import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Person } from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <Person sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="body1">
              Profile page will be implemented here
            </Typography>
            <Typography variant="body2">
              This will allow users to update their profile and preferences
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;