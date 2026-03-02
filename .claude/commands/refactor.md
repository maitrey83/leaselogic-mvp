Analyze the specified file for refactoring opportunities: $ARGUMENTS

## Steps

1. Read the file specified in $ARGUMENTS
2. Identify:
   - Code duplication (especially repeated fetch patterns in `src/components/`)
   - Functions longer than 50 lines
   - Deeply nested conditionals
   - Missing error boundaries in React components
   - Repeated Supabase query patterns that could be extracted to `backend/src/api/`
3. For each finding, propose a specific refactoring with a code sketch
4. Do NOT modify any files — present proposals for approval first

## Rules
- Never touch `backend/src/controllers/` — MVP code, Strangler Fig pattern
- New abstractions go in `backend/src/api/` (backend) or `src/utils/` (frontend)
- Keep it simple — no premature abstractions for one-time operations
- Respect existing patterns: config-driven documents (`src/config/documents/`), centralized auth (`src/context/AuthContext.js`)
