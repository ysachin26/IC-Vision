const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    // Replace req.body with validated and cleaned data
    req.body = value;
    next();
  };
};

// User registration validation schema
const userRegistrationSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must be at most 30 characters long'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }),
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name is required',
      'string.max': 'First name must be at most 50 characters long'
    }),
  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name is required',
      'string.max': 'Last name must be at most 50 characters long'
    }),
  role: Joi.string()
    .valid('admin', 'operator', 'viewer')
    .default('operator'),
  department: Joi.string()
    .trim()
    .max(100)
    .optional()
});

// User login validation schema
const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// OEM marking validation schema
const oemMarkingSchema = Joi.object({
  icPartNumber: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'IC part number must be at least 3 characters long',
      'string.max': 'IC part number must be at most 50 characters long'
    }),
  manufacturer: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Manufacturer name must be at least 2 characters long',
      'string.max': 'Manufacturer name must be at most 100 characters long'
    }),
  series: Joi.string()
    .trim()
    .max(50)
    .optional(),
  packageType: Joi.string()
    .valid('BGA', 'QFP', 'SOIC', 'TSSOP', 'LQFP', 'DFN', 'QFN', 'SOP', 'SSOP', 'PLCC', 'DIP', 'OTHER')
    .required(),
  category: Joi.string()
    .valid('microcontroller', 'memory', 'processor', 'analog', 'power', 'interface', 'logic', 'sensor', 'other')
    .required(),
  marking: Joi.object({
    text: Joi.string()
      .trim()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.min': 'Marking text is required',
        'string.max': 'Marking text must be at most 500 characters long'
      }),
    format: Joi.string()
      .valid('alphanumeric', 'numeric', 'mixed', 'logo+text', 'qr_code', 'barcode')
      .optional(),
    lines: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .default(1),
    font: Joi.string()
      .valid('laser_etched', 'ink_printed', 'embossed', 'screen_printed')
      .default('laser_etched'),
    size: Joi.string()
      .valid('very_small', 'small', 'medium', 'large')
      .default('small')
  }).required(),
  logo: Joi.object({
    hasLogo: Joi.boolean().default(false),
    logoName: Joi.string().trim().when('hasLogo', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    logoPosition: Joi.string()
      .valid('top', 'bottom', 'left', 'right', 'center')
      .default('top')
  }).optional(),
  dimensions: Joi.object({
    length: Joi.number().positive().optional(),
    width: Joi.number().positive().optional(),
    height: Joi.number().positive().optional()
  }).optional(),
  validationRules: Joi.object({
    minSimilarity: Joi.number().min(0.1).max(1.0).default(0.9),
    requiredElements: Joi.array().items(Joi.string().trim()).optional(),
    forbiddenElements: Joi.array().items(Joi.string().trim()).optional(),
    caseSensitive: Joi.boolean().default(false)
  }).optional(),
  notes: Joi.string()
    .trim()
    .max(1000)
    .optional(),
  tags: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
});

// Inspection verification schema
const inspectionVerificationSchema = Joi.object({
  humanClassification: Joi.string()
    .valid('genuine', 'fake', 'suspicious', 'inconclusive')
    .required(),
  humanConfidence: Joi.number()
    .min(0.0)
    .max(1.0)
    .required(),
  verificationNotes: Joi.string()
    .trim()
    .max(1000)
    .optional()
});

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB default

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only JPEG, PNG, BMP, and TIFF images are allowed'
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`
    });
  }

  next();
};

// Query parameters validation
const validateQueryParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ');
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errorMessage
      });
    }
    
    req.query = value;
    next();
  };
};

// Common query schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const searchSchema = Joi.object({
  search: Joi.string().trim().min(1).optional(),
  ...paginationSchema.describe().keys
});

module.exports = {
  validate,
  validateFileUpload,
  validateQueryParams,
  
  // Validation schemas
  userRegistrationSchema,
  userLoginSchema,
  oemMarkingSchema,
  inspectionVerificationSchema,
  paginationSchema,
  searchSchema,
  
  // Pre-configured middleware
  validateUserRegistration: validate(userRegistrationSchema),
  validateUserLogin: validate(userLoginSchema),
  validateOemMarking: validate(oemMarkingSchema),
  validateInspectionVerification: validate(inspectionVerificationSchema),
  validatePagination: validateQueryParams(paginationSchema),
  validateSearch: validateQueryParams(searchSchema)
};