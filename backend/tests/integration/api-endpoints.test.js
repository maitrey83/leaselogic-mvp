#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Tests
 * Tests: Auth, Legal Documents, and integration
 */

require('dotenv').config();
const { supabaseAdmin } = require('../../src/config/supabase');

const API_BASE = `http://127.0.0.1:${process.env.PORT || 5001}`;

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

const testEmail = `test-${Date.now()}@leaselogic.com`;
const testPassword = 'Test123!@#';
let accessToken = null;
let userId = null;

async function runTests() {
  console.log('\n🚀 API Endpoint Testing Suite\n');

  try {
    // Test 5: Register new user
    log.test('Test 5: POST /api/auth/register');
    const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: 'Test User'
      })
    });

    let registerData;
    try {
      const contentType = registerRes.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        registerData = await registerRes.json();
      } else {
        const text = await registerRes.text();
        log.error(`Expected JSON, got: ${text.substring(0, 200)}`);
        return;
      }
    } catch (error) {
      log.error(`Failed to parse response: ${error.message}`);
      return;
    }
    
    if (registerRes.ok && registerData.user) {
      userId = registerData.user.id;
      log.success(`User registered: ${registerData.user.email}`);
      
      // Verify user in users table
      const { data: userRecord } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userRecord) {
        log.success('Trigger worked: User record auto-created');
      } else {
        log.error('Trigger failed: No user record created');
      }
    } else {
      log.error(`Registration failed: ${registerData.error || 'Unknown error'}`);
      return;
    }

    // Test 6: Login
    log.test('Test 6: POST /api/auth/login');
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginData = await loginRes.json();
    
    if (loginRes.ok && loginData.session) {
      accessToken = loginData.session.access_token;
      log.success(`Login successful: Token received`);
    } else {
      log.error(`Login failed: ${loginData.error || 'Unknown error'}`);
      return;
    }

    // Test 7: Get current user
    log.test('Test 7: GET /api/auth/me');
    const meRes = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const meData = await meRes.json();
    
    if (meRes.ok && meData.id) {
      log.success(`Get user successful: ${meData.email}`);
    } else {
      log.error(`Get user failed: ${meData.error || 'Unknown error'}`);
    }

    // Test 8: Update profile
    log.test('Test 8: PUT /api/auth/profile');
    const profileRes = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: 'Updated Test User'
      })
    });
    
    const profileData = await profileRes.json();
    
    if (profileRes.ok) {
      log.success('Profile updated successfully');
    } else {
      log.error(`Profile update failed: ${profileData.error || 'Unknown error'}`);
    }

    // Test 9: Get all active legal documents
    log.test('Test 9: GET /api/legal/active');
    const legalRes = await fetch(`${API_BASE}/api/legal/active`);
    const legalData = await legalRes.json();
    
    if (legalRes.ok && Array.isArray(legalData) && legalData.length === 3) {
      log.success(`Got ${legalData.length} active legal documents`);
    } else {
      log.error('Failed to get legal documents');
    }

    // Test 10: Get specific legal document
    log.test('Test 10: GET /api/legal/terms-of-service/active');
    const tosRes = await fetch(`${API_BASE}/api/legal/terms-of-service/active`);
    const tosData = await tosRes.json();
    
    if (tosRes.ok && tosData.document_name) {
      log.success(`Got TOS: ${tosData.document_name} v${tosData.version}`);
    } else {
      log.error('Failed to get TOS');
    }

    // Test 11: Get document history
    log.test('Test 11: GET /api/legal/privacy-policy/history');
    const historyRes = await fetch(`${API_BASE}/api/legal/privacy-policy/history`);
    const historyData = await historyRes.json();
    
    if (historyRes.ok && Array.isArray(historyData)) {
      log.success(`Got ${historyData.length} version(s) of Privacy Policy`);
    } else {
      log.error('Failed to get document history');
    }

    // Test 12: Log consent
    log.test('Test 12: POST /api/consent/log');
    const consentRes = await fetch(`${API_BASE}/api/consent/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        documentType: 'utah-3day-pay-or-quit',
        consentType: 'download-preview',
        policyVersion: 'v1.3'
      })
    });
    
    const consentData = await consentRes.json();
    
    if (consentRes.ok) {
      log.success('Consent logged successfully');
    } else {
      log.error(`Consent logging failed: ${consentData.error || 'Unknown error'}`);
    }

    console.log('\n✅ All API tests completed!\n');
    
    // Cleanup
    log.info('Cleaning up test user...');
    await supabaseAdmin.auth.admin.deleteUser(userId);
    log.success('Test user deleted');

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  }
}

// Check if backend is running
fetch(`${API_BASE}/api/legal/active`)
  .then(() => {
    log.success('Backend is running');
    runTests();
  })
  .catch(() => {
    log.error('Backend is not running. Start it with: npm start');
    process.exit(1);
  });
