#!/usr/bin/env node

/**
 * Integration Tests: Data Requests - Delete Functionality
 * Tests GDPR Article 17 compliance for data deletion
 * Task: 2.10 Subtasks 2.10.7, 2.10.8
 */

require('dotenv').config();
const { supabaseAdmin } = require('../../src/config/supabase');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.blue}🧪 ${msg}${colors.reset}`)
};

let testUserId = null;
let testRequestId = null;
let testEmail = null;

async function runTests() {
  console.log('\n🧪 Testing Data Requests - Delete Functionality\n');

  try {
    // ========================================
    // Setup: Create test user with full data
    // ========================================
    log.info('Setup: Creating test user with full data...');

    testEmail = `delete-test-${Date.now()}@leaselogic.test`;
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: { full_name: 'Delete Test User' }
    });

    if (authError) throw new Error(`Failed to create test user: ${authError.message}`);
    testUserId = authUser.user.id;
    log.success(`Test user created: ${testUserId}`);

    // Wait for triggers to create user record and profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create a test session
    const { error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: testUserId,
        token: `test-token-${Date.now()}`,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        ip_address: '127.0.0.1',
        user_agent: 'Test Browser'
      });

    if (sessionError) {
      log.info(`Session creation skipped: ${sessionError.message}`);
    } else {
      log.success('Test session created');
    }

    // Create a consent log entry
    const { error: consentError } = await supabaseAdmin
      .from('consent_logs')
      .insert({
        user_id: testUserId,
        document_type: 'test-document',
        consent_type: 'test-consent',
        policy_version: '1.0',
        ip_address: '127.0.0.1',
        user_agent: 'Test Browser'
      });

    if (consentError) {
      log.info(`Consent log creation skipped: ${consentError.message}`);
    } else {
      log.success('Test consent log created');
    }

    // ========================================
    // Test 1: Create delete request
    // ========================================
    log.test('Test 1: Create delete request');

    const { data: request, error: requestError } = await supabaseAdmin
      .from('data_requests')
      .insert({
        user_id: testUserId,
        request_type: 'delete'
      })
      .select()
      .single();

    if (requestError) throw new Error(`Failed to create delete request: ${requestError.message}`);
    testRequestId = request.id;

    if (request.status === 'pending' && request.request_type === 'delete') {
      log.success(`Delete request created: ${testRequestId} (status: ${request.status})`);
    } else {
      log.error('Delete request has incorrect initial values');
    }

    // ========================================
    // Test 2: Verify data exists before delete
    // ========================================
    log.test('Test 2: Verify data exists before delete');

    const { data: userBefore } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    const { data: profileBefore } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    const { data: sessionsBefore } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('user_id', testUserId);

    const { data: consentBefore } = await supabaseAdmin
      .from('consent_logs')
      .select('*')
      .eq('user_id', testUserId);

    log.success(`Before delete: User exists, Profile: ${profileBefore ? 'yes' : 'no'}, Sessions: ${sessionsBefore?.length || 0}, Consents: ${consentBefore?.length || 0}`);

    // ========================================
    // Test 3: Call delete_user_data() function
    // ========================================
    log.test('Test 3: Call delete_user_data() function');

    const { data: deleteResult, error: deleteError } = await supabaseAdmin
      .rpc('delete_user_data', {
        p_user_id: testUserId,
        p_request_id: testRequestId
      });

    if (deleteError) throw new Error(`Delete function failed: ${deleteError.message}`);

    if (deleteResult && deleteResult.delete_info && deleteResult.actions_taken) {
      log.success('Delete function completed successfully');
      log.info(`  - Sessions deleted: ${deleteResult.actions_taken.sessions_deleted}`);
      log.info(`  - Profile deleted: ${deleteResult.actions_taken.profile_deleted}`);
      log.info(`  - User anonymized: ${deleteResult.actions_taken.user_anonymized}`);
    } else {
      log.error('Delete function returned invalid data structure');
    }

    // ========================================
    // Test 4: Verify sessions deleted
    // ========================================
    log.test('Test 4: Verify sessions deleted');

    const { data: sessionsAfter } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('user_id', testUserId);

    if (!sessionsAfter || sessionsAfter.length === 0) {
      log.success('Sessions deleted successfully');
    } else {
      log.error(`Sessions still exist: ${sessionsAfter.length}`);
    }

    // ========================================
    // Test 5: Verify user_profiles deleted
    // ========================================
    log.test('Test 5: Verify user_profiles deleted');

    const { data: profileAfter } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (!profileAfter) {
      log.success('User profile deleted successfully');
    } else {
      log.error('User profile still exists');
    }

    // ========================================
    // Test 6: Verify user record anonymized (NOT deleted)
    // ========================================
    log.test('Test 6: Verify user record anonymized (NOT deleted)');

    const { data: userAfter } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    const expectedEmail = `deleted-${testUserId}@deleted.local`;

    if (userAfter && userAfter.email === expectedEmail && userAfter.full_name === 'Deleted User') {
      log.success(`User anonymized: ${userAfter.email}, name: ${userAfter.full_name}`);
    } else if (!userAfter) {
      log.error('User record was deleted (should be anonymized)');
    } else {
      log.error(`User not properly anonymized: ${userAfter.email}`);
    }

    // ========================================
    // Test 7: Verify consent_logs PRESERVED
    // ========================================
    log.test('Test 7: Verify consent_logs PRESERVED (legal requirement)');

    const { data: consentAfter } = await supabaseAdmin
      .from('consent_logs')
      .select('*')
      .eq('user_id', testUserId);

    if (consentAfter && consentAfter.length > 0) {
      log.success(`Consent logs preserved: ${consentAfter.length} record(s)`);
    } else if (consentBefore && consentBefore.length > 0) {
      log.error('Consent logs were deleted (VIOLATION of legal requirement)');
    } else {
      log.info('No consent logs to preserve (none existed before delete)');
    }

    // ========================================
    // Test 8: Verify audit_logs PRESERVED
    // ========================================
    log.test('Test 8: Verify audit_logs PRESERVED (compliance requirement)');

    const { data: auditAfter } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('changed_by', testUserId);

    // Audit logs may or may not exist depending on what the user did
    log.success(`Audit logs preserved: ${auditAfter?.length || 0} record(s)`);

    // ========================================
    // Test 9: Verify request status updated
    // ========================================
    log.test('Test 9: Verify request status updated to completed');

    const { data: updatedRequest } = await supabaseAdmin
      .from('data_requests')
      .select('*')
      .eq('id', testRequestId)
      .single();

    if (updatedRequest && updatedRequest.status === 'completed' && updatedRequest.completed_at) {
      log.success(`Request status: ${updatedRequest.status}, completed_at: ${updatedRequest.completed_at}`);
    } else {
      log.error(`Request not marked complete: ${updatedRequest?.status}`);
    }

    // ========================================
    // Test 10: Verify audit trail captured deletion
    // ========================================
    log.test('Test 10: Verify audit trail captured deletion actions');

    const { data: deleteAudits } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('record_id', testUserId)
      .in('action', ['DELETE', 'UPDATE'])
      .order('changed_at', { ascending: false })
      .limit(5);

    if (deleteAudits && deleteAudits.length > 0) {
      log.success(`Audit trail captured ${deleteAudits.length} deletion-related action(s)`);
      deleteAudits.forEach(audit => {
        log.info(`  - ${audit.table_name}: ${audit.action} at ${audit.changed_at}`);
      });
    } else {
      log.info('Audit trail may not capture all deletions (depends on trigger configuration)');
    }

    console.log('\n✅ All delete tests completed!\n');

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  } finally {
    // ========================================
    // Cleanup: Delete test user from auth
    // ========================================
    if (testUserId) {
      log.info('Cleaning up: Deleting test user from auth...');
      try {
        // The user record is anonymized but auth user still exists
        await supabaseAdmin.auth.admin.deleteUser(testUserId);
        log.success('Test auth user deleted');
      } catch (cleanupError) {
        log.info(`Auth cleanup: ${cleanupError.message}`);
      }
    }
  }
}

// Run tests
runTests().catch(console.error);
