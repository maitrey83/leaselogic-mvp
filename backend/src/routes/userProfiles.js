const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { 
  getProfile, 
  updateSubscription, 
  checkLimit, 
  incrementUsage,
  getUsageStats 
} = require('../api/userProfiles');

// GET /api/profiles/me - Get current user's profile
router.get('/me', authenticateUser, getProfile);

// PUT /api/profiles/subscription - Update subscription (Testing only - Phase 4: Replace with Stripe webhooks)
router.put('/subscription', authenticateUser, updateSubscription);

// GET /api/profiles/check-limit - Check if under usage limit
router.get('/check-limit', authenticateUser, checkLimit);

// POST /api/profiles/increment-usage - Increment usage counter
router.post('/increment-usage', authenticateUser, incrementUsage);

// GET /api/profiles/usage - Get usage statistics
router.get('/usage', authenticateUser, getUsageStats);

module.exports = router;
