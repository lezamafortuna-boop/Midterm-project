const express = require('express');
const { Note, User } = require('../models/models');

const router = express.Router();

// Middleware: Ensure authenticated
function ensureAuthenticated(req, res, next) {
  if (req.oidc.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// Middleware: Ensure admin
function ensureAdmin(req, res, next) {
  if (req.oidc.isAuthenticated() && req.oidc.user.email === process.env.ADMIN_EMAIL) {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}

// Helper: Get user's Auth0 ID
async function getUserAuth0Id(req) {
  const user = await User.findOne({ auth0Id: req.oidc.user.sub });
  return user ? user.auth0Id : req.oidc.user.sub;
}

// ========== NOTES CRUD OPERATIONS ==========

// Get all notes for authenticated user
router.get('/notes', ensureAuthenticated, async (req, res) => {
  try {
    const auth0Id = await getUserAuth0Id(req);
    console.log('GET /api/notes - User:', auth0Id);
    const notes = await Note.find({ userId: auth0Id }).sort({ createdAt: -1 });
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
    const auth0Id = await getUserAuth0Id(req);
    console.log('POST /api/notes - User:', auth0Id, 'Body:', req.body);
    const { title, content } = req.body;
    const note = new Note({ userId: auth0Id, title, content });
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
    const auth0Id = await getUserAuth0Id(req);
    console.log('PUT /api/notes/:id - ID:', req.params.id, 'User:', auth0Id);
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: auth0Id },
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
    const auth0Id = await getUserAuth0Id(req);
    console.log('DELETE /api/notes/:id - ID:', req.params.id, 'User:', auth0Id);
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: auth0Id });
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
    const users = await User.find({}, 'email name auth0Id createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('GET /api/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user (admin only)
router.put('/admin/users/:id', ensureAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Cannot modify admin account' });
    }

    // Update name if provided
    if (name) {
      user.name = name;
      await user.save();
    }

    console.log(`✓ User updated: ${user.email}`);
    res.json({ success: true, user: { _id: user._id, email: user.email, name: user.name } });
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

    if (user.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Cannot delete admin account' });
    }

    // Delete user and all their notes
    await User.findByIdAndDelete(userId);
    await Note.deleteMany({ userId: user.auth0Id });

    console.log(`✓ User deleted: ${user.email}`);
    res.json({ success: true, message: `User ${user.email} deleted` });
  } catch (err) {
    console.error('DELETE /api/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;