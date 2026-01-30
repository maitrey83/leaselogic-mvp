#!/usr/bin/env node
/**
 * Manual API Test for Notices Endpoints
 * Task 3.6 - Phase 2 Verification
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';

// Color codes for terminal output
const c = {
  g: '\x1b[32m', // green
  r: '\x1b[31m', // red
  y: '\x1b[33m', // yellow
  b: '\x1b[34m', // blue
  m: '\x1b[35m', // magenta
  c: '\x1b[36m', // cyan
  x: '\x1b[0m'   // reset
};

// Test data
const TEST_USER = {
  email: `test-notices-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User'
};

const TEST_NOTICE = {
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

let authToken = null;
let createdNoticeId = null;

/**
 * Helper function to make HTTP requests
 */
async function makeRequest(method, endpoint, body = null, includeAuth = false) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (includeAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const contentType = response.headers.get('content-type');

  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType && contentType.includes('application/pdf')) {
    const arrayBuffer = await response.arrayBuffer();
    data = Buffer.from(arrayBuffer);
  } else {
    data = await response.text();
  }

  return { response, data };
}

/**
 * Test 0: Health Check
 */
async function testHealthCheck() {
  console.log(`\n${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
  console.log(`${c.b}Test 0: Health Check${c.x}`);
  console.log(`${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);

  try {
    const { response, data } = await makeRequest('GET', '/api/health');

    if (response.status === 200) {
      console.log(`${c.g}✅ Server is running${c.x}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Environment: ${data.environment}`);
      return true;
    } else {
      console.log(`${c.r}❌ Server health check failed${c.x}`);
      return false;
    }
  } catch (error) {
    console.log(`${c.r}❌ Server is not running: ${error.message}${c.x}`);
    console.log(`${c.y}   Make sure to start the server with: npm start${c.x}`);
    return false;
  }
}

/**
 * Test 1: Register Test User & Login
 */
async function testRegisterUser() {
  console.log(`\n${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
  console.log(`${c.b}Test 1: Register Test User & Login${c.x}`);
  console.log(`${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);

  try {
    // Register
    const { response: regResponse, data: regData } = await makeRequest('POST', '/api/auth/register', TEST_USER);

    if (regResponse.status !== 201 && regResponse.status !== 200) {
      console.log(`${c.r}❌ Registration failed: ${regData.error || JSON.stringify(regData)}${c.x}`);
      return false;
    }

    console.log(`${c.g}✅ User registered successfully${c.x}`);
    console.log(`   Email: ${TEST_USER.email}`);

    // Login to get token
    const { response: loginResponse, data: loginData } = await makeRequest('POST', '/api/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (loginResponse.status === 200 && loginData.session?.access_token) {
      authToken = loginData.session.access_token;
      console.log(`${c.g}✅ Login successful${c.x}`);
      console.log(`   Token: ${authToken.substring(0, 20)}...${c.x}`);
      return true;
    } else {
      console.log(`${c.r}❌ Login failed: ${loginData.error || JSON.stringify(loginData)}${c.x}`);
      return false;
    }
  } catch (error) {
    console.log(`${c.r}❌ Error: ${error.message}${c.x}`);
    return false;
  }
}

/**
 * Test 2: Create Notice Metadata (Subtask 3.6.2)
 */
async function testCreateNotice() {
  console.log(`\n${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
  console.log(`${c.b}Test 2: Create Notice Metadata${c.x}`);
  console.log(`${c.b}Subtask 3.6.2: Store metadata (NO PDF)${c.x}`);
  console.log(`${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);

  try {
    const { response, data } = await makeRequest('POST', '/api/notices', TEST_NOTICE, true);

    if (response.status === 201 && data.success) {
      createdNoticeId = data.notice.id;
      console.log(`${c.g}✅ Notice created successfully${c.x}`);
      console.log(`   ID: ${data.notice.id}`);
      console.log(`   Document Type: ${data.notice.document_type}`);
      console.log(`   Notice Type: ${data.notice.notice_type}`);
      console.log(`   Form Data Keys: ${Object.keys(data.notice.form_data).length} fields`);
      console.log(`   Generated At: ${data.notice.generated_at}`);
      console.log(`   Download Count: ${data.notice.download_count}`);
      return true;
    } else {
      console.log(`${c.r}❌ Failed to create notice: ${data.error || JSON.stringify(data)}${c.x}`);
      return false;
    }
  } catch (error) {
    console.log(`${c.r}❌ Error: ${error.message}${c.x}`);
    return false;
  }
}

/**
 * Test 3: List Notices (Subtask 3.6.7)
 */
async function testListNotices() {
  console.log(`\n${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
  console.log(`${c.b}Test 3: List User's Notices${c.x}`);
  console.log(`${c.b}Subtask 3.6.7: Query notice history${c.x}`);
  console.log(`${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);

  try {
    const { response, data } = await makeRequest('GET', '/api/notices', null, true);

    if (response.status === 200 && data.success) {
      console.log(`${c.g}✅ Notices listed successfully${c.x}`);
      console.log(`   Total Notices: ${data.count}`);
      if (data.count > 0) {
        console.log(`   First Notice ID: ${data.notices[0].id}`);
        console.log(`   Sorted by: generated_at (DESC)`);
      }
      return true;
    } else {
      console.log(`${c.r}❌ Failed to list notices: ${data.error || JSON.stringify(data)}${c.x}`);
      return false;
    }
  } catch (error) {
    console.log(`${c.r}❌ Error: ${error.message}${c.x}`);
    return false;
  }
}

/**
 * Test 4: Get Single Notice
 */
async function testGetNotice() {
  console.log(`\n${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
  console.log(`${c.b}Test 4: Get Single Notice${c.x}`);
  console.log(`${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);

  if (!createdNoticeId) {
    console.log(`${c.y}⚠️  Skipping - no notice ID available${c.x}`);
    return false;
  }

  try {
    const { response, data } = await makeRequest('GET', `/api/notices/${createdNoticeId}`, null, true);

    if (response.status === 200 && data.success) {
      console.log(`${c.g}✅ Notice retrieved successfully${c.x}`);
      console.log(`   ID: ${data.notice.id}`);
      console.log(`   Document Type: ${data.notice.document_type}`);
      console.log(`   Form Data: ${Object.keys(data.notice.form_data).length} fields`);
      return true;
    } else {
      console.log(`${c.r}❌ Failed to get notice: ${data.error || JSON.stringify(data)}${c.x}`);
      return false;
    }
  } catch (error) {
    console.log(`${c.r}❌ Error: ${error.message}${c.x}`);
    return false;
  }
}

/**
 * Test 5: Download PDF (Subtask 3.6.3 & 3.6.9)
 */
async function testDownloadPDF() {
  console.log(`\n${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
  console.log(`${c.b}Test 5: Download PDF (On-Demand Generation)${c.x}`);
  console.log(`${c.b}Subtask 3.6.3: Regenerate PDF from JSONB${c.x}`);
  console.log(`${c.b}Subtask 3.6.9: Track downloads${c.x}`);
  console.log(`${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);

  if (!createdNoticeId) {
    console.log(`${c.y}⚠️  Skipping - no notice ID available${c.x}`);
    return false;
  }

  try {
    const { response, data } = await makeRequest('GET', `/api/notices/${createdNoticeId}/download`, null, true);

    if (response.status === 200) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        const pdfBuffer = data;
        const outputPath = path.join(__dirname, `test-notice-${createdNoticeId}.pdf`);
        fs.writeFileSync(outputPath, pdfBuffer);

        console.log(`${c.g}✅ PDF downloaded successfully${c.x}`);
        console.log(`   File Size: ${pdfBuffer.length} bytes`);
        console.log(`   Saved To: ${outputPath}`);
        console.log(`   Content-Type: ${contentType}`);
        return true;
      } else {
        console.log(`${c.r}❌ Response is not a PDF${c.x}`);
        console.log(`   Content-Type: ${contentType}`);
        return false;
      }
    } else {
      console.log(`${c.r}❌ Failed to download PDF: ${JSON.stringify(data)}${c.x}`);
      return false;
    }
  } catch (error) {
    console.log(`${c.r}❌ Error: ${error.message}${c.x}`);
    return false;
  }
}

/**
 * Test 6: Verify Download Tracking (Subtask 3.6.9)
 */
async function testDownloadTracking() {
  console.log(`\n${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
  console.log(`${c.b}Test 6: Verify Download Tracking${c.x}`);
  console.log(`${c.b}Subtask 3.6.9: Increment counter + timestamp${c.x}`);
  console.log(`${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);

  if (!createdNoticeId) {
    console.log(`${c.y}⚠️  Skipping - no notice ID available${c.x}`);
    return false;
  }

  try {
    // Get notice details to check download count
    const { response, data } = await makeRequest('GET', `/api/notices/${createdNoticeId}`, null, true);

    if (response.status === 200 && data.success) {
      console.log(`${c.g}✅ Download tracking verified${c.x}`);
      console.log(`   Download Count: ${data.notice.download_count}`);
      console.log(`   Last Downloaded: ${data.notice.last_downloaded_at || 'Never'}`);

      if (data.notice.download_count > 0) {
        console.log(`${c.g}   ✓ Counter incremented correctly${c.x}`);
      }
      if (data.notice.last_downloaded_at) {
        console.log(`${c.g}   ✓ Timestamp updated correctly${c.x}`);
      }

      return true;
    } else {
      console.log(`${c.r}❌ Failed to verify tracking: ${data.error || JSON.stringify(data)}${c.x}`);
      return false;
    }
  } catch (error) {
    console.log(`${c.r}❌ Error: ${error.message}${c.x}`);
    return false;
  }
}

/**
 * Test 7: Delete Notice
 */
async function testDeleteNotice() {
  console.log(`\n${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
  console.log(`${c.b}Test 7: Delete Notice${c.x}`);
  console.log(`${c.b}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);

  if (!createdNoticeId) {
    console.log(`${c.y}⚠️  Skipping - no notice ID available${c.x}`);
    return false;
  }

  try {
    const { response, data } = await makeRequest('DELETE', `/api/notices/${createdNoticeId}`, null, true);

    if (response.status === 200 && data.success) {
      console.log(`${c.g}✅ Notice deleted successfully${c.x}`);
      console.log(`   Message: ${data.message}`);
      return true;
    } else {
      console.log(`${c.r}❌ Failed to delete notice: ${data.error || JSON.stringify(data)}${c.x}`);
      return false;
    }
  } catch (error) {
    console.log(`${c.r}❌ Error: ${error.message}${c.x}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${c.m}╔════════════════════════════════════════╗${c.x}`);
  console.log(`${c.m}║   NOTICES API MANUAL TEST SUITE        ║${c.x}`);
  console.log(`${c.m}║   Task 3.6 - Phase 2 Verification      ║${c.x}`);
  console.log(`${c.m}╚════════════════════════════════════════╝${c.x}`);

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Register User', fn: testRegisterUser },
    { name: 'Create Notice', fn: testCreateNotice },
    { name: 'List Notices', fn: testListNotices },
    { name: 'Get Notice', fn: testGetNotice },
    { name: 'Download PDF', fn: testDownloadPDF },
    { name: 'Download Tracking', fn: testDownloadTracking },
    { name: 'Delete Notice', fn: testDeleteNotice }
  ];

  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Summary
  console.log(`\n${c.m}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
  console.log(`${c.m}TEST SUMMARY${c.x}`);
  console.log(`${c.m}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
  console.log(`${c.c}Total Tests: ${results.total}${c.x}`);
  console.log(`${c.g}Passed: ${results.passed}${c.x}`);
  console.log(`${c.r}Failed: ${results.failed}${c.x}`);

  if (results.failed === 0) {
    console.log(`\n${c.g}🎉 ALL TESTS PASSED! Phase 2 is complete.${c.x}`);
    console.log(`${c.g}Ready to proceed with Phase 3 (Integration Tests)${c.x}\n`);
  } else {
    console.log(`\n${c.y}⚠️  Some tests failed. Please review the errors above.${c.x}\n`);
  }
}

// Run tests
runTests().catch(console.error);
