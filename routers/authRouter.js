const express = require('express');
const { User } = require('../models/models');

const router = express.Router();

// Login route - redirects to Auth0
router.get('/login', (req, res) => {
  res.oidc.login({ returnTo: '/' });
});

// Logout route - redirects to Auth0 logout
router.get('/logout', (req, res) => {
  res.oidc.logout({ returnTo: '/' });
});

// Get current user profile
router.get('/profile', (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.oidc.user);
});

// Get all registered users (admin only)
router.get('/admin/users', async (req, res) => {
  if (!req.oidc.isAuthenticated() || req.oidc.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const users = await User.find({}, 'auth0Id email name createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all users (minimal info for dropdown)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'email name').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user (admin only) - Note: Auth0 user details are managed by Auth0
router.put('/admin/users/:id', async (req, res) => {
  if (!req.oidc.isAuthenticated() || req.oidc.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access required' });
  }

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
    console.error('PUT /auth/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/admin/users/:id', async (req, res) => {
  if (!req.oidc.isAuthenticated() || req.oidc.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const userId = req.params.id;
    const { Note } = require('../models/models');
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
    console.error('DELETE /auth/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
