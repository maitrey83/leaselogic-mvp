#!/usr/bin/env node

/**
 * Notices History Integration Tests
 * Subtask 3.6.7: Test notice history query and filtering
 * Run: node tests/integration/notices-history.test.js
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
  const data = await response.json();
  return { response, data };
}

async function createNotice(noticeData, token) {
  const { response, data } = await makeRequest('POST', '/api/notices', noticeData, token);
  if (response.status !== 201) {
    throw new Error(`Failed to create notice: ${data.error}`);
  }
  return data.notice;
}

async function runTests() {
  console.log(`\n${colors.blue}🧪 Testing Notices History & Filtering${colors.reset}\n`);

  let testUserId;
  let testUserToken;
  let testPropertyId;
  let createdNoticeIds = [];

  try {
    // Setup: Create test user
    log.info('Setup: Creating test user...');
    const testEmail = `notices-history-${Date.now()}@test.com`;
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

    // Setup: Create test property
    const { data: property, error: propError } = await supabaseAdmin
      .from('properties')
      .insert({
        user_id: testUserId,
        property_name: 'Test Property',
        street_address: '123 Test St',
        city: 'Salt Lake City',
        state: 'UT',
        zip_code: '84101'
      })
      .select()
      .single();

    if (propError) throw new Error(`Failed to create property: ${propError.message}`);
    testPropertyId = property.id;

    // Create multiple notices for testing
    log.info('Setup: Creating test notices...');

    // Notice 1: utah-3day-notice, preview
    const notice1 = await createNotice({
      document_type: 'utah-3day-notice',
      notice_type: 'preview',
      property_id: testPropertyId,
      form_data: { landlordName: 'Test 1', tenantName: 'Tenant 1' }
    }, testUserToken);
    createdNoticeIds.push(notice1.id);

    // Add small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));

    // Notice 2: utah-3day-notice, final
    const notice2 = await createNotice({
      document_type: 'utah-3day-notice',
      notice_type: 'final',
      property_id: testPropertyId,
      form_data: { landlordName: 'Test 2', tenantName: 'Tenant 2' }
    }, testUserToken);
    createdNoticeIds.push(notice2.id);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Notice 3: utah-rent-increase, preview
    const notice3 = await createNotice({
      document_type: 'utah-rent-increase',
      notice_type: 'preview',
      property_id: testPropertyId,
      form_data: { landlordName: 'Test 3', tenantName: 'Tenant 3' }
    }, testUserToken);
    createdNoticeIds.push(notice3.id);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Notice 4: utah-rent-increase, final (no property)
    const notice4 = await createNotice({
      document_type: 'utah-rent-increase',
      notice_type: 'final',
      form_data: { landlordName: 'Test 4', tenantName: 'Tenant 4' }
    }, testUserToken);
    createdNoticeIds.push(notice4.id);

    log.success('Created 4 test notices');

    // Test 1: List all notices
    log.info('Test 1: Listing all notices...');
    const { response: r1, data: d1 } = await makeRequest(
      'GET',
      '/api/notices',
      null,
      testUserToken
    );

    if (r1.status !== 200 || !d1.success) {
      throw new Error('Failed to list notices');
    }
    if (d1.count !== 4) {
      throw new Error(`Expected 4 notices, got ${d1.count}`);
    }
    log.success(`Listed ${d1.count} notices`);

    // Test 2: Verify sorted by generated_at DESC (newest first)
    log.info('Test 2: Verifying sort order (newest first)...');
    const dates = d1.notices.map(n => new Date(n.generated_at).getTime());
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i] < dates[i + 1]) {
        throw new Error('Notices not sorted by generated_at DESC');
      }
    }
    log.success('Notices correctly sorted (newest first)');

    // Test 3: Filter by document_type (utah-3day-notice)
    log.info('Test 3: Filtering by document_type...');
    const { response: r3, data: d3 } = await makeRequest(
      'GET',
      '/api/notices?document_type=utah-3day-notice',
      null,
      testUserToken
    );

    if (r3.status !== 200 || !d3.success) {
      throw new Error('Failed to filter by document_type');
    }
    if (d3.count !== 2) {
      throw new Error(`Expected 2 utah-3day-notice, got ${d3.count}`);
    }
    const allCorrectType = d3.notices.every(n => n.document_type === 'utah-3day-notice');
    if (!allCorrectType) {
      throw new Error('Filter returned wrong document types');
    }
    log.success('Filtered by document_type correctly');

    // Test 4: Filter by notice_type (preview)
    log.info('Test 4: Filtering by notice_type...');
    const { response: r4, data: d4 } = await makeRequest(
      'GET',
      '/api/notices?notice_type=preview',
      null,
      testUserToken
    );

    if (r4.status !== 200 || !d4.success) {
      throw new Error('Failed to filter by notice_type');
    }
    if (d4.count !== 2) {
      throw new Error(`Expected 2 preview notices, got ${d4.count}`);
    }
    const allPreview = d4.notices.every(n => n.notice_type === 'preview');
    if (!allPreview) {
      throw new Error('Filter returned non-preview notices');
    }
    log.success('Filtered by notice_type correctly');

    // Test 5: Filter by property_id
    log.info('Test 5: Filtering by property_id...');
    const { response: r5, data: d5 } = await makeRequest(
      'GET',
      `/api/notices?property_id=${testPropertyId}`,
      null,
      testUserToken
    );

    if (r5.status !== 200 || !d5.success) {
      throw new Error('Failed to filter by property_id');
    }
    if (d5.count !== 3) {
      throw new Error(`Expected 3 notices with property, got ${d5.count}`);
    }
    const allWithProperty = d5.notices.every(n => n.property_id === testPropertyId);
    if (!allWithProperty) {
      throw new Error('Filter returned notices without property');
    }
    log.success('Filtered by property_id correctly');

    // Test 6: Combined filters (document_type + notice_type)
    log.info('Test 6: Testing combined filters...');
    const { response: r6, data: d6 } = await makeRequest(
      'GET',
      '/api/notices?document_type=utah-rent-increase&notice_type=final',
      null,
      testUserToken
    );

    if (r6.status !== 200 || !d6.success) {
      throw new Error('Failed with combined filters');
    }
    if (d6.count !== 1) {
      throw new Error(`Expected 1 notice with combined filters, got ${d6.count}`);
    }
    log.success('Combined filters work correctly');

    // Test 7: User isolation (other user's notices not visible)
    log.info('Test 7: Testing user isolation...');

    // Create second user
    const user2Email = `notices-history-2-${Date.now()}@test.com`;
    const { data: authData2 } = await supabaseAdmin.auth.admin.createUser({
      email: user2Email,
      password: 'testpass123',
      email_confirm: true
    });
    const user2Id = authData2.user.id;

    const { data: loginData2 } = await supabaseAdmin.auth.signInWithPassword({
      email: user2Email,
      password: 'testpass123'
    });
    const user2Token = loginData2.session.access_token;

    // User 2 should see 0 notices
    const { response: r7, data: d7 } = await makeRequest(
      'GET',
      '/api/notices',
      null,
      user2Token
    );

    if (r7.status !== 200 || !d7.success) {
      throw new Error('Failed to list notices for user 2');
    }
    if (d7.count !== 0) {
      throw new Error(`User 2 should see 0 notices, got ${d7.count}`);
    }
    log.success('User isolation enforced correctly');

    // Cleanup user 2
    await supabaseAdmin.auth.admin.deleteUser(user2Id);

    // Test 8: Verify notice fields in list response
    log.info('Test 8: Verifying response fields...');
    const firstNotice = d1.notices[0];
    const requiredFields = [
      'id', 'user_id', 'document_type', 'notice_type',
      'form_data', 'generated_at', 'download_count'
    ];

    for (const field of requiredFields) {
      if (!(field in firstNotice)) {
        throw new Error(`Missing field in response: ${field}`);
      }
    }
    log.success('All required fields present in response');

    // Test 9: Empty list when no notices
    log.info('Test 9: Testing empty list...');

    // Delete all notices
    for (const noticeId of createdNoticeIds) {
      await makeRequest('DELETE', `/api/notices/${noticeId}`, null, testUserToken);
    }
    createdNoticeIds = [];

    const { response: r9, data: d9 } = await makeRequest(
      'GET',
      '/api/notices',
      null,
      testUserToken
    );

    if (r9.status !== 200 || !d9.success) {
      throw new Error('Failed to list empty notices');
    }
    if (d9.count !== 0) {
      throw new Error(`Expected 0 notices after deletion, got ${d9.count}`);
    }
    log.success('Empty list returned correctly');

    console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}✅ All history tests passed!${colors.reset}`);
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

    if (testPropertyId) {
      await supabaseAdmin.from('properties').delete().eq('id', testPropertyId);
    }

    if (testUserId) {
      await supabaseAdmin.auth.admin.deleteUser(testUserId);
    }

    log.success('Cleanup complete');
  }
}

runTests().catch(console.error);
