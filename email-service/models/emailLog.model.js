const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['high_score_notification', 'rejection_with_feedback', 'general','custom_message'],
    required: true
  },
  to: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  errorMessage: String,
  sentAt: Date
}, { timestamps: true });

module.exports = mongoose.model('EmailLog', emailLogSchema);