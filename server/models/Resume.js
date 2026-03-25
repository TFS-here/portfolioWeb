const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  resumeUrl: { type: String, required: true },
  resumePublicId: { type: String, required: true } 
});

module.exports = mongoose.model('Resume', resumeSchema);