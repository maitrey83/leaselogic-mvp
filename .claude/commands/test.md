Run tests and report results: $ARGUMENTS

## Steps

### Backend integration tests (default if no args)
1. Run `cd backend && npm run test:integration`
2. Expected: 52 tests passing
3. Report: pass/fail count, failing test names with file paths
4. For any failures, read the test file and the code it tests, then suggest a fix
5. Do NOT modify files until approved

### Backend unit tests
1. If $ARGUMENTS contains "unit": run `cd backend && npm test`
2. Report results same as above

### Specific test
1. If $ARGUMENTS is a file path, run that test directly

## Test locations
- Integration tests: `backend/tests/integration/` via `backend/run-integration-tests.js`
- Unit tests: `backend/__tests__/` via Jest (`backend/package.json` jest config)
- Playwright E2E: `Playwright/e2e/` (framework set up, tests not yet written)

## Rules
- Always run tests BEFORE suggesting they pass — never assume
- If a test fails due to environment (missing env vars, DB connection), flag it as an env issue not a code bug
