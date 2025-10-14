import React from 'react';
import { Container, Typography, Card, CardContent, Box, Chip } from '@mui/material';

const OemDatabasePage = () => {
  const sampleOemData = [
    { manufacturer: 'Microchip Technology', part: 'ATMEGA328P-PU', marking: 'ATMEGA328P-PU\\n2241\\nAVR' },
    { manufacturer: 'STMicroelectronics', part: 'STM32F103C8T6', marking: 'STM32F103C8T6\\n945\\nCHN 517' },
    { manufacturer: 'Texas Instruments', part: 'NE555P', marking: 'NE555P\\nTI 2241' },
    { manufacturer: 'Espressif Systems', part: 'ESP32-WROOM-32', marking: 'ESP32-WROOM-32\\nFCC ID: 2AC7Z' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        OEM Database
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Manage reference IC markings from original equipment manufacturers
      </Typography>

      {sampleOemData.map((item, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box>
              <Typography variant="h6" color="primary">
                {item.manufacturer}
              </Typography>
              <Typography variant="body1">
                <strong>Part Number:</strong> {item.part}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', mt: 1 }}>
                <strong>Marking:</strong><br/>
                {item.marking.replace(/\\n/g, ' ')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default OemDatabasePage;