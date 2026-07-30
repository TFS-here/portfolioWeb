const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  techStack: [String],
  liveLink: String,
  repoLink: String,
  image: String,
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Project', ProjectSchema);