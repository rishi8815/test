const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema(
  {
    resellerId: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    converted: {
      type: Boolean,
      default: false,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Click', clickSchema);
