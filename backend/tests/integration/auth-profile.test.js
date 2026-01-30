#!/usr/bin/env node

/**
 * Integration Tests: Auth Profile Update
 * Tests: PUT /api/auth/profile
 * Coverage: Profile updates, validation, authorization
 */

require('dotenv').config();
const API_URL = process.env.API_URL || 'http://localhost:5001';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  suite: (msg) => console.log(`\n${colors.blue}📦 ${msg}${colors.reset}`),
  test: (msg) => console.log(`\n  🧪 ${msg}`),
  success: (msg) => console.log(`  ${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`  ${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`  ${colors.yellow}ℹ️  ${msg}${colors.reset}`)
};

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

function recordResult(testName, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log.success(`PASS: ${testName}`);
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, error });
    log.error(`FAIL: ${testName}`);
    if (error) log.error(`  Error: ${error}`);
  }
}

const generateTestEmail = () => `test-profile-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;

async function setupTestUser() {
  log.info('Setting up test user...');

  const testEmail = generateTestEmail();
  const testPassword = 'TestPassword123!';

  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      fullName: 'Profile Test User'
    })
  });

  if (response.status !== 201) {
    throw new Error('Failed to create test user');
  }

  const registerData = await response.json();

  // Login to get token
  const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });

  if (loginResponse.status !== 200) {
    throw new Error('Failed to login test user');
  }

  const loginData = await loginResponse.json();
  log.info(`Test user created and logged in: ${testEmail}`);

  return {
    email: testEmail,
    userId: registerData.user.id,
    token: loginData.session.access_token
  };
}

async function testUpdateProfileSuccess(testUser) {
  log.test('Test 1: Update profile with valid data');

  try {
    const newFullName = 'Updated Test User';
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUser.token}`
      },
      body: JSON.stringify({
        fullName: newFullName
      })
    });

    const data = await response.json();

    if (response.status !== 200) {
      recordResult('Update profile - status code', false, `Expected 200, got ${response.status}`);
      return;
    }
    recordResult('Update profile - status code', true);

    if (!data.user || !data.message) {
      recordResult('Update profile - response structure', false, 'Missing user or message');
      return;
    }
    recordResult('Update profile - response structure', true);

    if (data.user.full_name !== newFullName) {
      recordResult('Update profile - name updated', false, 'Name not updated');
      return;
    }
    recordResult('Update profile - name updated', true);

    if (!data.message.toLowerCase().includes('success')) {
      recordResult('Update profile - success message', false, 'No success message');
      return;
    }
    recordResult('Update profile - success message', true);

  } catch (error) {
    recordResult('Update profile', false, error.message);
  }
}

async function testUpdateProfileNoToken() {
  log.test('Test 2: Update profile without token');

  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Unauthorized User'
      })
    });

    const data = await response.json();

    if (response.status !== 401) {
      recordResult('No token - status code', false, `Expected 401, got ${response.status}`);
      return;
    }
    recordResult('No token - status code', true);

    if (!data.error || !data.error.toLowerCase().includes('token')) {
      recordResult('No token - error message', false, 'No token error');
      return;
    }
    recordResult('No token - error message', true);

  } catch (error) {
    recordResult('No token', false, error.message);
  }
}

async function testUpdateProfileInvalidToken() {
  log.test('Test 3: Update profile with invalid token');

  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-12345'
      },
      body: JSON.stringify({
        fullName: 'Invalid Token User'
      })
    });

    const data = await response.json();

    if (response.status !== 401) {
      recordResult('Invalid token - status code', false, `Expected 401, got ${response.status}`);
      return;
    }
    recordResult('Invalid token - status code', true);

    if (!data.error) {
      recordResult('Invalid token - error message', false, 'No error message');
      return;
    }
    recordResult('Invalid token - error message', true);

  } catch (error) {
    recordResult('Invalid token', false, error.message);
  }
}

async function testUpdateProfileVerifyPersistence(testUser) {
  log.test('Test 4: Verify profile update persists');

  try {
    // Update profile
    const newFullName = 'Persistence Test User';
    await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUser.token}`
      },
      body: JSON.stringify({
        fullName: newFullName
      })
    });

    // Fetch current user to verify
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });

    const data = await response.json();

    if (response.status !== 200) {
      recordResult('Persistence check - status code', false, `Expected 200, got ${response.status}`);
      return;
    }
    recordResult('Persistence check - status code', true);

    if (data.full_name !== newFullName) {
      recordResult('Persistence check - name persisted', false, `Expected "${newFullName}", got "${data.full_name}"`);
      return;
    }
    recordResult('Persistence check - name persisted', true);

  } catch (error) {
    recordResult('Persistence check', false, error.message);
  }
}

async function testUpdateProfileEmptyName(testUser) {
  log.test('Test 5: Update profile with empty fullName');

  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUser.token}`
      },
      body: JSON.stringify({
        fullName: ''
      })
    });

    const data = await response.json();

    // Should accept empty name (optional field)
    if (response.status !== 200) {
      recordResult('Empty name - accepted', false, `Expected 200, got ${response.status}`);
      return;
    }
    recordResult('Empty name - accepted', true);

  } catch (error) {
    recordResult('Empty name', false, error.message);
  }
}

async function runAllTests() {
  log.suite('Auth Profile Update Integration Tests');
  log.info(`Testing API at: ${API_URL}`);

  // Setup: Create and login test user
  const testUser = await setupTestUser();

  // Test 1: Update profile successfully
  await testUpdateProfileSuccess(testUser);

  // Test 2-3: Authorization tests
  await testUpdateProfileNoToken();
  await testUpdateProfileInvalidToken();

  // Test 4: Verify persistence
  await testUpdateProfileVerifyPersistence(testUser);

  // Test 5: Empty name
  await testUpdateProfileEmptyName(testUser);

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Summary: Auth Profile Update`);
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`${colors.green}✅ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testResults.failed}${colors.reset}`);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(({ test, error }) => {
      console.log(`  - ${test}: ${error}`);
    });
  }

  console.log('='.repeat(50) + '\n');

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
