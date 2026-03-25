const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { cloudinary, upload } = require('../utils/upload');

// GET: Fetch the current resume
router.get('/', async (req, res) => {
  try {
    const resumeData = await Resume.findOne();
    if (resumeData) {
      res.status(200).json(resumeData);
    } else {
      res.status(404).json({ message: "No resume found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST: Upload a new resume
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    // Upload to Cloudinary as a raw file (for PDFs)
    const cloudResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: "portfolio_resume",
      resource_type: "raw" 
    });

    // Update MongoDB (upsert creates it if it doesn't exist)
    const updatedResume = await Resume.findOneAndUpdate(
      {}, 
      { 
        resumeUrl: cloudResponse.secure_url,
        resumePublicId: cloudResponse.public_id 
      },
      { new: true, upsert: true } 
    );

    res.status(200).json({ message: "Resume uploaded successfully!", data: updatedResume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// DELETE: Delete the current resume
router.delete('/delete', async (req, res) => {
  try {
    const resumeData = await Resume.findOne();
    if (!resumeData) return res.status(400).json({ message: "No resume to delete" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(resumeData.resumePublicId, { resource_type: "raw" });

    // Delete from MongoDB
    await Resume.deleteOne({});

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Deletion failed" });
  }
});

module.exports = router;