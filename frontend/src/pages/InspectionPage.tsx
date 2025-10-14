import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Container,
  Grid,
  Chip,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  CloudUpload,
  Clear,
  PhotoCamera,
  Analytics,
  CheckCircle,
  Warning,
  Error,
  Help,
  Refresh,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { FileUploadState, BoundingBox } from '../types';

const VisuallyHiddenInput = styled('input')(({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
}));

const PreviewImage = styled('img')(({
  maxWidth: '100%',
  maxHeight: '400px',
  objectFit: 'contain',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}));

interface AnalysisResult {
  success: boolean;
  message: string;
  data?: {
    inspectionId: string;
    classification: string;
    confidence: number;
    processingTime: number;
    extractedText: string;
    similarity?: number;
    bestMatch?: {
      partNumber: string;
      manufacturer: string;
    };
    boundingBoxes?: BoundingBox[];
  };
}

interface InspectionSettings {
  ocrEngine: 'easyocr' | 'tesseract' | 'auto';
  enhanceImage: boolean;
}

const InspectionPage: React.FC = () => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
  });
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [settings, setSettings] = useState<InspectionSettings>({
    ocrEngine: 'auto',
    enhanceImage: true,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
      setUploadState(prev => ({
        ...prev,
        file,
        error: null,
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadState(prev => ({
          ...prev,
          preview: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
      
      // Clear previous results
      setResult(null);
    } else {
      setUploadState(prev => ({
        ...prev,
        error: 'Please select a valid image file (JPEG, PNG, or WebP)',
      }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!uploadState.file) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please select an image first',
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null,
    }));

    const formData = new FormData();
    formData.append('image', uploadState.file);
    formData.append('ocrEngine', settings.ocrEngine);
    formData.append('enhanceImage', settings.enhanceImage.toString());

    try {
      // Simulate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          setUploadState(prev => ({ ...prev, progress }));
        } else {
          clearInterval(progressInterval);
        }
      }, 200);

      const response = await fetch('http://localhost:5001/api/inspect', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      clearInterval(progressInterval);
      setUploadState(prev => ({ ...prev, progress: 100 }));
      
      const data: AnalysisResult = await response.json();
      setResult(data);
      
      if (!data.success) {
        setUploadState(prev => ({
          ...prev,
          error: data.message,
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({ 
        success: false, 
        message: 'Connection error occurred. Please check if the server is running.' 
      });
    } finally {
      setTimeout(() => {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          progress: 0,
        }));
      }, 1000);
    }
  };

  const clearSelection = (): void => {
    setUploadState({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
    });
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retryAnalysis = (): void => {
    handleSubmit();
  };

  const getClassificationIcon = (classification: string): JSX.Element => {
    switch (classification.toLowerCase()) {
      case 'genuine':
        return <CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />;
      case 'fake':
        return <Error sx={{ color: 'error.main', fontSize: 32 }} />;
      case 'suspicious':
        return <Warning sx={{ color: 'warning.main', fontSize: 32 }} />;
      default:
        return <Help sx={{ color: 'info.main', fontSize: 32 }} />;
    }
  };

  const getClassificationColor = (classification: string): 'success' | 'error' | 'warning' | 'info' => {
    switch (classification.toLowerCase()) {
      case 'genuine':
        return 'success';
      case 'fake':
        return 'error';
      case 'suspicious':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getRiskLevelColor = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          IC Inspection
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload an integrated circuit image for authentication analysis
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Upload Section */}
        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoCamera />
                Image Upload
              </Typography>
              
              {/* Settings */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>OCR Engine</InputLabel>
                      <Select
                        value={settings.ocrEngine}
                        label="OCR Engine"
                        onChange={(e) => setSettings(prev => ({ ...prev, ocrEngine: e.target.value as any }))}
                        disabled={uploadState.uploading}
                      >
                        <MenuItem value="auto">Auto Select</MenuItem>
                        <MenuItem value="easyocr">EasyOCR</MenuItem>
                        <MenuItem value="tesseract">Tesseract</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enhanceImage}
                          onChange={(e) => setSettings(prev => ({ ...prev, enhanceImage: e.target.checked }))}
                          disabled={uploadState.uploading}
                        />
                      }
                      label="Enhance Image"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUpload />}
                  size="large"
                  fullWidth
                  disabled={uploadState.uploading}
                  sx={{ mb: 2 }}
                >
                  Choose Image File
                  <VisuallyHiddenInput
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                  />
                </Button>
                
                {uploadState.file && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {uploadState.file.name} ({(uploadState.file.size / 1024).toFixed(2)} KB)
                    </Typography>
                    <IconButton onClick={clearSelection} color="error" size="small" disabled={uploadState.uploading}>
                      <Clear />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {uploadState.error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {uploadState.error}
                </Alert>
              )}

              {uploadState.preview && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Image Preview
                  </Typography>
                  <PreviewImage src={uploadState.preview} alt="Preview" />
                </Box>
              )}

              <Button 
                onClick={handleSubmit} 
                disabled={!uploadState.file || uploadState.uploading}
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                startIcon={<Analytics />}
              >
                {uploadState.uploading ? 'Analyzing...' : 'Analyze Image'}
              </Button>
              
              {uploadState.uploading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadState.progress} />
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    {uploadState.progress}% Complete
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={6}>
          {result ? (
            <Card elevation={2}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics />
                    Analysis Results
                  </Typography>
                  {!result.success && (
                    <IconButton onClick={retryAnalysis} color="primary" title="Retry Analysis">
                      <Refresh />
                    </IconButton>
                  )}
                </Box>
                
                {result.success && result.data ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      {getClassificationIcon(result.data.classification)}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" component="h3" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                          {result.data.classification}
                        </Typography>
                        <Chip 
                          label={`${(result.data.confidence * 100).toFixed(1)}% Confidence`}
                          color={getRiskLevelColor(result.data.confidence)}
                          variant="filled"
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" component="div" gutterBottom sx={{ fontWeight: 'medium' }}>
                        Extracted Text:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', minHeight: '60px' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          {result.data.extractedText || 'No text detected'}
                        </Typography>
                      </Paper>
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                            Processing Time
                          </Typography>
                          <Typography variant="h6">
                            {result.data.processingTime}ms
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {result.data.similarity && (
                        <Grid item xs={6}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                              Similarity Score
                            </Typography>
                            <Typography variant="h6">
                              {(result.data.similarity * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                            Inspection ID
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {result.data.inspectionId}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {result.data.bestMatch && (
                      <Box>
                        <Typography variant="body1" component="div" gutterBottom sx={{ fontWeight: 'medium' }}>
                          Best Match Found:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {result.data.bestMatch.partNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Manufacturer: {result.data.bestMatch.manufacturer}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Alert severity="error">
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Analysis Failed</Typography>
                    <Typography variant="body2">{result.message}</Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card elevation={2} sx={{ height: 'fit-content' }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Analytics sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Ready to Analyze
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload an IC image to begin the authentication process. Results will appear here.
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