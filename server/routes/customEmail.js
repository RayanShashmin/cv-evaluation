// server/routes/customEmail.js - NEW FILE
const router = require("express").Router();
const { authMiddleware, authorize } = require("../middleware/authMiddleware");
const axios = require('axios');

// Send custom email to candidate
router.post("/", authMiddleware, authorize('recruiter'), async (req, res) => {
  try {
    const { to, candidateName, subject, message } = req.body;

    console.log('═══════════════════════════════════════════');
    console.log('📧 Sending Custom Email');
    console.log('   To:', to);
    console.log('   Candidate:', candidateName);
    console.log('   Subject:', subject);
    console.log('═══════════════════════════════════════════');

    // Validation
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message'
      });
    }

    // Prepare email payload for queue
    const emailPayload = {
      type: 'CUSTOM_MESSAGE',
      data: {
        candidateName: candidateName || 'Candidate',
        candidateEmail: to,
        subject: subject,
        message: message,
        recruiterName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Recruiter'
      }
    };

    console.log('📤 Sending to email queue...');

    // Send to email queue
    const queueServiceUrl = process.env.QUEUE_SERVICE_URL || 'http://localhost:8081';
    const response = await axios.post(`${queueServiceUrl}/api/queue/send`, {
      queue: 'email-notification-queue',
      message: emailPayload
    }, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Email queued successfully');
    console.log('   Message ID:', response.data.messageId || 'N/A');
    console.log('═══════════════════════════════════════════');

    res.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        messageId: response.data.messageId,
        sentTo: to
      }
    });

  } catch (error) {
    console.error('❌ Error sending custom email:', error);
    console.error('═══════════════════════════════════════════');
    
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

module.exports = router;