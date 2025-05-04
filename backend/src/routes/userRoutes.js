const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  setup2FA,
  verify2FA,
  disable2FA
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// 2FA routes
router.get('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verify2FA);
router.delete('/2fa', protect, disable2FA);

module.exports = router;