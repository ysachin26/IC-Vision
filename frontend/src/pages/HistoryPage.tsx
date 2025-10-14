import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { History } from '@mui/icons-material';

const HistoryPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inspection History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage previous IC inspection results
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <History sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="body1">
              History page will be implemented here
            </Typography>
            <Typography variant="body2">
              This will show inspection history with filtering and search capabilities
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HistoryPage;