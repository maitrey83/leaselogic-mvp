const express = require('express');
const router = express.Router();
const sessions = require('../api/sessions');
const { authenticateUser } = require('../middleware/auth');

/**
 * GET /api/sessions
 * Get active sessions for current user
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const activeSessions = await sessions.getActiveSessions(req.user.id);
    res.json({ sessions: activeSessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete specific session (logout from device)
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    await sessions.deleteSession(req.params.id);
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

/**
 * DELETE /api/sessions
 * Delete all sessions for current user (logout from all devices)
 */
router.delete('/', authenticateUser, async (req, res) => {
  try {
    await sessions.deleteUserSessions(req.user.id);
    res.json({ message: 'All sessions deleted' });
  } catch (error) {
    console.error('Delete all sessions error:', error);
    res.status(500).json({ error: 'Failed to delete sessions' });
  }
});

/**
 * POST /api/sessions/cleanup
 * Manual cleanup of expired sessions (admin only)
 */
router.post('/cleanup', async (req, res) => {
  try {
    const deletedCount = await sessions.cleanupExpired();
    res.json({ message: 'Cleanup complete', deleted: deletedCount });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup sessions' });
  }
});

module.exports = router;
