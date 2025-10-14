import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PhotoCamera,
  CheckCircle,
  Warning,
  Error,
  Analytics,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  // Mock data - in a real app, this would come from API
  const stats = {
    totalInspections: 1247,
    todayInspections: 23,
    weeklyInspections: 156,
    accuracyRate: 94.2,
    genuine: 892,
    fake: 78,
    suspicious: 45,
    inconclusive: 32,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your IC authentication system
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhotoCamera sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="div">
                  Today's Inspections
                </Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {stats.todayInspections}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" component="div">
                  Genuine ICs
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats.genuine}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Error sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6" component="div">
                  Counterfeit Detected
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {stats.fake}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Analytics sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6" component="div">
                  Accuracy Rate
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {stats.accuracyRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <DashboardIcon sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="body1">
                  Dashboard components will be implemented here
                </Typography>
                <Typography variant="body2">
                  This will show recent inspections, trends, and system status
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  OCR Processing
                </Typography>
                <LinearProgress variant="determinate" value={95} color="success" />
                <Typography variant="caption" color="text.secondary">
                  95% - Excellent
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Database Performance
                </Typography>
                <LinearProgress variant="determinate" value={87} color="success" />
                <Typography variant="caption" color="text.secondary">
                  87% - Good
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Memory Usage
                </Typography>
                <LinearProgress variant="determinate" value={62} color="warning" />
                <Typography variant="caption" color="text.secondary">
                  62% - Normal
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;