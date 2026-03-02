Review the staged diff or specified file: $ARGUMENTS

## Steps

1. If $ARGUMENTS is empty, run `git diff --staged` to get staged changes
2. If $ARGUMENTS is a file path, read that file
3. Review for the following categories:

### Security (critical for a legal document platform)
- SQL injection via raw queries (should use Supabase client, not raw SQL)
- XSS in React components (dangerouslySetInnerHTML, unescaped user input)
- Auth bypass (routes missing `authenticateUser` middleware in `backend/src/routes/`)
- Secrets in code (API keys, tokens — never commit `.env` or `.mcp.json`)
- RLS gaps (new Supabase tables must have RLS enabled)

### Architecture rules
- Never modify files in `backend/src/controllers/` (Strangler Fig — MVP code)
- New features go in `backend/src/api/` layer
- Never ship `PUT /api/profiles/subscription` to production
- Feature flags must start OFF in production (`src/config/featureFlags.js`)
- No `git add .` or `git add -A` — stage specific files

### Code quality
- Express routes: auth middleware present on protected endpoints
- React: proper cleanup in useEffect, no memory leaks
- Supabase: using `supabaseAdmin` (service role) only on backend, never on frontend
- Error handling: catch blocks that swallow errors silently
- PDF generation: never launch new browser per request (use singleton in `PdfGenerator.js`)

4. Output findings grouped by severity: CRITICAL > HIGH > MEDIUM > LOW
