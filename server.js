const express = require('express');
const path = require('path');
const { auth } = require('express-openid-connect');
const mongoose = require('mongoose');
require('dotenv').config();

const { User, Note } = require('./models/models');
const authRouter = require('./routers/authRouter');
const takingRouter = require('./routers/takingRouter');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notetakingapp';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB connection error:', err.message));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Auth0 OpenID Connect middleware
app.use(auth({
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  secret: process.env.AUTH0_SECRET,
  routes: {
    login: false
  }
}));

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware to sync Auth0 users with MongoDB
app.use(async (req, res, next) => {
  if (req.oidc && req.oidc.isAuthenticated()) {
    try {
      const auth0Id = req.oidc.user.sub;
      const email = req.oidc.user.email;
      const name = req.oidc.user.name;

      // Upsert user in MongoDB
      await User.findOneAndUpdate(
        { auth0Id },
        { auth0Id, email, name },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Error syncing user:', err.message);
    }
  }
  next();
});

// Protect API routes
app.use('/api', requireAuth);

// Routers
app.use('/auth', authRouter);
app.use('/api', takingRouter);

// Root route - redirect to login if not authenticated, else show app
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`));
