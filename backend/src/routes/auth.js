const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile
} = require('../api/auth');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Logout user
router.post('/logout', logout);

// Get current user
router.get('/me', getCurrentUser);

// Update user profile
router.put('/profile', updateProfile);

module.exports = router;
