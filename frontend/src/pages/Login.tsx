import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Business,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest, RegisterRequest, FormErrors } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps): JSX.Element {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Login: React.FC = () => {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');
  
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  
  const [registerData, setRegisterData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: '',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
    setErrors({});
    setSubmitError('');
  };

  const handleShowPasswordToggle = (): void => {
    setShowPassword(!showPassword);
  };

  const handleLoginChange = (field: keyof LoginRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setLoginData({ ...loginData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleRegisterChange = (field: keyof RegisterRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setRegisterData({ ...registerData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateLoginForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!loginData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!registerData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!registerData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!registerData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!registerData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setSubmitError('');
    
    if (!validateLoginForm()) return;
    
    const result = await login(loginData.email, loginData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setSubmitError(result.message || 'Login failed');
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setSubmitError('');
    
    if (!validateRegisterForm()) return;
    
    const result = await register(registerData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setSubmitError(result.message || 'Registration failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ bgcolor: 'transparent', color: 'white', p: 4 }}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                MarkSure AOI
              </Typography>
              <Typography variant="h5" component="p" gutterBottom>
                Integrated Circuit Authentication Platform
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 3, lineHeight: 1.7 }}>
                Advanced AI-powered system for detecting counterfeit integrated circuits
                through optical character recognition and intelligent pattern matching.
                Protect your supply chain with cutting-edge authentication technology.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={8} sx={{ maxWidth: 480, mx: 'auto' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab label="Sign In" />
                    <Tab label="Register" />
                  </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                  <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={loginData.email}
                      onChange={handleLoginChange('email')}
                      error={!!errors.email}
                      helperText={errors.email}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={handleLoginChange('password')}
                      error={!!errors.password}
                      helperText={errors.password}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleShowPasswordToggle} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {submitError && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {submitError}
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Box component="form" onSubmit={handleRegisterSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={registerData.firstName}
                          onChange={handleRegisterChange('firstName')}
                          error={!!errors.firstName}
                          helperText={errors.firstName}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={registerData.lastName}
                          onChange={handleRegisterChange('lastName')}
                          error={!!errors.lastName}
                          helperText={errors.lastName}
                        />
                      </Grid>
                    </Grid>
                    
                    <TextField
                      fullWidth
                      label="Username"
                      value={registerData.username}
                      onChange={handleRegisterChange('username')}
                      error={!!errors.username}
                      helperText={errors.username}
                      margin="normal"
                    />
                    
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={registerData.email}
                      onChange={handleRegisterChange('email')}
                      error={!!errors.email}
                      helperText={errors.email}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Department"
                      value={registerData.department}
                      onChange={handleRegisterChange('department')}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={handleRegisterChange('password')}
                      error={!!errors.password}
                      helperText={errors.password}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleShowPasswordToggle} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {submitError && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {submitError}
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Create Account'}
                    </Button>
                  </Box>
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;