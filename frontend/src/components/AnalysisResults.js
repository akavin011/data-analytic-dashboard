import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

function AnalysisResults({ analysis }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dataset Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Number of Samples"
                  secondary={analysis.n_samples}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Number of Features"
                  secondary={analysis.n_features}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Target Variable"
                  secondary={analysis.target}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Model Type"
                  secondary={analysis.model_type}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Feature Types
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Categorical Features
              </Typography>
              <List dense>
                {analysis.categorical_features.map((feature) => (
                  <ListItem key={feature}>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Divider />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Numerical Features
              </Typography>
              <List dense>
                {analysis.numerical_features.map((feature) => (
                  <ListItem key={feature}>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Data Types
            </Typography>
            <List dense>
              {Object.entries(analysis.dtypes).map(([feature, dtype]) => (
                <ListItem key={feature}>
                  <ListItemText
                    primary={feature}
                    secondary={dtype}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Missing Values
            </Typography>
            <List dense>
              {Object.entries(analysis.missing_values).map(([feature, count]) => (
                <ListItem key={feature}>
                  <ListItemText
                    primary={feature}
                    secondary={`${count} missing values`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AnalysisResults; 