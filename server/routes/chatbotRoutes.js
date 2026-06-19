// routes/chatbotRoutes.js
const express = require('express');
const {
  chatWithBot,
  getSuggestedQuestions,
  getQuickResponse
} = require('../controllers/chatbotController.js');

const router = express.Router();

// POST /api/chatbot/chat - Send message to chatbot
router.post('/chat', chatWithBot);

// GET /api/chatbot/suggestions - Get suggested questions
router.get('/suggestions', getSuggestedQuestions);

// POST /api/chatbot/quick - Get quick response
router.post('/quick', getQuickResponse);

module.exports.default = router;

/*
 * Add to your main app.js / server.js:
 *
 * const chatbotRoutes = require('./routes/chatbotRoutes.js').default;
 * app.use('/api/chatbot', chatbotRoutes);
 */