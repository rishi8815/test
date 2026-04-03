const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  content: {
    type: String, // HTML content
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isGlobal: {
    type: Boolean,
    default: false, // If true, available to all users (admin created)
  }
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
