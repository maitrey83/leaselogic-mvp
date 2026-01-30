#!/usr/bin/env node

/**
 * Templates Load Integration Tests
 * Task 3.7: Test template load and list functionality
 * Run: node tests/integration/templates-load.test.js
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

async function createTemplate(templateData, token) {
  const { response, data } = await makeRequest('POST', '/api/templates', templateData, token);
  if (response.status !== 201) {
    throw new Error(`Failed to create template: ${data.error}`);
  }
  return data.template;
}

async function runTests() {
  console.log(`\n${colors.blue}🧪 Testing Template Load & List Functionality${colors.reset}\n`);

  let testUserId;
  let testUserToken;
  let testPropertyId;
  let createdTemplateIds = [];

  try {
    // Setup: Create test user
    log.info('Setup: Creating test user...');
    const testEmail = `templates-load-${Date.now()}@test.com`;
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

    // Setup: Create multiple templates for testing
    log.info('Setup: Creating test templates...');

    const template1 = await createTemplate({
      template_name: 'Template 1',
      document_type: 'utah-3day-notice',
      template_data: { landlordName: 'John', tenantNames: 'Alice' }
    }, testUserToken);
    createdTemplateIds.push(template1.id);

    await new Promise(resolve => setTimeout(resolve, 100)); // Ensure different timestamps

    const template2 = await createTemplate({
      template_name: 'Template 2',
      document_type: 'utah-3day-notice',
      template_data: { landlordName: 'Jane', tenantNames: 'Bob' }
    }, testUserToken);
    createdTemplateIds.push(template2.id);

    await new Promise(resolve => setTimeout(resolve, 100));

    const template3 = await createTemplate({
      template_name: 'Template 3',
      document_type: 'utah-rent-increase',
      template_data: { landlordName: 'Bob', tenantNames: 'Charlie' }
    }, testUserToken);
    createdTemplateIds.push(template3.id);

    log.success('Created 3 test templates');

    // Test 1: List all templates
    log.info('Test 1: List all templates...');
    const { response: r1, data: d1 } = await makeRequest(
      'GET',
      '/api/templates',
      null,
      testUserToken
    );

    if (r1.status !== 200 || !d1.success) {
      throw new Error('Failed to list templates');
    }
    if (d1.count !== 3) {
      throw new Error(`Expected 3 templates, got ${d1.count}`);
    }
    if (!Array.isArray(d1.templates)) {
      throw new Error('templates should be an array');
    }
    log.success(`Listed ${d1.count} templates`);

    // Test 2: Verify sorted by created_at DESC (newest first)
    log.info('Test 2: Verify sort order (newest first)...');
    const dates = d1.templates.map(t => new Date(t.created_at).getTime());
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i] < dates[i + 1]) {
        throw new Error('Templates not sorted by created_at DESC');
      }
    }
    log.success('Templates correctly sorted (newest first)');

    // Test 3: Filter by document_type (utah-3day-notice)
    log.info('Test 3: Filter by document_type...');
    const { response: r3, data: d3 } = await makeRequest(
      'GET',
      '/api/templates?document_type=utah-3day-notice',
      null,
      testUserToken
    );

    if (r3.status !== 200 || !d3.success) {
      throw new Error('Failed to filter by document_type');
    }
    if (d3.count !== 2) {
      throw new Error(`Expected 2 utah-3day-notice templates, got ${d3.count}`);
    }
    const allCorrectType = d3.templates.every(t => t.document_type === 'utah-3day-notice');
    if (!allCorrectType) {
      throw new Error('Filter returned wrong document types');
    }
    log.success('Filtered by document_type correctly');

    // Test 4: Filter by document_type (utah-rent-increase)
    log.info('Test 4: Filter by rent-increase document type...');
    const { response: r4, data: d4 } = await makeRequest(
      'GET',
      '/api/templates?document_type=utah-rent-increase',
      null,
      testUserToken
    );

    if (r4.status !== 200 || !d4.success) {
      throw new Error('Failed to filter by rent-increase');
    }
    if (d4.count !== 1) {
      throw new Error(`Expected 1 rent-increase template, got ${d4.count}`);
    }
    log.success('Filtered rent-increase correctly');

    // Test 5: Get single template by ID
    log.info('Test 5: Get single template...');
    const { response: r5, data: d5 } = await makeRequest(
      'GET',
      `/api/templates/${template1.id}`,
      null,
      testUserToken
    );

    if (r5.status !== 200 || !d5.success) {
      throw new Error('Failed to get single template');
    }
    if (d5.template.id !== template1.id) {
      throw new Error('Template ID mismatch');
    }
    if (d5.template.template_name !== 'Template 1') {
      throw new Error('Template name mismatch');
    }
    if (!d5.template.template_data || typeof d5.template.template_data !== 'object') {
      throw new Error('template_data not returned correctly');
    }
    log.success('Got single template correctly');

    // Test 6: Verify template_data is accessible
    log.info('Test 6: Verify template_data accessibility...');
    if (!d5.template.template_data.landlordName) {
      throw new Error('template_data fields not accessible');
    }
    if (d5.template.template_data.landlordName !== 'John') {
      throw new Error('template_data value mismatch');
    }
    log.success('template_data accessible and correct');

    // Test 7: User isolation (create second user)
    log.info('Test 7: Test user isolation...');

    const user2Email = `templates-load-2-${Date.now()}@test.com`;
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

    // User 2 should see 0 templates
    const { response: r7, data: d7 } = await makeRequest(
      'GET',
      '/api/templates',
      null,
      user2Token
    );

    if (r7.status !== 200 || !d7.success) {
      throw new Error('Failed to list templates for user 2');
    }
    if (d7.count !== 0) {
      throw new Error(`User 2 should see 0 templates, got ${d7.count}`);
    }
    log.success('User isolation enforced correctly');

    // Cleanup user 2
    await supabaseAdmin.auth.admin.deleteUser(user2Id);

    // Test 8: Get invalid template ID (should fail with 404)
    log.info('Test 8: Get invalid template ID (should fail)...');
    const { response: r8, data: d8 } = await makeRequest(
      'GET',
      '/api/templates/00000000-0000-0000-0000-000000000000',
      null,
      testUserToken
    );

    if (r8.status !== 404) {
      throw new Error(`Expected 404, got ${r8.status}`);
    }
    log.success('Invalid template ID correctly rejected');

    // Test 9: Verify response fields
    log.info('Test 9: Verify response fields...');
    const firstTemplate = d1.templates[0];
    const requiredFields = [
      'id', 'user_id', 'document_type', 'template_name',
      'template_data', 'usage_count', 'created_at', 'updated_at'
    ];

    for (const field of requiredFields) {
      if (!(field in firstTemplate)) {
        throw new Error(`Missing field in response: ${field}`);
      }
    }
    log.success('All required fields present in response');

    // Test 10: Empty list when no templates
    log.info('Test 10: Test empty list...');

    // Delete all templates
    for (const templateId of createdTemplateIds) {
      await makeRequest('DELETE', `/api/templates/${templateId}`, null, testUserToken);
    }
    createdTemplateIds = [];

    const { response: r10, data: d10 } = await makeRequest(
      'GET',
      '/api/templates',
      null,
      testUserToken
    );

    if (r10.status !== 200 || !d10.success) {
      throw new Error('Failed to list empty templates');
    }
    if (d10.count !== 0) {
      throw new Error(`Expected 0 templates after deletion, got ${d10.count}`);
    }
    if (!Array.isArray(d10.templates) || d10.templates.length !== 0) {
      throw new Error('Empty list should return empty array');
    }
    log.success('Empty list returned correctly');

    console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}✅ All load tests passed!${colors.reset}`);
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
