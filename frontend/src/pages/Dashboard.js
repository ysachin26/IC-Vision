import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Search,
  History,
  Storage,
  Analytics,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInspections: 0,
    genuine: 0,
    fake: 0,
    suspicious: 0,
    inconclusive: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Try to fetch analytics data
      const response = await axios.get('/inspections/analytics');
      setStats(response.data.data.analytics);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Using demo data.');
      // Use demo data if API fails
      setStats({
        totalInspections: 156,
        genuine: 142,
        fake: 8,
        suspicious: 4,
        inconclusive: 2,
        avgProcessingTime: 2.3,
        avgConfidence: 0.89
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Inspect IC',
      description: 'Upload and analyze IC markings',
      icon: <Search sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/inspect'
    },
    {
      title: 'View History',
      description: 'Browse inspection history',
      icon: <History sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      path: '/history'
    },
    {
      title: 'OEM Database',
      description: 'Manage reference markings',
      icon: <Storage sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      path: '/database'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: <Analytics sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      path: '/analytics'
    }
  ];

  const getAccuracyRate = () => {
    const total = stats.genuine + stats.fake;
    return total > 0 ? ((stats.genuine / total) * 100).toFixed(1) : 0;
  };

  const getStatusColor = (classification) => {
    switch (classification) {
      case 'genuine': return 'success';
      case 'fake': return 'error';
      case 'suspicious': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          MarkSure AOI System Dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {loading ? <LinearProgress /> : stats.totalInspections}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Inspections
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {loading ? <LinearProgress /> : stats.genuine}
                  </Typography>
                  <Typography color="text.secondary">
                    Genuine ICs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <ErrorIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {loading ? <LinearProgress /> : stats.fake}
                  </Typography>
                  <Typography color="text.secondary">
                    Fake ICs Detected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {loading ? <LinearProgress /> : `${getAccuracyRate()}%`}
                  </Typography>
                  <Typography color="text.secondary">
                    Detection Accuracy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Classification Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Classification Breakdown
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Genuine', count: stats.genuine, color: 'success' },
                  { label: 'Fake', count: stats.fake, color: 'error' },
                  { label: 'Suspicious', count: stats.suspicious, color: 'warning' },
                  { label: 'Inconclusive', count: stats.inconclusive, color: 'default' }
                ].map((item) => (
                  <Grid item xs={6} sm={3} key={item.label}>
                    <Box textAlign="center">
                      <Chip
                        label={`${item.count}`}
                        color={getStatusColor(item.label.toLowerCase())}
                        sx={{ fontSize: '1.1rem', mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Performance
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Avg Processing Time
                </Typography>
                <Typography variant="h6">
                  {stats.avgProcessingTime || 2.3}s
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Avg Confidence
                </Typography>
                <Typography variant="h6">
                  {((stats.avgConfidence || 0.89) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={3} key={action.title}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: action.color,
                    width: 60,
                    height: 60,
                    margin: '0 auto 16px'
                  }}
                >
                  {action.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;