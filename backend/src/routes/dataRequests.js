/**
 * Data Requests Routes
 *
 * GDPR-compliant data export and deletion endpoints
 *
 * ENDPOINTS:
 * - POST /api/data-requests - Create new request (export or delete)
 * - GET /api/data-requests - List user's requests
 * - GET /api/data-requests/:id - Get specific request status
 * - POST /api/data-requests/:id/process - Process a pending request
 */

const express = require('express');
const router = express.Router();
const dataRequests = require('../api/dataRequests');
const { authenticateUser } = require('../middleware/auth');

/**
 * POST /api/data-requests
 * Create a new data request (export or delete)
 *
 * Body: { request_type: 'export' | 'delete' }
 * Returns: { id, request_type, status, requested_at }
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { request_type } = req.body;

    if (!request_type) {
      return res.status(400).json({ error: 'request_type is required' });
    }

    if (!['export', 'delete'].includes(request_type)) {
      return res.status(400).json({
        error: 'Invalid request_type. Must be "export" or "delete"'
      });
    }

    const request = await dataRequests.createRequest(req.user.id, request_type);

    res.status(201).json({
      id: request.id,
      request_type: request.request_type,
      status: request.status,
      requested_at: request.requested_at
    });
  } catch (error) {
    console.error('Create data request error:', error);
    res.status(500).json({ error: 'Failed to create data request' });
  }
});

/**
 * GET /api/data-requests
 * List all data requests for the authenticated user
 *
 * Returns: Array of { id, request_type, status, requested_at, completed_at }
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const requests = await dataRequests.listRequests(req.user.id);

    res.json(requests.map(r => ({
      id: r.id,
      request_type: r.request_type,
      status: r.status,
      requested_at: r.requested_at,
      completed_at: r.completed_at
    })));
  } catch (error) {
    console.error('List data requests error:', error);
    res.status(500).json({ error: 'Failed to list data requests' });
  }
});

/**
 * GET /api/data-requests/:id
 * Get a specific data request by ID
 *
 * Returns: { id, request_type, status, requested_at, completed_at, export_url, notes }
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const request = await dataRequests.getRequest(req.params.id, req.user.id);

    if (!request) {
      return res.status(404).json({ error: 'Data request not found' });
    }

    res.json({
      id: request.id,
      request_type: request.request_type,
      status: request.status,
      requested_at: request.requested_at,
      completed_at: request.completed_at,
      export_url: request.export_url,
      notes: request.notes
    });
  } catch (error) {
    console.error('Get data request error:', error);
    res.status(500).json({ error: 'Failed to get data request' });
  }
});

/**
 * POST /api/data-requests/:id/process
 * Process a pending request (export or delete)
 *
 * This triggers the actual export or delete operation.
 * For export: Returns the exported data as JSON
 * For delete: Returns a summary of deleted/anonymized data
 */
router.post('/:id/process', authenticateUser, async (req, res) => {
  try {
    // Get the request first
    const request = await dataRequests.getRequest(req.params.id, req.user.id);

    if (!request) {
      return res.status(404).json({ error: 'Data request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: `Request already ${request.status}. Cannot process again.`
      });
    }

    let result;

    if (request.request_type === 'export') {
      result = await dataRequests.processExport(req.user.id, request.id);
      res.json({
        message: 'Export completed',
        data: result
      });
    } else if (request.request_type === 'delete') {
      result = await dataRequests.processDelete(req.user.id, request.id);
      res.json({
        message: 'Delete completed',
        summary: result
      });
    }
  } catch (error) {
    console.error('Process data request error:', error);
    res.status(500).json({ error: 'Failed to process data request' });
  }
});

module.exports = router;
