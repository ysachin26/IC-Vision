const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const sharp = require('sharp');
const { Inspection, OemMarking } = require('../models');
const { asyncHandler, AppError, sendSuccess, sendError, sendPaginatedResponse } = require('../middleware/errorHandler');

// Upload and analyze IC image
const uploadAndAnalyze = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, 'No image file uploaded');
  }

  const startTime = new Date();
  
  try {
    // Get image metadata using Sharp
    const imageMetadata = await sharp(req.file.path).metadata();
    
    // Generate file hash for duplicate detection
    const fileBuffer = await sharp(req.file.path).toBuffer();
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');

    // Check for duplicate uploads
    const existingInspection = await Inspection.findOne({ 'image.hash': fileHash });
    if (existingInspection) {
      return sendError(res, 409, 'This image has already been processed', {
        existingInspectionId: existingInspection.inspectionId,
        existingResult: existingInspection.result
      });
    }

    // Create inspection record
    const inspection = new Inspection({
      image: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        dimensions: {
          width: imageMetadata.width,
          height: imageMetadata.height
        },
        hash: fileHash
      },
      processing: {
        startTime,
        ocrEngine: req.body.ocrEngine || 'easyocr'
      },
      quality: {
        imageQuality: assessImageQuality(imageMetadata),
        lighting: 'adequate', // Will be updated by AI service
        angle: 'good',        // Will be updated by AI service
        focus: 0.8           // Will be updated by AI service
      },
      metadata: {
        source: 'web_upload',
        operator: req.user._id,
        location: req.body.location,
        station: req.body.station,
        notes: req.body.notes,
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
      }
    });

    // Save initial inspection record
    await inspection.save();

    // Call AI service for analysis
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    // Prepare form data for AI service
    const formData = new FormData();
    formData.append('image', fileBuffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    formData.append('ocr_engine', inspection.processing.ocrEngine);
    formData.append('inspection_id', inspection.inspectionId);

    // Make request to AI service
    const aiResponse = await axios.post(`${aiServiceUrl}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // 30 seconds timeout
    });

    const aiResults = aiResponse.data;

    // Update inspection with AI results
    inspection.processing.endTime = new Date();
    inspection.ocrResults = {
      extractedText: aiResults.extracted_text,
      confidence: aiResults.ocr_confidence,
      boundingBoxes: aiResults.bounding_boxes || [],
      alternatives: aiResults.alternatives || []
    };

    // Find best matching OEM marking
    const matchingResults = await findBestOemMatch(aiResults.extracted_text);
    
    inspection.matching = {
      matchedOem: matchingResults.bestMatch ? matchingResults.bestMatch._id : null,
      similarity: {
        textSimilarity: matchingResults.similarity,
        overallSimilarity: matchingResults.similarity
      },
      method: 'fuzzy_match',
      alternativeMatches: matchingResults.alternatives
    };

    // Classify the result
    const classification = classifyInspection(matchingResults, aiResults);
    inspection.result = classification;

    // Update processing duration
    inspection.processing.duration = inspection.processing.endTime - inspection.processing.startTime;

    // Save updated inspection
    await inspection.save();

    // Populate the response
    const populatedInspection = await Inspection.findById(inspection._id)
      .populate('matching.matchedOem', 'manufacturer icPartNumber marking logo')
      .populate('metadata.operator', 'username firstName lastName');

    // Update user statistics
    req.user.stats.totalInspections += 1;
    if (classification.classification === 'genuine') {
      req.user.stats.totalGenuineDetected += 1;
    } else if (classification.classification === 'fake') {
      req.user.stats.totalFakeDetected += 1;
    }
    await req.user.save();

    sendSuccess(res, 200, 'Image analyzed successfully', {
      inspection: populatedInspection
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Update inspection with error status if it was created
    if (inspection && inspection._id) {
      inspection.processing.endTime = new Date();
      inspection.result = {
        classification: 'inconclusive',
        confidence: 0,
        reasoning: 'Analysis failed due to technical error',
        riskLevel: 'medium',
        flags: ['analysis_error']
      };
      await inspection.save();
    }

    if (error.code === 'ECONNREFUSED') {
      return sendError(res, 503, 'AI service is currently unavailable');
    }
    
    return sendError(res, 500, 'Failed to analyze image', error.message);
  }
});

// Get inspection by ID
const getInspectionById = asyncHandler(async (req, res) => {
  const { inspectionId } = req.params;

  const inspection = await Inspection.findById(inspectionId)
    .populate('matching.matchedOem', 'manufacturer icPartNumber marking logo')
    .populate('metadata.operator', 'username firstName lastName')
    .populate('verification.verifiedBy', 'username firstName lastName');

  if (!inspection) {
    return sendError(res, 404, 'Inspection not found');
  }

  sendSuccess(res, 200, 'Inspection retrieved successfully', { inspection });
});

// Get inspection history
const getInspectionHistory = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    classification, 
    startDate, 
    endDate, 
    search,
    operator 
  } = req.query;

  // Build query
  const query = { archived: false };
  
  if (classification) {
    query['result.classification'] = classification;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    query.$or = [
      { 'ocrResults.extractedText': { $regex: search, $options: 'i' } },
      { inspectionId: { $regex: search, $options: 'i' } },
      { 'metadata.notes': { $regex: search, $options: 'i' } }
    ];
  }

  if (operator) {
    query['metadata.operator'] = operator;
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const inspections = await Inspection.find(query)
    .populate('matching.matchedOem', 'manufacturer icPartNumber')
    .populate('metadata.operator', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-image.path'); // Exclude file paths for security

  const total = await Inspection.countDocuments(query);

  sendPaginatedResponse(res, inspections, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Inspection history retrieved successfully');
});

// Get inspection analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, period = '30d' } = req.query;
  
  let start, end;
  
  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    // Default to last 30 days
    const days = parseInt(period.replace('d', '')) || 30;
    end = new Date();
    start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  const analytics = await Inspection.getAnalytics(start, end);
  
  sendSuccess(res, 200, 'Analytics retrieved successfully', {
    analytics: analytics[0] || {
      totalInspections: 0,
      genuine: 0,
      fake: 0,
      suspicious: 0,
      inconclusive: 0,
      avgProcessingTime: 0,
      avgConfidence: 0,
      avgSimilarity: 0
    },
    period: { start, end }
  });
});

// Verify inspection result (human verification)
const verifyInspection = asyncHandler(async (req, res) => {
  const { inspectionId } = req.params;
  const { humanClassification, humanConfidence, verificationNotes } = req.body;

  const inspection = await Inspection.findById(inspectionId);
  
  if (!inspection) {
    return sendError(res, 404, 'Inspection not found');
  }

  await inspection.markAsVerified(
    req.user._id,
    humanClassification,
    humanConfidence,
    verificationNotes
  );

  // Update OEM marking statistics
  if (inspection.matching.matchedOem) {
    const oemMarking = await OemMarking.findById(inspection.matching.matchedOem);
    if (oemMarking) {
      const isCorrect = inspection.verification.agreesWithAI;
      const detectionType = isCorrect ? null : 'false_positive';
      await oemMarking.updateUsageStats(isCorrect, detectionType);
    }
  }

  const updatedInspection = await Inspection.findById(inspectionId)
    .populate('verification.verifiedBy', 'username firstName lastName');

  sendSuccess(res, 200, 'Inspection verified successfully', {
    inspection: updatedInspection
  });
});

// Helper functions
function assessImageQuality(metadata) {
  const { width, height, density } = metadata;
  const resolution = width * height;
  
  if (resolution > 2000000) return 'excellent'; // > 2MP
  if (resolution > 1000000) return 'good';      // > 1MP
  if (resolution > 500000) return 'fair';       // > 0.5MP
  return 'poor';
}

async function findBestOemMatch(extractedText) {
  if (!extractedText || extractedText.trim().length === 0) {
    return { bestMatch: null, similarity: 0, alternatives: [] };
  }

  // Get all active OEM markings
  const oemMarkings = await OemMarking.find({ isActive: true });
  const matches = [];

  for (const oem of oemMarkings) {
    // Simple similarity calculation (this could be enhanced with fuzzy matching)
    const similarity = calculateTextSimilarity(extractedText, oem.marking.text);
    
    if (similarity >= oem.validationRules.minSimilarity) {
      matches.push({
        oem,
        similarity
      });
    }
  }

  // Sort by similarity
  matches.sort((a, b) => b.similarity - a.similarity);

  const bestMatch = matches[0];
  const alternatives = matches.slice(1, 5).map(match => ({
    oemId: match.oem._id,
    similarity: match.similarity,
    reason: 'text_similarity'
  }));

  return {
    bestMatch: bestMatch ? bestMatch.oem : null,
    similarity: bestMatch ? bestMatch.similarity : 0,
    alternatives
  };
}

function calculateTextSimilarity(text1, text2) {
  // Simple Levenshtein distance implementation
  // In production, you'd want to use a proper fuzzy matching library
  const str1 = text1.toLowerCase().replace(/\s+/g, '');
  const str2 = text2.toLowerCase().replace(/\s+/g, '');
  
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - matrix[str2.length][str1.length] / maxLength;
}

function classifyInspection(matchingResults, aiResults) {
  const similarity = matchingResults.similarity;
  const ocrConfidence = aiResults.ocr_confidence;
  
  let classification, confidence, reasoning, riskLevel, flags = [], recommendations = [];

  if (similarity >= 0.95 && ocrConfidence >= 0.8) {
    classification = 'genuine';
    confidence = Math.min(similarity, ocrConfidence);
    reasoning = 'High similarity match with OEM reference and good OCR confidence';
    riskLevel = 'low';
  } else if (similarity >= 0.85 && ocrConfidence >= 0.7) {
    classification = 'genuine';
    confidence = (similarity + ocrConfidence) / 2;
    reasoning = 'Good similarity match with OEM reference';
    riskLevel = 'low';
    flags.push('moderate_match');
  } else if (similarity >= 0.70 && ocrConfidence >= 0.6) {
    classification = 'suspicious';
    confidence = (similarity + ocrConfidence) / 2;
    reasoning = 'Moderate similarity match - requires human verification';
    riskLevel = 'medium';
    flags.push('low_similarity');
    recommendations.push('human_verification');
  } else if (similarity < 0.50) {
    classification = 'fake';
    confidence = 1 - similarity;
    reasoning = 'Low similarity to any known OEM marking';
    riskLevel = 'high';
    flags.push('no_match');
    recommendations.push('reject_component');
  } else {
    classification = 'inconclusive';
    confidence = 0.5;
    reasoning = 'Unable to determine authenticity with confidence';
    riskLevel = 'medium';
    flags.push('unclear_marking');
    recommendations.push('human_verification');
  }

  // Additional flags based on OCR confidence
  if (ocrConfidence < 0.6) {
    flags.push('poor_ocr_quality');
    recommendations.push('retake_image');
  }

  return {
    classification,
    confidence,
    reasoning,
    riskLevel,
    flags,
    recommendations
  };
}

module.exports = {
  uploadAndAnalyze,
  getInspectionById,
  getInspectionHistory,
  getAnalytics,
  verifyInspection
};