const express = require("express");
const router = express.Router();
const { Job, validateJob } = require("../models/job");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in an 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG/JPG/PNG images are allowed!"));
  },
});

// Create a new job
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { error } = validateJob(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const newJob = new Job({
      ...req.body,
      photo: req.file ? `/uploads/${req.file.filename}` : null, // Store relative path
    });
    await newJob.save();
    res.status(201).send({ data: newJob, message: "Job created successfully" });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).send({ data: jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get a single job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).send({ message: "Job not found" });
    res.status(200).send({ data: job });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Update a job by ID
router.put("/:id", upload.single("photo"), async (req, res) => {
  try {
    const { error } = validateJob(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const updatedData = {
      ...req.body,
      ...(req.file && { photo: `/uploads/${req.file.filename}` }), // Update photo if provided
    };
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedJob) return res.status(404).send({ message: "Job not found" });
    res.status(200).send({ data: updatedJob, message: "Job updated successfully" });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Delete a job by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).send({ message: "Job not found" });
    res.status(200).send({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;