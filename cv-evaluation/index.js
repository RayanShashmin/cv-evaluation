require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const connectDB = require('./config/database');
const { connectRabbitMQ, closeConnection } = require('./config/rabbitmq');
const { startConsumer } = require('./consumers/evaluationConsumer');

const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'CV Evaluation Microservice',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ═══════════════════════════════════════════════════════════
// Email Notification Helper Function
// ═══════════════════════════════════════════════════════════
async function sendHighScoreNotification(evaluationData, jobData, applicationData) {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('📧 HIGH SCORE DETECTED - Preparing Email');
    console.log('═══════════════════════════════════════════');
    console.log('   Overall Score:', evaluationData.scores.overall);
    console.log('   Candidate:', applicationData.name);
    console.log('   Job:', jobData.jobPostTitle);
    console.log('   Hiring Manager:', jobData.hiringManagerEmail);

    const emailPayload = {
      type: 'HIGH_SCORE_NOTIFICATION',
      data: {
        candidateName: applicationData.name,
        candidateEmail: applicationData.email,
        candidatePhone: applicationData.phone || 'Not provided',
        appliedDate: applicationData.appliedDate || new Date(),
        applicationId: evaluationData.applicationId,
        score: evaluationData.scores.overall,
        scores: {
          skillsMatch: evaluationData.scores.skillsMatch,
          experienceLevel: evaluationData.scores.experienceLevel,
          educationFit: evaluationData.scores.educationFit,
          presentationQuality: evaluationData.scores.presentationQuality
        },
        strengths: evaluationData.feedback.strengths || [],
        skills: evaluationData.matchAnalysis.matchedSkills || [],
        summary: evaluationData.feedback.summary || '',
        jobTitle: jobData.jobPostTitle,
        jobDepartment: jobData.jobDepartment,
        jobLocation: jobData.jobLocation,
        companyName: jobData.companyName,
        publisherEmail: jobData.hiringManagerEmail
      }
    };

    console.log('📤 Sending to email-notification-queue...');

    const queueServiceUrl = process.env.QUEUE_SERVICE_URL || 'http://localhost:8081';
    const response = await axios.post(`${queueServiceUrl}/api/queue/send`, {
      queue: 'email-notification-queue',
      message: emailPayload
    }, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Email notification queued successfully!');
    console.log('   Message ID:', response.data.messageId || 'N/A');
    console.log('═══════════════════════════════════════════');
    
    return { success: true, messageId: response.data.messageId };
    
  } catch (error) {
    console.error('═══════════════════════════════════════════');
    console.error('❌ Failed to queue email notification');
    console.error('   Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.error('═══════════════════════════════════════════');
    
    return { success: false, error: error.message };
  }
}

// Make function globally available
global.sendHighScoreNotification = sendHighScoreNotification;

// Initialize services
const initializeServices = async () => {
  try {
    await connectDB();
    const channel = await connectRabbitMQ();
    await startConsumer(channel);
    
    console.log('═══════════════════════════════════════════');
    console.log('🚀 CV Evaluation Microservice Ready!');
    console.log('📧 Email Notification: ENABLED');
    console.log('🎯 High Score Threshold: ≥90');
    console.log('═══════════════════════════════════════════');
    
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 8083;

app.listen(PORT, async () => {
  console.log(`📍 CV Evaluation Service running on port ${PORT}`);
  await initializeServices();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await closeConnection();
  process.exit(0);
});