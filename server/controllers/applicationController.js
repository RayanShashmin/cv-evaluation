const Application = require('../models/application.model');
const { uploadToS3, deleteFromS3 } = require('../services/s3.service');
const { sendToQueue } = require('../config/rabbitmq');

// Create Application
exports.createApplication = async (req, res) => {
  try {
    const { name, email, phone, coverLetter, jobId } = req.body;
    
    console.log('=== Application Submission ===');
    console.log('Body:', { name, email, phone, jobId });
    console.log('File:', req.file ? req.file.originalname : 'No file');
    
    // Validate required fields
    if (!name || !email || !coverLetter || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    console.log('Uploading to S3...');
    // Upload to S3
    const resumeUrl = await uploadToS3(req.file);
    console.log('S3 URL:', resumeUrl);

    // Create application
    const application = new Application({
      name,
      email,
      phone,
      coverLetter,
      resumeUrl,
      jobId,
      userId: req.user?._id
    });

    await application.save();
    console.log('Application saved:', application._id);
    
    // SEND TO RABBITMQ FOR CV EVALUATION
    try {
  console.log('🚀 Sending to RabbitMQ for evaluation...');
  
  const message = {
    applicationId: application._id.toString(),
    jobId: application.jobId.toString(),
    resumeUrl: resumeUrl,
    jobDescription: '', // Will be fetched by microservice
    timestamp: new Date().toISOString()
  };
  
  console.log('📤 Message data:', message); // DEBUG
  
  await sendToQueue(process.env.CV_EVAL_QUEUE || 'cv-evaluation-queue', message);
  
  console.log('✅ Message queued for evaluation');
} catch (error) {
  console.error('⚠️  Failed to queue message:', error.message);
}
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Application Creation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Get All Applications
exports.getApplications = async (req, res) => {
  try {
    const { jobId, status } = req.query;
    const filter = {};
    
    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;
    
    const applications = await Application.find(filter)
      .populate('jobId', 'jobPostTitle companyName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Get Single Application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'jobPostTitle companyName jobDescription');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
};

// Update Application Status
exports.updateApplication = async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message
    });
  }
};

// Delete Application
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Delete resume from S3
    if (application.resumeUrl) {
      await deleteFromS3(application.resumeUrl);
    }
    
    await application.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
};