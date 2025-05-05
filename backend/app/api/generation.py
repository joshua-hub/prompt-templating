from fastapi import APIRouter, HTTPException, Path
from datetime import datetime
from typing import Dict, Any, List
from app.db.models import db, GenerateRequest, GenerateResponse, RefineRequest, RefineResponse
from app.utils.templateParser import fill_template
from app.core.ai import embed_text, similarity_search, generate_text, construct_generation_prompt, construct_refinement_prompt

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
async def generate_document(request: GenerateRequest):
    """
    Generate a document based on a template and user inputs
    """
    # Validate template exists
    if request.template_id not in db.templates:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template = db.templates[request.template_id]
    
    # Fill template with user inputs
    filled_template = fill_template(template.content, request.inputs)
    
    # Get associated policies
    policy_ids = template.associated_policies
    
    # Generate embedding for the filled template
    query_vector = await embed_text(filled_template)
    
    # Retrieve relevant policy chunks
    policy_chunks = await similarity_search(query_vector, policy_ids)
    
    # Construct prompt for the LLM
    prompt = await construct_generation_prompt(filled_template, policy_chunks)
    
    # Generate content using the LLM
    system_message = "You are an assistant helping to create documents that comply with company policy."
    content = await generate_text(prompt, system_message)
    
    # Create document record
    document_id = db.generate_id()
    now = datetime.now()
    
    # Store context for potential refinement
    context = {
        "template_id": request.template_id,
        "filled_template": filled_template,
        "policy_sections": "\n\n".join([f"From {chunk['policy_name']}:\n{chunk['text']}" for chunk in policy_chunks])
    }
    
    db.generated_documents[document_id] = {
        "id": document_id,
        "content": content,
        "generated_at": now,
        "template_id": request.template_id,
        "context": context
    }
    
    return GenerateResponse(
        id=document_id,
        content=content,
        generated_at=now,
        template_id=request.template_id
    )

@router.post("/refine/{document_id}", response_model=RefineResponse)
async def refine_document(
    request: RefineRequest,
    document_id: str = Path(..., description="The ID of the document to refine")
):
    """
    Refine a generated document based on user feedback
    """
    # Validate document exists
    if document_id not in db.generated_documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document = db.generated_documents[document_id]
    
    # Construct refinement prompt
    prompt = await construct_refinement_prompt(
        document["content"],
        request.feedback,
        document["context"]
    )
    
    # Generate refined content
    system_message = "You are an assistant helping to refine documents to comply with company policy."
    refined_content = await generate_text(prompt, system_message)
    
    # Update document
    now = datetime.now()
    
    updated_document = {
        "id": document_id,
        "content": refined_content,
        "generated_at": document["generated_at"],
        "refined_at": now,
        "template_id": document["template_id"],
        "context": document["context"]
    }
    
    db.generated_documents[document_id] = updated_document
    
    return RefineResponse(
        id=document_id,
        content=refined_content,
        generated_at=document["generated_at"],
        refined_at=now,
        template_id=document["template_id"]
    ) 