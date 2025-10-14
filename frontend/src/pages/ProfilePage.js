import React from 'react';
import { Container, Typography, Card, CardContent, Box, Avatar, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Manage your account settings and view statistics
      </Typography>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.email}
              </Typography>
              <Chip 
                label={user?.role?.toUpperCase()} 
                color={user?.role === 'admin' ? 'error' : 'primary'} 
                size="small" 
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Username:</strong> {user?.username}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Department:</strong> {user?.department || 'Not specified'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Member since:</strong> {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Statistics
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Total Inspections:</strong> {user?.stats?.totalInspections || 0}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Genuine Detected:</strong> {user?.stats?.totalGenuineDetected || 0}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Fake Detected:</strong> {user?.stats?.totalFakeDetected || 0}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;