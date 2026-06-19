require('dotenv').config();
const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

let channel = null;
let connection = null;
let reconnectTimeout = null;

// Connect to RabbitMQ with reconnection logic
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
    
    // Assert queues exist
    await channel.assertQueue('email-notification-queue', { durable: true });
    await channel.assertQueue('cv-evaluation-queue', { durable: true });
    
    console.log('✅ [Queue Service] RabbitMQ Connected');
    console.log('📬 Queues ready: email-notification-queue, cv-evaluation-queue');
    
    // Handle connection errors
    connection.on('error', (err) => {
      if (err.message !== 'Connection closing') {
        console.error('❌ RabbitMQ connection error:', err.message);
      }
      reconnect();
    });
    
    connection.on('close', () => {
      console.log('⚠️  RabbitMQ connection closed. Reconnecting...');
      reconnect();
    });
    
    // Clear reconnect timeout on successful connection
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
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
    channel = null;
    connection = null;
    await connectRabbitMQ();
  }, 5000);
};

// ═══════════════════════════════════════════════════════════
// Route: Send Message to Queue
// ═══════════════════════════════════════════════════════════
app.post('/api/queue/send', async (req, res) => {
  try {
    const { queue, message } = req.body;

    console.log('═══════════════════════════════════════════');
    console.log('📨 [Queue Service] Received Request');
    console.log('Queue:', queue);
    console.log('Message Type:', message?.type);

    // Validate input
    if (!queue || !message) {
      return res.status(400).json({
        success: false,
        error: 'Queue name and message are required'
      });
    }

    // Check if channel is ready
    if (!channel) {
      console.error('❌ RabbitMQ channel not ready');
      return res.status(503).json({
        success: false,
        error: 'Queue service not ready. Please try again in a moment.'
      });
    }

    // Assert queue exists
    await channel.assertQueue(queue, { durable: true });

    // Send message to queue
    const msgBuffer = Buffer.from(JSON.stringify(message));
    const sent = channel.sendToQueue(queue, msgBuffer, { persistent: true });

    if (!sent) {
      throw new Error('Failed to send message to queue');
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('✅ Message sent to queue successfully');
    console.log('   Message ID:', messageId);
    console.log('═══════════════════════════════════════════');

    res.json({
      success: true,
      message: 'Message queued successfully',
      messageId: messageId,
      queue: queue
    });

  } catch (error) {
    console.error('❌ Error sending to queue:', error.message);
    console.error('═══════════════════════════════════════════');
    
    res.status(500).json({
      success: false,
      error: 'Failed to send message to queue',
      message: error.message
    });
  }
});

// ═══════════════════════════════════════════════════════════
// Route: Health Check
// ═══════════════════════════════════════════════════════════
app.get('/health', (req, res) => {
  res.json({
    service: 'Queue Service',
    status: channel ? 'healthy' : 'unhealthy',
    rabbitmq: channel ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    service: 'Queue Service',
    status: channel ? 'healthy' : 'unhealthy',
    rabbitmq: channel ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════
// Start Server
// ═══════════════════════════════════════════════════════════
const PORT = process.env.PORT || 8081;

app.listen(PORT, async () => {
  console.log('═══════════════════════════════════════════');
  console.log('🚀 Queue Service Started');
  console.log('📍 Port:', PORT);
  console.log('═══════════════════════════════════════════');
  
  await connectRabbitMQ();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  if (channel) await channel.close();
  if (connection) await connection.close();
  process.exit(0);
});

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  // Don't exit - let reconnection logic handle it
});