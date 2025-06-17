import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function formatSuggestion(suggestion) {
  const parts = suggestion.split(/\*\*Model Description:\*\*/);
  if (parts.length === 2) {
    return (
      <>
        <div>{parts[0].trim()}</div>
        <div><strong>Model Description:</strong>{parts[1].trim()}</div>
      </>
    );
  }
  return suggestion;
}

function downloadNotebook(code) {
  const notebook = {
    cells: [
      {
        cell_type: "code",
        metadata: {},
        source: code.split('\n').map(line => line + '\n'),
        outputs: [],
        execution_count: null
      }
    ],
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3"
      },
      language_info: {
        name: "python",
        codemirror_mode: {
          name: "ipython",
          version: 3
        },
        file_extension: ".py",
        mimetype: "text/x-python",
        nbconvert_exporter: "python",
        pygments_lexer: "ipython3",
        version: "3.8.5"
      }
    },
    nbformat: 4,
    nbformat_minor: 2
  };

  const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: "application/x-ipynb+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "generated_model.ipynb";
  a.click();
  URL.revokeObjectURL(url);
}

function CodeDisplay({ code }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Model Suggestion
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1" paragraph>
          {formatSuggestion(code.suggestion)}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Implementation Code
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => downloadNotebook(code.code || "# Code will be generated here...")}
            size="small"
          >
            Download as .ipynb
          </Button>
        </Box>
        <Box sx={{
          backgroundColor: '#1e1e1e',
          borderRadius: 1,
          overflow: 'hidden'
        }}>
          <SyntaxHighlighter
            language="python"
            style={materialDark}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            {code.code || '# Code will be generated here...'}
          </SyntaxHighlighter>
        </Box>
      </Paper>
    </Box>
  );
}

export default CodeDisplay; 