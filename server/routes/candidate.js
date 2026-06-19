// server/routes/candidate.js - FIXED WITH CORRECT JOB FIELDS
const router = require("express").Router();
const { authMiddleware, authorize } = require("../middleware/authMiddleware");
const Application = require("../models/application");

// DEBUG: Test endpoint to check auth
router.get("/test", authMiddleware, authorize('candidate'), (req, res) => {
    res.json({
        success: true,
        message: "Candidate auth working!",
        userId: req.user._id,
        userRole: req.user.role
    });
});

// Get all applications for logged-in candidate
router.get("/my-applications", authMiddleware, authorize('candidate'), async (req, res) => {
    try {
        console.log('=== Fetching Applications ===');
        console.log('User ID:', req.user._id);
        console.log('User Role:', req.user.role);

        const applications = await Application.find({ candidateId: req.user._id })
            .populate('jobId', 'jobPostTitle companyName jobLocation jobType')  // FIXED: Use correct field names
            .sort({ appliedDate: -1 });
        
        console.log('Found applications:', applications.length);
        console.log('Applications:', JSON.stringify(applications, null, 2));

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching applications",
            error: error.message
        });
    }
});

// Get specific application details
router.get("/application/:id", authMiddleware, authorize('candidate'), async (req, res) => {
    try {
        console.log('=== Fetching Single Application ===');
        console.log('Application ID:', req.params.id);
        console.log('User ID:', req.user._id);

        const application = await Application.findOne({
            _id: req.params.id,
            candidateId: req.user._id
        }).populate('jobId', 'jobPostTitle companyName jobLocation jobType')  // FIXED
          .populate('reviewedBy', 'firstName lastName');
        
        if (!application) {
            console.log('Application not found');
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }
        
        console.log('Found application:', application);

        res.status(200).json({
            success: true,
            application
        });
    } catch (error) {
        console.error("Error fetching application:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching application details",
            error: error.message
        });
    }
});

// Get application statistics
router.get("/stats", authMiddleware, authorize('candidate'), async (req, res) => {
    try {
        console.log('=== Fetching Stats ===');
        console.log('User ID:', req.user._id);

        const total = await Application.countDocuments({ candidateId: req.user._id });
        const reviewing = await Application.countDocuments({ 
            candidateId: req.user._id, 
            status: 'reviewing' 
        });
        const shortlisted = await Application.countDocuments({ 
            candidateId: req.user._id, 
            status: 'shortlisted' 
        });
        const rejected = await Application.countDocuments({ 
            candidateId: req.user._id, 
            status: 'rejected' 
        });
        
        const stats = {
            total,
            reviewing,
            shortlisted,
            rejected
        };

        console.log('Stats:', stats);

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching statistics",
            error: error.message
        });
    }
});

module.exports = router;