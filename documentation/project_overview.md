# Prompt Template System - Project Overview

## Project Summary
This project aims to build a template system for users with procedural jobs who must abide by specific policies. The system will allow users to select from predefined templates, fill in required information, and generate content that complies with policy requirements using AI assistance.

## Key Features
1. **Template Selection and Use**: Users can select templates that dynamically create input fields for required information.
2. **Template Administration**: Administrators can create and edit templates with customizable user interaction blocks.
3. **Document Generation**: The system generates content based on user inputs and relevant policy guidelines.
4. **Policy Compliance**: Integration with a RAG (Retrieval Augmented Generation) system ensures outputs comply with uploaded policy documents.
5. **Interactive Refinement**: Users can edit and refine the generated content with continued AI assistance.

## User Interface
The interface consists of three main tabs:
1. **User Tab**: For selecting templates and filling in required information.
2. **Admin Tab**: For creating and editing templates and uploading policy documents.
3. **Response Tab**: For viewing, editing, and refining AI-generated content.

## Technical Architecture
- **Frontend**: JavaScript with React and Material Design principles
- **Backend**: Python with FastAPI
- **Database**: Open-source, containerized vector database
- **AI Integration**: OpenAI-compatible API (running on-premises)
- **Deployment**: On-premises Kubernetes (K8s) environment

## Sample Use Case
A user needs to request time off work. They select the appropriate template, enter the number of days requested and the reason for leave. The system generates a compliant request based on the HR policy document that has been uploaded to the system.

## Project Scope
This is a proof-of-concept (POC) and minimum viable product (MVP) for demonstration purposes. If endorsed, a new project with comprehensive requirements will follow. 