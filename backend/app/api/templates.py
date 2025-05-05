from typing import List
from fastapi import APIRouter, HTTPException, Path
from datetime import datetime
from app.db.models import db, Template, TemplateCreate, TemplateUpdate, InputField
from app.utils.templateParser import parse_template

router = APIRouter()

@router.get("/templates", response_model=dict)
async def get_templates():
    """
    Get all templates
    """
    templates = list(db.templates.values())
    return {"templates": templates}

@router.get("/templates/{template_id}", response_model=Template)
async def get_template(template_id: str = Path(..., description="The ID of the template to retrieve")):
    """
    Get a specific template by ID
    """
    if template_id not in db.templates:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return db.templates[template_id]

@router.post("/templates", response_model=Template)
async def create_template(template: TemplateCreate):
    """
    Create a new template
    """
    template_id = db.generate_id()
    now = datetime.now()
    
    # Parse input fields from template content
    input_fields = parse_template(template.content)
    
    new_template = Template(
        id=template_id,
        name=template.name,
        description=template.description,
        content=template.content,
        associated_policies=template.associated_policies,
        created_at=now,
        updated_at=now,
        input_fields=input_fields
    )
    
    db.templates[template_id] = new_template
    return new_template

@router.put("/templates/{template_id}", response_model=Template)
async def update_template(
    template: TemplateUpdate,
    template_id: str = Path(..., description="The ID of the template to update")
):
    """
    Update an existing template
    """
    if template_id not in db.templates:
        raise HTTPException(status_code=404, detail="Template not found")
    
    existing_template = db.templates[template_id]
    
    # Parse input fields from template content
    input_fields = parse_template(template.content)
    
    updated_template = Template(
        id=template_id,
        name=template.name,
        description=template.description,
        content=template.content,
        associated_policies=template.associated_policies,
        created_at=existing_template.created_at,
        updated_at=datetime.now(),
        input_fields=input_fields
    )
    
    db.templates[template_id] = updated_template
    return updated_template

@router.delete("/templates/{template_id}")
async def delete_template(template_id: str = Path(..., description="The ID of the template to delete")):
    """
    Delete a template
    """
    if template_id not in db.templates:
        raise HTTPException(status_code=404, detail="Template not found")
    
    del db.templates[template_id]
    return {"message": "Template successfully deleted"} 