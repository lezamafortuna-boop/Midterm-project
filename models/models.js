const mongoose = require('mongoose');

// User Schema - Auth0 based
const userSchema = new mongoose.Schema({
  auth0Id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  name: String,
  createdAt: { type: Date, default: Date.now }
});

// Note Schema
const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Auth0 ID
  title: { type: String, required: true },
  content: { type: String, required: true },
  color: { type: String, default: "#ffffff" }, // Note color
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Note = mongoose.model('Note', noteSchema);

module.exports = { User, Note };