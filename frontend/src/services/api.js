import axios from 'axios';

const API_URL = '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Template endpoints
export const getTemplates = () => {
  return api.get('/templates');
};

export const getTemplate = (id) => {
  return api.get(`/templates/${id}`);
};

export const createTemplate = (template) => {
  return api.post('/templates', template);
};

export const updateTemplate = (id, template) => {
  return api.put(`/templates/${id}`, template);
};

export const deleteTemplate = (id) => {
  return api.delete(`/templates/${id}`);
};

// Policy endpoints
export const getPolicies = () => {
  return api.get('/policies');
};

export const uploadPolicy = (file, description = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  
  return api.post('/policies', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deletePolicy = (id) => {
  return api.delete(`/policies/${id}`);
};

// Document generation endpoints
export const generateDocument = (templateId, inputs) => {
  return api.post('/generate', { template_id: templateId, inputs });
};

export const refineDocument = (documentId, feedback) => {
  return api.post(`/refine/${documentId}`, { feedback });
};

export default api; 