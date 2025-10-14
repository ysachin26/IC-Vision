import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  TextField,
  MenuItem,
  LinearProgress,
  Chip,
  Alert,
  Paper
} from '@mui/material';
import { CloudUpload, PhotoCamera, Analytics } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';

const InspectionPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [ocrEngine, setOcrEngine] = useState('easyocr');
  const [metadata, setMetadata] = useState({
    location: '',
    station: '',
    notes: ''
  });

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff']
    },
    maxFiles: 1,
    maxSize: 10485760 // 10MB
  });

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('ocrEngine', ocrEngine);
    formData.append('location', metadata.location);
    formData.append('station', metadata.station);
    formData.append('notes', metadata.notes);

    try {
      const response = await axios.post('/inspections/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data.data.inspection);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Show demo results if API fails
      const demoResults = {
        inspectionId: `DEMO-${Date.now()}`,
        ocrResults: {
          extractedText: 'ATMEGA328P-PU 2241 AVR',
          confidence: 0.92
        },
        matching: {
          matchedOem: {
            manufacturer: 'Microchip Technology',
            icPartNumber: 'ATMEGA328P-PU'
          },
          similarity: {
            overallSimilarity: 0.94
          }
        },
        result: {
          classification: 'genuine',
          confidence: 0.91,
          reasoning: 'High similarity match with OEM reference and good OCR confidence',
          riskLevel: 'low'
        },
        processing: {
          duration: 2300
        },
        quality: {
          imageQuality: 'good'
        }
      };
      
      setResults(demoResults);
      toast.warning('Using demo results - API not available');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'genuine': return 'success';
      case 'fake': return 'error';
      case 'suspicious': return 'warning';
      case 'inconclusive': return 'default';
      default: return 'default';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        IC Marking Inspection
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Upload IC images for automated marking analysis and verification
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload IC Image
              </Typography>
              
              <Paper
                {...getRootProps()}
                sx={{
                  p: 3,
                  border: '2px dashed #ccc',
                  borderColor: isDragActive ? 'primary.main' : '#ccc',
                  backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                  textAlign: 'center',
                  cursor: 'pointer',
                  mb: 2
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                {isDragActive ? (
                  <Typography>Drop the image here...</Typography>
                ) : (
                  <>
                    <Typography gutterBottom>
                      Drag & drop an IC image here, or click to select
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports: JPEG, PNG, BMP, TIFF (Max: 10MB)
                    </Typography>
                  </>
                )}
              </Paper>

              {previewUrl && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}

              <TextField
                select
                fullWidth
                label="OCR Engine"
                value={ocrEngine}
                onChange={(e) => setOcrEngine(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="easyocr">EasyOCR (Recommended)</MenuItem>
                <MenuItem value="tesseract">Tesseract OCR</MenuItem>
                <MenuItem value="ensemble">Ensemble (Both)</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Location (Optional)"
                value={metadata.location}
                onChange={(e) => setMetadata({ ...metadata, location: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Station ID (Optional)"
                value={metadata.station}
                onChange={(e) => setMetadata({ ...metadata, station: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (Optional)"
                value={metadata.notes}
                onChange={(e) => setMetadata({ ...metadata, notes: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                startIcon={isAnalyzing ? <LinearProgress /> : <Analytics />}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze IC Marking'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {isAnalyzing && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analyzing...
                </Typography>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Processing IC image and extracting markings...
                </Typography>
              </CardContent>
            </Card>
          )}

          {results && !isAnalyzing && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>

                {/* Classification */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Classification
                  </Typography>
                  <Chip
                    label={results.result.classification.toUpperCase()}
                    color={getClassificationColor(results.result.classification)}
                    size="large"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`Risk: ${results.result.riskLevel.toUpperCase()}`}
                    color={getRiskColor(results.result.riskLevel)}
                    variant="outlined"
                  />
                </Box>

                {/* OCR Results */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Extracted Text
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {results.ocrResults.extractedText || 'No text detected'}
                    </Typography>
                  </Paper>
                  <Typography variant="body2" color="text.secondary">
                    OCR Confidence: {(results.ocrResults.confidence * 100).toFixed(1)}%
                  </Typography>
                </Box>

                {/* Matching Results */}
                {results.matching.matchedOem && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Matched OEM Reference
                    </Typography>
                    <Typography variant="body1">
                      <strong>{results.matching.matchedOem.manufacturer}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Part Number: {results.matching.matchedOem.icPartNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Similarity: {(results.matching.similarity.overallSimilarity * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                )}

                {/* Confidence & Reasoning */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Analysis Details
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Confidence:</strong> {(results.result.confidence * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Processing Time:</strong> {((results.processing.duration || 2300) / 1000).toFixed(2)}s
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Image Quality:</strong> {results.quality.imageQuality}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <strong>Reasoning:</strong> {results.result.reasoning}
                  </Alert>
                </Box>

                {/* Inspection ID */}
                <Typography variant="body2" color="text.secondary">
                  Inspection ID: {results.inspectionId}
                </Typography>
              </CardContent>
            </Card>
          )}

          {!results && !isAnalyzing && (
            <Card sx={{ minHeight: 200 }}>
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 150
              }}>
                <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  Upload an IC image to see analysis results here
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default InspectionPage;