const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    unique: true,
    index: true  // ← Keep only this, remove schema.index() below
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true  // ← Add index here instead
  },
  
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
  
  scores: {
    overall: { type: Number, min: 0, max: 100, default: 0, index: true },
    skillsMatch: { type: Number, min: 0, max: 100, default: 0 },
    experienceLevel: { type: Number, min: 0, max: 100, default: 0 },
    educationFit: { type: Number, min: 0, max: 100, default: 0 },
    presentationQuality: { type: Number, min: 0, max: 100, default: 0 }
  },
  
  feedback: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    summary: String
  },
  
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
  
  rawText: String,
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  
  processingTime: Number,
  errorMessage: String,
  
  notificationSent: { type: Boolean, default: false },
  notificationSentAt: { type: Date }
  
}, { timestamps: true });

// ❌ REMOVE ALL THESE LINES (they create duplicate indexes):
// evaluationSchema.index({ applicationId: 1 });
// evaluationSchema.index({ jobId: 1 });
// evaluationSchema.index({ status: 1 });
// evaluationSchema.index({ 'scores.overall': 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);