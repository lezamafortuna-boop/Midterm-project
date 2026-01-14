const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const path = require('path');
const { User } = require('../models/models');

const router = express.Router();
const MAX_USERS = 4; // Limit to 4 users total

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

router.get('/logout', (req, res, next) => {
  req.logout(function(err){ if(err) return next(err); res.redirect('/auth/login'); });
});

module.exports = router;
