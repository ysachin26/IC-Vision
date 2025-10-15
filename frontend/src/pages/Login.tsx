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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Business,
  CheckCircle,
  Cancel,
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

  // Password requirements checker
  const getPasswordRequirements = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
  };

  const passwordReqs = getPasswordRequirements(registerData.password);

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
    } else {
      const password = registerData.password;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const isLongEnough = password.length >= 8;
      
      if (!hasUppercase || !hasLowercase || !hasNumber || !isLongEnough) {
        newErrors.password = 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number';
      }
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
                      placeholder="Must contain uppercase, lowercase, number & 8+ characters"
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={handleRegisterChange('password')}
                      error={!!errors.password}
                      helperText={errors.password || 'Choose a strong password'}
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

                    {/* Password Requirements */}
                    {registerData.password.length > 0 && (
                      <Box sx={{ mt: 1, mb: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Password Requirements:
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                          <ListItem sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {passwordReqs.length ? (
                                <CheckCircle color="success" fontSize="small" />
                              ) : (
                                <Cancel color="error" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText 
                              primary="At least 8 characters" 
                              sx={{ 
                                '& .MuiListItemText-primary': { 
                                  fontSize: '0.875rem',
                                  color: passwordReqs.length ? 'success.main' : 'error.main'
                                }
                              }}
                            />
                          </ListItem>
                          <ListItem sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {passwordReqs.uppercase ? (
                                <CheckCircle color="success" fontSize="small" />
                              ) : (
                                <Cancel color="error" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText 
                              primary="One uppercase letter (A-Z)" 
                              sx={{ 
                                '& .MuiListItemText-primary': { 
                                  fontSize: '0.875rem',
                                  color: passwordReqs.uppercase ? 'success.main' : 'error.main'
                                }
                              }}
                            />
                          </ListItem>
                          <ListItem sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {passwordReqs.lowercase ? (
                                <CheckCircle color="success" fontSize="small" />
                              ) : (
                                <Cancel color="error" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText 
                              primary="One lowercase letter (a-z)" 
                              sx={{ 
                                '& .MuiListItemText-primary': { 
                                  fontSize: '0.875rem',
                                  color: passwordReqs.lowercase ? 'success.main' : 'error.main'
                                }
                              }}
                            />
                          </ListItem>
                          <ListItem sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {passwordReqs.number ? (
                                <CheckCircle color="success" fontSize="small" />
                              ) : (
                                <Cancel color="error" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText 
                              primary="One number (0-9)" 
                              sx={{ 
                                '& .MuiListItemText-primary': { 
                                  fontSize: '0.875rem',
                                  color: passwordReqs.number ? 'success.main' : 'error.main'
                                }
                              }}
                            />
                          </ListItem>
                        </List>
                      </Box>
                    )}

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