const express = require('express');
const { Note, User } = require('../models/models');

const router = express.Router();

// Middleware: Ensure authenticated
function ensureAuthenticated(req, res, next) {
  if (req.oidc.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
}

// Helper: Get user's Auth0 ID
async function getUserAuth0Id(req) {
  const user = await User.findOne({ auth0Id: req.oidc.user.sub });
  return user ? user.auth0Id : req.oidc.user.sub;
}

// ========== NOTES CRUD ==========

// Get notes
router.get('/notes', ensureAuthenticated, async (req, res) => {
  try {
    const auth0Id = await getUserAuth0Id(req);
    const notes = await Note.find({ userId: auth0Id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create note
router.post('/notes', ensureAuthenticated, async (req, res) => {
  try {
    const auth0Id = await getUserAuth0Id(req);
    const { title, content, color } = req.body;

    const note = new Note({
      userId: auth0Id,
      title,
      content,
      color: color || "#ffffff" // fallback for safety
    });

    const saved = await note.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update note
router.put('/notes/:id', ensureAuthenticated, async (req, res) => {
  try {
    const auth0Id = await getUserAuth0Id(req);
    const { title, content, color } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: auth0Id },
      { title, content, color },
      { new: true }
    );

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete note
router.delete('/notes/:id', ensureAuthenticated, async (req, res) => {
  try {
    const auth0Id = await getUserAuth0Id(req);

    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: auth0Id
    });

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;