// server/index.js

require('dotenv').config();
//import chatbotRoutes from './routes/chatbotRoutes.js';
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connection = require('./db');
const queueRoutes = require('./routes/queue');
const { connectRabbitMQ } = require('./config/rabbitmq');
// import chatbotRoutes from './routes/chatbotRoutes.js';


// Route imports
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/application');
const evaluationRoutes = require('./routes/evaluation');
const candidateRoutes = require('./routes/candidate');
const debugRoutes = require('./routes/debug');
const customEmailRoutes = require('./routes/customEmail');
const chatbotRoutes = require('./routes/chatbotRoutes').default;;


// Initialize Express app
const app = express();

// Database connection
connection();

// RabbitMQ connection
connectRabbitMQ().catch(console.error);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://34.228.66.116:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/candidate', candidateRoutes); // NEW
app.use('/api/debug', debugRoutes);
// app.use('/api/send-custom-email', customEmailRoutes);
app.use('/api/custom-email', customEmailRoutes);
app.use('/api/chatbot', chatbotRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server configuration
const port = process.env.PORT || 8080;
const env = process.env.NODE_ENV || 'development';

app.listen(port, () => {
  console.log(`Server running in ${env} mode on port ${port}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});