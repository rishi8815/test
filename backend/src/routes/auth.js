const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifySignupOTP,
  loginUser,
  getMe,
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', registerUser);
router.post('/verify-signup', verifySignupOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.put('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
