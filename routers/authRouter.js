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

module.exports = router;
