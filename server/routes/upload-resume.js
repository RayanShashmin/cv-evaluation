const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { s3 } = require('../config/aws'); // Import S3 client

// Configure multer for file upload
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
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `resumes/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const data = await s3.upload(params).promise();
    res.json({ fileUrl: data.Location });
  } catch (error) {
    console.error('S3 Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

module.exports = router;