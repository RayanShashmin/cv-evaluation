const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({});  // Uses GEMINI_API_KEY from .env by default

/**
 * Evaluate CV using Google Gemini AI
 */
exports.evaluateCV = async (cvText, jobDescription) => {
  try {
    console.log('🤖 Starting AI evaluation...');
    console.log('CV length:', cvText.length, 'characters');
    console.log('Job description length:', jobDescription?.length || 0, 'characters');
    
    const prompt = buildEvaluationPrompt(cvText, jobDescription);
    
    console.log('📤 Sending request to Gemini AI...');
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',  // Updated model; use 'gemini-2.5-pro' for more complex analysis if needed
      contents: prompt
    });
    const text = response.text;
    
    console.log('📥 Received response from AI');
    
    // Parse JSON response
    const evaluation = parseAIResponse(text);
    
    console.log('✅ AI evaluation completed');
    console.log('Overall score:', evaluation.scores.overall);
    
    return evaluation;
  } catch (error) {
    console.error('❌ AI Evaluation Error:', error);
    throw new Error('Failed to evaluate CV with AI: ' + error.message);
  }
};

/**
 * Build evaluation prompt for AI
 */
function buildEvaluationPrompt(cvText, jobDescription) {
  return `You are an expert HR recruiter and ATS (Applicant Tracking System). Analyze this CV against the job description and provide a detailed, objective evaluation.

JOB DESCRIPTION:
${jobDescription || 'General evaluation - no specific job description provided'}

CANDIDATE CV:
${cvText}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, just raw JSON.

Provide your analysis in this EXACT JSON format:
{
  "extractedData": {
    "personalInfo": {
      "name": "extracted name or unknown",
      "email": "extracted email or unknown",
      "phone": "extracted phone or unknown",
      "location": "extracted location or unknown"
    },
    "summary": "brief professional summary extracted from CV",
    "skills": ["skill1", "skill2", "skill3"],
    "experience": [
      {
        "title": "job title",
        "company": "company name",
        "duration": "duration",
        "description": "brief description"
      }
    ],
    "education": [
      {
        "degree": "degree name",
        "institution": "institution name",
        "year": "graduation year",
        "field": "field of study"
      }
    ],
    "certifications": ["cert1", "cert2"],
    "languages": ["language1", "language2"]
  },
  "scores": {
    "overall": 75,
    "skillsMatch": 80,
    "experienceLevel": 70,
    "educationFit": 85,
    "presentationQuality": 75
  },
  "feedback": {
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "recommendations": ["recommendation 1", "recommendation 2"],
    "summary": "Overall assessment summary in 2-3 sentences"
  },
  "matchAnalysis": {
    "matchedSkills": ["matched skill 1", "matched skill 2"],
    "missingSkills": ["missing skill 1", "missing skill 2"],
    "experienceGap": "description of experience gap or match",
    "fitLevel": "excellent"
  }
}

SCORING GUIDELINES (0-100):
- 90-100: Exceptional candidate, exceeds all requirements
- 80-89: Strong candidate, meets all key requirements
- 70-79: Good candidate, meets most requirements
- 60-69: Adequate candidate, meets minimum requirements
- Below 60: Does not meet requirements

fitLevel must be one of: "excellent", "good", "average", "poor"

Respond with ONLY the JSON object, no additional text.`;
}

/**
 * Parse AI response and validate structure
 */
function parseAIResponse(responseText) {
  try {
    // Remove markdown code blocks if present
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(cleanText);
    
    // Validate required fields
    if (!parsed.extractedData || !parsed.scores || !parsed.feedback || !parsed.matchAnalysis) {
      throw new Error('Missing required fields in AI response');
    }
    
    // Ensure scores are within valid range
    Object.keys(parsed.scores).forEach(key => {
      if (parsed.scores[key] < 0) parsed.scores[key] = 0;
      if (parsed.scores[key] > 100) parsed.scores[key] = 100;
    });
    
    // Validate fitLevel
    const validFitLevels = ['excellent', 'good', 'average', 'poor'];
    if (!validFitLevels.includes(parsed.matchAnalysis.fitLevel)) {
      parsed.matchAnalysis.fitLevel = 'average';
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Raw response:', responseText.substring(0, 500));
    throw new Error('Failed to parse AI response: ' + error.message);
  }
}

/**
 * Generate fallback evaluation if AI fails
 */
exports.generateFallbackEvaluation = (cvText) => {
  console.log('⚠️  Generating fallback evaluation...');
  
  return {
    extractedData: {
      personalInfo: {
        name: 'Unable to extract',
        email: 'Unable to extract',
        phone: 'Unable to extract',
        location: 'Unable to extract'
      },
      summary: cvText.substring(0, 200) + '...',
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      languages: []
    },
    scores: {
      overall: 50,
      skillsMatch: 50,
      experienceLevel: 50,
      educationFit: 50,
      presentationQuality: 50
    },
    feedback: {
      strengths: ['CV submitted for review'],
      weaknesses: ['Unable to perform automated evaluation'],
      recommendations: ['Manual review recommended'],
      summary: 'Automated evaluation failed. Manual review required.'
    },
    matchAnalysis: {
      matchedSkills: [],
      missingSkills: [],
      experienceGap: 'Unable to analyze',
      fitLevel: 'average'
    }
  };
};