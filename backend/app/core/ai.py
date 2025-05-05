from typing import List, Dict, Any
import openai
from app.core.config import settings
from app.core.database import similarity_search

# Initialize OpenAI with API key and base URL
openai.api_key = settings.ai.api_key
openai.api_base = settings.ai.api_base

async def embed_text(text: str) -> List[float]:
    """
    Generate an embedding for a single text
    
    Args:
        text: The text to embed
        
    Returns:
        Embedding vector
    """
    try:
        response = openai.Embedding.create(
            model=settings.ai.embedding_model,
            input=text,
        )
        return response["data"][0]["embedding"]
    except Exception as e:
        print(f"Error generating embedding: {e}")
        # Return a zero vector as fallback
        return [0.0] * 1536  # OpenAI embeddings are 1536-dimensional


async def embed_documents(documents: List[str]) -> List[List[float]]:
    """
    Generate embeddings for a list of documents
    
    Args:
        documents: List of text documents to embed
        
    Returns:
        List of embedding vectors
    """
    embeddings = []
    for doc in documents:
        embedding = await embed_text(doc)
        embeddings.append(embedding)
    return embeddings


async def generate_text(prompt: str, system_message: str = None) -> str:
    """
    Generate text using the OpenAI API
    
    Args:
        prompt: The user prompt
        system_message: Optional system message to provide context
        
    Returns:
        Generated text
    """
    try:
        messages = []
        
        if system_message:
            messages.append({"role": "system", "content": system_message})
            
        messages.append({"role": "user", "content": prompt})
        
        response = openai.ChatCompletion.create(
            model=settings.ai.generation_model,
            messages=messages,
            temperature=0.7,
            max_tokens=4000,
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating text: {e}")
        return "Error: Unable to generate text. It appears the policy isn't clear on this matter. Please take appropriate action based on your judgment."


async def construct_generation_prompt(filled_template: str, policy_chunks: List[Dict[str, Any]]) -> str:
    """
    Construct a prompt for the text generation model
    
    Args:
        filled_template: The template filled with user inputs
        policy_chunks: Relevant policy document chunks
        
    Returns:
        Constructed prompt
    """
    policy_text = "\n\n".join([
        f"From {chunk['policy_name']}:\n{chunk['text']}" 
        for chunk in policy_chunks
    ])
    
    if not policy_text.strip():
        policy_text = "No relevant policy information found. Please note this in the response."
    
    prompt = f"""USER REQUEST:
{filled_template}

RELEVANT POLICY SECTIONS:
{policy_text}

Please generate a well-formatted, policy-compliant document based on the user's request.
Ensure that all information complies with the provided policy sections.
If the policy is unclear or missing relevant information, please indicate this in your response.
"""
    return prompt


async def construct_refinement_prompt(original_content: str, feedback: str, context: Dict[str, Any]) -> str:
    """
    Construct a prompt for refining the generated content
    
    Args:
        original_content: The originally generated content
        feedback: User feedback for refinement
        context: Original request context (filled template, policy chunks)
        
    Returns:
        Constructed prompt
    """
    prompt = f"""You previously generated this document:
{original_content}

The user has provided the following feedback:
{feedback}

Original request:
{context.get('filled_template', 'No original request available')}

Relevant policy sections:
{context.get('policy_sections', 'No policy sections available')}

Please refine the document based on the user's feedback while ensuring it remains compliant with policy.
"""
    return prompt 