const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth'); // Import the middleware

// CHECK IF ADMIN EXISTS (Public)
router.get('/admin-exists', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ exists: userCount > 0 });
  } catch (err) {
    res.status(500).json(err);
  }
});

// REGISTER (Secured)
router.post('/register', auth, async (req, res) => {
  try {
    // 1. Check how many users exist
    const userCount = await User.countDocuments();

    // 2. SECURITY CHECK:
    // If users exist AND the requester is NOT logged in, block them.
    if (userCount > 0 && !req.user) {
      return res.status(403).json("Admin already exists. You must login to create a new admin.");
    }

    // 3. Create the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN (Unchanged)
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("User not found");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json("Wrong password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json(err);
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("User with this email not found");

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Update user
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Frontend URL could be dynamic, we'll use localhost or production origin
    const origin = req.headers.origin || 'http://localhost:3000';
    const resetUrl = `${origin}/reset-password/${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Portfolio Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your portfolio admin account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${resetUrl}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending reset email:', error);
        return res.status(500).json("Error sending email");
      } else {
        res.status(200).json("Password reset email sent!");
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({ 
      resetPasswordToken: req.params.token, 
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json("Password reset token is invalid or has expired.");

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json("Password has been reset successfully. You can now login.");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;