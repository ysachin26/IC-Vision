import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Storage } from '@mui/icons-material';

const OemDatabasePage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          OEM Database
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage IC part numbers and manufacturer reference database
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <Storage sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="body1">
              OEM Database page will be implemented here
            </Typography>
            <Typography variant="body2">
              This will allow management of IC markings and reference data
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OemDatabasePage;