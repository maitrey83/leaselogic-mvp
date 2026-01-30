#!/usr/bin/env node

/**
 * Auth Integration Test Runner
 * Runs all auth test suites and reports combined results
 */

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const testFiles = [
  'tests/integration/auth-register.test.js',
  'tests/integration/auth-login.test.js',
  'tests/integration/auth-profile.test.js'
];

let totalResults = {
  passed: 0,
  failed: 0,
  suites: []
};

function runTest(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}Running: ${testFile}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);

    const testPath = path.join(__dirname, testFile);
    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      env: process.env
    });

    child.on('exit', (code) => {
      if (code === 0) {
        totalResults.passed++;
        totalResults.suites.push({ file: testFile, passed: true });
        resolve();
      } else {
        totalResults.failed++;
        totalResults.suites.push({ file: testFile, passed: false });
        resolve(); // Continue to next test even if failed
      }
    });

    child.on('error', (error) => {
      totalResults.failed++;
      totalResults.suites.push({ file: testFile, passed: false, error: error.message });
      reject(error);
    });
  });
}

async function runAllTests() {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}🧪 Auth Integration Test Suite${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`Total test suites: ${testFiles.length}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  const startTime = Date.now();

  for (const testFile of testFiles) {
    await runTest(testFile);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print final summary
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}📊 FINAL TEST SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`Total Suites: ${testFiles.length}`);
  console.log(`${colors.green}✅ Passed: ${totalResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${totalResults.failed}${colors.reset}`);
  console.log(`Duration: ${duration}s`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  // Print suite details
  console.log('Suite Results:');
  totalResults.suites.forEach((suite, index) => {
    const status = suite.passed ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
    console.log(`  ${index + 1}. ${status} - ${suite.file}`);
    if (suite.error) {
      console.log(`     Error: ${suite.error}`);
    }
  });

  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  // Exit with appropriate code
  if (totalResults.failed > 0) {
    console.log(`${colors.red}❌ Some tests failed. Please review the output above.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ All auth integration tests passed!${colors.reset}\n`);
    process.exit(0);
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error(`${colors.red}Test runner failed:${colors.reset}`, error);
  process.exit(1);
});
