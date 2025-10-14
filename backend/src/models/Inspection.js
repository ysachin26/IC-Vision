const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const inspectionSchema = new mongoose.Schema({
  // Unique inspection identifier
  inspectionId: {
    type: String,
    unique: true,
    default: () => `INS-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`
  },

  // Image Information
  image: {
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    dimensions: {
      width: Number,
      height: Number
    },
    hash: {
      type: String, // File hash for duplicate detection
      index: true
    }
  },

  // Processing Information
  processing: {
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number // in milliseconds
    },
    ocrEngine: {
      type: String,
      enum: ['easyocr', 'tesseract', 'paddleocr', 'ensemble'],
      required: true
    },
    preprocessingSteps: [String], // Array of preprocessing steps applied
    aiServiceVersion: {
      type: String,
      default: '1.0.0'
    }
  },

  // OCR Results
  ocrResults: {
    extractedText: {
      type: String,
      required: true,
      index: true
    },
    confidence: {
      type: Number,
      min: 0.0,
      max: 1.0,
      required: true
    },
    boundingBoxes: [{
      text: String,
      confidence: Number,
      coordinates: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      }
    }],
    language: {
      type: String,
      default: 'en'
    },
    alternatives: [String] // Alternative OCR readings
  },

  // Logo Detection Results (Optional)
  logoResults: {
    detected: {
      type: Boolean,
      default: false
    },
    logoName: String,
    confidence: Number,
    boundingBox: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  },

  // Matching and Classification
  matching: {
    // Best matched OEM marking
    matchedOem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OemMarking'
    },
    similarity: {
      textSimilarity: {
        type: Number,
        min: 0.0,
        max: 1.0
      },
      logoSimilarity: {
        type: Number,
        min: 0.0,
        max: 1.0
      },
      overallSimilarity: {
        type: Number,
        min: 0.0,
        max: 1.0,
        required: true
      }
    },
    method: {
      type: String,
      enum: ['exact_match', 'fuzzy_match', 'regex_match', 'ml_similarity'],
      default: 'fuzzy_match'
    },
    alternativeMatches: [{
      oemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OemMarking'
      },
      similarity: Number,
      reason: String
    }]
  },

  // Final Classification
  result: {
    classification: {
      type: String,
      enum: ['genuine', 'fake', 'suspicious', 'inconclusive'],
      required: true,
      index: true
    },
    confidence: {
      type: Number,
      min: 0.0,
      max: 1.0,
      required: true
    },
    reasoning: {
      type: String,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    flags: [String], // Array of warning flags
    recommendations: [String] // Recommended actions
  },

  // Quality Metrics
  quality: {
    imageQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true
    },
    clarity: {
      type: Number,
      min: 0.0,
      max: 1.0
    },
    lighting: {
      type: String,
      enum: ['optimal', 'adequate', 'poor', 'overexposed', 'underexposed']
    },
    angle: {
      type: String,
      enum: ['perfect', 'good', 'tilted', 'skewed']
    },
    focus: {
      type: Number,
      min: 0.0,
      max: 1.0
    }
  },

  // Human Verification (Optional)
  verification: {
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    humanClassification: {
      type: String,
      enum: ['genuine', 'fake', 'suspicious', 'inconclusive']
    },
    humanConfidence: {
      type: Number,
      min: 0.0,
      max: 1.0
    },
    verificationNotes: String,
    agreesWithAI: Boolean
  },

  // Batch Information (Optional)
  batch: {
    batchId: String,
    batchSize: Number,
    position: Number
  },

  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['web_upload', 'api', 'batch_processing', 'camera_capture'],
      default: 'web_upload'
    },
    location: {
      type: String,
      trim: true
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    station: String, // Inspection station identifier
    sessionId: String, // Session identifier for grouped inspections
    tags: [String],
    notes: {
      type: String,
      maxlength: 1000
    }
  },

  // Archive and Retention
  archived: {
    type: Boolean,
    default: false
  },
  retentionDate: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for processing time in seconds
inspectionSchema.virtual('processingTimeSeconds').get(function() {
  return this.processing.duration ? (this.processing.duration / 1000).toFixed(2) : null;
});

