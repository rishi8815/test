const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail, buildOTPEmail } = require('../utils/sendEmail');

// @desc    Register new user
// @route   POST /auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user
  const user = new User({
    name,
    email,
    password,
    role: role || 'reseller', 
    registrationIp: req.ip
  });

  // Generate Signup OTP
  const otp = user.getSignupOTP();
  await user.save();

  // Send OTP via email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Beam Affiliate Account',
      html: buildOTPEmail(otp, 'verify your account'),
    });
  } catch (emailErr) {
    console.error('Failed to send signup OTP email:', emailErr.message);
    // Don't block registration, but log the error
  }

  res.status(201).json({
    message: 'User registered. Please verify your email with the OTP sent.',
    email: user.email
  });
};

// @desc    Verify signup OTP
// @route   POST /auth/verify-signup
// @access  Public
const verifySignupOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Please provide email and OTP' });
  }

  const hashedOTP = require('crypto')
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  const user = await User.findOne({
    email,
    signupOTP: hashedOTP,
    signupOTPExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.isVerified = true;
  user.signupOTP = undefined;
  user.signupOTPExpire = undefined;
  await user.save();

  res.status(200).json({
    message: 'Email verified successfully',
    data: {
      token: generateToken(user._id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        resellerId: user.resellerId,
      }
    }
  });
};

// @desc    Authenticate a user
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    // Update last login IP
    user.lastLoginIp = req.ip;
    await user.save({ validateBeforeSave: false });

    res.json({
      data: {
        token: generateToken(user._id),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          resellerId: user.resellerId,
        }
      }
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
};

// @desc    Get user data
// @route   GET /auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      resellerId: user.resellerId,
    }
  });
};

// @desc    Forgot password
// @route   POST /auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: 'There is no user with that email' });
  }

  // Get reset OTP
  const otp = user.getResetPasswordOTP();

  await user.save({ validateBeforeSave: false });

  // Send OTP via email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Beam Affiliate Password',
      html: buildOTPEmail(otp, 'reset your password'),
    });
  } catch (emailErr) {
    console.error('Failed to send password reset OTP email:', emailErr.message);
  }

  res.status(200).json({
    message: 'OTP has been sent to your email address',
  });
};

// @desc    Verify OTP
// @route   POST /auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Please provide email and OTP' });
  }

  // Get hashed OTP
  const hashedOTP = require('crypto')
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  const user = await User.findOne({
    email,
    resetPasswordOTP: hashedOTP,
    resetPasswordOTPExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  res.status(200).json({
    message: 'OTP verified successfully',
    success: true
  });
};

// @desc    Reset password
// @route   PUT /auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return res.status(400).json({ message: 'Please provide email, OTP and new password' });
  }

  // Get hashed OTP
  const hashedOTP = require('crypto')
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  const user = await User.findOne({
    email,
    resetPasswordOTP: hashedOTP,
    resetPasswordOTPExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Set new password
  user.password = password;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpire = undefined;
  await user.save();

  res.status(200).json({
    message: 'Password reset successful',
    data: {
      token: generateToken(user._id),
    }
  });
};

module.exports = {
  registerUser,
  verifySignupOTP,
  loginUser,
  getMe,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
