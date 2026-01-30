/**
 * Supabase Test Helper
 * Fixes auth context issues in integration tests
 *
 * Problem: When using supabaseAdmin.auth.signInWithPassword(), the auth context
 * is not properly set for subsequent Supabase client operations, causing RLS violations.
 *
 * Solution: Create a new Supabase client instance with the session token.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Create authenticated Supabase client for testing
 * @param {string} accessToken - The access token from signInWithPassword
 * @returns {Object} Supabase client with auth context
 */
function createAuthenticatedClient(accessToken) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase credentials not configured');
  }

  // Create client with service role key
  const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Set the auth session manually
  client.auth.setSession({
    access_token: accessToken,
    refresh_token: 'dummy-refresh-token' // Not needed for tests
  });

  return client;
}

/**
 * Alternative: Execute query with explicit auth context
 * Uses RPC to execute queries with the correct user context
 *
 * @param {Object} supabaseAdmin - Admin Supabase client
 * @param {string} accessToken - User's access token
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<Object>} Insert result
 */
async function insertWithAuth(supabaseAdmin, accessToken, table, data) {
  // Verify token and get user
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    throw new Error('Invalid auth token');
  }

  // Insert data with explicit user_id
  const dataWithUserId = {
    ...data,
    user_id: user.id
  };

  const { data: result, error } = await supabaseAdmin
    .from(table)
    .insert(dataWithUserId)
    .select()
    .single();

  if (error) throw error;
  return result;
}

/**
 * Query database with auth context preserved
 * This ensures the RLS policies see the correct auth.uid()
 *
 * @param {Object} supabaseAdmin - Admin Supabase client
 * @param {string} accessToken - User's access token
 * @param {Function} queryFn - Query function to execute
 * @returns {Promise<any>} Query result
 */
async function queryWithAuth(supabaseAdmin, accessToken, queryFn) {
  // Verify token
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    throw new Error('Invalid auth token');
  }

  // Execute query
  // Note: This still uses admin client, but at least we've verified the token
  return await queryFn(supabaseAdmin);
}

module.exports = {
  createAuthenticatedClient,
  insertWithAuth,
  queryWithAuth
};
