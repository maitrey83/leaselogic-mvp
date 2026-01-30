#!/usr/bin/env node

/**
 * Notices Download Tracking Integration Tests
 * Subtask 3.6.9: Test download tracking (counter + timestamp)
 * Run: node tests/integration/notices-download-tracking.test.js
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
  info: (msg) => console.log(`${colors.yellow}ℹ️  ${msg}${colors.reset}`)
};

const BASE_URL = 'http://localhost:5001';

async function makeRequest(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/pdf')) {
    const arrayBuffer = await response.arrayBuffer();
    data = Buffer.from(arrayBuffer);
  } else {
    data = await response.json();
  }

  return { response, data };
}

async function runTests() {
  console.log(`\n${colors.blue}🧪 Testing Download Tracking${colors.reset}\n`);

  let testUserId;
  let testUserToken;
  let createdNoticeIds = [];

  try {
    // Setup: Create test user
    log.info('Setup: Creating test user...');
    const testEmail = `notices-tracking-${Date.now()}@test.com`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'testpass123',
      email_confirm: true
    });

    if (authError) throw authError;
    testUserId = authData.user.id;

    const { data: loginData } = await supabaseAdmin.auth.signInWithPassword({
      email: testEmail,
      password: 'testpass123'
    });
    testUserToken = loginData.session.access_token;
    log.success('User authenticated');

    // Extract user from token to ensure consistency
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(testUserToken);
    if (userError || !user) {
      throw new Error('Failed to get user from token');
    }
    testUserId = user.id; // Update testUserId from token
    log.success(`User verified from token: ${testUserId}`);

    // Create test notice
    log.info('Setup: Creating test notice...');
    const noticeData = {
      document_type: 'utah-3day-notice',
      notice_type: 'preview',
      form_data: {
        landlordName: 'Test Landlord',
        landlordAddress: '123 Main St',
        landlordCity: 'Salt Lake City',
        landlordState: 'UT',
        landlordZip: '84101',
        tenantName: 'Test Tenant',
        tenantAddress: '456 Rental Ave',
        tenantCity: 'Salt Lake City',
        tenantState: 'UT',
        tenantZip: '84102',
        rentAmount: '1500',
        amountDue: '4500',
        monthsOwed: 'October, November, December',
        dateServed: '2026-01-23',
        complianceDate: '2026-01-26'
      }
    };

    const { response: r0, data: d0 } = await makeRequest(
      'POST',
      '/api/notices',
      noticeData,
      testUserToken
    );

    if (r0.status !== 201 || !d0.success) {
      throw new Error('Failed to create notice');
    }
    const noticeId = d0.notice.id;
    createdNoticeIds.push(noticeId);
    log.success(`Notice created: ${noticeId}`);

    // Test 1: Verify initial download_count is 0
    log.info('Test 1: Verifying initial download_count...');
    if (d0.notice.download_count !== 0) {
      throw new Error(`Expected download_count=0, got ${d0.notice.download_count}`);
    }
    if (d0.notice.last_downloaded_at !== null) {
      throw new Error('Expected last_downloaded_at=null initially');
    }
    log.success('Initial values correct (count=0, timestamp=null)');

    // Test 2: Download PDF and verify counter increments
    log.info('Test 2: Downloading PDF (1st time)...');
    const downloadStart1 = new Date();

    const { response: r2 } = await makeRequest(
      'GET',
      `/api/notices/${noticeId}/download`,
      null,
      testUserToken
    );

    if (r2.status !== 200) {
      throw new Error('Download failed');
    }

    // Small delay to ensure timestamp is recorded
    await new Promise(resolve => setTimeout(resolve, 500));

    // Fetch notice to check tracking
    const { response: r2b, data: d2b } = await makeRequest(
      'GET',
      `/api/notices/${noticeId}`,
      null,
      testUserToken
    );

    if (d2b.notice.download_count !== 1) {
      throw new Error(`Expected download_count=1, got ${d2b.notice.download_count}`);
    }
    if (!d2b.notice.last_downloaded_at) {
      throw new Error('last_downloaded_at should be set after download');
    }
    log.success('Counter incremented to 1, timestamp set');

    // Test 3: Verify timestamp is recent
    log.info('Test 3: Verifying timestamp accuracy...');
    const lastDownloadTime = new Date(d2b.notice.last_downloaded_at);
    const timeDiff = Math.abs(lastDownloadTime - downloadStart1);

    if (timeDiff > 5000) { // Within 5 seconds
      throw new Error('Timestamp is not recent enough');
    }
    log.success('Timestamp is accurate');

    // Test 4: Download again and verify counter increments to 2
    log.info('Test 4: Downloading PDF (2nd time)...');
    const downloadStart2 = new Date();

    await makeRequest('GET', `/api/notices/${noticeId}/download`, null, testUserToken);
    await new Promise(resolve => setTimeout(resolve, 500));

    const { response: r4, data: d4 } = await makeRequest(
      'GET',
      `/api/notices/${noticeId}`,
      null,
      testUserToken
    );

    if (d4.notice.download_count !== 2) {
      throw new Error(`Expected download_count=2, got ${d4.notice.download_count}`);
    }
    log.success('Counter incremented to 2');

    // Test 5: Verify timestamp updates on each download
    log.info('Test 5: Verifying timestamp updates...');
    const lastDownloadTime2 = new Date(d4.notice.last_downloaded_at);
    if (lastDownloadTime2 <= lastDownloadTime) {
      throw new Error('Timestamp did not update on second download');
    }

    const timeDiff2 = Math.abs(lastDownloadTime2 - downloadStart2);
    if (timeDiff2 > 5000) {
      throw new Error('Second timestamp is not accurate');
    }
    log.success('Timestamp updates on each download');

    // Test 6: Download multiple times and verify accurate counting
    log.info('Test 6: Testing multiple downloads...');

    // Download 3 more times
    for (let i = 0; i < 3; i++) {
      await makeRequest('GET', `/api/notices/${noticeId}/download`, null, testUserToken);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const { response: r6, data: d6 } = await makeRequest(
      'GET',
      `/api/notices/${noticeId}`,
      null,
      testUserToken
    );

    if (d6.notice.download_count !== 5) {
      throw new Error(`Expected download_count=5, got ${d6.notice.download_count}`);
    }
    log.success('Multiple downloads tracked correctly (count=5)');

    // Test 7: Verify tracking persists in database
    log.info('Test 7: Verifying tracking persists in database...');
    const { data: dbNotice, error: dbError } = await supabaseAdmin
      .from('notices')
      .select('download_count, last_downloaded_at')
      .eq('id', noticeId)
      .single();

    if (dbError) throw dbError;
    if (dbNotice.download_count !== 5) {
      throw new Error('Database download_count does not match');
    }
    if (!dbNotice.last_downloaded_at) {
      throw new Error('Database last_downloaded_at is null');
    }
    log.success('Tracking persisted in database correctly');

    // Test 8: Create second notice and verify independent tracking
    log.info('Test 8: Testing independent tracking per notice...');
    const { response: r8a, data: d8a } = await makeRequest(
      'POST',
      '/api/notices',
      noticeData,
      testUserToken
    );
    const notice2Id = d8a.notice.id;
    createdNoticeIds.push(notice2Id);

    // Download second notice once
    await makeRequest('GET', `/api/notices/${notice2Id}/download`, null, testUserToken);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check both notices
    const { data: notice1 } = await makeRequest('GET', `/api/notices/${noticeId}`, null, testUserToken);
    const { data: notice2 } = await makeRequest('GET', `/api/notices/${notice2Id}`, null, testUserToken);

    if (notice1.notice.download_count !== 5) {
      throw new Error('First notice count changed unexpectedly');
    }
    if (notice2.notice.download_count !== 1) {
      throw new Error('Second notice count incorrect');
    }
    log.success('Each notice tracked independently');

    // Test 9: Verify tracking in list view
    log.info('Test 9: Verifying tracking visible in list...');
    const { response: r9, data: d9 } = await makeRequest(
      'GET',
      '/api/notices',
      null,
      testUserToken
    );

    const notice1InList = d9.notices.find(n => n.id === noticeId);
    const notice2InList = d9.notices.find(n => n.id === notice2Id);

    if (!notice1InList || notice1InList.download_count !== 5) {
      throw new Error('Tracking not visible in list for notice 1');
    }
    if (!notice2InList || notice2InList.download_count !== 1) {
      throw new Error('Tracking not visible in list for notice 2');
    }
    log.success('Tracking visible in list view');

    // Test 10: Verify tracking survives failed downloads
    log.info('Test 10: Testing tracking with failed download...');
    const currentCount = d6.notice.download_count;

    // Try to download with invalid token (should fail)
    await makeRequest('GET', `/api/notices/${noticeId}/download`, null, 'invalid-token');

    // Check count hasn't changed
    const { data: d10 } = await makeRequest('GET', `/api/notices/${noticeId}`, null, testUserToken);
    if (d10.notice.download_count !== currentCount) {
      throw new Error('Count changed on failed download');
    }
    log.success('Tracking unchanged on failed download');

    console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}✅ All tracking tests passed!${colors.reset}`);
    console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Cleanup
    log.info('Cleanup: Deleting test data...');

    for (const noticeId of createdNoticeIds) {
      await supabaseAdmin.from('notices').delete().eq('id', noticeId);
    }

    if (testUserId) {
      await supabaseAdmin.auth.admin.deleteUser(testUserId);
    }

    log.success('Cleanup complete');
  }
}

runTests().catch(console.error);
