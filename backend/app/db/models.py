from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

# Template models
class InputField(BaseModel):
    id: str
    title: str
    description: str

class TemplateBase(BaseModel):
    name: str
    description: str
    content: str
    associated_policies: List[str] = []

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(TemplateBase):
    pass

class Template(TemplateBase):
    id: str
    created_at: datetime
    updated_at: datetime
    input_fields: List[InputField]

# Policy models
class PolicyBase(BaseModel):
    name: str
    description: str = ""

class PolicyCreate(PolicyBase):
    file_path: str
    content_hash: str

class Policy(PolicyBase):
    id: str
    uploaded_at: datetime

# Document generation models
class GenerateRequest(BaseModel):
    template_id: str
    inputs: Dict[str, str]

class GenerateResponse(BaseModel):
    id: str
    content: str
    generated_at: datetime
    template_id: str

class RefineRequest(BaseModel):
    feedback: str

class RefineResponse(BaseModel):
    id: str
    content: str
    generated_at: datetime
    refined_at: datetime
    template_id: str

# In-memory database for the POC
class InMemoryDB:
    def __init__(self):
        self.templates: Dict[str, Template] = {}
        self.policies: Dict[str, Policy] = {}
        self.generated_documents: Dict[str, Dict[str, Any]] = {}
        
    def generate_id(self) -> str:
        return str(uuid.uuid4())

# Create a single instance of the database
db = InMemoryDB() 