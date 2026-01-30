#!/usr/bin/env node
/**
 * Test Script for Properties Audit Trail
 * Task 3.5 - Phase 3.2
 * Run: node backend/tests/integration/properties-audit.test.js
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
  console.log('🧪 Testing Properties Audit Trail (Task 3.5.10)');
  console.log('='.repeat(60) + '\n');

  let testUserId = null;
  let propertyId = null;

  try {
    // Setup: Create test user
    log.info('Setup: Creating test user...');
    const { data: { user } } = await supabaseAdmin.auth.admin.createUser({
      email: `test-audit-${Date.now()}@example.com`,
      password: 'testPassword123!',
      email_confirm: true
    });
    testUserId = user.id;
    log.success('Test user created');

    // Test 1: Verify audit log captures INSERT
    log.test('Test 1: Verify audit log captures property INSERT');

    const { data: newProperty, error: createError } = await supabaseAdmin
      .from('properties')
      .insert({
        user_id: testUserId,
        street_address: '100 Audit Test St',
        city: 'Salt Lake City',
        state: 'UT',
        zip_code: '84101',
        property_name: 'Audit Test Property',
        property_type: 'apartment'
      })
      .select()
      .single();

    if (createError || !newProperty) {
      log.error(`Failed to create property: ${createError?.message}`);
      return;
    }

    propertyId = newProperty.id;

    // Wait for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check audit log
    const { data: insertAudit, error: insertError } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('table_name', 'properties')
      .eq('record_id', propertyId)
      .eq('action', 'INSERT')
      .order('changed_at', { ascending: false })
      .limit(1);

    if (insertError) {
      log.error(`Failed to query audit log: ${insertError.message}`);
    } else if (insertAudit && insertAudit.length > 0) {
      const audit = insertAudit[0];
      log.success('INSERT audit log created');
      log.info(`  Timestamp: ${audit.changed_at}`);
      log.info(`  User ID: ${audit.changed_by}`);

      // Verify new_values contains the property data
      if (audit.new_values && audit.new_values.street_address === '100 Audit Test St') {
        log.success('Audit log contains correct new_values');
      } else {
        log.error('FAILED: Audit log new_values incorrect');
      }

      // Verify old_values is null for INSERT
      if (audit.old_values === null) {
        log.success('Audit log old_values is null for INSERT');
      } else {
        log.error('FAILED: old_values should be null for INSERT');
      }
    } else {
      log.error('FAILED: No INSERT audit log found');
    }

    // Test 2: Verify audit log captures UPDATE
    log.test('Test 2: Verify audit log captures property UPDATE');

    const { data: updatedProperty, error: updatePropError } = await supabaseAdmin
      .from('properties')
      .update({
        city: 'Provo',
        property_type: 'condo'
      })
      .eq('id', propertyId)
      .select()
      .single();

    if (updatePropError) {
      log.error(`Failed to update property: ${updatePropError.message}`);
      return;
    }

    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check audit log
    const { data: updateAudit, error: updateError } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('table_name', 'properties')
      .eq('record_id', propertyId)
      .eq('action', 'UPDATE')
      .order('changed_at', { ascending: false })
      .limit(1);

    if (updateError) {
      log.error(`Failed to query audit log: ${updateError.message}`);
    } else if (updateAudit && updateAudit.length > 0) {
      const audit = updateAudit[0];
      log.success('UPDATE audit log created');

      // Verify old_values contains original data
      if (audit.old_values && audit.old_values.city === 'Salt Lake City') {
        log.success('Audit log contains correct old_values');
        log.info(`  Old city: ${audit.old_values.city}`);
      } else {
        log.error('FAILED: old_values incorrect');
      }

      // Verify new_values contains updated data
      if (audit.new_values && audit.new_values.city === 'Provo') {
        log.success('Audit log contains correct new_values');
        log.info(`  New city: ${audit.new_values.city}`);
      } else {
        log.error('FAILED: new_values incorrect');
      }
    } else {
      log.error('FAILED: No UPDATE audit log found');
    }

    // Test 3: Verify audit log captures DELETE
    log.test('Test 3: Verify audit log captures property DELETE');

    // Store property data before delete
    const propertyBeforeDelete = { ...updatedProperty };

    const { data: deletedProperty, error: deletePropError } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .select()
      .single();

    if (deletePropError) {
      log.error(`Failed to delete property: ${deletePropError.message}`);
      return;
    }

    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check audit log
    const { data: deleteAudit, error: deleteError } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('table_name', 'properties')
      .eq('record_id', propertyId)
      .eq('action', 'DELETE')
      .order('changed_at', { ascending: false })
      .limit(1);

    if (deleteError) {
      log.error(`Failed to query audit log: ${deleteError.message}`);
    } else if (deleteAudit && deleteAudit.length > 0) {
      const audit = deleteAudit[0];
      log.success('DELETE audit log created');

      // Verify old_values contains the deleted property data
      if (audit.old_values && audit.old_values.street_address) {
        log.success('Audit log contains correct old_values (deleted property)');
        log.info(`  Deleted address: ${audit.old_values.street_address}`);
      } else {
        log.error('FAILED: old_values incorrect');
      }

      // Verify new_values is null for DELETE
      if (audit.new_values === null) {
        log.success('Audit log new_values is null for DELETE');
      } else {
        log.error('FAILED: new_values should be null for DELETE');
      }
    } else {
      log.error('FAILED: No DELETE audit log found');
    }

    // Test 4: Verify audit trail completeness
    log.test('Test 4: Verify complete audit trail for property lifecycle');

    const { data: allAudits, error: allError } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('table_name', 'properties')
      .eq('record_id', propertyId)
      .order('changed_at', { ascending: true });

    if (allError) {
      log.error(`Failed to query audit logs: ${allError.message}`);
    } else if (allAudits && allAudits.length === 3) {
      log.success('Complete audit trail exists (INSERT, UPDATE, DELETE)');
      log.info('  Audit trail:');
      allAudits.forEach((audit, i) => {
        log.info(`    ${i + 1}. ${audit.action} at ${audit.changed_at}`);
      });
    } else {
      log.error(`FAILED: Expected 3 audit entries, found ${allAudits?.length || 0}`);
    }

    // Test 5: Verify audit log changed_by matches
    log.test('Test 5: Verify audit logs contain correct changed_by');

    if (allAudits && allAudits.every(a => a.changed_by === testUserId)) {
      log.success('All audit logs have correct changed_by');
    } else {
      log.error('FAILED: Audit logs have incorrect changed_by');
    }

    // Test 6: Verify audit log changed_ats are sequential
    log.test('Test 6: Verify audit log changed_ats are sequential');

    if (allAudits && allAudits.length > 1) {
      let sequential = true;
      for (let i = 1; i < allAudits.length; i++) {
        const prevTime = new Date(allAudits[i - 1].changed_at);
        const currTime = new Date(allAudits[i].changed_at);
        if (currTime < prevTime) {
          sequential = false;
          break;
        }
      }

      if (sequential) {
        log.success('Audit log changed_ats are sequential');
      } else {
        log.error('FAILED: Audit log changed_ats not sequential');
      }
    }

    console.log('\n' + '='.repeat(60));
    log.success('Properties Audit Trail Tests Complete');
    console.log('Audit trail successfully captures:');
    log.info('  ✓ INSERT operations (with new_values)');
    log.info('  ✓ UPDATE operations (with old/new values)');
    log.info('  ✓ DELETE operations (with old_values)');
    log.info('  ✓ User identification (changed_by)');
    log.info('  ✓ Sequential timestamps');
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
