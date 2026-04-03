const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    resellerId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['requested', 'processing', 'paid', 'rejected'],
      default: 'requested',
    },
    method: {
      type: String, // 'beam_wallet', 'bank_transfer', 'paypal'
      default: 'beam_wallet',
    },
    destination: {
      type: String, // Wallet address or IBAN
    },
    processedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payout', payoutSchema);
