const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

// Mock OTP storage (in memory for MVP, use Redis in prod)
const otpStore = new Map();

// @desc    Request data deletion (Public)
// @route   POST /privacy/deletion-request
const requestDeletion = async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    // Return success to avoid user enumeration
    return res.json({ message: 'If the email exists, a verification code has been sent.' });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const token = uuidv4();
  
  otpStore.set(token, { email, otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 min

  // Log audit
  await AuditLog.create({
    userId: user._id,
    action: 'DELETION_REQUESTED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // TODO: Send email
  console.log(`[MOCK EMAIL] To: ${email}, OTP: ${otp}, Token: ${token}`);

  res.json({ message: 'Verification code sent.', token }); // Return token to client to use in next step
};

// @desc    Confirm deletion
// @route   POST /privacy/confirm-deletion
const confirmDeletion = async (req, res) => {
  const { token, otp } = req.body;
  
  const record = otpStore.get(token);
  
  if (!record || record.otp !== otp || record.expires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  const user = await User.findOne({ email: record.email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Soft delete or anonymize
  user.isActive = false;
  user.name = 'Deleted User';
  user.email = `deleted_${user._id}@deleted.com`;
  user.resellerId = undefined;
  await user.save();

  await AuditLog.create({
    userId: user._id,
    action: 'ACCOUNT_DELETED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  otpStore.delete(token);

  res.json({ message: 'Account deleted successfully.' });
};

module.exports = {
  requestDeletion,
  confirmDeletion,
};
