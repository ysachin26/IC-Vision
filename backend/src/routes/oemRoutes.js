const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken, requireOperator, requireAdmin } = require('../middleware/auth');
const { validateOemMarking, validateSearch } = require('../middleware/validation');

// Import controller - we'll create this simplified version
const { OemMarking } = require('../models');
const { asyncHandler, sendSuccess, sendError, sendPaginatedResponse } = require('../middleware/errorHandler');

// All routes require authentication
router.use(authenticateToken);

// GET /api/oem/markings - Get all OEM markings
router.get('/markings', validateSearch, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search, 
    manufacturer, 
    category, 
    packageType 
  } = req.query;

  // Build query
  const query = { isActive: true };
  
  if (search) {
    query.$or = [
      { icPartNumber: { $regex: search, $options: 'i' } },
      { manufacturer: { $regex: search, $options: 'i' } },
      { 'marking.text': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  if (manufacturer) {
    query.manufacturer = { $regex: manufacturer, $options: 'i' };
  }
  
  if (category) {
    query.category = category;
  }
  
  if (packageType) {
    query.packageType = packageType;
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const markings = await OemMarking.find(query)
    .populate('createdBy', 'username firstName lastName')
    .populate('updatedBy', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await OemMarking.countDocuments(query);

  sendPaginatedResponse(res, markings, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'OEM markings retrieved successfully');
}));

// POST /api/oem/markings - Add new OEM marking
router.post('/markings', requireOperator, validateOemMarking, asyncHandler(async (req, res) => {
  // Check for duplicate
  const existing = await OemMarking.findOne({
    manufacturer: req.body.manufacturer,
    icPartNumber: req.body.icPartNumber
  });

  if (existing) {
    return sendError(res, 409, 'OEM marking with this manufacturer and part number already exists');
  }

  const marking = new OemMarking({
    ...req.body,
    createdBy: req.user._id
  });

  await marking.save();

  const populatedMarking = await OemMarking.findById(marking._id)
    .populate('createdBy', 'username firstName lastName');

  sendSuccess(res, 201, 'OEM marking created successfully', { marking: populatedMarking });
}));

// GET /api/oem/markings/:id - Get specific OEM marking
router.get('/markings/:id', asyncHandler(async (req, res) => {
  const marking = await OemMarking.findById(req.params.id)
    .populate('createdBy', 'username firstName lastName')
    .populate('updatedBy', 'username firstName lastName')
    .populate('verifiedBy', 'username firstName lastName');

  if (!marking) {
    return sendError(res, 404, 'OEM marking not found');
  }

  sendSuccess(res, 200, 'OEM marking retrieved successfully', { marking });
}));

// PUT /api/oem/markings/:id - Update OEM marking
router.put('/markings/:id', requireOperator, validateOemMarking, asyncHandler(async (req, res) => {
  const marking = await OemMarking.findById(req.params.id);

  if (!marking) {
    return sendError(res, 404, 'OEM marking not found');
  }

  // Update fields
  Object.keys(req.body).forEach(key => {
    marking[key] = req.body[key];
  });
  
  marking.updatedBy = req.user._id;
  await marking.save();

  const populatedMarking = await OemMarking.findById(marking._id)
    .populate('createdBy', 'username firstName lastName')
    .populate('updatedBy', 'username firstName lastName');

  sendSuccess(res, 200, 'OEM marking updated successfully', { marking: populatedMarking });
}));

// DELETE /api/oem/markings/:id - Delete (deactivate) OEM marking
router.delete('/markings/:id', requireAdmin, asyncHandler(async (req, res) => {
  const marking = await OemMarking.findById(req.params.id);

  if (!marking) {
    return sendError(res, 404, 'OEM marking not found');
  }

  // Soft delete by setting isActive to false
  marking.isActive = false;
  marking.updatedBy = req.user._id;
  await marking.save();

  sendSuccess(res, 200, 'OEM marking deactivated successfully');
}));

// GET /api/oem/manufacturers - Get list of manufacturers
router.get('/manufacturers', asyncHandler(async (req, res) => {
  const manufacturers = await OemMarking.distinct('manufacturer', { isActive: true });
  
  sendSuccess(res, 200, 'Manufacturers retrieved successfully', { 
    manufacturers: manufacturers.sort() 
  });
}));

// GET /api/oem/stats - Get OEM database statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await OemMarking.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalMarkings: { $sum: 1 },
        totalManufacturers: { $addToSet: '$manufacturer' },
        categories: { $addToSet: '$category' },
        packageTypes: { $addToSet: '$packageType' },
        avgTimesUsed: { $avg: '$stats.timesUsed' },
        totalUsage: { $sum: '$stats.timesUsed' }
      }
    },
    {
      $project: {
        totalMarkings: 1,
        totalManufacturers: { $size: '$totalManufacturers' },
        totalCategories: { $size: '$categories' },
        totalPackageTypes: { $size: '$packageTypes' },
        avgTimesUsed: { $round: ['$avgTimesUsed', 2] },
        totalUsage: 1
      }
    }
  ]);

  sendSuccess(res, 200, 'OEM statistics retrieved successfully', {
    stats: stats[0] || {
      totalMarkings: 0,
      totalManufacturers: 0,
      totalCategories: 0,
      totalPackageTypes: 0,
      avgTimesUsed: 0,
      totalUsage: 0
    }
  });
}));

module.exports = router;