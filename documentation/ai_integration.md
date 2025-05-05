# AI Integration Guide

## Overview
This document outlines how AI is integrated into the prompt template system to enable policy-compliant document generation.

## Components

### 1. Vector Database
- Stores embeddings of policy documents
- Enables semantic search for retrieving relevant policy information
- Requirements:
  - Open-source
  - Containerized
  - Compatible with Python

### 2. Embedding Service
- Processes policy documents into vector embeddings
- Uses OpenAI-compatible embedding models
- Stores embeddings in the vector database

### 3. Retrieval-Augmented Generation (RAG)
- Retrieves relevant policy information based on template and user inputs
- Combines retrieved information with the template and user inputs
- Constructs prompts for the generation model

### 4. Text Generation Service
- Processes the constructed prompts
- Generates policy-compliant content
- Handles refinement requests

## Implementation Details

### Document Processing Workflow

1. **Document Upload**
   ```python
   async def process_document(document: UploadFile):
       # Extract text from document
       text = await extract_text(document)
       
       # Split text into chunks
       chunks = text_splitter.split_text(text)
       
       # Generate embeddings for each chunk
       embeddings = await embedding_service.embed_documents(chunks)
       
       # Store in vector database
       doc_id = await vector_db.store_embeddings(document.filename, chunks, embeddings)
       
       return doc_id
   ```

2. **Policy Retrieval**
   ```python
   async def retrieve_relevant_policy(template_id: str, user_inputs: dict):
       # Get template
       template = await template_service.get_template(template_id)
       
       # Construct query from template and user inputs
       query = construct_query(template, user_inputs)
       
       # Generate query embedding
       query_embedding = await embedding_service.embed_query(query)
       
       # Retrieve relevant policy chunks
       policy_chunks = await vector_db.similarity_search(
           query_embedding, 
           num_results=3
       )
       
       return policy_chunks
   ```

3. **Content Generation**
   ```python
   async def generate_content(template_id: str, user_inputs: dict):
       # Get template
       template = await template_service.get_template(template_id)
       
       # Get relevant policy chunks
       policy_chunks = await retrieve_relevant_policy(template_id, user_inputs)
       
       # Fill template with user inputs
       filled_template = fill_template(template, user_inputs)
       
       # Construct prompt
       prompt = construct_generation_prompt(filled_template, policy_chunks)
       
       # Generate content
       generated_content = await ai_service.generate_text(prompt)
       
       return generated_content
   ```

4. **Content Refinement**
   ```python
   async def refine_content(content_id: str, feedback: str):
       # Get original content and context
       original_content = await content_service.get_content(content_id)
       context = await content_service.get_context(content_id)
       
       # Construct refinement prompt
       prompt = construct_refinement_prompt(original_content, feedback, context)
       
       # Generate refined content
       refined_content = await ai_service.generate_text(prompt)
       
       return refined_content
   ```

## Configuration

### AI Configuration File (ai_config.json)
```json
{
  "openai": {
    "api_key": "${OPENAI_API_KEY}",
    "api_base": "http://on-prem-api-endpoint:8000/v1",
    "embedding_model": "text-embedding-3-small",
    "generation_model": "gpt-3.5-turbo"
  },
  "vector_db": {
    "type": "chroma",
    "host": "vector-db-service",
    "port": 8000
  },
  "rag": {
    "chunk_size": 1000,
    "chunk_overlap": 200,
    "results_count": 3
  }
}
```

## Example Prompts

### Generation Prompt Template
```
You are an assistant helping to create documents that comply with company policy.

USER REQUEST:
{filled_template}

RELEVANT POLICY SECTIONS:
{policy_chunks}

Please generate a well-formatted, policy-compliant document based on the user's request. 
Ensure that all information complies with the provided policy sections.
```

### Refinement Prompt Template
```
You previously generated this document:
{original_content}

The user has provided the following feedback:
{feedback}

Original request and policy context:
{context}

Please refine the document based on the user's feedback while ensuring it remains compliant with policy.
```

## Error Handling

1. **Rate Limiting**
   - Implement exponential backoff for API requests
   - Queue requests if rate limits are hit

2. **Model Errors**
   - Provide fallback options if preferred model is unavailable
   - Log detailed error information for debugging

3. **Content Filtering**
   - Implement content filtering to ensure appropriate outputs
   - Have fallback responses for rejected content

## Testing

### Unit Tests
- Test embedding generation
- Test vector database operations
- Test prompt construction

### Integration Tests
- Test end-to-end document processing
- Test RAG retrieval quality
- Test generation with various templates and inputs

### Evaluation
- Measure relevance of retrieved policy chunks
- Evaluate compliance of generated content
- Track user satisfaction with generated content 