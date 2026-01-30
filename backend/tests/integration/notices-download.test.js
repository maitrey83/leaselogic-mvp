#!/usr/bin/env node

/**
 * Notices Download Integration Tests
 * Subtask 3.6.8: Test on-demand PDF download (regenerate from JSONB)
 * Run: node tests/integration/notices-download.test.js
 */

require('dotenv').config();
const { supabaseAdmin } = require('../../src/config/supabase');
const fs = require('fs');
const path = require('path');

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

  return { response, data, contentType };
}

async function runTests() {
  console.log(`\n${colors.blue}🧪 Testing On-Demand PDF Download${colors.reset}\n`);

  let testUserId;
  let testUserToken;
  let createdNoticeIds = [];
  const testPdfFiles = [];

  try {
    // Setup: Create test user
    log.info('Setup: Creating test user...');
    const testEmail = `notices-download-${Date.now()}@test.com`;
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

    // Test 1: Create notice with complete form_data
    log.info('Test 1: Creating notice with complete form_data...');
    const noticeData = {
      document_type: 'utah-3day-notice',
      notice_type: 'preview',
      form_data: {
        landlordName: 'John Landlord',
        landlordAddress: '123 Main St',
        landlordCity: 'Salt Lake City',
        landlordState: 'UT',
        landlordZip: '84101',
        tenantName: 'Jane Tenant',
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

    const { response: r1, data: d1 } = await makeRequest(
      'POST',
      '/api/notices',
      noticeData,
      testUserToken
    );

    if (r1.status !== 201 || !d1.success) {
      throw new Error('Failed to create notice');
    }
    const noticeId = d1.notice.id;
    createdNoticeIds.push(noticeId);
    log.success(`Notice created: ${noticeId}`);

    // Test 2: Download PDF (on-demand generation)
    log.info('Test 2: Downloading PDF (regenerate from JSONB)...');
    const { response: r2, data: pdfBuffer, contentType } = await makeRequest(
      'GET',
      `/api/notices/${noticeId}/download`,
      null,
      testUserToken
    );

    if (r2.status !== 200) {
      throw new Error(`Download failed: ${pdfBuffer.error || 'Unknown error'}`);
    }

    // Verify content type
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error(`Wrong content type: ${contentType}`);
    }
    log.success('Content-Type is application/pdf');

    // Verify PDF buffer
    if (!Buffer.isBuffer(pdfBuffer)) {
      throw new Error('Response is not a buffer');
    }
    if (pdfBuffer.length === 0) {
      throw new Error('PDF buffer is empty');
    }
    log.success(`PDF generated: ${pdfBuffer.length} bytes`);

    // Test 3: Verify PDF is valid (starts with PDF magic bytes)
    log.info('Test 3: Verifying PDF validity...');
    const pdfMagicBytes = pdfBuffer.toString('ascii', 0, 4);
    if (pdfMagicBytes !== '%PDF') {
      throw new Error('Invalid PDF format (missing %PDF header)');
    }
    log.success('PDF format validated');

    // Test 4: Save and verify PDF file
    log.info('Test 4: Saving PDF to disk...');
    const testPdfPath = path.join(__dirname, `../../test-download-${noticeId}.pdf`);
    fs.writeFileSync(testPdfPath, pdfBuffer);
    testPdfFiles.push(testPdfPath);

    const fileStats = fs.statSync(testPdfPath);
    if (fileStats.size !== pdfBuffer.length) {
      throw new Error('File size mismatch');
    }
    log.success(`PDF saved: ${testPdfPath} (${fileStats.size} bytes)`);

    // Test 5: Download same notice again (regeneration test)
    log.info('Test 5: Testing PDF regeneration (download again)...');
    const { response: r5, data: pdfBuffer2 } = await makeRequest(
      'GET',
      `/api/notices/${noticeId}/download`,
      null,
      testUserToken
    );

    if (r5.status !== 200) {
      throw new Error('Second download failed');
    }
    if (pdfBuffer2.length === 0) {
      throw new Error('Second PDF buffer is empty');
    }
    log.success('PDF regenerated successfully');

    // Test 6: Verify regenerated PDF is similar size (±10%)
    log.info('Test 6: Verifying regenerated PDF consistency...');
    const sizeDiff = Math.abs(pdfBuffer.length - pdfBuffer2.length);
    const maxDiff = pdfBuffer.length * 0.1; // 10% tolerance
    if (sizeDiff > maxDiff) {
      throw new Error(`PDF size varies too much: ${pdfBuffer.length} vs ${pdfBuffer2.length}`);
    }
    log.success('Regenerated PDF size is consistent');

    // Test 7: Test different document type (rent-increase)
    log.info('Test 7: Testing utah-rent-increase PDF generation...');
    const rentIncreaseData = {
      document_type: 'utah-rent-increase',
      notice_type: 'preview',
      form_data: {
        landlordName: 'Test Landlord',
        landlordAddress: '789 Owner St',
        landlordCity: 'Salt Lake City',
        landlordState: 'UT',
        landlordZip: '84101',
        tenantName: 'Test Tenant',
        tenantAddress: '456 Rental Ave',
        tenantCity: 'Salt Lake City',
        tenantState: 'UT',
        tenantZip: '84102',
        currentRent: '1500',
        newRent: '1650',
        effectiveDate: '2026-03-01',
        dateServed: '2026-01-23'
      }
    };

    const { response: r7a, data: d7a } = await makeRequest(
      'POST',
      '/api/notices',
      rentIncreaseData,
      testUserToken
    );
    const rentNoticeId = d7a.notice.id;
    createdNoticeIds.push(rentNoticeId);

    const { response: r7b, data: rentPdf } = await makeRequest(
      'GET',
      `/api/notices/${rentNoticeId}/download`,
      null,
      testUserToken
    );

    if (r7b.status !== 200 || !Buffer.isBuffer(rentPdf)) {
      throw new Error('Rent increase PDF generation failed');
    }
    log.success('utah-rent-increase PDF generated successfully');

    // Test 8: Test user isolation (cannot download other user's notice)
    log.info('Test 8: Testing user isolation on download...');

    // Create second user
    const user2Email = `notices-download-2-${Date.now()}@test.com`;
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

    // User 2 tries to download user 1's notice
    const { response: r8, data: d8 } = await makeRequest(
      'GET',
      `/api/notices/${noticeId}/download`,
      null,
      user2Token
    );

    if (r8.status !== 404) {
      throw new Error('User 2 should not be able to download user 1 notice');
    }
    log.success('User isolation enforced on download');

    // Cleanup user 2
    await supabaseAdmin.auth.admin.deleteUser(user2Id);

    // Test 9: Test download with invalid notice ID
    log.info('Test 9: Testing invalid notice ID...');
    const { response: r9 } = await makeRequest(
      'GET',
      '/api/notices/00000000-0000-0000-0000-000000000000/download',
      null,
      testUserToken
    );

    if (r9.status !== 404) {
      throw new Error('Should return 404 for invalid notice ID');
    }
    log.success('Invalid notice ID handled correctly');

    // Test 10: Test download without authentication
    log.info('Test 10: Testing unauthorized download...');
    const { response: r10 } = await makeRequest(
      'GET',
      `/api/notices/${noticeId}/download`,
      null,
      null // No token
    );

    if (r10.status !== 401) {
      throw new Error('Should require authentication');
    }
    log.success('Authentication enforced on download');

    console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}✅ All download tests passed!${colors.reset}`);
    console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Cleanup
    log.info('Cleanup: Deleting test data...');

    // Delete test PDF files
    for (const pdfPath of testPdfFiles) {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Delete notices
    for (const noticeId of createdNoticeIds) {
      await supabaseAdmin.from('notices').delete().eq('id', noticeId);
    }

    // Delete user
    if (testUserId) {
      await supabaseAdmin.auth.admin.deleteUser(testUserId);
    }

    log.success('Cleanup complete');
  }
}

runTests().catch(console.error);
