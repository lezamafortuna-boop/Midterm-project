const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const path = require('path');
const { User } = require('../models/models');

const router = express.Router();
const MAX_USERS = 4; // Limit to 4 users total

// Initialize admin user on startup
async function initializeAdmin() {
  try {
    const adminExists = await User.findOne({ username: 'lezama24' });
    
    if (!adminExists) {
      const passwordHash = await bcrypt.hash('Lezama2402!', 10);
      await User.create({
        id: 'admin-001',
        username: 'lezama24',
        passwordHash: passwordHash
      });
      console.log('✓ Admin user created: lezama24');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Show all registered users
    const users = await User.find({}, 'username');
    console.log(`✓ Total registered users: ${users.length}`);
  } catch (err) {
    console.error('✗ Error initializing admin:', err.message);
  }
}

// Call admin initialization
initializeAdmin();

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'loggin.html'));
});

// Get all registered users (usernames only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username').sort({ _id: 1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login?loginError=1'
}));

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    // Check user limit
    const userCount = await User.countDocuments();
    if (userCount >= MAX_USERS) {
      return res.status(400).json({ error: `Maximum ${MAX_USERS} users allowed. Cannot register more users.` });
    }
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ id: Date.now().toString(), username, passwordHash });
    
    console.log(`✓ New user registered: ${username}`);
    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get all users (admin only)
router.get('/admin/users', (req, res, next) => {
  if(req.isAuthenticated() && req.user.username === 'lezama24') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}, async (req, res) => {
  try {
    const users = await User.find({}, 'username _id').sort({ _id: 1 });
    res.json(users);
  } catch (err) {
    console.error('GET /auth/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user (admin only)
router.put('/admin/users/:id', (req, res, next) => {
  if(req.isAuthenticated() && req.user.username === 'lezama24') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}, async (req, res) => {
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
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();
    console.log(`✓ User updated: ${user.username}`);
    res.json({ success: true, user: { _id: user._id, username: user.username } });
  } catch (err) {
    console.error('PUT /auth/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/admin/users/:id', (req, res, next) => {
  if(req.isAuthenticated() && req.user.username === 'lezama24') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}, async (req, res) => {
  try {
    const userId = req.params.id;
    const { Note } = require('../models/models');
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
    console.error('DELETE /auth/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.get('/logout', (req, res, next) => {
  req.logout(function(err){ if(err) return next(err); res.redirect('/auth/login'); });
});

module.exports = router;