// Virtual for risk score
inspectionSchema.virtual('riskScore').get(function() {
  const riskLevels = { low: 1, medium: 2, high: 3, critical: 4 };
  return riskLevels[this.result.riskLevel] || 0;
});

// Virtual for accuracy assessment (if verified)
inspectionSchema.virtual('accuracyAssessment').get(function() {
  if (!this.verification.verified) return null;
  return this.verification.agreesWithAI ? 'correct' : 'incorrect';
});

// Pre-save middleware to calculate processing duration
inspectionSchema.pre('save', function(next) {
  if (this.processing.endTime && this.processing.startTime) {
    this.processing.duration = this.processing.endTime.getTime() - this.processing.startTime.getTime();
  }
  next();
});

// Static method to get inspections by classification
inspectionSchema.statics.findByClassification = function(classification, limit = 50) {
  return this.find({ 'result.classification': classification })
             .populate('metadata.operator', 'username fullName')
             .populate('matching.matchedOem', 'manufacturer icPartNumber')
             .sort({ createdAt: -1 })
             .limit(limit);
};

// Static method to get recent inspections
inspectionSchema.statics.findRecent = function(limit = 50) {
  return this.find({ archived: false })
             .populate('metadata.operator', 'username fullName')
             .populate('matching.matchedOem', 'manufacturer icPartNumber')
             .sort({ createdAt: -1 })
             .limit(limit);
};

// Static method to get suspicious inspections
inspectionSchema.statics.findSuspicious = function() {
  return this.find({
    $or: [
      { 'result.classification': 'suspicious' },
      { 'result.classification': 'fake' },
      { 'result.riskLevel': 'high' },
      { 'result.riskLevel': 'critical' },
      { 'matching.similarity.overallSimilarity': { $lt: 0.7 } }
    ],
    archived: false
  }).populate('metadata.operator', 'username fullName')
    .populate('matching.matchedOem', 'manufacturer icPartNumber')
    .sort({ createdAt: -1 });
};

// Static method for analytics
inspectionSchema.statics.getAnalytics = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days default
      $lte: endDate || new Date()
    },
    archived: false
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalInspections: { $sum: 1 },
        genuine: { $sum: { $cond: [{ $eq: ['$result.classification', 'genuine'] }, 1, 0] } },
        fake: { $sum: { $cond: [{ $eq: ['$result.classification', 'fake'] }, 1, 0] } },
        suspicious: { $sum: { $cond: [{ $eq: ['$result.classification', 'suspicious'] }, 1, 0] } },
        inconclusive: { $sum: { $cond: [{ $eq: ['$result.classification', 'inconclusive'] }, 1, 0] } },
        avgProcessingTime: { $avg: '$processing.duration' },
        avgConfidence: { $avg: '$result.confidence' },
        avgSimilarity: { $avg: '$matching.similarity.overallSimilarity' }
      }
    }
  ]);
};

// Instance method to mark as verified
inspectionSchema.methods.markAsVerified = function(userId, humanClassification, humanConfidence, notes) {
  this.verification.verified = true;
  this.verification.verifiedBy = userId;
  this.verification.verifiedAt = new Date();
  this.verification.humanClassification = humanClassification;
  this.verification.humanConfidence = humanConfidence;
  this.verification.verificationNotes = notes;
  this.verification.agreesWithAI = (this.result.classification === humanClassification);
  
  return this.save();
};

// Instance method to archive
inspectionSchema.methods.archive = function() {
  this.archived = true;
  return this.save();
};

// Indexes for better query performance
inspectionSchema.index({ inspectionId: 1 });
inspectionSchema.index({ 'result.classification': 1, createdAt: -1 });
inspectionSchema.index({ 'metadata.operator': 1 });
inspectionSchema.index({ 'matching.matchedOem': 1 });
inspectionSchema.index({ archived: 1, createdAt: -1 });
inspectionSchema.index({ 'verification.verified': 1 });
inspectionSchema.index({ 'image.hash': 1 });
inspectionSchema.index({ 'batch.batchId': 1 });

// Text index for search functionality
inspectionSchema.index({
  'ocrResults.extractedText': 'text',
  'metadata.notes': 'text',
  'result.reasoning': 'text'
});

module.exports = mongoose.model('Inspection', inspectionSchema);