import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsPage = () => {
  const mockData = [
    { name: 'Genuine', value: 142, color: '#4caf50' },
    { name: 'Fake', value: 8, color: '#f44336' },
    { name: 'Suspicious', value: 4, color: '#ff9800' },
    { name: 'Inconclusive', value: 2, color: '#9e9e9e' }
  ];

  const trendData = [
    { date: '10-10', genuine: 45, fake: 2 },
    { date: '10-11', genuine: 52, fake: 1 },
    { date: '10-12', genuine: 48, fake: 3 },
    { date: '10-13', genuine: 39, fake: 1 },
    { date: '10-14', genuine: 42, fake: 1 }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Detailed inspection analytics and performance metrics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Classification Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {mockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Inspection Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="genuine" fill="#4caf50" name="Genuine" />
                  <Bar dataKey="fake" fill="#f44336" name="Fake" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">95.1%</Typography>
                    <Typography variant="body2" color="text.secondary">Accuracy</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">2.3s</Typography>
                    <Typography variant="body2" color="text.secondary">Avg Processing</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">156</Typography>
                    <Typography variant="body2" color="text.secondary">Total Inspections</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">5.1%</Typography>
                    <Typography variant="body2" color="text.secondary">False Positive Rate</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalyticsPage;