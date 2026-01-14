const express = require('express');
const { Note, User } = require('../models/models');

const router = express.Router();

// Middleware: Ensure authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// Middleware: Ensure admin
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.username === 'lezama24') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}

// ========== NOTES CRUD OPERATIONS ==========

// Get all notes for authenticated user
router.get('/notes', ensureAuthenticated, async (req, res) => {
  try {
    console.log('GET /api/notes - User:', req.user?._id);
    const notes = await Note.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    console.log('Found notes:', notes.length);
    res.json(notes);
  } catch (err) {
    console.error('GET /api/notes error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create a new note
router.post('/notes', ensureAuthenticated, async (req, res) => {
  try {
    console.log('POST /api/notes - User:', req.user?._id, 'Body:', req.body);
    const { title, content } = req.body;
    const note = new Note({ userId: req.user._id.toString(), title, content });
    const saved = await note.save();
    console.log('Note saved:', saved._id);
    res.json(saved);
  } catch (err) {
    console.error('POST /api/notes error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Update a note
router.put('/notes/:id', ensureAuthenticated, async (req, res) => {
  try {
    console.log('PUT /api/notes/:id - ID:', req.params.id, 'User:', req.user?._id);
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id.toString() },
      { title, content },
      { new: true }
    );
    if (!note) {
      console.log('Note not found for update');
      return res.status(404).json({ error: 'Note not found' });
    }
    console.log('Note updated:', note._id);
    res.json(note);
  } catch (err) {
    console.error('PUT /api/notes error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Delete a note
router.delete('/notes/:id', ensureAuthenticated, async (req, res) => {
  try {
    console.log('DELETE /api/notes/:id - ID:', req.params.id, 'User:', req.user?._id);
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id.toString() });
    if (!note) {
      console.log('Note not found for deletion');
      return res.status(404).json({ error: 'Note not found' });
    }
    console.log('Note deleted:', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/notes error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ========== ADMIN ENDPOINTS ==========

// Get all users (admin only)
router.get('/admin/users', ensureAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'username _id').sort({ _id: 1 });
    res.json(users);
  } catch (err) {
    console.error('GET /api/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user (admin only)
router.put('/admin/users/:id', ensureAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.username === 'lezama24') {
      return res.status(403).json({ error: 'Cannot modify admin account' });
    }

    // Update username if provided and unique
    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      user.username = username;
    }

    // Update password if provided
    if (password) {
      const bcrypt = require('bcrypt');
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();
    console.log(`✓ User updated: ${user.username}`);
    res.json({ success: true, user: { _id: user._id, username: user.username } });
  } catch (err) {
    console.error('PUT /api/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/admin/users/:id', ensureAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.username === 'lezama24') {
      return res.status(403).json({ error: 'Cannot delete admin account' });
    }

    // Delete user and all their notes
    await User.findByIdAndDelete(userId);
    await Note.deleteMany({ userId: userId.toString() });

    console.log(`✓ User deleted: ${user.username}`);
    res.json({ success: true, message: `User ${user.username} deleted` });
  } catch (err) {
    console.error('DELETE /api/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
