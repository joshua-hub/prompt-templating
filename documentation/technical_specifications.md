# Technical Specifications

## System Architecture

### Frontend
- **Framework**: React.js
- **UI Design**: Material Design principles
- **Key Components**:
  - Tab-based interface
  - Dynamic form generation based on templates
  - Document viewer/editor
  - Template editor

### Backend
- **Framework**: Python FastAPI
- **API Endpoints**:
  - Template management (CRUD operations)
  - User input processing
  - Document generation
  - Policy document management

### Database
- **Type**: Vector database (open-source, containerized)
- **Data Stored**:
  - Templates
  - Policy document embeddings
  - Generated documents history

### AI Integration
- **Provider**: On-premises OpenAI-compatible API
- **Models**:
  - Embedding model for policy documents
  - Text generation model for content creation
- **Configuration**: Configurable via settings file (model selection, API keys)

## Key Workflows

### User Roles
For this POC/MVP, users and administrators are considered the same people to enable rapid iteration and testing. This simplified approach allows for quicker feedback cycles during the trial phase. Role-based access control can be implemented in future versions if the project gets endorsed.

### Template Creation
1. Administrator selects "Create New Template" in the admin tab
2. Administrator writes template content in the text editor
3. Administrator adds "user interaction" blocks using the dedicated button
4. Administrator defines titles and descriptions for each input field
5. Administrator can associate policy documents with the template
6. Template is saved to the database
7. Administrator can also select an existing template to edit its content, associated policies, or other properties
8. Administrator can delete templates that are no longer needed

### Policy Document Management
1. Administrator uploads policy documents in the admin tab
2. System processes documents through the embedding model
3. System generates a hash of the document to track uniqueness
4. Embeddings are stored in the vector database for retrieval
5. If a document with the same hash already exists, the system uses the existing embeddings
6. Administrator associates policy documents with templates during creation or editing
7. Multiple templates can reference the same policy document without duplicating embeddings

### User Template Usage
1. User selects a template from the dropdown in the user tab
2. System dynamically generates input fields based on the template
3. User fills in required information
4. User submits the form
5. System retrieves relevant policy information using RAG
6. System generates content based on the template, user inputs, and policy
7. Generated content is displayed in the response tab

### Response Refinement
1. User reviews generated content in the response tab
2. User can edit the content directly
3. User can request changes by providing feedback
4. System regenerates content based on feedback and original context

## Deployment

### Environment
- **Platform**: Kubernetes (K8s)
- **Location**: On-premises

### Components
- **Frontend Container**: Serving the React application
- **Backend Container**: Running the FastAPI service
- **Database Container**: Running the vector database
- **Storage**: For policy documents and generated content

## Additional Requirements

### Document Handling
- **Supported File Formats**: PDF only (non-flattened)
- **Document Storage**: Policy documents are stored, but generated responses are not persisted
- **Export Options**: Text field with copy button for generated content
- **Version Control**: No version history required for templates or generated documents

### Database
- **Vector Database**: Qdrant
- **Requirements**:
  - Must run on-premises
  - Must be containerized
  - Must operate in a disconnected environment (no internet access)
- **Expected Volume**: 
  - 10-20 templates
  - 5-6 policy documents

### User Experience
- **Browser Compatibility**: Chrome, Edge, Firefox
- **Error Handling**: When policy references are ambiguous or missing, the system should inject a message in the response indicating that the policy isn't clear and the user needs to take action
- **Security Considerations**: No special security requirements as policy documents are not sensitive; user inputs and generated responses should not be stored long-term

### Metrics & Logging
- **Success Metrics**: Users will provide feedback on efficiency gains
- **Logging Requirements**: Standard application logging only, no special requirements

## Development Considerations

### MVP Features
- Basic template management
- Simple user interface
- RAG integration for policy compliance
- Content generation and refinement