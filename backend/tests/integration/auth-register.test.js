#!/usr/bin/env node

/**
 * Integration Tests: Auth Registration
 * Tests: POST /api/auth/register
 * Coverage: Registration flow, validation, error handling
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

// Generate unique email for test user
const generateTestEmail = () => `test-auth-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;

async function testRegisterSuccess() {
  log.test('Test 1: Register new user (happy path)');

  try {
    const testEmail = generateTestEmail();
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        fullName: 'Test User'
      })
    });

    const data = await response.json();

    // Verify response status
    if (response.status !== 201) {
      recordResult('Register success - status code', false, `Expected 201, got ${response.status}`);
      return null;
    }
    recordResult('Register success - status code', true);

    // Verify response structure
    if (!data.user || !data.user.id || !data.user.email) {
      recordResult('Register success - response structure', false, 'Missing user data');
      return null;
    }
    recordResult('Register success - response structure', true);

    // Verify email matches
    if (data.user.email !== testEmail) {
      recordResult('Register success - email match', false, `Email mismatch: ${data.user.email} vs ${testEmail}`);
      return null;
    }
    recordResult('Register success - email match', true);

    // Verify message
    if (!data.message || !data.message.includes('successfully')) {
      recordResult('Register success - success message', false, 'No success message');
      return null;
    }
    recordResult('Register success - success message', true);

    return { email: testEmail, userId: data.user.id };
  } catch (error) {
    recordResult('Register success', false, error.message);
    return null;
  }
}

async function testRegisterMissingEmail() {
  log.test('Test 2: Register without email (validation)');

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'TestPassword123!',
        fullName: 'Test User'
      })
    });

    const data = await response.json();

    // Should return 400
    if (response.status !== 400) {
      recordResult('Missing email - status code', false, `Expected 400, got ${response.status}`);
      return;
    }
    recordResult('Missing email - status code', true);

    // Should have error message
    if (!data.error || !data.error.toLowerCase().includes('email')) {
      recordResult('Missing email - error message', false, 'No email error message');
      return;
    }
    recordResult('Missing email - error message', true);

  } catch (error) {
    recordResult('Missing email', false, error.message);
  }
}

async function testRegisterMissingPassword() {
  log.test('Test 3: Register without password (validation)');

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: generateTestEmail(),
        fullName: 'Test User'
      })
    });

    const data = await response.json();

    if (response.status !== 400) {
      recordResult('Missing password - status code', false, `Expected 400, got ${response.status}`);
      return;
    }
    recordResult('Missing password - status code', true);

    if (!data.error || !data.error.toLowerCase().includes('password')) {
      recordResult('Missing password - error message', false, 'No password error message');
      return;
    }
    recordResult('Missing password - error message', true);

  } catch (error) {
    recordResult('Missing password', false, error.message);
  }
}

async function testRegisterDuplicateEmail(existingEmail) {
  log.test('Test 4: Register with duplicate email (conflict)');

  if (!existingEmail) {
    log.info('Skipping duplicate email test (no existing user)');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: existingEmail,
        password: 'DifferentPassword123!',
        fullName: 'Another User'
      })
    });

    const data = await response.json();

    // Should return 400 (duplicate)
    if (response.status !== 400) {
      recordResult('Duplicate email - status code', false, `Expected 400, got ${response.status}`);
      return;
    }
    recordResult('Duplicate email - status code', true);

    // Should have error message about duplicate/existing
    if (!data.error) {
      recordResult('Duplicate email - error message', false, 'No error message');
      return;
    }
    recordResult('Duplicate email - error message', true);

  } catch (error) {
    recordResult('Duplicate email', false, error.message);
  }
}

async function testRegisterInvalidEmail() {
  log.test('Test 5: Register with invalid email format');

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'TestPassword123!',
        fullName: 'Test User'
      })
    });

    const data = await response.json();

    // Should return 400
    if (response.status !== 400) {
      recordResult('Invalid email - status code', false, `Expected 400, got ${response.status}`);
      return;
    }
    recordResult('Invalid email - status code', true);

    // Should have error message
    if (!data.error) {
      recordResult('Invalid email - error message', false, 'No error message');
      return;
    }
    recordResult('Invalid email - error message', true);

  } catch (error) {
    recordResult('Invalid email', false, error.message);
  }
}

async function testRegisterWithOptionalFullName() {
  log.test('Test 6: Register without fullName (optional field)');

  try {
    const testEmail = generateTestEmail();
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!'
        // fullName omitted
      })
    });

    const data = await response.json();

    // Should succeed (fullName is optional)
    if (response.status !== 201) {
      recordResult('Optional fullName - status code', false, `Expected 201, got ${response.status}`);
      return;
    }
    recordResult('Optional fullName - status code', true);

    // User should be created
    if (!data.user || !data.user.id) {
      recordResult('Optional fullName - user created', false, 'User not created');
      return;
    }
    recordResult('Optional fullName - user created', true);

  } catch (error) {
    recordResult('Optional fullName', false, error.message);
  }
}

async function testRegisterEmptyBody() {
  log.test('Test 7: Register with empty request body');

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const data = await response.json();

    if (response.status !== 400) {
      recordResult('Empty body - status code', false, `Expected 400, got ${response.status}`);
      return;
    }
    recordResult('Empty body - status code', true);

    if (!data.error) {
      recordResult('Empty body - error message', false, 'No error message');
      return;
    }
    recordResult('Empty body - error message', true);

  } catch (error) {
    recordResult('Empty body', false, error.message);
  }
}

async function testRegisterWeakPassword() {
  log.test('Test 8: Register with weak password');

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: generateTestEmail(),
        password: '123',  // Very weak
        fullName: 'Test User'
      })
    });

    const data = await response.json();

    // Should return 400 (Supabase password requirements)
    if (response.status !== 400) {
      recordResult('Weak password - status code', false, `Expected 400, got ${response.status}`);
      return;
    }
    recordResult('Weak password - status code', true);

    // Should have error message
    if (!data.error) {
      recordResult('Weak password - error message', false, 'No error message');
      return;
    }
    recordResult('Weak password - error message', true);

  } catch (error) {
    recordResult('Weak password', false, error.message);
  }
}

async function runAllTests() {
  log.suite('Auth Registration Integration Tests');
  log.info(`Testing API at: ${API_URL}`);

  // Test 1: Happy path - create first user
  const firstUser = await testRegisterSuccess();

  // Test 2-3: Validation tests
  await testRegisterMissingEmail();
  await testRegisterMissingPassword();

  // Test 4: Duplicate email (using first user)
  await testRegisterDuplicateEmail(firstUser?.email);

  // Test 5: Invalid email format
  await testRegisterInvalidEmail();

  // Test 6: Optional fullName
  await testRegisterWithOptionalFullName();

  // Test 7: Empty body
  await testRegisterEmptyBody();

  // Test 8: Weak password
  await testRegisterWeakPassword();

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Summary: Auth Registration`);
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
