#!/usr/bin/env node

/**
 * Run All Integration Tests
 * Usage: node run-integration-tests.js
 */

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const tests = [
  'tests/integration/sessions.test.js',
  'tests/integration/user-profiles.test.js',
  'tests/integration/api-endpoints.test.js',
  'tests/integration/audit-logs.test.js'
];

let currentTest = 0;
let passedTests = 0;
let failedTests = 0;

console.log(`${colors.blue}🧪 Running All Integration Tests${colors.reset}\n`);

function runTest(testPath) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}Running: ${testPath}${colors.reset}`);
    console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    const test = spawn('node', [testPath], {
      stdio: 'inherit',
      cwd: __dirname
    });

    test.on('close', (code) => {
      if (code === 0) {
        passedTests++;
        console.log(`\n${colors.green}✅ ${testPath} passed${colors.reset}\n`);
        resolve();
      } else {
        failedTests++;
        console.log(`\n${colors.red}❌ ${testPath} failed${colors.reset}\n`);
        resolve(); // Continue with other tests
      }
    });

    test.on('error', (error) => {
      failedTests++;
      console.error(`${colors.red}Error running ${testPath}:${colors.reset}`, error);
      resolve();
    });
  });
}

async function runAllTests() {
  for (const test of tests) {
    await runTest(test);
    currentTest++;
  }

  // Summary
  console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📊 Test Summary${colors.reset}`);
  console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`Total: ${tests.length} test suites`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  if (failedTests > 0) {
    console.log(`${colors.red}❌ Some tests failed${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ All integration tests passed!${colors.reset}\n`);
    process.exit(0);
  }
}

runAllTests().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
