// server/routes/debug.js - ADD THIS TO TEST YOUR SETUP
const router = require("express").Router();
const { getChannel } = require('../config/rabbitmq');
const Application = require("../models/application");
const Evaluation = require("../models/evaluation.model");

// Test RabbitMQ connection
router.get("/rabbitmq-status", (req, res) => {
  try {
    const channel = getChannel();
    
    if (channel) {
      res.json({
        success: true,
        message: "RabbitMQ is connected",
        status: "healthy"
      });
    } else {
      res.status(503).json({
        success: false,
        message: "RabbitMQ channel not available",
        status: "disconnected"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking RabbitMQ",
      error: error.message
    });
  }
});

// Manually trigger evaluation for an application
router.post("/trigger-evaluation/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    console.log('\n=== MANUAL EVALUATION TRIGGER ===');
    console.log('Application ID:', applicationId);
    
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }
    
    console.log('✅ Application found');
    console.log('   CV URL:', application.cvUrl);
    console.log('   Job ID:', application.jobId);
    
    const channel = getChannel();
    
    if (!channel) {
      return res.status(503).json({
        success: false,
        message: "RabbitMQ not available"
      });
    }
    
    const message = {
      type: 'evaluate',
      applicationId: applicationId,
      cvUrl: application.cvUrl || application.resume,
      jobId: application.jobId.toString(),
      candidateEmail: application.email
    };
    
    await channel.assertQueue('cv_evaluation_queue', { durable: true });
    channel.sendToQueue(
      'cv_evaluation_queue',
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    console.log('✅ Message sent to queue');
    console.log('   Message:', message);
    console.log('================================\n');
    
    res.json({
      success: true,
      message: "Evaluation triggered successfully",
      data: {
        applicationId,
        queuedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error triggering evaluation:', error);
    res.status(500).json({
      success: false,
      message: "Error triggering evaluation",
      error: error.message
    });
  }
});

// Check evaluation status for an application
router.get("/evaluation-status/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findById(applicationId);
    const evaluation = await Evaluation.findOne({ applicationId });
    
    res.json({
      success: true,
      data: {
        application: application ? {
          id: application._id,
          cvUrl: application.cvUrl,
          status: application.status,
          aiScore: application.aiScore
        } : null,
        evaluation: evaluation ? {
          status: evaluation.status,
          scores: evaluation.scores,
          createdAt: evaluation.createdAt,
          errorMessage: evaluation.errorMessage
        } : null,
        hasEvaluation: !!evaluation
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking status",
      error: error.message
    });
  }
});

// List all applications without evaluations
router.get("/missing-evaluations", async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('jobId', 'jobPostTitle');
    
    const evaluations = await Evaluation.find();
    const evaluatedIds = new Set(evaluations.map(e => e.applicationId.toString()));
    
    const missing = applications.filter(app => 
      !evaluatedIds.has(app._id.toString())
    );
    
    res.json({
      success: true,
      total: applications.length,
      evaluated: evaluations.length,
      missing: missing.length,
      missingApplications: missing.map(app => ({
        id: app._id,
        name: app.name,
        email: app.email,
        jobTitle: app.jobId?.jobPostTitle,
        appliedDate: app.appliedDate,
        cvUrl: app.cvUrl
      }))
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching missing evaluations",
      error: error.message
    });
  }
});

module.exports = router;