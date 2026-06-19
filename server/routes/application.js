// server/routes/application.js - FIXED VERSION
const router = require("express").Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const Application = require("../models/application");
const { s3 } = require('../config/aws');
const multer = require("multer");
const path = require("path");
const { getChannel } = require('../config/rabbitmq');

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Optional auth middleware - extracts user if token exists but doesn't reject if missing
const optionalAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but we don't reject - just continue without user
      req.user = null;
    }
  }
  next();
};

// ========================================
// POST /api/applications - Submit Application
// ========================================
router.post("/", optionalAuth, upload.single('resume'), async (req, res) => {
  try {
    console.log('\n=== APPLICATION SUBMISSION ===');
    console.log('Body:', req.body);
    console.log('File:', req.file ? req.file.originalname : 'NO FILE');
    console.log('User:', req.user ? req.user._id : 'NO USER (PUBLIC APPLICATION)');

    const { jobId, name, email, phone, coverLetter } = req.body;

    // Validation
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required"
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required"
      });
    }
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    // Upload to S3
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `cvs/${fileName}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    
    console.log('📤 Uploading to S3...');
    const s3Data = await s3.upload(params).promise();
    console.log('✅ S3 Upload Success:', s3Data.Location);

    // Create application
    const applicationData = {
      candidateId: req.user ? req.user._id : null,  // Optional - null for public applications
      jobId: jobId,
      name: name,
      email: email,
      phone: phone || '',
      coverLetter: coverLetter || '',
      cvUrl: s3Data.Location,
      resume: s3Data.Location,  // Backward compatibility
      status: 'submitted',
      aiScore: null,
      feedback: ''
    };

    const newApplication = new Application(applicationData);
    await newApplication.save();
    
    console.log('✅ Application Saved:', newApplication._id);

    // Populate job details with CORRECT field names
    await newApplication.populate('jobId', 'jobPostTitle companyName jobLocation jobType');

    // Trigger AI evaluation via RabbitMQ
    try {
      const channel = getChannel();
      if (channel) {
        const message = {
          type: 'evaluate',
          applicationId: newApplication._id.toString(),
          resumeUrl: s3Data.Location,  // ✅ FIXED: Changed from cvUrl to resumeUrl
          jobId: jobId,
          candidateEmail: email,
          candidateInfo: {
            name: name,
            email: email,
            phone: phone || ''
          }
        };
        
        await channel.assertQueue('cv-evaluation-queue', { durable: true });
        channel.sendToQueue(
          'cv-evaluation-queue',
          Buffer.from(JSON.stringify(message)),
          { persistent: true }
        );
        console.log('✅ Message sent to RabbitMQ queue');
        console.log('   Queue: cv-evaluation-queue');
        console.log('   Application ID:', newApplication._id);
      } else {
        console.log('⚠️  RabbitMQ channel not available - evaluation will not run');
      }
    } catch (queueError) {
      console.error('❌ Queue error:', queueError.message);
      // Don't fail the request, just log it
    }

    console.log('============================\n');

    // Success response
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: newApplication
    });

  } catch (error) {
    console.error('\n❌ APPLICATION ERROR:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error submitting application"
    });
  }
});

// Get all applications (for recruiters)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'jobPostTitle companyName jobLocation')
      .sort({ appliedDate: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching applications" 
    });
  }
});

// Get applications for specific job
router.get("/job/:jobId", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'jobPostTitle companyName')
      .sort({ appliedDate: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching applications" 
    });
  }
});

// Get single application
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'jobPostTitle companyName jobDescription');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching application" 
    });
  }
});

// Update application status
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status, feedback, aiScore } = req.body;
    
    const updateData = {
      status,
      updatedDate: Date.now()
    };
    
    if (feedback !== undefined) updateData.feedback = feedback;
    if (aiScore !== undefined) updateData.aiScore = aiScore;
    if (req.user) updateData.reviewedBy = req.user._id;

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('candidateId', 'firstName lastName email')
    .populate('jobId', 'jobPostTitle companyName');

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Application status updated",
      application: updatedApplication
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating application" 
    });
  }
});

// Delete application
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedApplication = await Application.findByIdAndDelete(req.params.id);
    
    if (!deletedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting application" 
    });
  }
});

module.exports = router;