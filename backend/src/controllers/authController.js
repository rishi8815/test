const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

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
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'reseller', 
    registrationIp: req.ip
  });

  if (user) {
    res.status(201).json({
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
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate a user
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
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

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
