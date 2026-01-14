const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { User, Note } = require('./models/models');
const authRouter = require('./routers/authRouter');
const takingRouter = require('./routers/takingRouter');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notetakingapp';

// Connect to MongoDB with better logging
mongoose.connect(MONGO_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB connection error:', err.message));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'replace-with-strong-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) return done(null, false);
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

// Routers
app.use('/auth', authRouter);
app.use('/api', takingRouter);

// redirect root to login if not authenticated, else show notes app or admin panel
app.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    // Redirect admin to admin panel by default
    if(req.user.username === 'lezama24') {
      res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  } else {
    res.redirect('/auth/login');
  }
});

// Route for admin to access notes app
app.get('/notes', (req, res) => {
  if(req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.redirect('/auth/login');
  }
});

// serve static assets (css/js for login allowed) - AFTER root route
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
