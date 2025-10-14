const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Import middleware
const { authenticateToken, requireOperator } = require('../middleware/auth');
const { validateFileUpload, validateInspectionVerification } = require('../middleware/validation');

// Import controller
const inspectionController = require('../controllers/inspectionController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `ic-image-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, BMP, and TIFF are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
    files: 1 // Only one file at a time
  },
  fileFilter: fileFilter
});

// All routes require authentication
router.use(authenticateToken);

// POST /api/inspections/analyze - Upload and analyze IC image
router.post('/analyze', 
  requireOperator,
  upload.single('image'), 
  validateFileUpload,
  inspectionController.uploadAndAnalyze
);

// GET /api/inspections - Get inspection history with filtering
router.get('/', inspectionController.getInspectionHistory);

// GET /api/inspections/analytics - Get inspection analytics
router.get('/analytics', inspectionController.getAnalytics);

// GET /api/inspections/:inspectionId - Get specific inspection by ID
router.get('/:inspectionId', inspectionController.getInspectionById);

// POST /api/inspections/:inspectionId/verify - Verify inspection result
router.post('/:inspectionId/verify', 
  requireOperator,
  validateInspectionVerification,
  inspectionController.verifyInspection
);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "image" as field name.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;