#!/usr/bin/env node

/**
 * Sessions Table Integration Tests
 * Run: node tests/integration/sessions.test.js
 */

require('dotenv').config();
const { supabaseAdmin } = require('../../src/config/supabase');
const sessions = require('../../src/api/sessions');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}ℹ️  ${msg}${colors.reset}`)
};

async function runTests() {
  console.log('\n🧪 Testing Sessions Table\n');

  let testUserId;
  let testSessionId;
  const testToken = 'test-token-' + Date.now();

  try {
    // Test 1: Create test user
    log.info('Test 1: Creating test user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `session-test-${Date.now()}@test.com`,
      password: 'testpass123',
      email_confirm: true
    });

    if (authError) throw authError;
    testUserId = authData.user.id;
    log.success(`User created: ${testUserId}`);

    // Test 2: Create session
    log.info('Test 2: Creating session...');
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    const session = await sessions.createSession(
      testUserId,
      testToken,
      '127.0.0.1',
      'Test User Agent',
      expiresAt
    );
    testSessionId = session.id;
    log.success(`Session created: ${testSessionId}`);

    // Test 3: Get session by token
    log.info('Test 3: Getting session by token...');
    const foundSession = await sessions.getSessionByToken(testToken);
    if (!foundSession || foundSession.id !== testSessionId) {
      throw new Error('Session not found by token');
    }
    log.success('Session found by token');

    // Test 4: Get active sessions
    log.info('Test 4: Getting active sessions...');
    const activeSessions = await sessions.getActiveSessions(testUserId);
    if (activeSessions.length === 0) {
      throw new Error('No active sessions found');
    }
    log.success(`Active sessions: ${activeSessions.length}`);

    // Test 5: Update session activity
    log.info('Test 5: Updating session activity...');
    await sessions.updateActivity(testSessionId);
    log.success('Activity updated');

    // Test 6: Expired sessions not returned
    log.info('Test 6: Testing expired session filtering...');
    const expiredToken = 'expired-' + Date.now();
    const expiredAt = new Date(Date.now() - 3600000).toISOString();
    await sessions.createSession(testUserId, expiredToken, '127.0.0.1', 'Test', expiredAt);
    const expiredSession = await sessions.getSessionByToken(expiredToken);
    if (expiredSession) {
      throw new Error('Expired session was returned (should be null)');
    }
    log.success('Expired sessions correctly filtered');

    // Test 7: Cleanup expired sessions
    log.info('Test 7: Cleaning up expired sessions...');
    const deletedCount = await sessions.cleanupExpired();
    log.success(`Deleted ${deletedCount} expired session(s)`);

    // Test 8: Delete session
    log.info('Test 8: Deleting session...');
    await sessions.deleteSession(testSessionId);
    const deletedSession = await sessions.getSessionByToken(testToken);
    if (deletedSession) {
      throw new Error('Session still exists after deletion');
    }
    log.success('Session deleted successfully');

    // Cleanup
    log.info('Cleaning up test user...');
    await supabaseAdmin.from('sessions').delete().eq('user_id', testUserId);
    await supabaseAdmin.auth.admin.deleteUser(testUserId);
    log.success('Test user deleted');

    console.log('\n✅ All tests completed!\n');

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    
    // Cleanup on error
    if (testUserId) {
      try {
        await supabaseAdmin.from('sessions').delete().eq('user_id', testUserId);
        await supabaseAdmin.auth.admin.deleteUser(testUserId);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError.message);
      }
    }
    
    process.exit(1);
  }
}

runTests().catch(console.error);
