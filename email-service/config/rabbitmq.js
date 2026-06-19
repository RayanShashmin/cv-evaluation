const amqp = require('amqplib');

let connection = null;
let channel = null;
let reconnectTimeout = null;

const connectRabbitMQ = async () => {
  try {
    console.log('🔄 Connecting to RabbitMQ...');
    
    // Add connection options for CloudAMQP
    const connectionOptions = {
      heartbeat: 60, // Send heartbeat every 60 seconds
      timeout: 30000, // Connection timeout 30 seconds
    };
    
    connection = await amqp.connect(process.env.RABBITMQ_URL, connectionOptions);
    channel = await connection.createChannel();
    
    // Assert queue exists
    await channel.assertQueue(process.env.EMAIL_QUEUE, { durable: true });
    
    console.log('✅ [Email Service] RabbitMQ Connected');
    console.log(`📬 Listening on queue: ${process.env.EMAIL_QUEUE}`);
    
    // Handle connection errors
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err.message);
      reconnect();
    });
    
    connection.on('close', () => {
      console.log('⚠️  RabbitMQ connection closed. Reconnecting...');
      reconnect();
    });
    
    return channel;
  } catch (error) {
    console.error('❌ RabbitMQ Connection Error:', error.message);
    reconnect();
  }
};

const reconnect = () => {
  if (reconnectTimeout) return; // Already reconnecting
  
  console.log('⏳ Reconnecting in 5 seconds...');
  reconnectTimeout = setTimeout(async () => {
    reconnectTimeout = null;
    await connectRabbitMQ();
  }, 5000);
};

const sendToQueue = async (queueName, message) => {
  if (!channel) {
    console.error('❌ No RabbitMQ channel available');
    throw new Error('RabbitMQ channel not available');
  }
  
  const msgBuffer = Buffer.from(JSON.stringify(message));
  channel.sendToQueue(queueName, msgBuffer, { persistent: true });
  console.log(`📤 [Email Service] Sent to ${queueName}`);
};

const closeConnection = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  sendToQueue,
  closeConnection,
  getChannel
};