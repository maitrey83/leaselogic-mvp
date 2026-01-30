#!/usr/bin/env node

/**
 * Templates Save Integration Tests
 * Task 3.7: Test template save functionality
 * Run: node tests/integration/templates-save.test.js
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

async function runTests() {
  console.log(`\n${colors.blue}🧪 Testing Template Save Functionality${colors.reset}\n`);

  let testUserId;
  let testUserToken;
  let testPropertyId;
  let createdTemplateIds = [];

  try {
    // Setup: Create test user
    log.info('Setup: Creating test user...');
    const testEmail = `templates-save-${Date.now()}@test.com`;
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
    log.success('Test property created');

    // Test 1: Save template with all fields
    log.info('Test 1: Save template with all fields...');
    const template1Data = {
      template_name: 'Standard 3-Day Notice',
      document_type: 'utah-3day-notice',
      template_data: {
        landlordName: 'John Doe',
        landlordPhone: '(801) 555-1234',
        landlordEmail: 'john@example.com',
        tenantNames: 'Jane Smith',
        street: '123 Main St',
        city: 'Salt Lake City',
        state: 'UT',
        zipCode: '84101',
        pastDueAmount: '1200.00',
        originalDueDate: '2026-01-01',
        noticeDate: '2026-01-15'
      },
      property_id: testPropertyId
    };

    const { response: r1, data: d1 } = await makeRequest(
      'POST',
      '/api/templates',
      template1Data,
      testUserToken
    );

    if (r1.status !== 201 || !d1.success) {
      throw new Error(`Expected 201, got ${r1.status}: ${d1.error}`);
    }
    if (!d1.template || !d1.template.id) {
      throw new Error('Template not returned in response');
    }
    if (d1.template.template_name !== 'Standard 3-Day Notice') {
      throw new Error('Template name mismatch');
    }
    if (d1.template.document_type !== 'utah-3day-notice') {
      throw new Error('Document type mismatch');
    }
    if (d1.template.usage_count !== 0) {
      throw new Error('Initial usage_count should be 0');
    }

    createdTemplateIds.push(d1.template.id);
    log.success('Template saved with all fields');

    // Test 2: Save template without property_id (should work)
    log.info('Test 2: Save template without property_id...');
    const template2Data = {
      template_name: 'Generic Notice Template',
      document_type: 'utah-rent-increase',
      template_data: {
        landlordName: 'Jane Doe',
        landlordEmail: 'jane@example.com'
      }
    };

    const { response: r2, data: d2 } = await makeRequest(
      'POST',
      '/api/templates',
      template2Data,
      testUserToken
    );

    if (r2.status !== 201 || !d2.success) {
      throw new Error('Failed to save template without property_id');
    }
    if (d2.template.property_id !== null) {
      throw new Error('property_id should be null');
    }

    createdTemplateIds.push(d2.template.id);
    log.success('Template saved without property_id');

    // Test 3: Try to save duplicate template name (should fail with 409)
    log.info('Test 3: Save duplicate template name (should fail)...');
    const duplicateData = {
      template_name: 'Standard 3-Day Notice',
      document_type: 'utah-3day-notice',
      template_data: { landlordName: 'Test' }
    };

    const { response: r3, data: d3 } = await makeRequest(
      'POST',
      '/api/templates',
      duplicateData,
      testUserToken
    );

    if (r3.status !== 409) {
      throw new Error(`Expected 409 Conflict, got ${r3.status}`);
    }
    if (!d3.error || !d3.error.toLowerCase().includes('already exists')) {
      throw new Error('Error message should mention duplicate');
    }
    log.success('Duplicate template name correctly rejected');

    // Test 4: Save template without authentication (should fail with 401)
    log.info('Test 4: Save without authentication (should fail)...');
    const { response: r4 } = await makeRequest(
      'POST',
      '/api/templates',
      template1Data,
      null // No token
    );

    if (r4.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${r4.status}`);
    }
    log.success('Unauthenticated request correctly rejected');

    // Test 5: Save with invalid document_type (should fail with 400)
    log.info('Test 5: Save with invalid document_type (should fail)...');
    const invalidTypeData = {
      template_name: 'Invalid Template',
      document_type: 'invalid-type',
      template_data: { test: 'data' }
    };

    const { response: r5, data: d5 } = await makeRequest(
      'POST',
      '/api/templates',
      invalidTypeData,
      testUserToken
    );

    if (r5.status !== 400) {
      throw new Error(`Expected 400 Bad Request, got ${r5.status}`);
    }
    if (!d5.error || !d5.error.toLowerCase().includes('invalid document_type')) {
      throw new Error('Error should mention invalid document_type');
    }
    log.success('Invalid document_type correctly rejected');

    // Test 6: Save with missing template_name (should fail with 400)
    log.info('Test 6: Save with missing template_name (should fail)...');
    const missingNameData = {
      document_type: 'utah-3day-notice',
      template_data: { test: 'data' }
    };

    const { response: r6, data: d6 } = await makeRequest(
      'POST',
      '/api/templates',
      missingNameData,
      testUserToken
    );

    if (r6.status !== 400) {
      throw new Error(`Expected 400 Bad Request, got ${r6.status}`);
    }
    log.success('Missing template_name correctly rejected');

    // Test 7: Save with empty template_data (should fail with 400)
    log.info('Test 7: Save with empty template_data (should fail)...');
    const emptyDataTemplate = {
      template_name: 'Empty Template',
      document_type: 'utah-3day-notice',
      template_data: {}
    };

    const { response: r7, data: d7 } = await makeRequest(
      'POST',
      '/api/templates',
      emptyDataTemplate,
      testUserToken
    );

    if (r7.status !== 400) {
      throw new Error(`Expected 400 Bad Request, got ${r7.status}`);
    }
    log.success('Empty template_data correctly rejected');

    // Test 8: Verify template stored in database
    log.info('Test 8: Verify template in database...');
    const { data: dbTemplate, error: dbError } = await supabaseAdmin
      .from('notice_templates')
      .select('*')
      .eq('id', createdTemplateIds[0])
      .single();

    if (dbError || !dbTemplate) {
      throw new Error('Template not found in database');
    }
    if (dbTemplate.user_id !== testUserId) {
      throw new Error('Template user_id mismatch');
    }
    if (typeof dbTemplate.template_data !== 'object') {
      throw new Error('template_data should be JSONB object');
    }
    log.success('Template correctly stored in database');

    // Test 9: Save with invalid property_id (should fail with 404)
    log.info('Test 9: Save with invalid property_id (should fail)...');
    const invalidPropertyData = {
      template_name: 'Test Template 9',
      document_type: 'utah-3day-notice',
      template_data: { test: 'data' },
      property_id: '00000000-0000-0000-0000-000000000000'
    };

    const { response: r9, data: d9 } = await makeRequest(
      'POST',
      '/api/templates',
      invalidPropertyData,
      testUserToken
    );

    if (r9.status !== 404) {
      throw new Error(`Expected 404 Not Found, got ${r9.status}`);
    }
    log.success('Invalid property_id correctly rejected');

    // Test 10: Same template name allowed for different document type
    log.info('Test 10: Same name for different document type...');
    const sameNameDiffType = {
      template_name: 'Standard 3-Day Notice',
      document_type: 'utah-rent-increase', // Different type
      template_data: { landlordName: 'Test' }
    };

    const { response: r10, data: d10 } = await makeRequest(
      'POST',
      '/api/templates',
      sameNameDiffType,
      testUserToken
    );

    if (r10.status !== 201 || !d10.success) {
      throw new Error('Should allow same name for different document type');
    }
    createdTemplateIds.push(d10.template.id);
    log.success('Same name allowed for different document type');

    console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}✅ All save tests passed!${colors.reset}`);
    console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Cleanup
    log.info('Cleanup: Deleting test data...');

    for (const templateId of createdTemplateIds) {
      await supabaseAdmin.from('notice_templates').delete().eq('id', templateId);
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
