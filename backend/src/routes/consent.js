const express = require('express');
const router = express.Router();
const { logConsent, getConsentHistory, getConsentStats } = require('../api/consent');

// POST /api/consent/log - Log user consent
router.post('/log', logConsent);

// GET /api/consent/history/:userId - Get consent history
router.get('/history/:userId', getConsentHistory);

// GET /api/consent/stats - Get consent statistics (admin)
router.get('/stats', getConsentStats);

module.exports = router;
