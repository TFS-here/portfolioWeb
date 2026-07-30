const router = require('express').Router();
const Message = require('../models/Message');
const nodemailer = require('nodemailer');
const strictAuth = require('../middleware/strictAuth');

// POST: Save Message & Email Me
router.post('/', async (req, res) => {
  try {
    // 1. Save to Database (So it shows in Admin Dashboard)
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();

    // 2. Setup Email Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 3. Define Email Details
    const mailOptions = {
      from: req.body.email, // The visitor's email
      to: process.env.EMAIL_USER, // Your email (shifattfs00@gmail.com)
      subject: `🚀 New Portfolio Message from ${req.body.name}`,
      text: `
        You have received a new message from your portfolio website!
        
        ----------------------------------------
        Name:    ${req.body.name}
        Email:   ${req.body.email}
        Date:    ${new Date().toLocaleString()}
        ----------------------------------------
        
        Message:
        ${req.body.message}
      `
    };

    // 4. Send Email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email notification sent: ' + info.response);
      }
    });

    // Return success to frontend (even if email fails, DB save succeeded)
    res.status(201).json(savedMessage);

  } catch (err) {
    res.status(500).json(err);
  }
});

// GET (Admin only)
router.get('/', strictAuth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ date: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE (Admin only)
router.delete('/:id', strictAuth, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json("Message deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;