const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const { asyncHandler, AppError, sendSuccess, sendError } = require('../middleware/errorHandler');

// Register a new user
const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, role, department } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return sendError(res, 400, 'User with this email or username already exists');
  }

  // Create new user
  const user = new User({
    username,
    email,
    password, // Will be hashed by the pre-save middleware
    firstName,
    lastName,
    role: role || 'operator',
    department
  });

  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  sendSuccess(res, 201, 'User registered successfully', {
    user: userResponse,
    token
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.isActive) {
    return sendError(res, 401, 'Invalid credentials or account is disabled');
  }

  // Check password
  const isPasswordCorrect = await user.correctPassword(password, user.password);

  if (!isPasswordCorrect) {
    return sendError(res, 401, 'Invalid credentials');
  }

  // Update last login
  await user.updateLastLogin();

  // Generate JWT token
  const token = generateToken(user._id);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  sendSuccess(res, 200, 'Login successful', {
    user: userResponse,
    token
  });
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  sendSuccess(res, 200, 'Profile retrieved successfully', { user });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const updates = req.body;
  const allowedUpdates = ['firstName', 'lastName', 'department', 'preferences'];
  
  // Filter out non-allowed updates
  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    filteredUpdates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  sendSuccess(res, 200, 'Profile updated successfully', { user });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendError(res, 400, 'Current password and new password are required');
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Verify current password
  const isCurrentPasswordCorrect = await user.correctPassword(currentPassword, user.password);

  if (!isCurrentPasswordCorrect) {
    return sendError(res, 400, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword; // Will be hashed by pre-save middleware
  await user.save();

  sendSuccess(res, 200, 'Password changed successfully');
});

// Logout user (client-side implementation)
const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT implementation, logout is typically handled client-side
  // by removing the token from storage. We could implement token blacklisting
  // here if needed.
  
  sendSuccess(res, 200, 'Logout successful');
});

// Get user statistics
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // This could be expanded with more detailed analytics
  const user = await User.findById(userId).select('stats');
  
  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  sendSuccess(res, 200, 'User statistics retrieved successfully', {
    stats: user.stats
  });
});

// Admin only: Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, isActive } = req.query;

  // Build query
  const query = {};
  
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    query.role = role;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  };

  sendSuccess(res, 200, 'Users retrieved successfully', {
    users,
    pagination
  });
});

// Admin only: Update user
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  const allowedUpdates = ['firstName', 'lastName', 'role', 'department', 'isActive'];
  const filteredUpdates = {};
  
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    userId,
    filteredUpdates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  sendSuccess(res, 200, 'User updated successfully', { user });
});

// Admin only: Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Don't allow users to delete themselves
  if (userId === req.user._id.toString()) {
    return sendError(res, 400, 'Cannot delete your own account');
  }

  const user = await User.findById(userId);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Soft delete by setting isActive to false
  user.isActive = false;
  await user.save();

  sendSuccess(res, 200, 'User deactivated successfully');
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getUserStats,
  getAllUsers,
  updateUser,
  deleteUser
};