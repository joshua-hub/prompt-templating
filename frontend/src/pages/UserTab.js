import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper,
  Grid,
  Alert
} from '@mui/material';
import { getTemplates, getTemplate, generateDocument } from '../services/api';
import { parseTemplate } from '../utils/templateParser';

const UserTab = ({ onContentGenerated }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [inputFields, setInputFields] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await getTemplates();
        setTemplates(response.data.templates);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates. Please try again later.');
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Load template details when a template is selected
  const handleTemplateSelect = async (event) => {
    const templateId = event.target.value;
    setSelectedTemplateId(templateId);
    setInputValues({});
    
    if (!templateId) {
      setSelectedTemplate(null);
      setInputFields([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getTemplate(templateId);
      const template = response.data;
      setSelectedTemplate(template);
      
      // Parse template content to extract input fields
      const fields = parseTemplate(template.content);
      setInputFields(fields);
      
      // Initialize input values
      const initialValues = {};
      fields.forEach(field => {
        initialValues[field.id] = '';
      });
      setInputValues(initialValues);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching template details:', err);
      setError('Failed to load template details. Please try again later.');
      setLoading(false);
    }
  };

  // Handle input field changes
  const handleInputChange = (fieldId, value) => {
    setInputValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Submit form to generate document
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedTemplateId) {
      setError('Please select a template first.');
      return;
    }
    
    // Validate that all fields are filled
    const missingFields = Object.entries(inputValues).filter(([_, value]) => !value).length > 0;
    if (missingFields) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await generateDocument(selectedTemplateId, inputValues);
      const { content, id } = response.data;
      
      onContentGenerated(content, id);
      setLoading(false);
    } catch (err) {
      console.error('Error generating document:', err);
      setError('Failed to generate document. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" component="h2" gutterBottom>
        Select a Template
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="template-select-label">Template</InputLabel>
        <Select
          labelId="template-select-label"
          id="template-select"
          value={selectedTemplateId}
          label="Template"
          onChange={handleTemplateSelect}
          disabled={loading}
        >
          <MenuItem value="">
            <em>Select a template</em>
          </MenuItem>
          {templates.map((template) => (
            <MenuItem key={template.id} value={template.id}>
              {template.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedTemplate && (
        <Paper elevation={1} sx={{ p: 2, mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {selectedTemplate.description}
          </Typography>
        </Paper>
      )}
      
      {inputFields.length > 0 && (
        <>
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>
            Fill in Required Information
          </Typography>
          
          <Grid container spacing={3}>
            {inputFields.map((field) => (
              <Grid item xs={12} key={field.id}>
                <TextField
                  id={field.id}
                  label={field.title}
                  fullWidth
                  multiline
                  rows={3}
                  value={inputValues[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  helperText={field.description}
                  disabled={loading}
                  required
                />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Generating...' : 'Generate Document'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default UserTab; 