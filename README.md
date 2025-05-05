# Prompt Template System

A policy-guided document generation system that uses templates and AI to create policy-compliant documents.

## Features

- Template management with dynamic user input fields
- Policy document upload and management with vector search
- AI-powered document generation with policy compliance
- Interactive document refinement
- Modern Material Design UI

## Architecture

- **Frontend**: React.js with Material-UI
- **Backend**: Python FastAPI
- **Vector Database**: Qdrant
- **AI Integration**: OpenAI-compatible API

## Prerequisites

- Docker and Docker Compose
- Access to an OpenAI-compatible API (can be configured to use a local or remote API)

## Getting Started

### Configuration

1. Create a `.env` file in the project root with your API key:

```
OPENAI_API_KEY=your_api_key_here
OPENAI_API_BASE=http://your-api-endpoint:8000/v1  # Optional, defaults to on-premises endpoint
```

### Running with Docker Compose

1. Build and start the containers:

```bash
docker-compose up -d --build
```

2. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - Qdrant dashboard: http://localhost:6333/dashboard

### Development Setup

#### Frontend

```bash
cd frontend
npm install
npm start
```

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## System Use

### Creating Templates

1. Go to the Admin tab
2. Click "New" to create a template
3. Enter a name and description
4. Write your template content
5. Use the "Insert User Interaction" button to add input fields
6. Save the template

### Uploading Policy Documents

1. Go to the Admin tab
2. Navigate to the "Policy Documents" section
3. Select a PDF file to upload
4. Add an optional description
5. Upload the document

### Generating Documents

1. Go to the User tab
2. Select a template
3. Fill in the required information
4. Click "Generate Document"
5. View the generated document in the Response tab

### Refining Documents

1. In the Response tab, review the generated document
2. If changes are needed, enter feedback in the field
3. Click "Refine Content"
4. The updated document will be displayed

## Project Structure

```
/prompt_template_system
├── frontend/             # React frontend application
│   ├── public/           # Static assets
│   └── src/              # Source code
├── backend/              # Python FastAPI backend
│   └── app/              # Application code
├── Dockerfile.frontend   # Frontend Dockerfile
├── Dockerfile.backend    # Backend Dockerfile
├── nginx.conf            # Nginx configuration
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # This file
```

## License

This project is a proof of concept for demonstration purposes. 