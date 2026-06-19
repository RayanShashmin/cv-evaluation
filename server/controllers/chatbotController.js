// controllers/chatbotController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with your FREE API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_CHATBOT_API_KEY);

// System instructions for recruitment chatbot
const RECRUITMENT_CONTEXT = `You are an intelligent recruitment assistant for an AI-powered CV evaluation and recruitment platform. Your role is to help job seekers and employers navigate their recruitment journey.

Your Expertise:
- Job search and application guidance
- CV/Resume writing tips and best practices
- Interview preparation and strategies
- Career advice and development
- Platform features explanation (AI CV evaluation, job matching, etc.)
- Employer guidance on posting jobs and reviewing candidates

Personality:
- Professional yet friendly and approachable
- Encouraging and supportive
- Concise but thorough (aim for 2-4 sentences unless detailed explanation needed)
- Use emojis sparingly for warmth (1-2 max per response)

Guidelines:
- Always provide actionable, practical advice
- If asked about specific jobs, encourage using the search feature
- Don't invent job listings or company details
- Focus on recruitment, careers, and the platform
- Be honest if you don't know something
- Keep responses conversational and easy to understand

Remember: You're here to empower people in their career journey! 🚀`;

const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Validate input
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    // Initialize Gemini model (gemini-1.5-flash is FREE and fast)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: RECRUITMENT_CONTEXT,
    });

    // Build conversation history for context
    // const chat = model.startChat({
    //   history: conversationHistory.map(msg => ({
    //     role: msg.role === 'assistant' ? 'model' : 'user',
    //     parts: [{ text: msg.content }],
    //   })),
    //   generationConfig: {
    //     maxOutputTokens: 500,
    //     temperature: 0.7,
    //     topP: 0.9,
    //     topK: 40,
    //   },
    // });

    // Remove any assistant messages at the beginning
const cleanedHistory = [...conversationHistory];

while (cleanedHistory.length && cleanedHistory[0].role === 'assistant') {
  cleanedHistory.shift();
}

const chat = model.startChat({
  history: cleanedHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  })),
  generationConfig: {
    maxOutputTokens: 500,
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
  },
});


    // Send message and get response
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.status(200).json({
      success: true,
      data: {
        reply: reply,
        conversationId: req.body.conversationId || Date.now().toString(),
      }
    });

  } catch (error) {
    console.error('Gemini Chatbot Error:', error);
    
    // Handle specific Gemini errors
    if (error.message?.includes('API key')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key. Please check your Gemini configuration.',
      });
    }

    if (error.message?.includes('quota')) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit reached. Please try again in a moment.',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process chat message. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get context-aware suggested questions
const getSuggestedQuestions = async (req, res) => {
  try {
    const suggestions = [
      "💼 How does the AI CV evaluation work?",
      "✍️ What makes a strong CV/resume?",
      "🎯 How can I prepare for an interview?",
      "🔍 Tips for searching the right jobs",
      "📝 How do I apply for positions?",
      "🏢 How can employers post jobs?",
      "🤝 What is AI-powered job matching?",
      "📊 How to improve my application success rate?",
    ];

    // Randomize and return 6 suggestions
    const randomSuggestions = suggestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    res.status(200).json({
      success: true,
      data: randomSuggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions',
    });
  }
};

// Get quick responses for common questions
const getQuickResponse = async (req, res) => {
  try {
    const { question } = req.body;

    const quickResponses = {
      "how_cv_works": "Our AI CV evaluation analyzes your resume against job requirements using advanced machine learning. It checks skills match, experience relevance, formatting, and provides a compatibility score with actionable feedback! 📊",
      "how_to_apply": "Find a job you like, click 'Apply Now', upload your CV, and our AI will instantly evaluate your fit. You'll get feedback and the employer receives your application with an AI-generated compatibility report! 🚀",
      "interview_tips": "Research the company, practice common questions, prepare examples of your achievements, dress professionally, and ask thoughtful questions. Show enthusiasm and be authentic! 💪",
      "post_job": "Employers can click 'Post Job', fill in job details, and our AI will automatically match qualified candidates from our database. You'll receive ranked applications! 🎯",
    };

    if (quickResponses[question]) {
      return res.status(200).json({
        success: true,
        data: { reply: quickResponses[question] },
      });
    }

    res.status(404).json({
      success: false,
      error: 'Quick response not found',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get quick response',
    });
  }
};

module.exports = {
  chatWithBot,
  getSuggestedQuestions,
  getQuickResponse,
};