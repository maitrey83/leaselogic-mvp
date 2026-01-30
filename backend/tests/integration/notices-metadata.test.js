#!/usr/bin/env node

/**
 * Notices Metadata Integration Tests
 * Subtask 3.6.6: Test notice metadata creation (NO PDF storage)
 * Run: node tests/integration/notices-metadata.test.js
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

// Test form data
const PREVIEW_NOTICE_DATA = {
  document_type: 'utah-3day-notice',
  notice_type: 'preview',
  form_data: {
    landlordName: 'Test Landlord',
    landlordAddress: '123 Test St',
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

const FINAL_NOTICE_DATA = {
  document_type: 'utah-rent-increase',
  notice_type: 'final',
  form_data: {
    landlordName: 'Final Test Landlord',
    landlordAddress: '789 Owner Blvd',
    tenantName: 'Final Test Tenant',
    currentRent: '1500',
    newRent: '1650',
    effectiveDate: '2026-03-01',
    dateServed: '2026-01-23'
  }
};

async function makeRequest(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  return { response, data };
}

async function runTests() {
  console.log(`\n${colors.blue}🧪 Testing Notices Metadata Creation${colors.reset}\n`);

  let testUserId;
  let testUserToken;
  let testPropertyId;
  let createdNoticeIds = [];

  try {
    // Setup: Create test user
    log.info('Setup: Creating test user...');
    const testEmail = `notices-metadata-${Date.now()}@test.com`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'testpass123',
      email_confirm: true
    });

    if (authError) throw authError;
    testUserId = authData.user.id;
    log.success(`User created: ${testUserId}`);

    // Login to get token
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
    log.info('Setup: Creating test property...');
    const { data: property, error: propError } = await supabaseAdmin
      .from('properties')
      .insert({
        user_id: testUserId,
        property_name: 'Test Property for Notices',
        street_address: '123 Test St',
        city: 'Salt Lake City',
        state: 'UT',
        zip_code: '84101'
      })
      .select()
      .single();

    if (propError) throw propError;
    testPropertyId = property.id;
    log.success(`Property created: ${testPropertyId}`);

    // Test 1: Create preview notice (no payment)
    log.info('Test 1: Creating preview notice...');
    const { response: r1, data: d1 } = await makeRequest(
      'POST',
      '/api/notices',
      PREVIEW_NOTICE_DATA,
      testUserToken
    );

    if (r1.status !== 201 || !d1.success) {
      throw new Error(`Failed to create preview notice: ${d1.error}`);
    }
    createdNoticeIds.push(d1.notice.id);
    log.success(`Preview notice created: ${d1.notice.id}`);

    // Verify metadata
    if (d1.notice.document_type !== 'utah-3day-notice') {
      throw new Error('Document type mismatch');
    }
    if (d1.notice.notice_type !== 'preview') {
      throw new Error('Notice type mismatch');
    }
    if (!d1.notice.form_data) {
      throw new Error('form_data is missing');
    }
    if (Object.keys(d1.notice.form_data).length !== 15) {
      throw new Error(`Expected 15 form fields, got ${Object.keys(d1.notice.form_data).length}`);
    }
    if (d1.notice.download_count !== 0) {
      throw new Error('Initial download_count should be 0');
    }
    log.success('Preview notice metadata verified');

    // Test 2: Create final notice (with payment_id placeholder)
    log.info('Test 2: Creating final notice...');
    const finalData = { ...FINAL_NOTICE_DATA, payment_id: null };
    const { response: r2, data: d2 } = await makeRequest(
      'POST',
      '/api/notices',
      finalData,
      testUserToken
    );

    if (r2.status !== 201 || !d2.success) {
      throw new Error(`Failed to create final notice: ${d2.error}`);
    }
    createdNoticeIds.push(d2.notice.id);
    log.success(`Final notice created: ${d2.notice.id}`);

    // Test 3: Create notice with property link
    log.info('Test 3: Creating notice linked to property...');
    const linkedData = { ...PREVIEW_NOTICE_DATA, property_id: testPropertyId };
    const { response: r3, data: d3 } = await makeRequest(
      'POST',
      '/api/notices',
      linkedData,
      testUserToken
    );

    if (r3.status !== 201 || !d3.success) {
      throw new Error(`Failed to create linked notice: ${d3.error}`);
    }
    createdNoticeIds.push(d3.notice.id);

    if (d3.notice.property_id !== testPropertyId) {
      throw new Error('Property ID not linked correctly');
    }
    log.success(`Notice linked to property: ${testPropertyId}`);

    // Test 4: Verify NO pdf_url or pdf_storage_path fields
    log.info('Test 4: Verifying no PDF storage fields...');
    if (d1.notice.pdf_url || d1.notice.pdf_storage_path) {
      throw new Error('PDF storage fields should not exist (on-demand generation)');
    }
    log.success('No PDF storage fields present (on-demand approach confirmed)');

    // Test 5: Verify form_data completeness for PDF regeneration
    log.info('Test 5: Verifying form_data for PDF regeneration...');
    const formData = d1.notice.form_data;
    const requiredFields = ['landlordName', 'tenantName', 'rentAmount', 'dateServed'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        throw new Error(`Missing required field for regeneration: ${field}`);
      }
    }
    log.success('form_data contains all required fields for PDF regeneration');

    // Test 6: Verify notice stored in database
    log.info('Test 6: Verifying notice in database...');
    const { data: dbNotice, error: dbError } = await supabaseAdmin
      .from('notices')
      .select('*')
      .eq('id', d1.notice.id)
      .single();

    if (dbError || !dbNotice) {
      throw new Error('Notice not found in database');
    }
    log.success('Notice verified in database');

    // Test 7: Test invalid document_type
    log.info('Test 7: Testing invalid document_type...');
    const invalidData = { ...PREVIEW_NOTICE_DATA, document_type: 'invalid-type' };
    const { response: r7, data: d7 } = await makeRequest(
      'POST',
      '/api/notices',
      invalidData,
      testUserToken
    );

    if (r7.status === 201) {
      throw new Error('Should reject invalid document_type');
    }
    log.success('Invalid document_type rejected correctly');

    // Test 8: Test invalid notice_type
    log.info('Test 8: Testing invalid notice_type...');
    const invalidNoticeType = { ...PREVIEW_NOTICE_DATA, notice_type: 'invalid' };
    const { response: r8, data: d8 } = await makeRequest(
      'POST',
      '/api/notices',
      invalidNoticeType,
      testUserToken
    );

    if (r8.status === 201) {
      throw new Error('Should reject invalid notice_type');
    }
    log.success('Invalid notice_type rejected correctly');

    // Test 9: Test missing form_data
    log.info('Test 9: Testing missing form_data...');
    const missingFormData = { document_type: 'utah-3day-notice', notice_type: 'preview' };
    const { response: r9, data: d9 } = await makeRequest(
      'POST',
      '/api/notices',
      missingFormData,
      testUserToken
    );

    if (r9.status === 201) {
      throw new Error('Should reject missing form_data');
    }
    log.success('Missing form_data rejected correctly');

    // Test 10: Test empty form_data
    log.info('Test 10: Testing empty form_data...');
    const emptyFormData = { ...PREVIEW_NOTICE_DATA, form_data: {} };
    const { response: r10, data: d10 } = await makeRequest(
      'POST',
      '/api/notices',
      emptyFormData,
      testUserToken
    );

    if (r10.status === 201) {
      throw new Error('Should reject empty form_data');
    }
    log.success('Empty form_data rejected correctly');

    console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}✅ All metadata tests passed!${colors.reset}`);
    console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Cleanup
    log.info('Cleanup: Deleting test data...');

    // Delete notices
    for (const noticeId of createdNoticeIds) {
      await supabaseAdmin.from('notices').delete().eq('id', noticeId);
    }

    // Delete property
    if (testPropertyId) {
      await supabaseAdmin.from('properties').delete().eq('id', testPropertyId);
    }

    // Delete user
    if (testUserId) {
      await supabaseAdmin.auth.admin.deleteUser(testUserId);
    }

    log.success('Cleanup complete');
  }
}

runTests().catch(console.error);
