#!/usr/bin/env node

/**
 * Integration Tests: Data Requests API Endpoints
 * Tests REST API for GDPR data requests
 * Task: 2.10 Subtask 2.10.10
 */

require('dotenv').config();
const { supabaseAdmin } = require('../../src/config/supabase');

const API_BASE = 'http://127.0.0.1:5001';

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
let accessToken = null;
let exportRequestId = null;
let deleteRequestId = null;

async function runTests() {
  console.log('\n🧪 Testing Data Requests API Endpoints\n');

  try {
    // ========================================
    // Setup: Create test user and get token
    // ========================================
    log.info('Setup: Creating test user and getting auth token...');

    const testEmail = `api-test-${Date.now()}@leaselogic.test`;
    const testPassword = 'TestPassword123!';

    // Create user via Supabase Admin
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: 'API Test User' }
    });

    if (authError) throw new Error(`Failed to create test user: ${authError.message}`);
    testUserId = authUser.user.id;
    log.success(`Test user created: ${testUserId}`);

    // Get access token by signing in
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) throw new Error(`Failed to sign in: ${signInError.message}`);
    accessToken = signInData.session.access_token;
    log.success('Got access token');

    // Wait for triggers
    await new Promise(resolve => setTimeout(resolve, 500));

    // ========================================
    // Test 1: POST /api/data-requests (export)
    // ========================================
    log.test('Test 1: POST /api/data-requests (export) - success');

    const exportRes = await fetch(`${API_BASE}/api/data-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ request_type: 'export' })
    });

    if (exportRes.ok) {
      const exportData = await exportRes.json();
      exportRequestId = exportData.id;
      if (exportData.request_type === 'export' && exportData.status === 'pending') {
        log.success(`Export request created: ${exportRequestId}`);
      } else {
        log.error('Export request has wrong values');
      }
    } else {
      const errorData = await exportRes.json();
      log.error(`Export request failed: ${errorData.error}`);
    }

    // ========================================
    // Test 2: POST /api/data-requests (delete)
    // ========================================
    log.test('Test 2: POST /api/data-requests (delete) - success');

    const deleteRes = await fetch(`${API_BASE}/api/data-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ request_type: 'delete' })
    });

    if (deleteRes.ok) {
      const deleteData = await deleteRes.json();
      deleteRequestId = deleteData.id;
      if (deleteData.request_type === 'delete' && deleteData.status === 'pending') {
        log.success(`Delete request created: ${deleteRequestId}`);
      } else {
        log.error('Delete request has wrong values');
      }
    } else {
      const errorData = await deleteRes.json();
      log.error(`Delete request failed: ${errorData.error}`);
    }

    // ========================================
    // Test 3: GET /api/data-requests/:id
    // ========================================
    log.test('Test 3: GET /api/data-requests/:id - success');

    const getRes = await fetch(`${API_BASE}/api/data-requests/${exportRequestId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (getRes.ok) {
      const getData = await getRes.json();
      if (getData.id === exportRequestId && getData.request_type === 'export') {
        log.success(`Got request: ${getData.id} (${getData.status})`);
      } else {
        log.error('Got wrong request data');
      }
    } else {
      log.error('Failed to get request');
    }

    // ========================================
    // Test 4: GET /api/data-requests (list)
    // ========================================
    log.test('Test 4: GET /api/data-requests - list all requests');

    const listRes = await fetch(`${API_BASE}/api/data-requests`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      if (Array.isArray(listData) && listData.length >= 2) {
        log.success(`Listed ${listData.length} request(s)`);
      } else {
        log.error(`Expected at least 2 requests, got ${listData?.length || 0}`);
      }
    } else {
      log.error('Failed to list requests');
    }

    // ========================================
    // Test 5: POST without auth - 401 error
    // ========================================
    log.test('Test 5: POST without auth - should return 401');

    const noAuthRes = await fetch(`${API_BASE}/api/data-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_type: 'export' })
    });

    if (noAuthRes.status === 401) {
      log.success('Correctly returned 401 for unauthenticated request');
    } else {
      log.error(`Expected 401, got ${noAuthRes.status}`);
    }

    // ========================================
    // Test 6: Invalid request_type - 400 error
    // ========================================
    log.test('Test 6: Invalid request_type - should return 400');

    const invalidRes = await fetch(`${API_BASE}/api/data-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ request_type: 'invalid' })
    });

    if (invalidRes.status === 400) {
      log.success('Correctly returned 400 for invalid request_type');
    } else {
      log.error(`Expected 400, got ${invalidRes.status}`);
    }

    // ========================================
    // Test 7: GET non-existent request - 404
    // ========================================
    log.test('Test 7: GET non-existent request - should return 404');

    const notFoundRes = await fetch(`${API_BASE}/api/data-requests/00000000-0000-0000-0000-000000000000`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (notFoundRes.status === 404) {
      log.success('Correctly returned 404 for non-existent request');
    } else {
      log.error(`Expected 404, got ${notFoundRes.status}`);
    }

    // ========================================
    // Test 8: POST process export request
    // ========================================
    log.test('Test 8: POST /api/data-requests/:id/process (export)');

    const processExportRes = await fetch(`${API_BASE}/api/data-requests/${exportRequestId}/process`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (processExportRes.ok) {
      const processData = await processExportRes.json();
      if (processData.message === 'Export completed' && processData.data) {
        log.success('Export processed successfully');
        log.info(`  - User data included: ${processData.data.user ? 'yes' : 'no'}`);
      } else {
        log.error('Export process returned unexpected data');
      }
    } else {
      const errorData = await processExportRes.json();
      log.error(`Export process failed: ${errorData.error}`);
    }

    // ========================================
    // Test 9: Verify export request is now completed
    // ========================================
    log.test('Test 9: Verify export request status is "completed"');

    const verifyRes = await fetch(`${API_BASE}/api/data-requests/${exportRequestId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (verifyRes.ok) {
      const verifyData = await verifyRes.json();
      if (verifyData.status === 'completed') {
        log.success(`Request status: ${verifyData.status}`);
      } else {
        log.error(`Expected "completed", got "${verifyData.status}"`);
      }
    } else {
      log.error('Failed to verify request status');
    }

    // ========================================
    // Test 10: Cannot process already completed request
    // ========================================
    log.test('Test 10: Cannot process already completed request - should return 400');

    const reprocessRes = await fetch(`${API_BASE}/api/data-requests/${exportRequestId}/process`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (reprocessRes.status === 400) {
      log.success('Correctly returned 400 for already processed request');
    } else {
      log.error(`Expected 400, got ${reprocessRes.status}`);
    }

    console.log('\n✅ All API tests completed!\n');

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
        log.info(`Cleanup: ${cleanupError.message}`);
      }
    }
  }
}

// Check if backend is running
fetch(`${API_BASE}/api/health`)
  .then(res => {
    if (res.ok) {
      log.success('Backend is running');
      runTests();
    } else {
      throw new Error('Backend returned non-OK status');
    }
  })
  .catch(() => {
    log.error(`Backend is not running at ${API_BASE}. Start it with: npm start`);
    process.exit(1);
  });
