const router = require('express').Router();
const Project = require('../models/Project');
const strictAuth = require('../middleware/strictAuth');

// GET All Projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (err) { res.status(500).json(err); }
});

// POST New Project
router.post('/', strictAuth, async (req, res) => {
  try {
    const count = await Project.countDocuments();
    const newProject = new Project({ ...req.body, order: count });
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) { res.status(500).json(err); }
});

// DELETE Project
router.delete('/:id', strictAuth, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json("Project deleted.");
  } catch (err) { res.status(500).json(err); }
});
// REORDER Projects - must be BEFORE /:id to avoid Express matching "reorder" as an ID
router.put('/reorder/bulk', strictAuth, async (req, res) => {
  try {
    const { updates } = req.body; // Expecting { updates: [{_id: "...", order: 0}, ...] }
    
    // Create bulk operations
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update._id },
        update: { $set: { order: update.order } }
      }
    }));

    await Project.bulkWrite(bulkOps);
    res.status(200).json("Projects reordered successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE a project
router.put('/:id', strictAuth, async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;