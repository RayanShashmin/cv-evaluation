const Evaluation = require('../models/evaluation.model');
const { extractTextFromS3, validateExtractedText } = require('../services/cv-extraction.service');
const { evaluateCV, generateFallbackEvaluation } = require('../services/ai-evaluation.service');
const { sendToQueue } = require('../config/rabbitmq');
const axios = require('axios');

const processEvaluation = async (message) => {
  const startTime = Date.now();
  
  try {
    console.log('═══════════════════════════════════════════');
    console.log('🤖 [CV Service] New Evaluation Request');
    console.log('📨 Full message:', JSON.stringify(message, null, 2));
    console.log('═══════════════════════════════════════════');

    // Validate message structure
    if (!message.applicationId || !message.resumeUrl) {
      console.error('❌ Invalid message format. Missing required fields.');
      console.error('Expected: { applicationId, jobId, resumeUrl }');
      console.error('Received:', message);
      return;
    }

    const { applicationId, jobId, resumeUrl, jobDescription, jobData, candidateInfo } = message;
    
    console.log('✅ Valid message received');
    console.log('   Application ID:', applicationId);
    console.log('   Job ID:', jobId);
    console.log('   Resume URL:', resumeUrl);

    // Create or update evaluation record
    let evaluation = await Evaluation.findOne({ applicationId });
    
    if (!evaluation) {
      evaluation = new Evaluation({
        applicationId,
        jobId: jobId || applicationId,
        status: 'processing'
      });
    } else {
      evaluation.status = 'processing';
      evaluation.errorMessage = undefined;
    }
    await evaluation.save();
    console.log('✅ Evaluation record created/updated');

    // Extract text from CV
    console.log('📄 Extracting text from CV...');
    const cvText = await extractTextFromS3(resumeUrl);
    const validatedText = validateExtractedText(cvText);
    console.log('✅ Text extracted:', validatedText.length, 'characters');

    // AI Evaluation
    console.log('🤖 Starting AI evaluation...');
    let aiResult;
    
    try {
      aiResult = await evaluateCV(validatedText, jobDescription || '');
    } catch (aiError) {
      console.error('⚠️  AI evaluation failed, using fallback');
      aiResult = generateFallbackEvaluation(validatedText);
    }

    // Update evaluation with results
    evaluation.extractedData = aiResult.extractedData;
    evaluation.scores = aiResult.scores;
    evaluation.feedback = aiResult.feedback;
    evaluation.matchAnalysis = aiResult.matchAnalysis;
    evaluation.rawText = validatedText;
    evaluation.status = 'completed';
    evaluation.processingTime = Date.now() - startTime;
    
    await evaluation.save();
    
    console.log('✅ Evaluation completed! Score:', evaluation.scores.overall);
    console.log('⏱️  Processing time:', evaluation.processingTime, 'ms');

    // ═══════════════════════════════════════════════════════════
    // Check if score >= 70 and send high score email
    // ═══════════════════════════════════════════════════════════
    if (evaluation.scores.overall >= 70) {
      console.log('');
      console.log('🎉🎉🎉 HIGH SCORE ALERT! 🎉🎉🎉');
      console.log('   Score:', evaluation.scores.overall, '/ 100');
      console.log('   Triggering email notification...');
      
      try {
        // Fetch job details if not provided
        let jobInfo = jobData;
        
        if (!jobInfo && jobId) {
          console.log('   Fetching job details from main backend...');
          const mainBackendUrl = process.env.MAIN_BACKEND_URL || 'http://localhost:8080';
          
          try {
            const jobResponse = await axios.get(`${mainBackendUrl}/api/jobs/${jobId}`, {
              timeout: 5000
            });
            
            // ✅ FIXED: Unwrap the response (your API returns {data: job})
            jobInfo = jobResponse.data.data || jobResponse.data;
            
            console.log('✅ Job details fetched successfully');
            console.log('   Job Title:', jobInfo.jobPostTitle);
            console.log('   Company:', jobInfo.companyName);
            console.log('   Hiring Manager Email:', jobInfo.hiringManagerEmail);
            
          } catch (fetchError) {
            console.error('❌ Failed to fetch job details:', fetchError.message);
            if (fetchError.response) {
              console.error('   Response status:', fetchError.response.status);
              console.error('   Response data:', JSON.stringify(fetchError.response.data, null, 2));
            }
          }
        }

        // Validate job data
        if (!jobInfo) {
          console.error('❌ No job data available');
          console.log('   Job ID:', jobId);
          console.log('   Skipping email notification');
        } else if (!jobInfo.hiringManagerEmail) {
          console.error('❌ Missing hiring manager email in job data');
          console.log('   Available job fields:', Object.keys(jobInfo));
          console.log('   Job Data:', JSON.stringify(jobInfo, null, 2));
          console.log('   Skipping email notification');
        } else {
          // Prepare candidate data
          const candidateData = {
            name: candidateInfo?.name || evaluation.extractedData?.personalInfo?.name || 'Unknown Candidate',
            email: candidateInfo?.email || evaluation.extractedData?.personalInfo?.email || 'N/A',
            phone: candidateInfo?.phone || evaluation.extractedData?.personalInfo?.phone || 'N/A',
            appliedDate: message.appliedDate || new Date()
          };

          console.log('   Candidate Name:', candidateData.name);
          console.log('   Candidate Email:', candidateData.email);
          console.log('   Hiring Manager:', jobInfo.hiringManagerEmail);
          console.log('   📤 Sending to email queue...');

          // Send high score notification to email queue
          await sendToQueue('email-notification-queue', {
            type: 'HIGH_SCORE_NOTIFICATION',
            data: {
              candidateName: candidateData.name,
              candidateEmail: candidateData.email,
              candidatePhone: candidateData.phone,
              appliedDate: candidateData.appliedDate,
              applicationId: applicationId,
              score: evaluation.scores.overall,
              scores: {
                skillsMatch: evaluation.scores.skillsMatch,
                experienceLevel: evaluation.scores.experienceLevel,
                educationFit: evaluation.scores.educationFit,
                presentationQuality: evaluation.scores.presentationQuality
              },
              strengths: evaluation.feedback.strengths || [],
              skills: evaluation.matchAnalysis.matchedSkills || [],
              summary: evaluation.feedback.summary || '',
              jobTitle: jobInfo.jobPostTitle,
              jobDepartment: jobInfo.jobDepartment,
              jobLocation: jobInfo.jobLocation,
              companyName: jobInfo.companyName,
              publisherEmail: jobInfo.hiringManagerEmail
            }
          });

          // Mark as notified
          evaluation.notificationSent = true;
          evaluation.notificationSentAt = new Date();
          await evaluation.save();

          console.log('✅ High score email notification queued!');
        }
      } catch (emailError) {
        console.error('⚠️  Failed to send high score notification:', emailError.message);
        console.error('   Stack:', emailError.stack);
        console.log('   Evaluation completed, but email notification failed');
      }
    } else {
      console.log('📊 Score below 70 - No high score notification sent');
      console.log('   Score:', evaluation.scores.overall, '/ 100');
      console.log('   Threshold: 70');
    }

    console.log('═══════════════════════════════════════════');
    
    // Send result back
    try {
      await sendToQueue(process.env.RESULT_QUEUE || 'cv-evaluation-results', {
        type: 'EVALUATION_COMPLETED',
        applicationId,
        evaluationId: evaluation._id.toString(),
        scores: evaluation.scores,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
      console.log('📤 Result sent back to main backend');
    } catch (queueError) {
      console.error('⚠️  Failed to send result:', queueError.message);
    }
    
  } catch (error) {
    console.error('═══════════════════════════════════════════');
    console.error('❌ [CV Service] Evaluation Error:', error.message);
    console.error('═══════════════════════════════════════════');
    
    // Try to update evaluation status
    if (message.applicationId) {
      try {
        await Evaluation.findOneAndUpdate(
          { applicationId: message.applicationId },
          { 
            status: 'failed',
            errorMessage: error.message,
            processingTime: Date.now() - startTime
          }
        );
      } catch (updateError) {
        console.error('Failed to update error status:', updateError.message);
      }
    }
    
    // Send error notification
    try {
      await sendToQueue(process.env.RESULT_QUEUE || 'cv-evaluation-results', {
        type: 'EVALUATION_FAILED',
        applicationId: message.applicationId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } catch (queueError) {
      console.error('⚠️  Failed to send error notification');
    }
  }
};

// Start consuming messages from RabbitMQ
const startConsumer = async (channel) => {
  const queue = process.env.CV_EVAL_QUEUE;
  
  console.log('👂 Starting consumer for queue:', queue);
  
  channel.prefetch(1);
  
  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      try {
        const message = JSON.parse(msg.content.toString());
        
        if (message.test) {
          console.log('⏭️  Skipping test message');
          channel.ack(msg);
          return;
        }
        
        await processEvaluation(message);
        channel.ack(msg);
      } catch (error) {
        console.error('❌ Error processing message:', error.message);
        channel.ack(msg);
      }
    }
  });
  
  console.log('✅ [CV Service] Consumer started successfully');
  console.log(`👂 Listening for evaluation requests on: ${queue}`);
};

module.exports = { startConsumer };