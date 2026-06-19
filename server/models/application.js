// server/models/application.js
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  // User reference (optional - null for public applications)
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: false,
    default: null
  },
  
  // Job reference
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  
  // Candidate details from form
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  
  // Resume/CV URL
  cvUrl: { type: String, required: true },
  resume: { type: String }, // Alias for backward compatibility
  
  // Application status
  status: { 
    type: String, 
    enum: ['submitted', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'accepted'],
    default: 'submitted'
  },
  
  // AI Evaluation results
  aiScore: { type: Number, default: null },
  feedback: { type: String, default: '' },
  
  // Timestamps
  appliedDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  
  // Reviewed by (recruiter)
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',
    default: null 
  }
}, { timestamps: true });

// Update the updatedDate before saving
applicationSchema.pre('save', function(next) {
  this.updatedDate = Date.now();
  next();
});

// Prevent model overwrite error
const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

module.exports = Application;