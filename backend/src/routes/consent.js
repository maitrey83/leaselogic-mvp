const express = require('express');
const router = express.Router();
const { logConsent, getConsentHistory, getConsentStats } = require('../api/consent');
const { authenticateUser } = require('../middleware/auth');

// POST /api/consent/log - Log user consent
router.post('/log', logConsent);

// GET /api/consent/history/:userId - Get consent history (auth required)
router.get('/history/:userId', authenticateUser, getConsentHistory);

// GET /api/consent/stats - Get consent statistics (auth required)
router.get('/stats', authenticateUser, getConsentStats);

module.exports = router;
