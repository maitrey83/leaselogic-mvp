/**
 * Sessions API
 * 
 * IMPORTANT: RLS (Row Level Security) Issue & Solution
 * 
 * PROBLEM:
 * The Supabase JavaScript client does NOT bypass RLS even when using the service_role key.
 * Direct INSERT operations fail with: "new row violates row-level security policy"
 * 
 * WHY IT HAPPENS:
 * - The JS client respects RLS policies regardless of the key used
 * - Service role key doesn't automatically grant bypass privileges in JS client
 * - RLS policies need explicit PERMISSIVE rules, but even those don't work reliably
 * 
 * SOLUTION:
 * Use database functions with SECURITY DEFINER to bypass RLS.
 * The function runs with the privileges of the function owner (postgres), not the caller.
 * 
 * DATABASE FUNCTION CREATED:
 * - create_session() - Inserts session with SECURITY DEFINER (bypasses RLS)
 * 
 * See migration: 007_create_sessions_table.sql
 * Additional function added via Supabase SQL Editor (not in migration file)
 * 
 * ALTERNATIVE APPROACHES TRIED (didn't work):
 * 1. Direct INSERT with supabaseAdmin - blocked by RLS
 * 2. RLS policy with "TO service_role" - still blocked
 * 3. RLS policy with "AS PERMISSIVE" - still blocked
 * 4. Disabling RLS completely - works but insecure
 * 
 * CURRENT APPROACH (working):
 * Use .rpc() to call database function with SECURITY DEFINER
 */

const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Create new session
 * 
 * Uses database function to bypass RLS.
 * Function: create_session(p_user_id, p_token, p_ip_address, p_user_agent, p_expires_at)
 * 
 * @param {string} userId - User UUID
 * @param {string} token - JWT access token
 * @param {string} ipAddress - Client IP address
 * @param {string} userAgent - Client user agent
 * @param {string} expiresAt - ISO timestamp when session expires
 * @returns {Promise<Object>} Created session object
 */
async function createSession(userId, token, ipAddress, userAgent, expiresAt) {
  // Use database function to bypass RLS
  const { data, error } = await supabaseAdmin
    .rpc('create_session', {
      p_user_id: userId,
      p_token: token,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_expires_at: expiresAt
    });

  if (error) {
    console.error('Session insert error:', error);
    throw error;
  }
  return data;
}

/**
 * Get active sessions for user
 */
async function getActiveSessions(userId) {
  const { data, error } = await supabaseAdmin
    .rpc('get_active_sessions', { p_user_id: userId });

  if (error) throw error;
  return data;
}

/**
 * Update session activity
 */
async function updateActivity(sessionId) {
  const { error } = await supabaseAdmin
    .rpc('update_session_activity', { p_session_id: sessionId });

  if (error) throw error;
}

/**
 * Delete session (logout)
 */
async function deleteSession(sessionId) {
  const { error } = await supabaseAdmin
    .from('sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
}

/**
 * Delete all sessions for user
 */
async function deleteUserSessions(userId) {
  const { error } = await supabaseAdmin
    .from('sessions')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Cleanup expired sessions (manual trigger)
 */
async function cleanupExpired() {
  const { data, error } = await supabaseAdmin
    .rpc('cleanup_expired_sessions');

  if (error) throw error;
  return data; // Returns count of deleted sessions
}

/**
 * Get session by token
 */
async function getSessionByToken(token) {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

module.exports = {
  createSession,
  getActiveSessions,
  updateActivity,
  deleteSession,
  deleteUserSessions,
  cleanupExpired,
  getSessionByToken
};
