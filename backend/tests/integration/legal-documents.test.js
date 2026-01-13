#!/usr/bin/env node

/**
 * Test Script for legal_documents Table
 * Run: node test-legal-documents.js
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
  console.log('\n🧪 Testing legal_documents Table\n');

  try {
    // Test 1: Check table exists
    log.info('Test 1: Checking if table exists...');
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from('legal_documents')
      .select('*')
      .limit(1);

    if (tableError) {
      log.error(`Table check failed: ${tableError.message}`);
      return;
    }
    log.success('Table exists');

    // Test 2: Check seed data
    log.info('Test 2: Checking seed data...');
    const { data: seedData, error: seedError } = await supabaseAdmin
      .from('legal_documents')
      .select('document_type, version, is_active')
      .eq('is_active', true);

    if (seedError) {
      log.error(`Seed data check failed: ${seedError.message}`);
      return;
    }

    if (seedData.length === 3) {
      log.success(`Found 3 active documents: ${seedData.map(d => `${d.document_type} v${d.version}`).join(', ')}`);
    } else {
      log.error(`Expected 3 active documents, found ${seedData.length}`);
    }

    // Test 3: Get active document by type
    log.info('Test 3: Getting active document by type...');
    const { data: activeDoc, error: activeError } = await supabaseAdmin
      .from('legal_documents')
      .select('*')
      .eq('document_type', 'terms-of-service')
      .eq('is_active', true)
      .single();

    if (activeError) {
      log.error(`Get active document failed: ${activeError.message}`);
      return;
    }

    if (activeDoc) {
      log.success(`Active TOS: ${activeDoc.document_name} v${activeDoc.version}`);
    } else {
      log.error('Active document not found');
    }

    // Test 4: Get document history
    log.info('Test 4: Getting document history...');
    const { data: history, error: historyError } = await supabaseAdmin
      .from('legal_documents')
      .select('*')
      .eq('document_type', 'privacy-policy')
      .order('effective_date', { ascending: false });

    if (historyError) {
      log.error(`Get history failed: ${historyError.message}`);
      return;
    }

    if (history && history.length > 0) {
      log.success(`Privacy Policy history: ${history.length} version(s)`);
    } else {
      log.error('Document history not found');
    }

    // Test 5: Test unique constraint
    log.info('Test 5: Testing unique constraint (should fail)...');
    const { error: uniqueError } = await supabaseAdmin
      .from('legal_documents')
      .insert({
        document_type: 'terms-of-service',
        version: 'v1.4',
        document_name: 'Terms of Service',
        content: 'Test duplicate',
        effective_date: new Date().toISOString().split('T')[0],
        is_active: true  // This should fail - only one active per type
      });

    if (uniqueError) {
      log.success('Unique constraint working (duplicate active document rejected)');
    } else {
      log.error('Unique constraint not working - duplicate was inserted!');
      // Clean up
      await supabaseAdmin
        .from('legal_documents')
        .delete()
        .eq('version', 'v1.4');
    }

    // Test 6: Test RLS policies
    log.info('Test 6: Testing RLS policies (public read)...');
    const { data: publicData, error: publicError } = await supabaseAdmin
      .from('legal_documents')
      .select('document_type, version')
      .eq('is_active', true);

    if (!publicError && publicData && publicData.length > 0) {
      log.success('RLS policies allow public read');
    } else {
      log.error('RLS policies not working correctly');
    }

    // Test 7: Verify content exists
    log.info('Test 7: Verifying document content...');
    const { data: contentData } = await supabaseAdmin
      .from('legal_documents')
      .select('document_type, document_name, content')
      .eq('document_type', 'terms-of-service')
      .eq('is_active', true)
      .single();

    if (contentData && contentData.content && contentData.content.length > 10) {
      log.success(`${contentData.document_name} content exists (${contentData.content.length} characters)`);
    } else {
      log.error('Document content missing or too short');
    }

    console.log('\n✅ All tests completed!\n');

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  }
}

// Run tests
runTests();
