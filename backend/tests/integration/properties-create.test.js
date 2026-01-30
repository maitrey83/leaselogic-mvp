#!/usr/bin/env node
/**
 * Test Script for Properties Creation
 * Task 3.5 - Phase 2.2
 * Run: node backend/tests/integration/properties-create.test.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
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
  info: (msg) => console.log(`${colors.yellow}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.blue}🧪 ${msg}${colors.reset}`)
};

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Testing Properties Creation (Task 3.5.5)');
  console.log('='.repeat(60) + '\n');

  let testUserId = null;
  let createdPropertyId = null;

  try {
    // Setup: Create a test user
    log.info('Setup: Creating test user...');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `test-prop-create-${Date.now()}@example.com`,
      password: 'testPassword123!',
      email_confirm: true
    });

    if (authError || !user) {
      log.error(`Failed to create test user: ${authError?.message}`);
      return;
    }
    testUserId = user.id;
    log.success(`Test user created: ${user.email}`);

    // Test 1: Create property with all fields
    log.test('Test 1: Create property with all fields');
    const { data: property1, error: error1 } = await supabaseAdmin
      .from('properties')
      .insert({
        user_id: testUserId,
        property_name: 'Test Downtown Property',
        street_address: '123 Main St',
        unit_number: 'Apt 4B',
        city: 'Salt Lake City',
        state: 'UT',
        zip_code: '84101',
        property_type: 'apartment',
        notes: 'Test property with all fields'
      })
      .select()
      .single();

    if (error1) {
      log.error(`Failed to create property: ${error1.message}`);
    } else {
      log.success('Property created with all fields');
      log.info(`  Property ID: ${property1.id}`);
      log.info(`  Name: ${property1.property_name}`);
      createdPropertyId = property1.id;
    }

    // Test 2: Create property with required fields only
    log.test('Test 2: Create property with required fields only');
    const { data: property2, error: error2 } = await supabaseAdmin
      .from('properties')
      .insert({
        user_id: testUserId,
        street_address: '456 Elm St',
        city: 'Provo',
        state: 'UT',
        zip_code: '84601'
      })
      .select()
      .single();

    if (error2) {
      log.error(`Failed to create minimal property: ${error2.message}`);
    } else {
      log.success('Property created with required fields only');
      log.info(`  Property ID: ${property2.id}`);
    }

    // Test 3: Create property with invalid zip code (should fail)
    log.test('Test 3: Create property with invalid zip code (should fail)');
    const { data: property3, error: error3 } = await supabaseAdmin
      .from('properties')
      .insert({
        user_id: testUserId,
        street_address: '789 Oak Ave',
        city: 'Ogden',
        state: 'UT',
        zip_code: 'ABCDE' // Invalid
      })
      .select()
      .single();

    if (error3) {
      log.success('Correctly rejected invalid zip code');
      log.info(`  Error: ${error3.message}`);
    } else {
      log.error('FAILED: Should have rejected invalid zip code');
    }

    // Test 4: Create property with invalid property type (should fail)
    log.test('Test 4: Create property with invalid property type (should fail)');
    const { data: property4, error: error4 } = await supabaseAdmin
      .from('properties')
      .insert({
        user_id: testUserId,
        street_address: '789 Pine St',
        city: 'Logan',
        state: 'UT',
        zip_code: '84321',
        property_type: 'invalid-type' // Not in enum
      })
      .select()
      .single();

    if (error4) {
      log.success('Correctly rejected invalid property type');
      log.info(`  Error: ${error4.message}`);
    } else {
      log.error('FAILED: Should have rejected invalid property type');
    }

    // Test 5: Create property without required field (should fail)
    log.test('Test 5: Create property without street_address (should fail)');
    const { data: property5, error: error5 } = await supabaseAdmin
      .from('properties')
      .insert({
        user_id: testUserId,
        city: 'St. George',
        state: 'UT',
        zip_code: '84770'
        // Missing street_address
      })
      .select()
      .single();

    if (error5) {
      log.success('Correctly rejected missing required field');
      log.info(`  Error: ${error5.message}`);
    } else {
      log.error('FAILED: Should have rejected missing street_address');
    }

    // Test 6: Verify search_vector auto-population
    log.test('Test 6: Verify search_vector is automatically populated');
    if (createdPropertyId) {
      const { data: checkProperty, error: checkError } = await supabaseAdmin
        .from('properties')
        .select('search_vector')
        .eq('id', createdPropertyId)
        .single();

      if (checkError) {
        log.error(`Failed to check search_vector: ${checkError.message}`);
      } else if (checkProperty.search_vector) {
        log.success('Search vector automatically populated by trigger');
      } else {
        log.error('FAILED: Search vector not populated');
      }
    }

    // Test 7: Verify timestamps
    log.test('Test 7: Verify created_at and updated_at timestamps');
    if (createdPropertyId) {
      const { data: timeProperty, error: timeError } = await supabaseAdmin
        .from('properties')
        .select('created_at, updated_at')
        .eq('id', createdPropertyId)
        .single();

      if (timeError) {
        log.error(`Failed to check timestamps: ${timeError.message}`);
      } else if (timeProperty.created_at && timeProperty.updated_at) {
        log.success('Timestamps automatically set');
        log.info(`  Created: ${timeProperty.created_at}`);
        log.info(`  Updated: ${timeProperty.updated_at}`);
      } else {
        log.error('FAILED: Timestamps not set');
      }
    }

    console.log('\n' + '='.repeat(60));
    log.success('Property Creation Tests Complete');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    log.error(`Test suite error: ${error.message}`);
    console.error(error);
  } finally {
    // Cleanup: Delete test user (cascade deletes properties)
    if (testUserId) {
      log.info('Cleanup: Deleting test user and properties...');
      await supabaseAdmin.auth.admin.deleteUser(testUserId);
      log.success('Test data cleaned up');
    }
  }
}

runTests().catch(console.error);
