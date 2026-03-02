Run a production smoke test checklist.

## Steps

1. Check backend health:
   ```
   curl -s https://leaselogic-backend.onrender.com/api/health
   ```
   - Expected: 200 with JSON response
   - Note: First request may take 30-60s (Render free tier cold start)

2. Check frontend is up:
   ```
   curl -s -o /dev/null -w "%{http_code}" https://leaselogic-mvp.vercel.app
   ```
   - Expected: 200

3. Check API endpoints respond (unauthenticated — expect 401):
   ```
   curl -s -w "\n%{http_code}" https://leaselogic-backend.onrender.com/api/documents
   curl -s -w "\n%{http_code}" https://leaselogic-backend.onrender.com/api/sessions/cleanup
   ```
   - Expected: 401 (means auth middleware is working)

4. Check CORS headers:
   ```
   curl -s -I -H "Origin: https://leaselogic-mvp.vercel.app" https://leaselogic-backend.onrender.com/api/health
   ```
   - Expected: `access-control-allow-origin: https://leaselogic-mvp.vercel.app`

5. Check database connectivity (via health endpoint or direct):
   - If health endpoint returns DB status, report it
   - Otherwise note that DB check requires auth

## Output format

```
## Smoke Test Results

| Check                | Status | Details          |
|----------------------|--------|------------------|
| Backend health       | ✅/❌  | [response]       |
| Frontend reachable   | ✅/❌  | HTTP [code]      |
| Auth middleware       | ✅/❌  | [401 or not]     |
| CORS headers         | ✅/❌  | [origin header]  |
| Database             | ✅/❌  | [status]         |

### Issues Found
- [any failures with suggested fixes]
```

## Rules
- Wait up to 60s for first backend response (cold start)
- If backend times out, suggest checking Render dashboard — don't assume code is broken
- Never send real user data in smoke test requests
