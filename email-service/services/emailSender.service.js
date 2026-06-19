const transporter = require('../config/email');
const EmailLog = require('../models/emailLog.model');

exports.sendEmail = async (emailData) => {
  const { to, subject, html, type, applicationId } = emailData;
  
  // Create email log
  const emailLog = new EmailLog({
    type,
    to,
    subject,
    applicationId,
    status: 'pending'
  });
  await emailLog.save();
  
  try {
    console.log(`📧 Sending email to: ${to}`);
    console.log(`   Subject: ${subject}`);
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    
    // Update log
    emailLog.status = 'sent';
    emailLog.sentAt = new Date();
    await emailLog.save();
    
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    
    // Update log with error
    emailLog.status = 'failed';
    emailLog.errorMessage = error.message;
    await emailLog.save();
    
    throw error;
  }
};