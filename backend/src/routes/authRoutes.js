const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin,
  validatePagination 
} = require('../middleware/validation');

// Import controller
const authController = require('../controllers/authController');

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);
router.post('/logout', authController.logout); // Client-side logout

// Protected routes (require authentication)
router.use(authenticateToken); // All routes below require authentication

// User profile routes
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);
router.get('/stats', authController.getUserStats);

// Admin only routes
router.get('/users', requireAdmin, validatePagination, authController.getAllUsers);
router.put('/users/:userId', requireAdmin, authController.updateUser);
router.delete('/users/:userId', requireAdmin, authController.deleteUser);

module.exports = router;