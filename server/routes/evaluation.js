// server/routes/evaluation.js
const express = require('express');
const router = express.Router();
const {
  evaluateApplication,
  getEvaluation,
  getJobEvaluations,
  getJobStats,
  deleteEvaluation,
  sendFeedbackEmail,
} = require('../controllers/evaluationController');
const { authMiddleware, authorize } = require("../middleware/authMiddleware");

// NO AUTH - for auto-trigger by AI service
router.post('/evaluate/:applicationId', evaluateApplication);

// Get single evaluation (Both recruiters and candidates can view)
router.get('/:applicationId', authMiddleware, getEvaluation);

// REQUIRES AUTH - Recruiter only routes
router.get('/job/:jobId', authMiddleware, authorize('recruiter'), getJobEvaluations);
router.get('/job/:jobId/stats', authMiddleware, authorize('recruiter'), getJobStats);

// Send feedback email (Recruiter only)
router.post('/:applicationId/send-feedback', authMiddleware, authorize('recruiter'), sendFeedbackEmail);

// Delete evaluation (Recruiter only)
router.delete('/:applicationId', authMiddleware, authorize('recruiter'), deleteEvaluation);

module.exports = router;