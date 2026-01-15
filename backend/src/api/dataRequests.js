/**
 * Data Requests API
 *
 * GDPR Compliance:
 * - Article 15: Right of Access (export)
 * - Article 17: Right to Erasure (delete)
 * - Article 20: Right to Data Portability (export)
 *
 * ENDPOINTS:
 * - POST /api/data-requests - Create new export/delete request
 * - GET /api/data-requests - List user's requests
 * - GET /api/data-requests/:id - Get specific request status
 *
 * SECURITY:
 * - All endpoints require authentication
 * - RLS ensures users can only access their own requests
 * - Export/delete functions use SECURITY DEFINER
 */

const { supabaseAdmin } = require('../config/supabase');

/**
 * Create a new data request (export or delete)
 *
 * @param {string} userId - User UUID
 * @param {string} requestType - 'export' or 'delete'
 * @returns {Promise<Object>} Created request object
 */
async function createRequest(userId, requestType) {
  // Validate request type
  if (!['export', 'delete'].includes(requestType)) {
    throw new Error('Invalid request_type. Must be "export" or "delete"');
  }

  const { data, error } = await supabaseAdmin
    .from('data_requests')
    .insert({
      user_id: userId,
      request_type: requestType
    })
    .select()
    .single();

  if (error) {
    console.error('Create data request error:', error);
    throw error;
  }

  return data;
}

/**
 * Get a specific data request by ID
 *
 * @param {string} requestId - Request UUID
 * @param {string} userId - User UUID (for authorization)
 * @returns {Promise<Object|null>} Request object or null if not found
 */
async function getRequest(requestId, userId) {
  const { data, error } = await supabaseAdmin
    .from('data_requests')
    .select('*')
    .eq('id', requestId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Get data request error:', error);
    throw error;
  }

  return data;
}

/**
 * List all data requests for a user
 *
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of request objects
 */
async function listRequests(userId) {
  const { data, error } = await supabaseAdmin
    .from('data_requests')
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('List data requests error:', error);
    throw error;
  }

  return data || [];
}

/**
 * Process an export request
 * Calls the export_user_data() database function
 *
 * @param {string} userId - User UUID
 * @param {string} requestId - Request UUID
 * @returns {Promise<Object>} Export data as JSONB
 */
async function processExport(userId, requestId) {
  const { data, error } = await supabaseAdmin
    .rpc('export_user_data', {
      p_user_id: userId,
      p_request_id: requestId
    });

  if (error) {
    console.error('Export user data error:', error);
    throw error;
  }

  return data;
}

/**
 * Process a delete request
 * Calls the delete_user_data() database function
 *
 * @param {string} userId - User UUID
 * @param {string} requestId - Request UUID
 * @returns {Promise<Object>} Delete result summary
 */
async function processDelete(userId, requestId) {
  const { data, error } = await supabaseAdmin
    .rpc('delete_user_data', {
      p_user_id: userId,
      p_request_id: requestId
    });

  if (error) {
    console.error('Delete user data error:', error);
    throw error;
  }

  return data;
}

module.exports = {
  createRequest,
  getRequest,
  listRequests,
  processExport,
  processDelete
};
