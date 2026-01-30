#!/usr/bin/env node

/**
 * Integration Tests: Auth Login
 * Tests: POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
 * Coverage: Login flow, token management, user retrieval, logout
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

const generateTestEmail = () => `test-login-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;

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
      fullName: 'Login Test User'
    })
  });

  if (response.status !== 201) {
    throw new Error('Failed to create test user');
  }

  const data = await response.json();
  log.info(`Test user created: ${testEmail}`);

  return {
    email: testEmail,
    password: testPassword,
    userId: data.user.id
  };
}

async function testLoginSuccess(testUser) {
  log.test('Test 1: Login with valid credentials');

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const data = await response.json();

    // Verify status
    if (response.status !== 200) {
      recordResult('Login success - status code', false, `Expected 200, got ${response.status}`);
      return null;
    }
    recordResult('Login success - status code', true);

    // Verify response structure
    if (!data.user || !data.session) {
      recordResult('Login success - response structure', false, 'Missing user or session');
      return null;
    }
    recordResult('Login success - response structure', true);

    // Verify access token
    if (!data.session.access_token) {
      recordResult('Login success - access token', false, 'No access token');
      return null;
    }
    recordResult('Login success - access token', true);

    // Verify user email matches
    if (data.user.email !== testUser.email) {
      recordResult('Login success - user email', false, 'Email mismatch');
      return null;
    }
    recordResult('Login success - user email', true);

    // Verify message
    if (!data.message || !data.message.toLowerCase().includes('success')) {
      recordResult('Login success - success message', false, 'No success message');
      return null;
    }
    recordResult('Login success - success message', true);

    return data.session.access_token;
  } catch (error) {
    recordResult('Login success', false, error.message);
    return null;
  }
}

async function testLoginMissingEmail() {
  log.test('Test 2: Login without email');

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'TestPassword123!'
      })
    });

    const data = await response.json();

    if (response.status !== 400) {
      recordResult('Missing email - status code', false, `Expected 400, got ${response.status}`);
      return;
    }
    recordResult('Missing email - status code', true);

    if (!data.error || !data.error.toLowerCase().includes('email')) {
      recordResult('Missing email - error message', false, 'No email error');
      return;
    }
    recordResult('Missing email - error message', true);

  } catch (error) {
    recordResult('Missing email', false, error.message);
  }
}

async function testLoginMissingPassword() {
  log.test('Test 3: Login without password');

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com'
      })
    });

    const data = await response.json();

    if (response.status !== 400) {
      recordResult('Missing password - status code', false, `Expected 400, got ${response.status}`);
      return;
    }
    recordResult('Missing password - status code', true);

    if (!data.error || !data.error.toLowerCase().includes('password')) {
      recordResult('Missing password - error message', false, 'No password error');
      return;
    }
    recordResult('Missing password - error message', true);

  } catch (error) {
    recordResult('Missing password', false, error.message);
  }
}

async function testLoginInvalidCredentials() {
  log.test('Test 4: Login with wrong password');

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'WrongPassword123!'
      })
    });

    const data = await response.json();

    // Should return 401
    if (response.status !== 401) {
      recordResult('Invalid credentials - status code', false, `Expected 401, got ${response.status}`);
      return;
    }
    recordResult('Invalid credentials - status code', true);

    // Should have error message
    if (!data.error) {
      recordResult('Invalid credentials - error message', false, 'No error message');
      return;
    }
    recordResult('Invalid credentials - error message', true);

  } catch (error) {
    recordResult('Invalid credentials', false, error.message);
  }
}

async function testLoginNonexistentUser() {
  log.test('Test 5: Login with nonexistent email');

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent-' + Date.now() + '@test.com',
        password: 'TestPassword123!'
      })
    });

    const data = await response.json();

    if (response.status !== 401) {
      recordResult('Nonexistent user - status code', false, `Expected 401, got ${response.status}`);
      return;
    }
    recordResult('Nonexistent user - status code', true);

    if (!data.error) {
      recordResult('Nonexistent user - error message', false, 'No error message');
      return;
    }
    recordResult('Nonexistent user - error message', true);

  } catch (error) {
    recordResult('Nonexistent user', false, error.message);
  }
}

async function testGetCurrentUser(token, expectedEmail) {
  log.test('Test 6: Get current user with valid token');

  if (!token) {
    log.info('Skipping - no token available');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.status !== 200) {
      recordResult('Get current user - status code', false, `Expected 200, got ${response.status}`);
      return;
    }
    recordResult('Get current user - status code', true);

    if (!data.id || !data.email) {
      recordResult('Get current user - user data', false, 'Missing user data');
      return;
    }
    recordResult('Get current user - user data', true);

    if (data.email !== expectedEmail) {
      recordResult('Get current user - email match', false, 'Email mismatch');
      return;
    }
    recordResult('Get current user - email match', true);

  } catch (error) {
    recordResult('Get current user', false, error.message);
  }
}

async function testGetCurrentUserNoToken() {
  log.test('Test 7: Get current user without token');

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET'
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

async function testGetCurrentUserInvalidToken() {
  log.test('Test 8: Get current user with invalid token');

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token-12345'
      }
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

async function testLogout(token) {
  log.test('Test 9: Logout with valid token');

  if (!token) {
    log.info('Skipping - no token available');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.status !== 200) {
      recordResult('Logout - status code', false, `Expected 200, got ${response.status}`);
      return;
    }
    recordResult('Logout - status code', true);

    if (!data.message || !data.message.toLowerCase().includes('success')) {
      recordResult('Logout - success message', false, 'No success message');
      return;
    }
    recordResult('Logout - success message', true);

  } catch (error) {
    recordResult('Logout', false, error.message);
  }
}

async function testLogoutNoToken() {
  log.test('Test 10: Logout without token');

  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST'
    });

    const data = await response.json();

    if (response.status !== 401) {
      recordResult('Logout no token - status code', false, `Expected 401, got ${response.status}`);
      return;
    }
    recordResult('Logout no token - status code', true);

    if (!data.error) {
      recordResult('Logout no token - error message', false, 'No error message');
      return;
    }
    recordResult('Logout no token - error message', true);

  } catch (error) {
    recordResult('Logout no token', false, error.message);
  }
}

async function runAllTests() {
  log.suite('Auth Login & Session Integration Tests');
  log.info(`Testing API at: ${API_URL}`);

  // Setup: Create test user
  const testUser = await setupTestUser();

  // Test 1: Login with valid credentials
  const token = await testLoginSuccess(testUser);

  // Test 2-5: Login validation
  await testLoginMissingEmail();
  await testLoginMissingPassword();
  await testLoginInvalidCredentials();
  await testLoginNonexistentUser();

  // Test 6-8: Get current user
  await testGetCurrentUser(token, testUser.email);
  await testGetCurrentUserNoToken();
  await testGetCurrentUserInvalidToken();

  // Test 9-10: Logout
  await testLogout(token);
  await testLogoutNoToken();

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Summary: Auth Login & Session`);
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
