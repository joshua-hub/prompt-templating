from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.templates import router as templates_router
from app.api.policies import router as policies_router
from app.api.generation import router as generation_router
from app.core.config import settings

app = FastAPI(
    title="Prompt Template System API",
    description="API for the Prompt Template System",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify the actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(templates_router, prefix="/api/v1", tags=["templates"])
app.include_router(policies_router, prefix="/api/v1", tags=["policies"])
app.include_router(generation_router, prefix="/api/v1", tags=["generation"])

# Mount static files (frontend)
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend/build")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

@app.get("/api/health", tags=["health"])
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "ok"} 