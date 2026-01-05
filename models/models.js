const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  id: String,
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true }
});

// Note Schema
const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Note = mongoose.model('Note', noteSchema);

module.exports = {
  User,
  Note
};
