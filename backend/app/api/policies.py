import os
import uuid
import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Path
from typing import Optional
from datetime import datetime
from app.db.models import db, Policy, PolicyCreate
from app.core.config import settings
from app.utils.pdf import process_pdf
from app.core.ai import embed_documents
from app.core.database import store_embeddings, delete_document, get_document_by_hash

router = APIRouter()

@router.get("/policies", response_model=dict)
async def get_policies():
    """
    Get all policy documents
    """
    policies = list(db.policies.values())
    return {"policies": policies}

@router.post("/policies", response_model=Policy)
async def upload_policy(
    file: UploadFile = File(...),
    description: str = Form("")
):
    """
    Upload a new policy document
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Generate unique ID and file path
    policy_id = db.generate_id()
    file_name = f"{policy_id}_{file.filename}"
    file_path = os.path.join(settings.upload_dir, file_name)
    
    try:
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process the PDF
        chunks = await process_pdf(file_path)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Failed to extract text from the PDF")
        
        # Generate embeddings
        embeddings = await embed_documents(chunks)
        
        # Store in vector database
        content_hash = await store_embeddings(policy_id, file.filename, file_path, chunks, embeddings)
        
        # Create policy record
        now = datetime.now()
        
        policy = Policy(
            id=policy_id,
            name=file.filename,
            description=description,
            uploaded_at=now
        )
        
        # Store in database
        db.policies[policy_id] = policy
        
        return policy
    except Exception as e:
        # Clean up on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process policy document: {str(e)}")

@router.delete("/policies/{policy_id}")
async def delete_policy(policy_id: str = Path(..., description="The ID of the policy to delete")):
    """
    Delete a policy document
    """
    if policy_id not in db.policies:
        raise HTTPException(status_code=404, detail="Policy document not found")
    
    policy = db.policies[policy_id]
    
    # Get the file path
    file_name = f"{policy_id}_{policy.name}"
    file_path = os.path.join(settings.upload_dir, file_name)
    
    # Delete from vector database
    await delete_document(policy_id)
    
    # Delete the file if it exists
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete from database
    del db.policies[policy_id]
    
    return {"message": "Policy document successfully deleted"} 