// email-service/services/emailTemplate.service.js - COMPLETE VERSION

exports.highScoreNotification = (data) => {
  return {
    subject: `🎉 High-Scoring Candidate: ${data.candidateName} - Score: ${data.score}/100`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 650px; 
            margin: 30px auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .score-badge { 
            display: inline-block;
            font-size: 56px; 
            font-weight: bold; 
            color: #4ade80; 
            margin: 15px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
          }
          .content { 
            padding: 40px 30px; 
          }
          .info-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #64748b;
          }
          .value {
            color: #1e293b;
            font-weight: 500;
          }
          .score-breakdown {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
          }
          .score-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            text-align: center;
          }
          .score-item .score-value {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
          }
          .score-item .score-label {
            font-size: 12px;
            color: #64748b;
            margin-top: 5px;
          }
          .strengths-list {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #22c55e;
          }
          .strengths-list ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .strengths-list li {
            padding: 5px 0;
            color: #166534;
          }
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 15px 0;
          }
          .skill-tag {
            background: #dbeafe;
            color: #1e40af;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
          }
          .btn {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 25px 0;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
            transition: transform 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
          }
          .footer {
            background: #f8fafc;
            padding: 25px;
            text-align: center;
            color: #64748b;
            font-size: 13px;
            border-top: 1px solid #e2e8f0;
          }
          .job-details {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>🎯 Excellent Candidate Match!</h1>
            <div class="score-badge">${data.score}/100</div>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Outstanding evaluation score</p>
          </div>
          
          <!-- Content -->
          <div class="content">
            <!-- Job Details -->
            <div class="job-details">
              <h3 style="margin-top: 0; color: #92400e;">📋 Job Position</h3>
              <div class="info-row">
                <span class="label">Position:</span>
                <span class="value">${data.jobTitle}</span>
              </div>
              <div class="info-row">
                <span class="label">Department:</span>
                <span class="value">${data.jobDepartment}</span>
              </div>
              <div class="info-row">
                <span class="label">Location:</span>
                <span class="value">${data.jobLocation}</span>
              </div>
            </div>
            <!-- Candidate Info -->
            <div class="info-card">
              <h3 style="margin-top: 0; color: #1e293b;">👤 Candidate Information</h3>
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${data.candidateName}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${data.candidateEmail}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${data.candidatePhone || 'Not provided'}</span>
              </div>
              <div class="info-row">
                <span class="label">Applied Date:</span>
                <span class="value">${new Date(data.appliedDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
            <!-- Score Breakdown -->
            <h3 style="color: #1e293b;">📊 Detailed Evaluation Scores</h3>
            <div class="score-breakdown">
              <div class="score-item">
                <div class="score-value">${data.scores.skillsMatch}%</div>
                <div class="score-label">Skills Match</div>
              </div>
              <div class="score-item">
                <div class="score-value">${data.scores.experienceLevel}%</div>
                <div class="score-label">Experience Level</div>
              </div>
              <div class="score-item">
                <div class="score-value">${data.scores.educationFit}%</div>
                <div class="score-label">Education Fit</div>
              </div>
              <div class="score-item">
                <div class="score-value">${data.scores.presentationQuality}%</div>
                <div class="score-label">CV Quality</div>
              </div>
            </div>
            <!-- Strengths -->
            <div class="strengths-list">
              <h3 style="margin-top: 0; color: #166534;">💪 Key Strengths</h3>
              <ul>
                ${data.strengths.map(strength => `<li>${strength}</li>`).join('')}
              </ul>
            </div>
            <!-- Skills -->
            <h3 style="color: #1e293b;">🔧 Top Matching Skills</h3>
            <div class="skills">
              ${data.skills.slice(0, 10).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard/applications/${data.applicationId}" class="btn">
                📄 View Full Application & CV →
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.8; margin-top: 30px;">
              💡 <strong>Next Steps:</strong> We recommend reviewing the full application and scheduling an interview with this candidate. Their high score indicates a strong match for your requirements.
            </p>
          </div>
          <!-- Footer -->
          <div class="footer">
            <p style="margin: 5px 0;"><strong>AI Recruit - Intelligent CV Evaluation System</strong></p>
            <p style="margin: 5px 0;">This is an automated notification sent to: <strong>${data.publisherEmail}</strong></p>
            <p style="margin: 5px 0;">You received this because a candidate scored ${data.score}% or higher for your job posting.</p>
            <p style="margin: 15px 0 5px 0; font-size: 11px; color: #94a3b8;">
              Please do not reply to this email. For support, contact your system administrator.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

exports.rejectionWithFeedback = (data) => {
  return {
    subject: `Application Update - ${data.jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .score-badge { display: inline-block; padding: 8px 16px; background: #dbeafe; border-radius: 20px; font-weight: bold; color: #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Application</h1>
            <p>Position: ${data.jobTitle} at ${data.companyName}</p>
          </div>
          <div class="content">
            <p>Dear ${data.candidateName},</p>
            
            <p>Thank you for taking the time to apply for the ${data.jobTitle} position. After careful review of your application, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
            
            <div class="section">
              <h3>📊 Your Evaluation Score</h3>
              <p><span class="score-badge">${data.score}/100</span></p>
              <p style="color: #6b7280; font-size: 14px;">This score is based on our AI-powered analysis of your CV against the job requirements.</p>
            </div>
            
            <div class="section">
              <h3>💪 Your Strengths</h3>
              <ul>
                ${data.strengths.map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>
            
            <div class="section">
              <h3>💡 Areas for Improvement</h3>
              <ul>
                ${data.recommendations.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
            
            <div class="section">
              <h3>🎯 AI Feedback Summary</h3>
              <p>${data.summary}</p>
            </div>
            
            <p style="margin-top: 30px;">We encourage you to apply for other positions that may be a better fit for your skills and experience. We wish you the best in your job search!</p>
            
            <p>Best regards,<br>
            <strong>${data.companyName} Recruitment Team</strong></p>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This feedback was generated by AI Recruit to help you improve your future applications.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// NEW: Custom message template
exports.customMessage = (data) => {
  return {
    subject: data.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 30px auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { 
            background: #f9fafb; 
            padding: 30px; 
            border-radius: 0 0 10px 10px; 
          }
          .message-box { 
            background: white; 
            padding: 25px; 
            border-left: 4px solid #667eea; 
            margin: 20px 0; 
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #6b7280; 
            font-size: 14px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Message from Recruiter</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.subject}</p>
          </div>
          <div class="content">
            <p>Dear ${data.candidateName},</p>
            
            <div class="message-box">
              <p style="white-space: pre-wrap; margin: 0; line-height: 1.8;">${data.message}</p>
            </div>

            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>${data.recruiterName}</strong>
            </p>

            <div class="footer">
              <p style="margin: 5px 0;">This is a message from our recruitment system.</p>
              <p style="margin: 5px 0; font-size: 12px; color: #94a3b8;">
                Please do not reply to this email. For inquiries, contact the recruiter directly.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
};