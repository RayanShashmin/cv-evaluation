const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    unique: true,
    index: true  // ← Keep index here
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true  // ← Add index here
  },
  
  // Extracted CV Data
  extractedData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String
    },
    summary: String,
    skills: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      institution: String,
      year: String,
      field: String
    }],
    certifications: [String],
    languages: [String]
  },
  
  // AI Evaluation Scores (0-100)
  scores: {
    overall: { type: Number, min: 0, max: 100, default: 0, index: true },
    skillsMatch: { type: Number, min: 0, max: 100, default: 0 },
    experienceLevel: { type: Number, min: 0, max: 100, default: 0 },
    educationFit: { type: Number, min: 0, max: 100, default: 0 },
    presentationQuality: { type: Number, min: 0, max: 100, default: 0 }
  },
  
  // AI-Generated Feedback
  feedback: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    summary: String
  },
  
  // Matching Analysis
  matchAnalysis: {
    matchedSkills: [String],
    missingSkills: [String],
    experienceGap: String,
    fitLevel: {
      type: String,
      enum: ['excellent', 'good', 'average', 'poor'],
      default: 'average'
    }
  },
  
  // Raw CV Text
  rawText: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  
  processingTime: Number, // in milliseconds
  errorMessage: String,
  
  // ═══════════════════════════════════════════
  // NEW: Email Notification Tracking
  // ═══════════════════════════════════════════
  notificationSent: { 
    type: Boolean, 
    default: false 
  },
  notificationSentAt: { 
    type: Date 
  },
  
  // NEW: Feedback Email Tracking
  feedbackSent: { 
    type: Boolean, 
    default: false 
  },
  feedbackSentAt: { 
    type: Date 
  }
  
}, { timestamps: true });

// Remove duplicate index definitions (they're already in the schema above)
// evaluationSchema.index({ applicationId: 1 }); // ← REMOVE
// evaluationSchema.index({ jobId: 1 }); // ← REMOVE
// evaluationSchema.index({ status: 1 }); // ← REMOVE

module.exports = mongoose.model('Evaluation', evaluationSchema);