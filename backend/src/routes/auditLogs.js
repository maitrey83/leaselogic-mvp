const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { 
  getRecordHistory, 
  getUserActivity, 
  getTableChanges 
} = require('../api/auditLogs');

// GET /api/audit/:tableName/:recordId - Get record history
router.get('/:tableName/:recordId', authenticateUser, getRecordHistory);

// GET /api/audit/user/:userId - Get user activity
router.get('/user/:userId', authenticateUser, getUserActivity);

// GET /api/audit/table/:tableName - Get table changes (admin only for now)
router.get('/table/:tableName', authenticateUser, getTableChanges);

module.exports = router;
