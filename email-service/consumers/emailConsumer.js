const { sendEmail } = require('../services/emailSender.service');
const {
  highScoreNotification,
  rejectionWithFeedback,
  customMessage // ✅ NEW (only if you already created this template)
} = require('../services/emailTemplate.service');

const processEmailTask = async (message) => {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('📬 [Email Service] New Email Task');
    console.log('Type:', message.type);
    console.log('═══════════════════════════════════════════');

    if (message.type === 'HIGH_SCORE_NOTIFICATION') {
      const template = highScoreNotification(message.data);

      await sendEmail({
        to: message.data.publisherEmail,
        subject: template.subject,
        html: template.html,
        type: 'high_score_notification',
        applicationId: message.data.applicationId
      });

    } 
    else if (message.type === 'REJECTION_WITH_FEEDBACK') {
      const template = rejectionWithFeedback(message.data);

      await sendEmail({
        to: message.data.candidateEmail,
        subject: template.subject,
        html: template.html,
        type: 'rejection_with_feedback',
        applicationId: message.data.applicationId
      });
    } 
    // ✅ NEW EMAIL TYPE (SAFE ADDITION)
    else if (message.type === 'CUSTOM_MESSAGE') {
      const template = customMessage(message.data);

      await sendEmail({
        to: message.data.candidateEmail,
        subject: template.subject,
        html: template.html,
        type: 'custom_message',
        applicationId: null
      });
    } 
    else {
      console.warn('⚠️ Unknown email type:', message.type);
    }

    console.log('✅ Email task completed successfully');
    console.log('═══════════════════════════════════════════');

  } catch (error) {
    console.error('═══════════════════════════════════════════');
    console.error('❌ [Email Service] Error:', error.message);
    console.error('═══════════════════════════════════════════');
    throw error;
  }
};

const startConsumer = async (channel) => {
  const queue = process.env.EMAIL_QUEUE;

  // ✅ SAFE ADD (prevents missing-queue crash)
  await channel.assertQueue(queue, { durable: true });

  channel.prefetch(1);

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      try {
        const message = JSON.parse(msg.content.toString());
        await processEmailTask(message);
        channel.ack(msg);
      } catch (error) {
        console.error('❌ Error processing email task:', error.message);
        channel.ack(msg); // prevent infinite retry
      }
    }
  }, {
    noAck: false
  });

  console.log(`✅ [Email Service] Consumer started`);
  console.log(`👂 Listening for email tasks on: ${queue}`);
};

module.exports = { startConsumer };
