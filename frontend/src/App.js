import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FileUpload from './components/FileUpload';
import AnalysisResults from './components/AnalysisResults';
import CodeDisplay from './components/CodeDisplay';
import ChatWithLlama from './components/ChatWithLlama';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [code, setCode] = useState(null);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setCode(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze dataset');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setCode(data.model_suggestion);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            DataMatic Bot
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
            Intelligent ML Model Suggestion
          </Typography>

          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <FileUpload onFileUpload={handleFileUpload} />
          </Paper>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {analysis && (
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
              <AnalysisResults analysis={analysis} />
            </Paper>
          )}

          {analysis && (
            <ChatWithLlama analysis={analysis} />
          )}

          {code && (
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
              <CodeDisplay code={code} />
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 