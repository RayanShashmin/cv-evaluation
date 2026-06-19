const express = require('express');
const router = express.Router();
const { getChannel } = require('../config/rabbitmq');

router.post('/send', async (req, res) => {
  try {
    const { queue, message } = req.body;

     const queueName = queue === 'cv_evaluation_queue' ? 'cv-evaluation-queue' : queue;

    if (!queue || !message) {
      return res.status(400).json({
        success: false,
        error: 'Queue name and message are required'
      });
    }

    const channel = getChannel();
    
    if (!channel) {
      return res.status(503).json({
        success: false,
        error: 'Queue service not ready'
      });
    }

    console.log('═══════════════════════════════════════════');
    console.log('📤 [Main Backend] Sending to Queue');
    console.log('Queue:', queue);
    console.log('Type:', message.type);

    await channel.assertQueue(queue, { durable: true });
    const msgBuffer = Buffer.from(JSON.stringify(message));
    channel.sendToQueue(queue, msgBuffer, { persistent: true });

    console.log('✅ Message sent');
    console.log('═══════════════════════════════════════════');

    res.json({
      success: true,
      message: 'Message queued successfully',
      messageId: Date.now().toString()
    });

  } catch (error) {
    console.error('❌ Queue error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
});

module.exports = router;