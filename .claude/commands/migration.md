Review or apply a database migration: $ARGUMENTS

## Steps

### If $ARGUMENTS is empty — list migrations:
1. Read all files in `backend/migrations/` and list them in order
2. Run via Supabase MCP: `list_migrations` to see what's applied
3. Compare and report:
   - Applied migrations (in DB)
   - Pending migrations (in code but not applied)
   - Any drift between code and DB

### If $ARGUMENTS is a SQL file path — review before applying:
1. Read the migration file
2. Check for:
   - RLS policies (every new table MUST have RLS enabled)
   - Indexes on foreign keys and frequently queried columns
   - `updated_at` trigger if the table has that column
   - No destructive operations without explicit user confirmation (DROP TABLE, DROP COLUMN)
3. Show a summary of what the migration does
4. Ask for confirmation before applying via Supabase MCP `apply_migration`

### If $ARGUMENTS is "apply [filename]":
1. Read and review the file (same checks as above)
2. Apply via Supabase MCP `apply_migration`
3. Verify by running `list_migrations` after

## Migration conventions
- Files named: `NNN_description.sql` (e.g., `014_create_payments.sql`)
- Always enable RLS: `ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;`
- Always add `updated_at` trigger for tables with that column
- Service role key bypasses RLS — use for admin operations only

## Tables (as of Feb 2026)
12 LeaseLogic tables in public schema. Run `list_tables` to get current list.
