import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Analytics } from '@mui/icons-material';

const AnalyticsPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics & Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View system performance metrics and generate reports
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <Analytics sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="body1">
              Analytics page will be implemented here
            </Typography>
            <Typography variant="body2">
              This will show charts, graphs, and detailed analytics reports
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AnalyticsPage;