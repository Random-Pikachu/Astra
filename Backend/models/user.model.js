const mongoose = require('mongoose');
const { generateRandomCode } = require('../utils/randomCode');

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userCode: {
    type: String,
    required: true,
    unique: true,
    default: () =>
      generateRandomCode({
        prefix: 'user-'
      })
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
