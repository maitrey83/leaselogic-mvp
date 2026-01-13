const express = require('express');
const router = express.Router();
const {
  getActiveDocument,
  getDocumentHistory,
  getAllActiveDocuments
} = require('../api/legalDocuments');

// Get all active legal documents
router.get('/active', getAllActiveDocuments);

// Get active version of specific document type
router.get('/:documentType/active', getActiveDocument);

// Get history of specific document type
router.get('/:documentType/history', getDocumentHistory);

module.exports = router;
