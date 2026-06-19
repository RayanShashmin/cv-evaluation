const amqp = require('amqplib');

let connection = null;
let channel = null;

// Connect to RabbitMQ
const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Create queues if they don't exist
    await channel.assertQueue(process.env.CV_EVAL_QUEUE, { durable: true });
    await channel.assertQueue(process.env.RESULT_QUEUE, { durable: true });
    
    console.log('✅ [CV Service] RabbitMQ Connected');
    console.log(`📬 Listening on queue: ${process.env.CV_EVAL_QUEUE}`);
    
    return channel;
  } catch (error) {
    console.error('❌ RabbitMQ Connection Error:', error);
    setTimeout(connectRabbitMQ, 5000); // Retry after 5 seconds
  }
};

// Send message to queue
const sendToQueue = async (queueName, message) => {
  if (!channel) {
    await connectRabbitMQ();
  }
  
  const msgBuffer = Buffer.from(JSON.stringify(message));
  channel.sendToQueue(queueName, msgBuffer, { persistent: true });
  console.log(`📤 [CV Service] Message sent to ${queueName}:`, message);
};

// Close connection
const closeConnection = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};

module.exports = {
  connectRabbitMQ,
  sendToQueue,
  closeConnection,
  getChannel: () => channel
};