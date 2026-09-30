require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const emailToReset = process.argv[2] || 'shifattfs@gmail.com';
const newPassword = process.argv[3] || 'admin12345';

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { email: emailToReset },
      { 
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      },
      { new: true }
    );

    if (!user) {
      console.log(`❌ No user found with email: ${emailToReset}`);
    } else {
      console.log(`✅ Password successfully updated for: ${user.email}`);
      console.log(`🔑 New Password: ${newPassword}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error resetting password:", error.message);
  }
}

resetPassword();
