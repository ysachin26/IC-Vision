import React from 'react';
import { Container, Typography, Card, CardContent, Box, Chip } from '@mui/material';
import { History } from '@mui/icons-material';

const HistoryPage = () => {
  const sampleHistory = [
    { id: 'INS-001', text: 'ATMEGA328P-PU 2241 AVR', classification: 'genuine', date: '2024-10-14' },
    { id: 'INS-002', text: 'STM32F103C8T6 945 CHN', classification: 'suspicious', date: '2024-10-14' },
    { id: 'INS-003', text: 'NE555P TI 2241', classification: 'genuine', date: '2024-10-13' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Inspection History
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Browse past IC marking inspections and results
      </Typography>

      {sampleHistory.map((item) => (
        <Card key={item.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">{item.id}</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {item.text}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.date}
                </Typography>
              </Box>
              <Chip 
                label={item.classification.toUpperCase()} 
                color={item.classification === 'genuine' ? 'success' : 'warning'} 
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default HistoryPage;