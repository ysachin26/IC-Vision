require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Import configurations
const { connectDB } = require('./config/database');

// Import middleware
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
// We'll create these next
const authRoutes = require('./routes/authRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const oemRoutes = require('./routes/oemRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Create required directories
const createDirectories = () => {
  const directories = [
    'uploads',
    'logs',
    'temp'
  ];
  
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}/`);
    }
  });
};

// Database connection
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Create required directories
    createDirectories();
    
    // Trust proxy (for rate limiting behind reverse proxy)
    app.set('trust proxy', 1);
    
    // Security middleware
    app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    
    // CORS configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    app.use(cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400 // 24 hours
    }));
    
    // Compression middleware
    app.use(compression());
    
    // Body parsing middleware
    app.use(express.json({ 
      limit: '10mb',
      type: 'application/json'
    }));
    app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));
    
    // Logging middleware
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    } else {
      app.use(morgan('combined'));
    }
    
    // Static files middleware
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'MarkSure AOI System is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    });
    
    // API status endpoint
    app.get('/api/status', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API is operational',
        services: {
          database: 'connected',
          aiService: 'pending', // Will be updated when AI service is checked
          storage: 'ready'
        },
        timestamp: new Date().toISOString()
      });
    });
    
    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/inspections', inspectionRoutes);
    app.use('/api/oem', oemRoutes);
    
    // API documentation route (placeholder)
    app.get('/api/docs', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'MarkSure AOI API Documentation',
        version: '1.0.0',
        endpoints: {
          authentication: {
            'POST /api/auth/register': 'Register a new user',
            'POST /api/auth/login': 'Login user',
            'GET /api/auth/profile': 'Get user profile',
            'PUT /api/auth/profile': 'Update user profile',
            'POST /api/auth/change-password': 'Change password'
          },
          inspections: {
            'POST /api/inspections/analyze': 'Upload and analyze IC image',
            'GET /api/inspections': 'Get inspection history',
            'GET /api/inspections/:id': 'Get specific inspection',
            'POST /api/inspections/:id/verify': 'Verify inspection result',
            'GET /api/inspections/analytics': 'Get inspection analytics'
          },
          oem: {
            'GET /api/oem/markings': 'Get OEM markings',
            'POST /api/oem/markings': 'Add new OEM marking',
            'PUT /api/oem/markings/:id': 'Update OEM marking',
            'DELETE /api/oem/markings/:id': 'Delete OEM marking'
          }
        }
      });
    });
    
    // Root endpoint
    app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Welcome to MarkSure AOI System API',
        version: '1.0.0',
        documentation: '/api/docs',
        health: '/health',
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle 404 - Route not found
    app.use(notFound);
    
    // Global error handler (must be last middleware)
    app.use(globalErrorHandler);
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`\\n🚀 MarkSure AOI Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
      console.log(`⚡ Ready to process IC inspections!\\n`);
    });
    
    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\\n📋 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('🔒 HTTP server closed.');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.log('⚠️ Forcing shutdown...');
        process.exit(1);
      }, 10000);
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();