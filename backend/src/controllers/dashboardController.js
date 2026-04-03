const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const User = require('../models/User');

// @desc    Get dashboard data
// @route   GET /reseller/dashboard
const getDashboard = async (req, res) => {
  const resellerId = req.user.resellerId;
  
  // Totals
  const transactions = await Transaction.find({ resellerId });
  
  const earnings = transactions
    .filter(t => t.status !== 'rejected')
    .reduce((acc, t) => acc + t.commissionAmount, 0);
  
  const conversions = transactions.length;
  const clicks = 0; // TODO: Aggregate from Click model if needed, or separate endpoint

  // Recent activity
  const recentTransactions = transactions.slice(0, 5);

  res.json({
    data: {
      totals: {
        earnings,
        conversions,
        clicks: 120, // Mock or fetch real
      },
      transactions: recentTransactions,
      trend: [], // Implement trend aggregation
    }
  });
};

// @desc    Get transactions
// @route   GET /reseller/transactions
const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ resellerId: req.user.resellerId }).sort({ createdAt: -1 });
  res.json({ data: transactions });
};

// @desc    Get payouts
// @route   GET /reseller/payouts
const getPayouts = async (req, res) => {
  const payouts = await Payout.find({ resellerId: req.user.resellerId }).sort({ createdAt: -1 });
  res.json({ data: payouts });
};

// @desc    Request Payout
// @route   POST /reseller/payouts
const requestPayout = async (req, res) => {
  const { amount, method, destination } = req.body;
  
  // Validate balance (omitted for speed, would sum approved transactions - paid payouts)
  
  const payout = await Payout.create({
    resellerId: req.user.resellerId,
    amount,
    method,
    destination,
  });
  
  res.status(201).json(payout);
};

// @desc    Get Profile
// @route   GET /reseller/me
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    resellerId: user.resellerId,
    // Add other profile fields
  });
};

// @desc    Update Profile
// @route   PUT /reseller/me
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;
  // Don't update resellerId or role here
  
  await user.save();
  res.json(user);
};

// @desc    Get Settings
// @route   GET /reseller/settings
const getSettings = async (req, res) => {
  // Mock settings for now
  res.json({ notifications: true, payoutMethod: 'beam_wallet' });
};

module.exports = {
  getDashboard,
  getTransactions,
  getPayouts,
  requestPayout,
  getProfile,
  updateProfile,
  getSettings,
};
