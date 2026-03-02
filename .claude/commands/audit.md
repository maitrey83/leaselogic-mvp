Run a security and compliance audit: $ARGUMENTS

## Steps

### If $ARGUMENTS is empty — full audit:

#### 1. API Route Security
- Read `backend/src/server.js` to find all mounted routes
- For each route file in `backend/src/routes/`, check that:
  - All non-public endpoints use `authenticateUser` middleware
  - Public endpoints are intentionally public (document with reason)
- Report: protected vs unprotected endpoint count

#### 2. Supabase RLS
- Run `list_tables` via Supabase MCP
- For each table, check RLS is enabled
- Report: tables with/without RLS

#### 3. Environment & Secrets
- Verify `.env` is in `.gitignore`
- Verify `.mcp.json` is in `.gitignore`
- Scan for hardcoded secrets: search for patterns like `sk_`, `sbp_`, `eyJ` in source files
- Report: any secrets found in code

#### 4. CORS
- Read `backend/src/server.js` CORS configuration
- Verify only allowed origins: localhost + Vercel URL
- Report: CORS status

#### 5. Input Validation
- Check API routes for SQL injection risk (parameterized queries vs string concat)
- Check for XSS in any user-facing HTML generation
- Report: any risks found

### If $ARGUMENTS is "routes" — route-only audit (steps 1 + 4)
### If $ARGUMENTS is "database" — DB-only audit (step 2)
### If $ARGUMENTS is "secrets" — secrets-only scan (step 3)

## Output format

```
## Security Audit Report

### Route Security: [PASS/WARN]
- X/Y endpoints protected
- Unprotected: [list with justification]

### Database RLS: [PASS/WARN]
- X/Y tables have RLS enabled

### Secrets: [PASS/WARN]
- .env gitignored: Yes/No
- Hardcoded secrets found: Yes/No

### CORS: [PASS/WARN]
- Allowed origins: [list]

### Action Items
- [ ] [any fixes needed]
```

## Rules
- This is a code audit, NOT a legal compliance review
- Do not claim documents are "legally compliant" — they are based on Utah statute requirements
- Flag issues by severity: CRITICAL (fix now), WARN (fix soon), INFO (nice to have)
