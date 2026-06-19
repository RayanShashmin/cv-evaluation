require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { connectRabbitMQ, closeConnection } = require('./config/rabbitmq');
const { startConsumer } = require('./consumers/emailConsumer');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

app.get('/health', (req, res) => {
  res.json({
    service: 'Email Notification Microservice',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

const initializeServices = async () => {
  try {
    await connectDB();
    const channel = await connectRabbitMQ();
    
    if (channel) {
      await startConsumer(channel);
    }
    
    console.log('═══════════════════════════════════════════');
    console.log('🚀 Email Notification Service Ready!');
    console.log('═══════════════════════════════════════════');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    // Don't exit - let reconnection logic handle it
  }
};

const PORT = process.env.PORT || 8082;

app.listen(PORT, async () => {
  console.log(`📍 Email Service running on port ${PORT}`);
  await initializeServices();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await closeConnection();
  process.exit(0);
});

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});