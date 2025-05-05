import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

class AISettings(BaseModel):
    api_key: str = os.getenv("OPENAI_API_KEY", "")
    api_base: str = os.getenv("OPENAI_API_BASE", "http://openai-api:8000/v1")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    generation_model: str = os.getenv("GENERATION_MODEL", "gpt-3.5-turbo")

class VectorDBSettings(BaseModel):
    host: str = os.getenv("QDRANT_HOST", "qdrant")
    port: int = int(os.getenv("QDRANT_PORT", "6333"))
    collection_name: str = os.getenv("QDRANT_COLLECTION", "policies")

class RAGSettings(BaseModel):
    chunk_size: int = int(os.getenv("CHUNK_SIZE", "1000"))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "200"))
    results_count: int = int(os.getenv("RESULTS_COUNT", "3"))

class Settings(BaseModel):
    app_name: str = "Prompt Template System"
    api_prefix: str = "/api/v1"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    upload_dir: str = os.getenv("UPLOAD_DIR", "/app/uploads")
    ai: AISettings = AISettings()
    vector_db: VectorDBSettings = VectorDBSettings()
    rag: RAGSettings = RAGSettings()

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.upload_dir, exist_ok=True) 