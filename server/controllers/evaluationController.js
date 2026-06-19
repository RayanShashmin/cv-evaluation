const axios = require('axios');
const Evaluation = require('../models/evaluation.model'); // ← FIXED PATH
// const Application = require('../models/application.model'); // ← CORRECT PATH
const Application = require('../models/application')
const { extractTextFromS3, validateExtractedText } = require('../services/cv-extraction.service');
const { evaluateCV, generateFallbackEvaluation } = require('../services/ai-evaluation.service');
const { Job } = require('../models/job');

// ═══════════════════════════════════════════════════════════
// Function 1: Evaluate Application
// ═══════════════════════════════════════════════════════════
const evaluateApplication = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { applicationId } = req.params;
    
    console.log('=== Starting CV Evaluation ===');
    console.log('Application ID:', applicationId);
    
    const application = await Application.findById(applicationId).populate('jobId');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    if (!application.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'No resume found for this application'
      });
    }
    
    console.log('✅ Application found:', application._id);
    console.log('Resume URL:', application.resumeUrl);
    console.log('Job:', application.jobId?.jobPostTitle);
    
    let evaluation = await Evaluation.findOne({ applicationId });
    
    if (evaluation && evaluation.status === 'completed') {
      console.log('⚠️  Evaluation already exists, re-evaluating...');
    }
    
    if (!evaluation) {
      evaluation = new Evaluation({
        applicationId: application._id,
        jobId: application.jobId._id,
        status: 'processing'
      });
      await evaluation.save();
    } else {
      evaluation.status = 'processing';
      evaluation.errorMessage = undefined;
      await evaluation.save();
    }
    
    console.log('📄 Extracting text from CV...');
    const cvText = await extractTextFromS3(application.resumeUrl);
    const validatedText = validateExtractedText(cvText);
    
    console.log('✅ Text extracted:', validatedText.length, 'characters');
    
    const jobDescription = application.jobId?.jobDescription || 
                          application.jobId?.shortJobDescription || 
                          '';
    
    console.log('📋 Job description length:', jobDescription.length);
    
    console.log('🤖 Starting AI evaluation...');
    let aiResult;
    
    try {
      aiResult = await evaluateCV(validatedText, jobDescription);
    } catch (aiError) {
      console.error('⚠️  AI evaluation failed, using fallback:', aiError.message);
      aiResult = generateFallbackEvaluation(validatedText);
    }
    
    evaluation.extractedData = aiResult.extractedData;
    evaluation.scores = aiResult.scores;
    evaluation.feedback = aiResult.feedback;
    evaluation.matchAnalysis = aiResult.matchAnalysis;
    evaluation.rawText = validatedText;
    evaluation.status = 'completed';
    evaluation.processingTime = Date.now() - startTime;
    
    await evaluation.save();
    
    console.log('✅ Evaluation completed in', evaluation.processingTime, 'ms');
    console.log('Overall score:', evaluation.scores.overall);
    console.log('==============================');
    
    res.status(200).json({
      success: true,
      message: 'CV evaluation completed successfully',
      data: evaluation
    });
    
  } catch (error) {
    console.error('❌ Evaluation Error:', error);
    
    if (req.params.applicationId) {
      await Evaluation.findOneAndUpdate(
        { applicationId: req.params.applicationId },
        { 
          status: 'failed',
          errorMessage: error.message,
          processingTime: Date.now() - startTime
        }
      );
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate CV',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Function 2: Get Evaluation
// ═══════════════════════════════════════════════════════════
const getEvaluation = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    console.log('Getting evaluation for applicationId:', applicationId);
    
    if (!applicationId || applicationId === '[object Object]' || applicationId.includes('object')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }
    
    const evaluation = await Evaluation.findOne({ applicationId })
      .populate('applicationId', 'name email phone')
      .populate('jobId', 'jobPostTitle companyName');
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error('Get Evaluation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Function 3: Get Job Evaluations
// ═══════════════════════════════════════════════════════════
const getJobEvaluations = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, minScore } = req.query;
    
    const filter = { jobId };
    
    if (status) {
      filter.status = status;
    }
    
    let evaluations = await Evaluation.find(filter)
      .populate('applicationId', 'name email phone appliedAt')
      .sort({ 'scores.overall': -1, createdAt: -1 });
    
    if (minScore) {
      evaluations = evaluations.filter(e => e.scores.overall >= parseInt(minScore));
    }
    
    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    console.error('Get Job Evaluations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluations',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Function 4: Get Job Stats
// ═══════════════════════════════════════════════════════════
const getJobStats = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const evaluations = await Evaluation.find({ 
      jobId, 
      status: 'completed' 
    });
    
    if (evaluations.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalEvaluations: 0,
          averageScore: 0,
          distribution: {
            excellent: 0,
            good: 0,
            average: 0,
            poor: 0
          }
        }
      });
    }
    
    const totalScore = evaluations.reduce((sum, e) => sum + e.scores.overall, 0);
    const averageScore = totalScore / evaluations.length;
    
    const distribution = evaluations.reduce((acc, e) => {
      acc[e.matchAnalysis.fitLevel] = (acc[e.matchAnalysis.fitLevel] || 0) + 1;
      return acc;
    }, { excellent: 0, good: 0, average: 0, poor: 0 });
    
    const topSkills = {};
    evaluations.forEach(e => {
      e.extractedData.skills.forEach(skill => {
        topSkills[skill] = (topSkills[skill] || 0) + 1;
      });
    });
    
    const sortedSkills = Object.entries(topSkills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
    
    res.status(200).json({
      success: true,
      data: {
        totalEvaluations: evaluations.length,
        averageScore: Math.round(averageScore),
        distribution,
        topSkills: sortedSkills,
        highestScore: Math.max(...evaluations.map(e => e.scores.overall)),
        lowestScore: Math.min(...evaluations.map(e => e.scores.overall))
      }
    });
  } catch (error) {
    console.error('Get Job Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Function 5: Send Feedback Email (NEW)
// ═══════════════════════════════════════════════════════════
const sendFeedbackEmail = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    console.log('═══════════════════════════════════════════');
    console.log('📧 Sending Feedback Email');
    console.log('Application ID:', applicationId);

    // 1. Get evaluation
    const evaluation = await Evaluation.findOne({ applicationId });
    if (!evaluation) {
      return res.status(404).json({ 
        success: false,
        error: "Evaluation not found" 
      });
    }

    // 2. Check if feedback already sent
    if (evaluation.feedbackSent) {
      return res.status(400).json({
        success: false,
        error: "Feedback email already sent",
        sentAt: evaluation.feedbackSentAt
      });
    }

    // 3. Get application details
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ 
        success: false,
        error: "Application not found" 
      });
    }

    // 4. Get job details
    const job = await Job.findById(application.jobId || evaluation.jobId);
    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: "Job not found" 
      });
    }

    // 5. Get candidate email
    const candidateEmail = 
      evaluation.extractedData?.personalInfo?.email || 
      application.email;

    if (!candidateEmail) {
      return res.status(400).json({
        success: false,
        error: "Candidate email not found"
      });
    }

    console.log('   Candidate:', evaluation.extractedData?.personalInfo?.name);
    console.log('   Email:', candidateEmail);
    console.log('   Score:', evaluation.scores.overall);

    // 6. Prepare email payload
    const emailPayload = {
      type: 'REJECTION_WITH_FEEDBACK',
      data: {
        candidateName: evaluation.extractedData?.personalInfo?.name || 'Candidate',
        candidateEmail: candidateEmail,
        score: evaluation.scores.overall,
        strengths: evaluation.feedback.strengths || [],
        weaknesses: evaluation.feedback.weaknesses || [],
        recommendations: evaluation.feedback.recommendations || [],
        summary: evaluation.feedback.summary || '',
        jobTitle: job.jobPostTitle,
        companyName: job.companyName
      }
    };

    console.log('📤 Sending to email queue...');

    // 7. Send to email queue
    const queueServiceUrl = process.env.QUEUE_SERVICE_URL || 'http://localhost:8081';
    const response = await axios.post(`${queueServiceUrl}/api/queue/send`, {
      queue: 'email-notification-queue',
      message: emailPayload
    }, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });

    // 8. Mark as feedback sent
    evaluation.feedbackSent = true;
    evaluation.feedbackSentAt = new Date();
    await evaluation.save();

    console.log('✅ Feedback email queued successfully');
    console.log('═══════════════════════════════════════════');

    res.json({
      success: true,
      message: "Feedback email sent successfully",
      data: {
        messageId: response.data.messageId,
        sentTo: candidateEmail,
        sentAt: evaluation.feedbackSentAt
      }
    });

  } catch (error) {
    console.error('❌ Error sending feedback email:', error);
    console.error('═══════════════════════════════════════════');
    
    res.status(500).json({
      success: false,
      error: "Failed to send feedback email",
      message: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Function 6: Delete Evaluation (NEW)
// ═══════════════════════════════════════════════════════════
const deleteEvaluation = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    console.log('═══════════════════════════════════════════');
    console.log('🗑️ Deleting Candidate');
    console.log('Application ID:', applicationId);

    // 1. Delete evaluation
    const evaluation = await Evaluation.findOneAndDelete({ applicationId });
    
    if (!evaluation) {
      console.log('⚠️ Evaluation not found, but continuing...');
    }

    // 2. Delete application
    await Application.findByIdAndDelete(applicationId);

    console.log('✅ Candidate deleted successfully');
    console.log('═══════════════════════════════════════════');

    res.json({
      success: true,
      message: "Candidate deleted successfully"
    });

  } catch (error) {
    console.error('❌ Error deleting candidate:', error);
    console.error('═══════════════════════════════════════════');
    
    res.status(500).json({
      success: false,
      error: "Failed to delete candidate",
      message: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// EXPORTS (ALL FUNCTIONS)
// ═══════════════════════════════════════════════════════════
module.exports = {
  evaluateApplication,
  getEvaluation,
  getJobEvaluations,
  getJobStats,
  sendFeedbackEmail,
  deleteEvaluation,
};