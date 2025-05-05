import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Alert,
  Divider,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { refineDocument } from '../services/api';

const ResponseTab = ({ content, contentId, setContent }) => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Handle feedback input change
  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  // Handle refine button click
  const handleRefine = async () => {
    if (!contentId) {
      setError('No document to refine. Please generate a document first.');
      return;
    }

    if (!feedback.trim()) {
      setError('Please provide feedback for refinement.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await refineDocument(contentId, feedback);
      const { content: refinedContent } = response.data;

      setContent(refinedContent);
      setFeedback('');
      setLoading(false);
    } catch (err) {
      console.error('Error refining document:', err);
      setError('Failed to refine document. Please try again later.');
      setLoading(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  if (!content) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Typography variant="h6" color="text.secondary">
          No content generated yet. Use the User tab to generate content.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Generated Content
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {copied && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Content copied to clipboard!
        </Alert>
      )}

      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          position: 'relative',
          minHeight: '200px',
          whiteSpace: 'pre-wrap'
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Tooltip title="Copy to clipboard">
            <IconButton onClick={handleCopy} size="small">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body1">
          {content}
        </Typography>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" component="h2" gutterBottom>
        Request Changes
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            id="feedback"
            label="Feedback"
            multiline
            rows={4}
            fullWidth
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="Provide feedback to refine the generated content..."
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRefine}
            disabled={loading || !feedback.trim()}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Processing...' : 'Refine Content'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResponseTab; 