#!/usr/bin/env node

/**
 * Test Script for user_profiles Table
 * Run: node tests/integration/user-profiles.test.js
 */

require('dotenv').config();
const { supabaseAdmin } = require('../../src/config/supabase');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}ℹ️  ${msg}${colors.reset}`)
};

async function runTests() {
  console.log('\n🧪 Testing user_profiles Table\n');

  try {
    // Test 1: Check table exists
    log.info('Test 1: Checking if table exists...');
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      log.error(`Table check failed: ${tableError.message}`);
      return;
    }
    log.success('user_profiles table exists');

    // Test 2: Check table structure
    log.info('Test 2: Checking table structure...');
    const { data: profiles } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      const hasRequiredFields = 
        profile.hasOwnProperty('user_id') &&
        profile.hasOwnProperty('subscription_plan') &&
        profile.hasOwnProperty('notices_generated_this_month') &&
        profile.hasOwnProperty('monthly_limit');
      
      if (hasRequiredFields) {
        log.success('Table structure correct');
      } else {
        log.error('Table missing required fields');
      }
    } else {
      log.success('Table structure ready (no profiles yet)');
    }

    // Test 3: Test auto-create profile trigger
    log.info('Test 3: Testing auto-create profile trigger...');
    const testEmail = `profile-test-${Date.now()}@test.com`;
    
    // Create test user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'Test123!',
      email_confirm: true
    });

    if (authError) {
      log.error(`User creation failed: ${authError.message}`);
      return;
    }

    // Wait for trigger
    await new Promise(r => setTimeout(r, 1000));

    // Check if profile was created
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      log.error(`Profile auto-create failed: ${profileError.message}`);
    } else if (profileData) {
      log.success(`Profile auto-created with plan: ${profileData.subscription_plan}`);
    } else {
      log.error('Profile not created by trigger');
    }

    // Test 4: Test increment_usage_counter function
    log.info('Test 4: Testing increment_usage_counter...');
    const { data: newCount, error: incrementError } = await supabaseAdmin
      .rpc('increment_usage_counter', { target_user_id: authData.user.id });

    if (incrementError) {
      log.error(`Increment failed: ${incrementError.message}`);
    } else {
      log.success(`Usage incremented to: ${newCount}`);
    }

    // Test 5: Test check_usage_limit function
    log.info('Test 5: Testing check_usage_limit...');
    const { data: underLimit, error: limitError } = await supabaseAdmin
      .rpc('check_usage_limit', { target_user_id: authData.user.id });

    if (limitError) {
      log.error(`Limit check failed: ${limitError.message}`);
    } else {
      log.success(`Under limit: ${underLimit} (used: ${newCount}/3)`);
    }

    // Test 6: Test subscription plan change
    // NOTE: Phase 4 - This direct update will be replaced with Stripe webhook integration
    // See: requirements/Phases/guides/TASK-4.6-stripe-webhooks.md
    log.info('Test 6: Testing subscription plan change...');
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ subscription_plan: 'basic' })
      .eq('user_id', authData.user.id)
      .select()
      .single();

    if (updateError) {
      log.error(`Plan update failed: ${updateError.message}`);
    } else if (updatedProfile.monthly_limit === 25) {
      log.success(`Plan changed to basic, limit updated to: ${updatedProfile.monthly_limit}`);
    } else {
      log.error('Monthly limit not updated correctly');
    }

    // Test 7: Test reset_monthly_usage function
    log.info('Test 7: Testing reset_monthly_usage...');
    const { data: resetCount, error: resetError } = await supabaseAdmin
      .rpc('reset_monthly_usage');

    if (resetError) {
      log.error(`Reset failed: ${resetError.message}`);
    } else {
      log.success(`Monthly usage reset for ${resetCount} users`);
    }

    // Verify reset worked
    const { data: resetProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('notices_generated_this_month')
      .eq('user_id', authData.user.id)
      .single();

    if (resetProfile && resetProfile.notices_generated_this_month === 0) {
      log.success('Usage counter reset to 0');
    } else {
      log.error('Usage counter not reset');
    }

    // Cleanup
    log.info('Cleaning up test user...');
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    log.success('Test user deleted');

    console.log('\n✅ All tests completed!\n');

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  }
}

// Run tests
runTests();
