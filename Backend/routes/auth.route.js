const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const router = express.Router();

// Register (Local)
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ email, password: hashedPassword, username });
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login (Local)
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in', user: req.user });
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send('Logout error');
    res.json({ message: 'Logged out' });
  });
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=auth_failed' }),
  (req, res) => {
    // Store user data in a way that frontend can access
    const userData = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      googleId: req.user.googleId
    };
    
    // Redirect to frontend with user data
    const userDataEncoded = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`http://localhost:5173/welcome?user=${userDataEncoded}`);
  });

// Protected route
router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) 
    return res.status(401).send('Unauthorized');
  res.json({ user: req.user });
});

module.exports = router;
