import hashlib
from typing import List, Dict, Any, Optional
import qdrant_client
from qdrant_client.http import models
from app.core.config import settings

# Initialize Qdrant client
qdrant_client = qdrant_client.QdrantClient(
    host=settings.vector_db.host,
    port=settings.vector_db.port
)

# Create collection if it doesn't exist
def init_collection():
    """Initialize the vector database collection"""
    try:
        collections_response = qdrant_client.get_collections()
        collection_names = [collection.name for collection in collections_response.collections]
        
        if settings.vector_db.collection_name not in collection_names:
            vector_size = 1536  # Size for OpenAI embeddings
            
            qdrant_client.create_collection(
                collection_name=settings.vector_db.collection_name,
                vectors_config=models.VectorParams(
                    size=vector_size,
                    distance=models.Distance.COSINE
                )
            )
            
            # Create index for the policy_hash field
            qdrant_client.create_payload_index(
                collection_name=settings.vector_db.collection_name,
                field_name="policy_hash",
                field_schema=models.PayloadSchemaType.KEYWORD
            )
    except Exception as e:
        print(f"Error initializing Qdrant collection: {e}")


async def store_embeddings(policy_id: str, policy_name: str, file_path: str, chunks: List[str], embeddings: List[List[float]]):
    """
    Store document chunks and embeddings in the vector database
    
    Args:
        policy_id: The ID of the policy document
        policy_name: The name of the policy document
        file_path: Path to the original document
        chunks: List of text chunks from the document
        embeddings: List of embedding vectors for each chunk
    """
    # Create a hash of the document content to check for duplicates
    content_hash = hashlib.md5(''.join(chunks).encode()).hexdigest()
    
    # Check if this document already exists
    search_result = qdrant_client.scroll(
        collection_name=settings.vector_db.collection_name,
        scroll_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="policy_hash",
                    match=models.MatchValue(value=content_hash)
                )
            ]
        ),
        limit=1
    )
    
    if search_result[0]:  # Document with this hash already exists
        return content_hash
    
    # Prepare points for insertion
    points = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        points.append(
            models.PointStruct(
                id=f"{policy_id}_{i}",
                vector=embedding,
                payload={
                    "policy_id": policy_id,
                    "policy_name": policy_name,
                    "policy_hash": content_hash,
                    "chunk_index": i,
                    "text": chunk,
                    "file_path": file_path
                }
            )
        )
    
    # Insert points
    qdrant_client.upsert(
        collection_name=settings.vector_db.collection_name,
        points=points
    )
    
    return content_hash


async def get_document_by_hash(hash_value: str) -> Optional[Dict[str, Any]]:
    """
    Get the first document that matches the given hash
    
    Args:
        hash_value: MD5 hash of the document content
        
    Returns:
        Document metadata or None if not found
    """
    search_result = qdrant_client.scroll(
        collection_name=settings.vector_db.collection_name,
        scroll_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="policy_hash",
                    match=models.MatchValue(value=hash_value)
                )
            ]
        ),
        limit=1
    )
    
    if search_result[0]:
        point = search_result[0][0]
        return {
            "policy_id": point.payload["policy_id"],
            "policy_name": point.payload["policy_name"],
            "policy_hash": point.payload["policy_hash"],
            "file_path": point.payload["file_path"]
        }
    return None


async def similarity_search(query_vector: List[float], policy_ids: List[str] = None, num_results: int = None):
    """
    Search for similar documents in the vector database
    
    Args:
        query_vector: Embedding vector of the search query
        policy_ids: Optional list of policy IDs to restrict the search to
        num_results: Number of results to return (default: from settings)
        
    Returns:
        List of text chunks matching the query
    """
    if num_results is None:
        num_results = settings.rag.results_count
    
    filter_condition = None
    if policy_ids and len(policy_ids) > 0:
        filter_condition = models.Filter(
            should=[
                models.FieldCondition(
                    key="policy_id",
                    match=models.MatchValue(value=policy_id)
                )
                for policy_id in policy_ids
            ]
        )
    
    search_result = qdrant_client.search(
        collection_name=settings.vector_db.collection_name,
        query_vector=query_vector,
        query_filter=filter_condition,
        limit=num_results
    )
    
    return [
        {
            "text": point.payload["text"],
            "policy_name": point.payload["policy_name"],
            "score": point.score
        }
        for point in search_result
    ]


async def delete_document(policy_id: str):
    """
    Delete all chunks for a document from the vector database
    
    Args:
        policy_id: ID of the policy document to delete
    """
    qdrant_client.delete(
        collection_name=settings.vector_db.collection_name,
        points_selector=models.Filter(
            must=[
                models.FieldCondition(
                    key="policy_id",
                    match=models.MatchValue(value=policy_id)
                )
            ]
        )
    )

# Initialize collection on module import
init_collection() 