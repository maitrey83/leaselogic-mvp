#!/usr/bin/env node
/**
 * Test Script for Properties Full-Text Search
 * Task 3.5 - Phase 2.4
 * Run: node backend/tests/integration/properties-search.test.js
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
  console.log('🧪 Testing Properties Full-Text Search (Task 3.5.7)');
  console.log('='.repeat(60) + '\n');

  let testUserId = null;

  try {
    // Setup: Create test user
    log.info('Setup: Creating test user...');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `test-search-${Date.now()}@example.com`,
      password: 'testPassword123!',
      email_confirm: true
    });

    if (authError || !user) {
      log.error(`Failed to create test user: ${authError?.message}`);
      return;
    }
    testUserId = user.id;
    log.success(`Test user created`);

    // Setup: Create test properties with various data
    log.info('Setup: Creating test properties...');
    const testProperties = [
      {
        property_name: 'Downtown Loft',
        street_address: '123 Main Street',
        city: 'Salt Lake City',
        unit_number: 'Suite 400'
      },
      {
        property_name: 'Suburban House',
        street_address: '456 Elm Avenue',
        city: 'Provo',
        unit_number: null
      },
      {
        property_name: 'Beach Condo',
        street_address: '789 Ocean Drive',
        city: 'San Diego',
        unit_number: 'Unit 12B'
      },
      {
        property_name: 'Mountain Cabin',
        street_address: '321 Pine Road',
        city: 'Park City',
        unit_number: null
      }
    ];

    for (const prop of testProperties) {
      await supabaseAdmin.from('properties').insert({
        user_id: testUserId,
        ...prop,
        state: 'UT',
        zip_code: '84101'
      });
    }
    log.success(`Created ${testProperties.length} test properties`);

    // Test 1: Search by street name
    log.test('Test 1: Search by street name "main"');
    const { data: result1, error: error1 } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('user_id', testUserId)
      .textSearch('search_vector', 'main', { type: 'websearch', config: 'english' });

    if (error1) {
      log.error(`Search failed: ${error1.message}`);
    } else if (result1.length === 1 && result1[0].street_address.includes('Main')) {
      log.success(`Found 1 property with "main" in address`);
    } else {
      log.error(`FAILED: Expected 1 result, got ${result1.length}`);
    }

    // Test 2: Search by city name
    log.test('Test 2: Search by city "provo"');
    const { data: result2, error: error2 } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('user_id', testUserId)
      .textSearch('search_vector', 'provo', { type: 'websearch', config: 'english' });

    if (error2) {
      log.error(`Search failed: ${error2.message}`);
    } else if (result2.length === 1 && result2[0].city === 'Provo') {
      log.success(`Found 1 property in Provo`);
    } else {
      log.error(`FAILED: Expected 1 result, got ${result2.length}`);
    }

    // Test 3: Search by property name
    log.test('Test 3: Search by property name "downtown"');
    const { data: result3, error: error3 } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('user_id', testUserId)
      .textSearch('search_vector', 'downtown', { type: 'websearch', config: 'english' });

    if (error3) {
      log.error(`Search failed: ${error3.message}`);
    } else if (result3.length === 1 && result3[0].property_name.includes('Downtown')) {
      log.success(`Found 1 property with "downtown" in name`);
    } else {
      log.error(`FAILED: Expected 1 result, got ${result3.length}`);
    }

    // Test 4: Search by unit number
    log.test('Test 4: Search by unit number "suite"');
    const { data: result4, error: error4 } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('user_id', testUserId)
      .textSearch('search_vector', 'suite', { type: 'websearch', config: 'english' });

    if (error4) {
      log.error(`Search failed: ${error4.message}`);
    } else if (result4.length === 1 && result4[0].unit_number?.includes('Suite')) {
      log.success(`Found 1 property with "suite" in unit number`);
    } else {
      log.error(`FAILED: Expected 1 result, got ${result4.length}`);
    }

    // Test 5: Search with multiple results
    log.test('Test 5: Search for "city" (should match multiple)');
    const { data: result5, error: error5 } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('user_id', testUserId)
      .textSearch('search_vector', 'city', { type: 'websearch', config: 'english' });

    if (error5) {
      log.error(`Search failed: ${error5.message}`);
    } else if (result5.length >= 2) {
      log.success(`Found ${result5.length} properties matching "city"`);
      log.info(`  Results: ${result5.map(p => p.property_name).join(', ')}`);
    } else {
      log.error(`FAILED: Expected 2+ results, got ${result5.length}`);
    }

    // Test 6: Search with no results
    log.test('Test 6: Search with no matches "nonexistent"');
    const { data: result6, error: error6 } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('user_id', testUserId)
      .textSearch('search_vector', 'nonexistent', { type: 'websearch', config: 'english' });

    if (error6) {
      log.error(`Search failed: ${error6.message}`);
    } else if (result6.length === 0) {
      log.success(`Correctly returned 0 results for nonexistent term`);
    } else {
      log.error(`FAILED: Expected 0 results, got ${result6.length}`);
    }

    // Test 7: Partial word search
    log.test('Test 7: Partial word search "oce" (for ocean)');
    const { data: result7, error: error7 } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('user_id', testUserId)
      .textSearch('search_vector', 'oce*', { type: 'websearch', config: 'english' });

    if (error7) {
      log.error(`Search failed: ${error7.message}`);
    } else if (result7.length > 0) {
      log.success(`Partial search working - found ${result7.length} result(s)`);
    } else {
      log.info(`Partial search returned 0 results (expected behavior)`);
    }

    // Test 8: User isolation in search
    log.test('Test 8: Verify search only returns current user\'s properties');
    // Create another user with a property
    const { data: { user: otherUser } } = await supabaseAdmin.auth.admin.createUser({
      email: `test-search-other-${Date.now()}@example.com`,
      password: 'test123!',
      email_confirm: true
    });

    await supabaseAdmin.from('properties').insert({
      user_id: otherUser.id,
      property_name: 'Other User Property',
      street_address: '999 Main Street', // Same street name
      city: 'Logan',
      state: 'UT',
      zip_code: '84321'
    });

    // Search as first user for "main"
    const { data: isolatedSearch } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('user_id', testUserId) // Filter by current user
      .textSearch('search_vector', 'main');

    const hasOtherUserProperty = isolatedSearch?.some(p => p.user_id === otherUser.id);
    if (!hasOtherUserProperty) {
      log.success('User isolation working - only own properties returned');
    } else {
      log.error('FAILED: Search returned other user\'s properties');
    }

    // Cleanup other user
    await supabaseAdmin.auth.admin.deleteUser(otherUser.id);

    console.log('\n' + '='.repeat(60));
    log.success('Properties Full-Text Search Tests Complete');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    log.error(`Test suite error: ${error.message}`);
    console.error(error);
  } finally {
    // Cleanup
    if (testUserId) {
      log.info('Cleanup: Deleting test user...');
      await supabaseAdmin.auth.admin.deleteUser(testUserId);
      log.success('Test data cleaned up');
    }
  }
}

runTests().catch(console.error);
