const Click = require('../models/Click');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Commission Rate Configuration (could be in DB)
const COMMISSION_RATE = 0.10; // 10%

// @desc    Track a click
// @route   POST /api/tracking/click
// @access  Public
const trackClick = async (req, res) => {
  const { resellerId, productId } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!resellerId) {
    return res.status(400).json({ message: 'Reseller ID required' });
  }

  // Verify reseller exists (optional, helps prevent spam)
  const reseller = await User.findOne({ resellerId });
  if (!reseller) {
    return res.status(404).json({ message: 'Invalid Reseller ID' });
  }

  // Prevent duplicate clicks from same IP within short time? (Fraud prevention)
  // For now, we log everything but can filter later.
  
  const click = await Click.create({
    resellerId,
    productId,
    ipAddress,
    userAgent,
  });

  res.status(201).json(click);
};

// @desc    Record a conversion/transaction
// @route   POST /api/tracking/conversion
// @access  Private (Internal/Admin or Payment Webhook)
const recordConversion = async (req, res) => {
  const { 
    resellerId, 
    amount, 
    currency, 
    productId, 
    productName, 
    paymentId, 
    customerEmail 
  } = req.body;

  if (!resellerId || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Calculate Commission
  const commissionAmount = amount * COMMISSION_RATE;

  // Create Transaction
  const transaction = await Transaction.create({
    resellerId,
    amount,
    currency,
    commissionAmount,
    status: 'pending', // Pending validation
    productDetails: {
      id: productId,
      name: productName,
    },
    paymentId,
    customerEmail,
  });

  // If we can link to a recent click, do it
  // Find most recent click from this reseller (and maybe IP if we had it from the client context)
  // Ideally, frontend passes the clickId if it tracked it, but usually just resellerId is passed.
  // We can leave clickId null if not strictly tracked 1:1.

  res.status(201).json(transaction);
};

// @desc    Get dashboard stats for reseller
// @route   GET /api/tracking/dashboard
// @access  Private (Reseller)
const getDashboardStats = async (req, res) => {
  const resellerId = req.user.resellerId;

  if (!resellerId) {
    return res.status(400).json({ message: 'User is not a reseller' });
  }

  // Parallel queries
  const [clicks, transactions] = await Promise.all([
    Click.countDocuments({ resellerId }),
    Transaction.find({ resellerId }).sort({ createdAt: -1 }),
  ]);

  const totalEarnings = transactions
    .filter(t => t.status !== 'rejected')
    .reduce((acc, t) => acc + t.commissionAmount, 0);
  
  const conversions = transactions.length;

  // Simple trend data (mocking real aggregation for brevity, or doing simple JS grouping)
  // Real app should use MongoDB aggregation
  
  res.json({
    totals: {
      clicks,
      conversions,
      earnings: totalEarnings,
    },
    transactions: transactions.slice(0, 5), // Recent 5
  });
};

module.exports = {
  trackClick,
  recordConversion,
  getDashboardStats,
};
