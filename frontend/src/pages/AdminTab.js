import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getPolicies,
  uploadPolicy,
  deletePolicy
} from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminTab = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Template states
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Policy states
  const [policies, setPolicies] = useState([]);
  const [policyFile, setPolicyFile] = useState(null);
  const [policyDescription, setPolicyDescription] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ type: '', id: '' });

  // Fetch templates and policies on component mount
  useEffect(() => {
    fetchTemplates();
    fetchPolicies();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch all templates
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

  // Fetch all policies
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await getPolicies();
      setPolicies(response.data.policies);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError('Failed to load policies. Please try again later.');
      setLoading(false);
    }
  };

  // Select template for editing
  const handleEditTemplate = async (templateId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getTemplate(templateId);
      const template = response.data;
      
      setSelectedTemplateId(template.id);
      setTemplateName(template.name);
      setTemplateDescription(template.description);
      setTemplateContent(template.content);
      setSelectedPolicies(template.associated_policies || []);
      setIsEditing(true);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching template details:', err);
      setError('Failed to load template details. Please try again later.');
      setLoading(false);
    }
  };

  // Create new template or cancel editing
  const handleNewTemplate = () => {
    setSelectedTemplateId('');
    setTemplateName('');
    setTemplateDescription('');
    setTemplateContent('');
    setSelectedPolicies([]);
    setIsEditing(false);
    setSuccess('');
    setError('');
  };

  // Insert user interaction block at cursor position in template content
  const handleInsertInteraction = () => {
    const textArea = document.getElementById('template-content');
    const cursorPos = textArea.selectionStart;
    
    const interactionBlock = `\n#############\ntitle: {write the title of this input field}\ndescription: {write a description for what is entered into this field}\n#############\n`;
    
    const newContent = 
      templateContent.substring(0, cursorPos) + 
      interactionBlock + 
      templateContent.substring(cursorPos);
    
    setTemplateContent(newContent);
    
    // Set focus back to textarea and place cursor after the inserted block
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(cursorPos + interactionBlock.length, cursorPos + interactionBlock.length);
    }, 0);
  };

  // Save template (create new or update existing)
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Template name is required.');
      return;
    }
    
    if (!templateContent.trim()) {
      setError('Template content is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const templateData = {
        name: templateName,
        description: templateDescription,
        content: templateContent,
        associated_policies: selectedPolicies
      };
      
      if (isEditing) {
        await updateTemplate(selectedTemplateId, templateData);
        setSuccess('Template updated successfully!');
      } else {
        await createTemplate(templateData);
        setSuccess('Template created successfully!');
      }
      
      await fetchTemplates();
      setLoading(false);
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save template. Please try again later.');
      setLoading(false);
    }
  };

  // Confirm deletion dialog
  const handleDeleteConfirm = (type, id, name) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  // Delete template or policy
  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (itemToDelete.type === 'template') {
        await deleteTemplate(itemToDelete.id);
        setSuccess('Template deleted successfully!');
        await fetchTemplates();
        
        // If we deleted the currently edited template, reset the form
        if (selectedTemplateId === itemToDelete.id) {
          handleNewTemplate();
        }
      } else if (itemToDelete.type === 'policy') {
        await deletePolicy(itemToDelete.id);
        setSuccess('Policy document deleted successfully!');
        await fetchPolicies();
      }
      
      setDeleteDialogOpen(false);
      setLoading(false);
    } catch (err) {
      console.error(`Error deleting ${itemToDelete.type}:`, err);
      setError(`Failed to delete ${itemToDelete.type}. Please try again later.`);
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };

  // Handle policy file selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are supported.');
        setPolicyFile(null);
        event.target.value = null;
        return;
      }
      setPolicyFile(file);
    }
  };

  // Upload policy document
  const handleUploadPolicy = async (event) => {
    event.preventDefault();
    
    if (!policyFile) {
      setError('Please select a PDF file to upload.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await uploadPolicy(policyFile, policyDescription);
      
      setSuccess('Policy document uploaded successfully!');
      setPolicyFile(null);
      setPolicyDescription('');
      document.getElementById('policy-file').value = '';
      
      await fetchPolicies();
      setLoading(false);
    } catch (err) {
      console.error('Error uploading policy document:', err);
      setError('Failed to upload policy document. Please try again later.');
      setLoading(false);
    }
  };

  // Handle policy selection for template
  const handlePolicyChange = (event) => {
    setSelectedPolicies(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Template & Policy Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="admin tabs"
        >
          <Tab label="Templates" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
          <Tab label="Policy Documents" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Templates</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleNewTemplate}
                  disabled={loading}
                >
                  New
                </Button>
              </Box>
              <List>
                {templates.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No templates yet" />
                  </ListItem>
                ) : (
                  templates.map((template) => (
                    <ListItem key={template.id} sx={{ borderBottom: '1px solid #eee' }}>
                      <ListItemText 
                        primary={template.name} 
                        secondary={template.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="edit"
                          onClick={() => handleEditTemplate(template.id)}
                          disabled={loading}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteConfirm('template', template.id, template.name)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {isEditing ? 'Edit Template' : 'Create New Template'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    id="template-name"
                    label="Template Name"
                    fullWidth
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    id="template-description"
                    label="Description"
                    fullWidth
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="associated-policies-label">Associated Policies</InputLabel>
                    <Select
                      labelId="associated-policies-label"
                      id="associated-policies"
                      multiple
                      value={selectedPolicies}
                      onChange={handlePolicyChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const policy = policies.find(p => p.id === value);
                            return (
                              <Chip key={value} label={policy ? policy.name : value} />
                            );
                          })}
                        </Box>
                      )}
                      disabled={loading}
                    >
                      {policies.map((policy) => (
                        <MenuItem key={policy.id} value={policy.id}>
                          {policy.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleInsertInteraction}
                      disabled={loading}
                    >
                      Insert User Interaction
                    </Button>
                  </Box>
                  
                  <TextField
                    id="template-content"
                    label="Template Content"
                    multiline
                    rows={10}
                    fullWidth
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    disabled={loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={handleNewTemplate}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveTemplate}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Saving...' : 'Save Template'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Upload Policy Document
              </Typography>
              
              <form onSubmit={handleUploadPolicy}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <input
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      id="policy-file"
                      type="file"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                    <label htmlFor="policy-file">
                      <Button
                        variant="contained"
                        component="span"
                        disabled={loading}
                      >
                        Select PDF File
                      </Button>
                    </label>
                    {policyFile && (
                      <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                        {policyFile.name}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      id="policy-description"
                      label="Description (optional)"
                      fullWidth
                      value={policyDescription}
                      onChange={(e) => setPolicyDescription(e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={!policyFile || loading}
                      startIcon={loading && <CircularProgress size={20} />}
                    >
                      {loading ? 'Uploading...' : 'Upload Policy'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Policy Documents
              </Typography>
              
              <List>
                {policies.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No policy documents yet" />
                  </ListItem>
                ) : (
                  policies.map((policy) => (
                    <ListItem key={policy.id} sx={{ borderBottom: '1px solid #eee' }}>
                      <ListItemText
                        primary={policy.name}
                        secondary={
                          <>
                            {policy.description}
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              Uploaded: {new Date(policy.uploaded_at).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteConfirm('policy', policy.id, policy.name)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          {`Delete ${itemToDelete.type === 'template' ? 'Template' : 'Policy Document'}`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTab; 