const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  createNotice,
  listNotices,
  getNotice,
  downloadNotice,
  deleteNotice
} = require('../api/notices');

// All routes require authentication
router.use(authenticateUser);

/**
 * Notice Routes for Task 3.6 - Phase 2
 *
 * Subtask 3.6.2: POST /api/notices - Create notice metadata
 * Subtask 3.6.3: GET /api/notices/:id/download - Download PDF (on-demand generation)
 * Subtask 3.6.7: GET /api/notices - List user's notices
 */

// POST /api/notices - Create notice metadata (NO PDF storage)
router.post('/', createNotice);

// GET /api/notices - List all notices for authenticated user
router.get('/', listNotices);

// GET /api/notices/:id - Get single notice metadata
router.get('/:id', getNotice);

// GET /api/notices/:id/download - Generate and download PDF on-demand
router.get('/:id/download', downloadNotice);

// DELETE /api/notices/:id - Delete notice
router.delete('/:id', deleteNotice);

module.exports = router;
