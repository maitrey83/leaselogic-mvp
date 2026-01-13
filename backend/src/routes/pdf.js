const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// Generate PDF from form data
router.post('/generate', pdfController.generatePDF);

// Preview PDF (with watermark)
router.post('/preview', pdfController.generatePreviewPDF);

module.exports = router;
