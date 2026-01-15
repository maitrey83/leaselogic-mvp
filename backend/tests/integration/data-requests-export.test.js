#!/usr/bin/env node

/**
 * Integration Tests: Data Requests - Export Functionality
 * Tests GDPR Article 15/20 compliance for data export
 * Task: 2.10 Subtask 2.10.5
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

async function runTests() {
  console.log('\n🧪 Testing Data Requests - Export Functionality\n');

  try {
    // ========================================
    // Setup: Create test user
    // ========================================
    log.info('Setup: Creating test user...');

    const testEmail = `export-test-${Date.now()}@leaselogic.test`;
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: { full_name: 'Export Test User' }
    });

    if (authError) throw new Error(`Failed to create test user: ${authError.message}`);
    testUserId = authUser.user.id;
    log.success(`Test user created: ${testUserId}`);

    // Wait for triggers to create user record and profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // ========================================
    // Test 1: Create export request
    // ========================================
    log.test('Test 1: Create export request');

    const { data: request, error: requestError } = await supabaseAdmin
      .from('data_requests')
      .insert({
        user_id: testUserId,
        request_type: 'export'
      })
      .select()
      .single();

    if (requestError) throw new Error(`Failed to create export request: ${requestError.message}`);
    testRequestId = request.id;

    if (request.status === 'pending' && request.request_type === 'export') {
      log.success(`Export request created: ${testRequestId} (status: ${request.status})`);
    } else {
      log.error('Export request has incorrect initial values');
    }

    // ========================================
    // Test 2: Call export_user_data() function
    // ========================================
    log.test('Test 2: Call export_user_data() function');

    const { data: exportData, error: exportError } = await supabaseAdmin
      .rpc('export_user_data', {
        p_user_id: testUserId,
        p_request_id: testRequestId
      });

    if (exportError) throw new Error(`Export function failed: ${exportError.message}`);

    if (exportData && exportData.user && exportData.export_info) {
      log.success('Export function returned data successfully');
    } else {
      log.error('Export function returned invalid data structure');
    }

    // ========================================
    // Test 3: Verify export contains user data
    // ========================================
    log.test('Test 3: Verify export contains user data');

    const hasUser = exportData.user && exportData.user.id === testUserId;
    const hasProfile = exportData.profile !== null;
    const hasExportInfo = exportData.export_info && exportData.export_info.user_id === testUserId;
    const hasSessions = Array.isArray(exportData.sessions);
    const hasConsentLogs = Array.isArray(exportData.consent_logs);
    const hasAuditLogs = Array.isArray(exportData.audit_logs);
    const hasDataRequests = Array.isArray(exportData.data_requests);

    if (hasUser && hasProfile && hasExportInfo && hasSessions && hasConsentLogs && hasAuditLogs && hasDataRequests) {
      log.success('Export contains all required data sections');
      log.info(`  - User: ${exportData.user.email}`);
      log.info(`  - Profile: ${exportData.profile.subscription_plan || 'present'}`);
      log.info(`  - Sessions: ${exportData.sessions.length} record(s)`);
      log.info(`  - Consent logs: ${exportData.consent_logs.length} record(s)`);
      log.info(`  - Audit logs: ${exportData.audit_logs.length} record(s)`);
      log.info(`  - Data requests: ${exportData.data_requests.length} record(s)`);
    } else {
      log.error('Export missing required data sections');
      console.log('Missing:', { hasUser, hasProfile, hasExportInfo, hasSessions, hasConsentLogs, hasAuditLogs, hasDataRequests });
    }

    // ========================================
    // Test 4: Verify request status updated to completed
    // ========================================
    log.test('Test 4: Verify request status updated to completed');

    const { data: updatedRequest, error: fetchError } = await supabaseAdmin
      .from('data_requests')
      .select('*')
      .eq('id', testRequestId)
      .single();

    if (fetchError) throw new Error(`Failed to fetch request: ${fetchError.message}`);

    if (updatedRequest.status === 'completed' && updatedRequest.completed_at !== null) {
      log.success(`Request status: ${updatedRequest.status}, completed_at: ${updatedRequest.completed_at}`);
    } else {
      log.error(`Expected status 'completed', got: ${updatedRequest.status}`);
    }

    // ========================================
    // Test 5: Test export without request_id
    // ========================================
    log.test('Test 5: Test export without request_id (direct export)');

    const { data: directExport, error: directError } = await supabaseAdmin
      .rpc('export_user_data', {
        p_user_id: testUserId
      });

    if (directError) throw new Error(`Direct export failed: ${directError.message}`);

    if (directExport && directExport.user) {
      log.success('Direct export (no request_id) works correctly');
    } else {
      log.error('Direct export returned invalid data');
    }

    // ========================================
    // Test 6: Test export for non-existent user
    // ========================================
    log.test('Test 6: Test export for non-existent user');

    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    const { data: badExport, error: badError } = await supabaseAdmin
      .rpc('export_user_data', {
        p_user_id: fakeUserId
      });

    if (badError) {
      log.success(`Correctly rejected non-existent user: ${badError.message.substring(0, 50)}...`);
    } else {
      log.error('Should have rejected non-existent user');
    }

    // ========================================
    // Test 7: Verify GDPR fields in export
    // ========================================
    log.test('Test 7: Verify GDPR compliance fields');

    const gdprArticles = exportData.export_info.gdpr_articles;
    const hasArticle15 = gdprArticles && gdprArticles.some(a => a.includes('Article 15'));
    const hasArticle20 = gdprArticles && gdprArticles.some(a => a.includes('Article 20'));

    if (hasArticle15 && hasArticle20) {
      log.success('Export includes GDPR Article 15 & 20 references');
    } else {
      log.error('Missing GDPR article references');
    }

    console.log('\n✅ All export tests completed!\n');

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  } finally {
    // ========================================
    // Cleanup
    // ========================================
    if (testUserId) {
      log.info('Cleaning up test user...');
      try {
        await supabaseAdmin.auth.admin.deleteUser(testUserId);
        log.success('Test user deleted');
      } catch (cleanupError) {
        log.error(`Cleanup failed: ${cleanupError.message}`);
      }
    }
  }
}

// Run tests
runTests().catch(console.error);
