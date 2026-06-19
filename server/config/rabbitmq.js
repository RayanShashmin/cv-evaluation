const amqp = require('amqplib');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  try {
    console.log('🔄 Connecting to RabbitMQ...');
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Create queues if they don't exist
    await channel.assertQueue(process.env.CV_EVAL_QUEUE || 'cv-evaluation-queue', { durable: true });
    await channel.assertQueue(process.env.RESULT_QUEUE || 'cv-evaluation-results', { durable: true });
    
    console.log('✅ [Main Backend] RabbitMQ Connected');
    
    // Listen for results
    startResultsConsumer();
    
    return channel;
  } catch (error) {
    console.error('❌ RabbitMQ Connection Error:', error.message);
    console.log('⏳ Retrying in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
};

const sendToQueue = async (queueName, message) => {
  if (!channel) {
    await connectRabbitMQ();
  }
  
  const msgBuffer = Buffer.from(JSON.stringify(message));
  channel.sendToQueue(queueName, msgBuffer, { persistent: true });
  console.log(`📤 [Main Backend] Sent to ${queueName}`);
};

const startResultsConsumer = () => {
  const queue = process.env.RESULT_QUEUE || 'cv-evaluation-results';
  
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      const result = JSON.parse(msg.content.toString());
      console.log('📨 [Main Backend] Received result:', result);
      
      // You can update application status here if needed
      // For example: Update application.evaluationStatus = 'completed'
      
      channel.ack(msg);
    }
  });
  
  console.log('👂 [Main Backend] Listening for evaluation results...');
};

const getChannel = () => {
  return channel;
};

const closeConnection = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};

module.exports = {
  connectRabbitMQ,
  sendToQueue,
  getChannel,
  closeConnection
};