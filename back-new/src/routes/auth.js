const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { validateLogin, handleValidationErrors } = require('../middleware/validators');

// Import controller
const {
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken,
  getSystemStats
} = require('../controllers/AuthController');

// Public routes
router.post('/login', validateLogin, handleValidationErrors, asyncHandler(login));

// Protected routes
router.use(authenticateToken);

router.get('/profile', asyncHandler(getProfile));
router.put('/profile', asyncHandler(updateProfile));
router.put('/change-password', asyncHandler(changePassword));
router.post('/logout', asyncHandler(logout));
router.get('/verify', asyncHandler(verifyToken));
router.get('/system-stats', asyncHandler(getSystemStats));

module.exports = router;
