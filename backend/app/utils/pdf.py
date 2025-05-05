import os
import tempfile
from typing import List
import pdf2image
import pytesseract
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.core.config import settings

async def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file using OCR
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Extracted text as a string
    """
    try:
        # Convert PDF to images
        images = pdf2image.convert_from_path(file_path)
        
        # Extract text from each image using OCR
        text = ""
        for img in images:
            text += pytesseract.image_to_string(img) + "\n\n"
            
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

async def split_text(text: str) -> List[str]:
    """
    Split text into chunks for embedding
    
    Args:
        text: Text to split
        
    Returns:
        List of text chunks
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.rag.chunk_size,
        chunk_overlap=settings.rag.chunk_overlap,
        length_function=len,
    )
    
    chunks = text_splitter.split_text(text)
    return chunks

async def process_pdf(file_path: str) -> List[str]:
    """
    Process a PDF file: extract text and split into chunks
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        List of text chunks
    """
    text = await extract_text_from_pdf(file_path)
    chunks = await split_text(text)
    return chunks 