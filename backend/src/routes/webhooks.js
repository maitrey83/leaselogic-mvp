/**
 * Stripe Webhook Routes
 * Task 4.5 + 4.6
 *
 * CRITICAL: This route uses express.raw() for Stripe signature verification.
 * It must be mounted BEFORE express.json() in server.js.
 */

const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../api/webhooks');

// POST /api/webhooks/stripe — raw body required for signature verification
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

module.exports = router;
