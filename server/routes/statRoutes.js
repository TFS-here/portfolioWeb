const router = require('express').Router();
const Stat = require('../models/Stat');
const strictAuth = require('../middleware/strictAuth');

// GET
router.get('/', async (req, res) => {
  try { const stats = await Stat.find(); res.json(stats); } 
  catch (err) { res.status(500).json(err); }
});

// POST
router.post('/', strictAuth, async (req, res) => {
  const newStat = new Stat(req.body);
  try { const savedStat = await newStat.save(); res.status(201).json(savedStat); } 
  catch (err) { res.status(500).json(err); }
});

// PUT
router.put('/:id', strictAuth, async (req, res) => {
  try {
    const updatedStat = await Stat.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedStat);
  } catch (err) { res.status(500).json(err); }
});

// DELETE
router.delete('/:id', strictAuth, async (req, res) => {
  try { await Stat.findByIdAndDelete(req.params.id); res.json("Deleted"); } 
  catch (err) { res.status(500).json(err); }
});

module.exports = router;