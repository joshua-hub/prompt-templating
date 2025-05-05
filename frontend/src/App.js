import React, { useState } from 'react';
import { Box, Tabs, Tab, Container, Typography, Paper } from '@mui/material';
import UserTab from './pages/UserTab';
import AdminTab from './pages/AdminTab';
import ResponseTab from './pages/ResponseTab';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
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

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedContentId, setGeneratedContentId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleContentGenerated = (content, contentId) => {
    setGeneratedContent(content);
    setGeneratedContentId(contentId);
    setTabValue(2); // Switch to Response tab
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Prompt Template System
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="application tabs"
            centered
          >
            <Tab label="User" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Admin" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Response" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <UserTab onContentGenerated={handleContentGenerated} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <AdminTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <ResponseTab 
            content={generatedContent} 
            contentId={generatedContentId}
            setContent={setGeneratedContent}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default App; 