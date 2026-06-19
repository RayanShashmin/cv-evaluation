const { GoogleGenAI } = require('@google/genai');

const SYSTEM_PROMPT = `You are an AI assistant for an AI-powered CV evaluation recruitment platform.

PLATFORM CAPABILITIES:
- AI-powered CV evaluation with scoring
- Job posting and application tracking
- Automated candidate matching
- Real-time application status

YOUR ROLE:
- Guide candidates through CV upload and application process
- Help recruiters understand evaluation metrics and dashboard
- Explain platform features clearly and concisely
- Provide step-by-step instructions when needed

RESPONSE GUIDELINES:
- Keep responses under 100 words unless detailed steps are needed
- Be professional but friendly
- Always provide actionable next steps
- For technical issues, direct to support

PLATFORM SPECIFIC INFO:
For Candidates:
- CV Upload: Navigate to "Submit Application" → Upload CV (PDF/DOCX, max 5MB) → AI evaluates in 2 minutes
- Scoring: Skills Match 40%, Experience 30%, Education 20%, Presentation 10%
- Timeline: Evaluation 2 mins → Recruiter review 1-3 days → Interview 5-7 days
- Good Score: 70+ is excellent, 50-70 is good, below 50 needs improvement

For Recruiters:
- Dashboard: View evaluated CVs sorted by score → Filter by skills/experience
- Export: Select candidates → Click "Export" → Download CSV/Excel
- Scoring: AI provides weighted scores with detailed breakdown
- Features: Smart matching, bulk actions, analytics

General Platform Info:
- This is an AI-powered recruitment platform that automatically evaluates CVs
- Candidates submit CVs and get instant AI evaluation
- Recruiters access a dashboard with scored and ranked candidates
- The system uses advanced AI to match candidates with job requirements

LIMITATIONS:
- Cannot access specific user accounts or modify data
- Cannot schedule interviews directly
- Cannot change CV scores or evaluations`;

class GeminiService {
  constructor() {
    // Initialize the Google GenAI client with API key
    // Use GEMINI_CHATBOT_API_KEY or fallback to GEMINI_API_KEY
    const apiKey = process.env.GEMINI_CHATBOT_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ ERROR: No API key found! Please set GEMINI_CHATBOT_API_KEY in your .env file');
      throw new Error('GEMINI_CHATBOT_API_KEY is required');
    }
    
    this.ai = new GoogleGenAI({ apiKey: apiKey });
    console.log('✅ Gemini Service initialized successfully');
  }

  async generateResponse(message, conversationHistory, userContext) {
    try {
      console.log('🤖 Gemini Service: Starting generation');
      
      // Build conversation context
      const contextualPrompt = this.buildContextualPrompt(message, userContext);
      
      // Format conversation history for Gemini
      const contents = [];
      
      // Add conversation history
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
      
      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: contextualPrompt }]
      });
      
      console.log('📝 Chat history length:', conversationHistory.length);
      console.log('💬 Sending to Gemini:', contextualPrompt.substring(0, 100) + '...');
      
      // Generate response using the correct API for @google/genai v1.37.0
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      });
      
      // Extract text from response
      const text = response.text;
      console.log('✅ Gemini response received');
      
      return text;
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      console.error('Error details:', error.message);
      
      // Handle rate limits gracefully
      if (error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('429')) {
        return "I'm experiencing high traffic right now. Please try again in a moment, or contact support@yourplatform.com for immediate assistance.";
      }
      
      // Handle quota exceeded
      if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
        return "Our AI service is temporarily unavailable. Please contact support@yourplatform.com for assistance.";
      }
      
      // Handle invalid API key
      if (error.message?.includes('API key') || error.message?.includes('INVALID_ARGUMENT') || error.message?.includes('API_KEY_INVALID')) {
        return "There's a configuration issue with the API key. Please contact support@yourplatform.com for assistance.";
      }
      
      // Handle model not found
      if (error.message?.includes('NOT_FOUND') || error.message?.includes('models/')) {
        return "The AI model is currently unavailable. Please try again in a moment.";
      }
      
      throw new Error('Failed to generate response: ' + error.message);
    }
  }

  buildContextualPrompt(message, userContext) {
    const { userType, isAuthenticated, userName } = userContext;
    
    let context = `[User Type: ${userType}`;
    if (isAuthenticated && userName) {
      context += ` | Name: ${userName}`;
    }
    context += `]\n\nUser Question: ${message}`;
    
    return context;
  }

  generateSuggestions(message, userType) {
    const lowerMessage = message.toLowerCase();
    
    // Upload-related questions
    if (lowerMessage.includes('upload') || lowerMessage.includes('submit') || lowerMessage.includes('cv') || lowerMessage.includes('resume')) {
      return userType === 'candidate'
        ? ['What file formats are supported?', 'How long does evaluation take?', 'What happens after I apply?']
        : ['How do I view uploaded CVs?', 'How do I filter applications?', 'Can I download applications?'];
    }
    
    // Score-related questions
    if (lowerMessage.includes('score') || lowerMessage.includes('evaluation') || lowerMessage.includes('rating') || lowerMessage.includes('assess')) {
      return userType === 'candidate'
        ? ['What is a good score?', 'How is my CV scored?', 'Can I improve my score?']
        : ['How is the scoring calculated?', 'Can I export top candidates?', 'What do the metrics mean?'];
    }
    
    // Timeline questions
    if (lowerMessage.includes('when') || lowerMessage.includes('time') || lowerMessage.includes('how long') || lowerMessage.includes('timeline')) {
      return userType === 'candidate'
        ? ['When will I hear back?', 'How long is the hiring process?', 'What are the next steps?']
        : ['What is the typical hiring timeline?', 'How quickly are CVs evaluated?'];
    }
    
    // Dashboard/Platform questions
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('how to use') || lowerMessage.includes('navigate') || lowerMessage.includes('platform')) {
      return userType === 'recruiter'
        ? ['How do I filter candidates?', 'How do I export results?', 'How do I view detailed scores?']
        : ['How do I track my application?', 'Where can I see my status?'];
    }
    
    // Introduction messages
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('recruiter') || lowerMessage.includes('candidate') || lowerMessage.includes('tell') || lowerMessage.includes('about')) {
      return userType === 'recruiter'
        ? ['How does the AI scoring work?', 'How do I find top candidates?', 'How do I export results?']
        : ['How do I upload my CV?', 'How does the evaluation work?', 'What happens after I apply?'];
    }
    
    // Default suggestions based on user type
    return userType === 'candidate'
      ? ['How do I upload my CV?', 'What does each score mean?', 'What happens after evaluation?']
      : ['How do I access the dashboard?', 'How do I filter candidates?', 'How do I export results?'];
  }

  // Additional method for checking API health
  async checkHealth() {
    try {
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
      });
      return { healthy: true, message: 'Gemini API is operational' };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }
}

module.exports = new GeminiService();