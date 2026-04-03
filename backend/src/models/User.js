const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['reseller', 'admin'],
      default: 'reseller',
    },
    resellerId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined to not conflict (though for resellers it should exist)
    },
    // For fraud prevention
    lastLoginIp: String,
    registrationIp: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // next() is optional with async/await in mongoose 5+, but good to be explicit or just rely on promise
});

// Generate Reseller ID if role is reseller
userSchema.pre('save', function (next) {
  if (this.role === 'reseller' && !this.resellerId) {
    // Generate a short unique ID (e.g., 8 chars) or use UUID. 
    // For affiliate links, shorter is often nicer, but UUID is collision-safe.
    // Let's use a part of UUID or a random string to keep it URL friendly.
    this.resellerId = uuidv4().split('-')[0]; // Simple 8-char hex
  }
  // next(); // Don't call next() here if not needed for sync middleware or just use return
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
