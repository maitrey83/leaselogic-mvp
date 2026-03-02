Debug the issue described in: $ARGUMENTS

## Steps

1. Parse $ARGUMENTS for: error message, file path, or description of the problem
2. If an error message is provided:
   - Search the codebase for the error string using Grep
   - Trace the call stack from the error to identify the root cause
3. If a file is specified:
   - Read the file and its dependencies
   - Check for common issues in that layer
4. Check production logs:
   - Use `mcp__claude_ai_Supabase__get_logs` for database/auth/storage errors
   - Check Render logs if the user pastes them
5. Trace the execution path:
   - Frontend: `src/components/` or `src/pages/` -> `src/services/authService.js` or `src/utils/consentLogger.js` -> backend API
   - Backend: `backend/src/routes/` -> `backend/src/api/` or `backend/src/controllers/` -> `backend/src/services/` -> Supabase
6. Propose a fix with the specific file and line to change
7. Suggest how to verify the fix:
   - Locally: `cd backend && npm run test:integration` (52 tests)
   - Production: curl the endpoint or check Render logs

## Common issues in this project
- Puppeteer/Chrome memory: PdfGenerator must use singleton browser (`backend/src/services/PdfGenerator.js`)
- CORS: only `localhost:3000` and `leaselogic-mvp.vercel.app` allowed (`backend/src/server.js:24-27`)
- RLS violations: check Supabase policies if insert/update fails with code 42501
- Auth: protected routes need `authenticateUser` middleware from `backend/src/middleware/auth.js`
- API URL: frontend uses `REACT_APP_API_URL` env var, defaults to `http://localhost:5001`
