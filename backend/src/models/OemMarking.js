const mongoose = require('mongoose');

const oemMarkingSchema = new mongoose.Schema({
  // IC Basic Information
  icPartNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  series: {
    type: String,
    trim: true
  },
  packageType: {
    type: String,
    required: true,
    trim: true,
    enum: ['BGA', 'QFP', 'SOIC', 'TSSOP', 'LQFP', 'DFN', 'QFN', 'SOP', 'SSOP', 'PLCC', 'DIP', 'OTHER']
  },
  category: {
    type: String,
    required: true,
    enum: ['microcontroller', 'memory', 'processor', 'analog', 'power', 'interface', 'logic', 'sensor', 'other']
  },

  // Marking Information
  marking: {
    text: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    format: {
      type: String,
      enum: ['alphanumeric', 'numeric', 'mixed', 'logo+text', 'qr_code', 'barcode']
    },
    lines: {
      type: Number,
      min: 1,
      max: 10,
      default: 1
    },
    font: {
      type: String,
      enum: ['laser_etched', 'ink_printed', 'embossed', 'screen_printed'],
      default: 'laser_etched'
    },
    size: {
      type: String,
      enum: ['very_small', 'small', 'medium', 'large'],
      default: 'small'
    }
  },

  // Logo Information (Optional)
  logo: {
    hasLogo: {
      type: Boolean,
      default: false
    },
    logoName: {
      type: String,
      trim: true
    },
    logoPosition: {
      type: String,
      enum: ['top', 'bottom', 'left', 'right', 'center'],
      default: 'top'
    },
    logoImagePath: {
      type: String,
      trim: true
    }
  },

  // Physical Specifications
  dimensions: {
    length: {
      type: Number, // in mm
      min: 0.1
    },
    width: {
      type: Number, // in mm
      min: 0.1
    },
    height: {
      type: Number, // in mm
      min: 0.1
    }
  },

  // Marking Variations (for different date codes, lot codes, etc.)
  variations: [{
    pattern: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    regex: {
      type: String
    },
    examples: [String]
  }],

  // Quality and Validation
  validationRules: {
    minSimilarity: {
      type: Number,
      min: 0.1,
      max: 1.0,
      default: 0.9
    },
    requiredElements: [String], // Elements that must be present
    forbiddenElements: [String], // Elements that indicate fake
    caseSensitive: {
      type: Boolean,
      default: false
    }
  },

  // Reference Information
  datasheet: {
    url: {
      type: String,
      trim: true
    },
    version: {
      type: String,
      trim: true
    },
    lastChecked: {
      type: Date
    }
  },

  // Sample Images
  sampleImages: [{
    imagePath: {
      type: String,
      required: true
    },
    imageType: {
      type: String,
      enum: ['reference', 'genuine', 'fake_example'],
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  }],

  // Usage Statistics
  stats: {
    timesUsed: {
      type: Number,
      default: 0
    },
    correctDetections: {
      type: Number,
      default: 0
    },
    falsePositives: {
      type: Number,
      default: 0
    },
    falseNegatives: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    }
  },

  // Metadata
  source: {
    type: String,
    enum: ['manual_entry', 'datasheet_extraction', 'image_analysis', 'supplier_data'],
    default: 'manual_entry'
  },
  confidence: {
    type: Number,
    min: 0.0,
    max: 1.0,
    default: 1.0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  tags: [String],

  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for accuracy rate
oemMarkingSchema.virtual('accuracyRate').get(function() {
  const total = this.stats.correctDetections + this.stats.falsePositives + this.stats.falseNegatives;
  return total > 0 ? ((this.stats.correctDetections / total) * 100).toFixed(2) : 100;
});

// Virtual for display name
oemMarkingSchema.virtual('displayName').get(function() {
  return `${this.manufacturer} ${this.icPartNumber}`;
});

// Pre-save middleware to update stats
oemMarkingSchema.pre('save', function(next) {
  if (this.isModified('stats.correctDetections') || 
      this.isModified('stats.falsePositives') || 
      this.isModified('stats.falseNegatives')) {
    this.stats.lastUsed = new Date();
  }
  next();
});

// Static method to find by manufacturer
oemMarkingSchema.statics.findByManufacturer = function(manufacturer) {
  return this.find({ 
    manufacturer: new RegExp(manufacturer, 'i'), 
    isActive: true 
  });
};

// Static method to search markings
oemMarkingSchema.statics.searchMarkings = function(searchText) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { icPartNumber: new RegExp(searchText, 'i') },
          { manufacturer: new RegExp(searchText, 'i') },
          { 'marking.text': new RegExp(searchText, 'i') },
          { tags: { $in: [new RegExp(searchText, 'i')] } }
        ]
      }
    ]
  });
};

// Instance method to update usage stats
oemMarkingSchema.methods.updateUsageStats = function(isCorrect, detectionType) {
  this.stats.timesUsed += 1;
  
  if (isCorrect) {
    this.stats.correctDetections += 1;
  } else {
    if (detectionType === 'false_positive') {
      this.stats.falsePositives += 1;
    } else if (detectionType === 'false_negative') {
      this.stats.falseNegatives += 1;
    }
  }
  
  this.stats.lastUsed = new Date();
  return this.save();
};

// Compound indexes for better query performance
oemMarkingSchema.index({ manufacturer: 1, icPartNumber: 1 });
oemMarkingSchema.index({ 'marking.text': 1 });
oemMarkingSchema.index({ packageType: 1, category: 1 });
oemMarkingSchema.index({ isActive: 1, manufacturer: 1 });
oemMarkingSchema.index({ tags: 1 });
oemMarkingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('OemMarking', oemMarkingSchema);