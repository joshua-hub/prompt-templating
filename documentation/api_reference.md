# API Reference

## Overview
This document outlines the API endpoints for the prompt template system backend.

## Base URL
```
http://[hostname]/api/v1
```

## Authentication
For the MVP/POC, no authentication is required. In future versions, authentication will be implemented.

## Endpoints

### Templates

#### GET /templates
Retrieves list of all templates.

**Response**
```json
{
  "templates": [
    {
      "id": "template-1",
      "name": "Time Off Request",
      "description": "Request time off from work",
      "created_at": "2023-06-12T10:00:00Z",
      "updated_at": "2023-06-13T15:30:00Z"
    },
    {
      "id": "template-2",
      "name": "Expense Report",
      "description": "Submit an expense report",
      "created_at": "2023-06-14T09:15:00Z",
      "updated_at": "2023-06-14T09:15:00Z"
    }
  ]
}
```

#### GET /templates/{template_id}
Retrieves a specific template by ID.

**Response**
```json
{
  "id": "template-1",
  "name": "Time Off Request",
  "description": "Request time off from work",
  "content": "I would like to take \n\n#############\ntitle: number of days off being requested\ndescription: Input the number of workdays you are requesting off. exclude useual days off, weekends and public holidays.\n#############\n\nthis is for the following reason\n\n#############\ntitle: reason for requesting leave\ndescription: what is the purpose of leave (i.e. annual leave, personal leave with reason)\n#############\n\nplease comply with the leave policy section from the HR document referenced.",
  "created_at": "2023-06-12T10:00:00Z",
  "updated_at": "2023-06-13T15:30:00Z",
  "input_fields": [
    {
      "id": "field-1",
      "title": "number of days off being requested",
      "description": "Input the number of workdays you are requesting off. exclude useual days off, weekends and public holidays."
    },
    {
      "id": "field-2",
      "title": "reason for requesting leave",
      "description": "what is the purpose of leave (i.e. annual leave, personal leave with reason)"
    }
  ],
  "associated_policies": ["policy-1"]
}
```

#### POST /templates
Creates a new template.

**Request**
```json
{
  "name": "New Template",
  "description": "Description of the new template",
  "content": "Template content with #############\ntitle: field title\ndescription: field description\n#############",
  "associated_policies": ["policy-1"]
}
```

**Response**
```json
{
  "id": "template-3",
  "name": "New Template",
  "description": "Description of the new template",
  "content": "Template content with #############\ntitle: field title\ndescription: field description\n#############",
  "created_at": "2023-06-15T14:25:00Z",
  "updated_at": "2023-06-15T14:25:00Z",
  "input_fields": [
    {
      "id": "field-1",
      "title": "field title",
      "description": "field description"
    }
  ],
  "associated_policies": ["policy-1"]
}
```

#### PUT /templates/{template_id}
Updates an existing template.

**Request**
```json
{
  "name": "Updated Template Name",
  "description": "Updated description",
  "content": "Updated content",
  "associated_policies": ["policy-1", "policy-2"]
}
```

**Response**
```json
{
  "id": "template-1",
  "name": "Updated Template Name",
  "description": "Updated description",
  "content": "Updated content",
  "created_at": "2023-06-12T10:00:00Z",
  "updated_at": "2023-06-15T16:40:00Z",
  "input_fields": [...],
  "associated_policies": ["policy-1", "policy-2"]
}
```

#### DELETE /templates/{template_id}
Deletes a template.

**Response**
```json
{
  "message": "Template successfully deleted"
}
```

### Policies

#### GET /policies
Retrieves list of all policy documents.

**Response**
```json
{
  "policies": [
    {
      "id": "policy-1",
      "name": "HR Policy.pdf",
      "description": "Human Resources Policy Document",
      "uploaded_at": "2023-06-10T11:20:00Z"
    },
    {
      "id": "policy-2",
      "name": "Security Policy.pdf",
      "description": "IT Security Policy",
      "uploaded_at": "2023-06-11T09:45:00Z"
    }
  ]
}
```

#### POST /policies
Uploads a new policy document.

**Request**
Multipart form data with:
- `file`: The policy document file
- `description`: Description of the policy (optional)

**Response**
```json
{
  "id": "policy-3",
  "name": "Expense Policy.pdf",
  "description": "Expense Reporting Policy",
  "uploaded_at": "2023-06-15T17:30:00Z"
}
```

#### DELETE /policies/{policy_id}
Deletes a policy document.

**Response**
```json
{
  "message": "Policy document successfully deleted"
}
```

### Document Generation

#### POST /generate
Generates a document based on a template and user inputs.

**Request**
```json
{
  "template_id": "template-1",
  "inputs": {
    "field-1": "5",
    "field-2": "Annual vacation"
  }
}
```

**Response**
```json
{
  "id": "doc-1",
  "content": "I would like to take 5 days off for Annual vacation. This request complies with the company policy that states employees are entitled to 20 days of annual leave per year.",
  "generated_at": "2023-06-15T18:00:00Z",
  "template_id": "template-1"
}
```

#### POST /refine/{document_id}
Refines a generated document based on user feedback.

**Request**
```json
{
  "feedback": "Please add information about who will cover my work while I'm away."
}
```

**Response**
```json
{
  "id": "doc-1",
  "content": "I would like to take 5 days off for Annual vacation. This request complies with the company policy that states employees are entitled to 20 days of annual leave per year. During my absence, my team members will cover my responsibilities as per our department's backup procedure.",
  "generated_at": "2023-06-15T18:05:00Z",
  "refined_at": "2023-06-15T18:10:00Z",
  "template_id": "template-1"
}
```

## Error Handling

All endpoints may return error responses in the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

- `TEMPLATE_NOT_FOUND`: The requested template was not found
- `POLICY_NOT_FOUND`: The requested policy document was not found
- `DOCUMENT_NOT_FOUND`: The requested generated document was not found
- `INVALID_REQUEST`: The request format is invalid
- `INTERNAL_ERROR`: An internal server error occurred
- `AI_SERVICE_ERROR`: Error communicating with the AI service

## Rate Limiting

For the MVP/POC, no rate limiting is implemented. In future versions, rate limiting will be applied to prevent abuse.

## Versioning

The API uses versioning in the URL path (e.g., `/api/v1`). Breaking changes will result in a new version number. 