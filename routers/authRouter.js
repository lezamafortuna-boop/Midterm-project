const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const path = require('path');
const { User } = require('../models/models');

const router = express.Router();

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'loggin.html'));
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login?error=1'
}));

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Missing username or password');
    
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.redirect('/auth/login?error=exists');
    
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ id: Date.now().toString(), username, passwordHash });
    res.redirect('/auth/login?registered=1');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Registration failed');
  }
});

router.get('/logout', (req, res, next) => {
  req.logout(function(err){ if(err) return next(err); res.redirect('/auth/login'); });
});

module.exports = router;
