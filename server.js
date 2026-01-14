const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { User, Note } = require('./models/models');
const authRouter = require('./routers/authRouter');

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

function ensureAuthenticated(req, res, next){
  const isAuth = req.isAuthenticated();
  console.log(`[AUTH CHECK] ${req.method} ${req.path} - Authenticated: ${isAuth}, User: ${req.user?._id || 'none'}`);
  if(isAuth) return next();
  res.status(401).json({ error: 'Not authenticated' });
}

function ensureAdmin(req, res, next){
  if(req.isAuthenticated() && req.user.username === 'lezama24') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}

app.use('/auth', authRouter);

// redirect root to login if not authenticated, else show notes app or admin panel
app.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    // Redirect admin to admin panel
    if(req.user.username === 'lezama24') {
      res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  } else {
    res.redirect('/auth/login');
  }
});

// serve static assets (css/js for login allowed) - AFTER root route
app.use(express.static(path.join(__dirname, 'public')));

// Notes API endpoints
app.get('/api/notes', ensureAuthenticated, async (req, res) => {
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

app.post('/api/notes', ensureAuthenticated, async (req, res) => {
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

app.put('/api/notes/:id', ensureAuthenticated, async (req, res) => {
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

app.delete('/api/notes/:id', ensureAuthenticated, async (req, res) => {
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
app.get('/api/admin/users', ensureAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'username _id').sort({ _id: 1 });
    res.json(users);
  } catch (err) {
    console.error('GET /api/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user password (admin only)
app.put('/api/admin/users/:id', ensureAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const userId = req.params.id;

    // Prevent deleting admin account
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
    console.error('PUT /api/admin/users error:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', ensureAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admin account
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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
