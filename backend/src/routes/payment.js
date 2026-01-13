const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create payment intent
router.post('/create-payment-intent', paymentController.createPaymentIntent);

// Verify payment and generate final PDF
router.post('/verify-and-generate', paymentController.verifyPaymentAndGeneratePDF);

module.exports = router;
