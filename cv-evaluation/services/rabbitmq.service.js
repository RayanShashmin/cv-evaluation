const { sendToQueue } = require('../config/rabbitmq');

// Send evaluation result back to main backend
exports.sendEvaluationResult = async (result) => {
  try {
    await sendToQueue(process.env.RESULT_QUEUE, {
      type: 'EVALUATION_COMPLETED',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending result:', error);
  }
};

// Send error notification
exports.sendEvaluationError = async (applicationId, error) => {
  try {
    await sendToQueue(process.env.RESULT_QUEUE, {
      type: 'EVALUATION_FAILED',
      data: {
        applicationId,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending error notification:', error);
  }
};