-- Migration: Formalize consent_logs Table
-- Date: 2025-11-25
-- Task: Phase 1, Task 1.5
-- Purpose: Add immutability, RLS, indexes, and constraints

-- ============================================================================
-- STEP 1: BACKUP EXISTING DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS consent_logs_backup AS 
SELECT * FROM consent_logs;

-- Verify backup
DO $$
DECLARE
  backup_count INTEGER;
  original_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO backup_count FROM consent_logs_backup;
  SELECT COUNT(*) INTO original_count FROM consent_logs;
  RAISE NOTICE 'Backup created: % records (original: %)', backup_count, original_count;
END $$;

-- ============================================================================
-- STEP 2: ADD NEW COLUMNS
-- ============================================================================

-- Add metadata column for extensibility
ALTER TABLE consent_logs 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ============================================================================
-- STEP 3: FIX EXISTING DATA (if needed)
-- ============================================================================

-- Ensure no NULL values in required fields
UPDATE consent_logs SET document_type = 'utah-3day-notice' WHERE document_type IS NULL;
UPDATE consent_logs SET consent_type = 'download-preview' WHERE consent_type IS NULL;
UPDATE consent_logs SET user_agent = 'Unknown' WHERE user_agent IS NULL;
UPDATE consent_logs SET policy_version = '{}'::jsonb WHERE policy_version IS NULL;

-- ============================================================================
-- STEP 4: ADD NOT NULL CONSTRAINTS
-- ============================================================================

ALTER TABLE consent_logs ALTER COLUMN document_type SET NOT NULL;
ALTER TABLE consent_logs ALTER COLUMN consent_type SET NOT NULL;
ALTER TABLE consent_logs ALTER COLUMN user_agent SET NOT NULL;
ALTER TABLE consent_logs ALTER COLUMN policy_version SET NOT NULL;
ALTER TABLE consent_logs ALTER COLUMN consented_at SET NOT NULL;

-- ============================================================================
-- STEP 5: ADD CHECK CONSTRAINTS
-- ============================================================================

-- Document type must be lowercase with hyphens
ALTER TABLE consent_logs 
ADD CONSTRAINT IF NOT EXISTS valid_document_type 
CHECK (document_type ~ '^[a-z0-9-]+$');

-- Consent type must be one of allowed values
ALTER TABLE consent_logs 
ADD CONSTRAINT IF NOT EXISTS valid_consent_type 
CHECK (consent_type IN (
  'download-preview', 
  'download-final', 
  'purchase', 
  'registration', 
  'account-creation'
));

-- ============================================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id 
ON consent_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_consent_logs_document_type 
ON consent_logs(document_type);

CREATE INDEX IF NOT EXISTS idx_consent_logs_consented_at 
ON consent_logs(consented_at DESC);

CREATE INDEX IF NOT EXISTS idx_consent_logs_user_document 
ON consent_logs(user_id, document_type);

-- ============================================================================
-- STEP 7: CREATE IMMUTABILITY TRIGGER (CRITICAL)
-- ============================================================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS immutable_consent_logs ON consent_logs;
DROP FUNCTION IF EXISTS prevent_consent_modification();

-- Create trigger function
CREATE OR REPLACE FUNCTION prevent_consent_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Consent logs are immutable and cannot be updated. Record ID: %', OLD.id;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Consent logs are immutable and cannot be deleted. Record ID: %', OLD.id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER immutable_consent_logs
  BEFORE UPDATE OR DELETE ON consent_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_consent_modification();

-- ============================================================================
-- STEP 8: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can insert consent logs" ON consent_logs;
DROP POLICY IF EXISTS "Users can view own consent logs" ON consent_logs;
DROP POLICY IF EXISTS "Service role can view all consent logs" ON consent_logs;

-- Policy 1: Service role can INSERT (backend API)
CREATE POLICY "Service role can insert consent logs"
  ON consent_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 2: Users can view their own consent history
CREATE POLICY "Users can view own consent logs"
  ON consent_logs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy 3: Service role can view all (for admin/support)
CREATE POLICY "Service role can view all consent logs"
  ON consent_logs
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- STEP 9: VERIFICATION
-- ============================================================================

-- Verify table structure
DO $$
DECLARE
  col_count INTEGER;
  idx_count INTEGER;
  trigger_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count columns
  SELECT COUNT(*) INTO col_count 
  FROM information_schema.columns 
  WHERE table_name = 'consent_logs';
  
  -- Count indexes
  SELECT COUNT(*) INTO idx_count 
  FROM pg_indexes 
  WHERE tablename = 'consent_logs';
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count 
  FROM pg_trigger 
  WHERE tgname = 'immutable_consent_logs';
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE tablename = 'consent_logs';
  
  RAISE NOTICE 'Migration verification:';
  RAISE NOTICE '  Columns: %', col_count;
  RAISE NOTICE '  Indexes: %', idx_count;
  RAISE NOTICE '  Triggers: %', trigger_count;
  RAISE NOTICE '  RLS Policies: %', policy_count;
  
  IF col_count < 9 THEN
    RAISE EXCEPTION 'Missing columns! Expected at least 9, found %', col_count;
  END IF;
  
  IF idx_count < 4 THEN
    RAISE WARNING 'Missing indexes! Expected at least 4, found %', idx_count;
  END IF;
  
  IF trigger_count < 1 THEN
    RAISE EXCEPTION 'Immutability trigger not created!';
  END IF;
  
  IF policy_count < 3 THEN
    RAISE WARNING 'Missing RLS policies! Expected 3, found %', policy_count;
  END IF;
  
  RAISE NOTICE '✅ Migration completed successfully!';
END $$;

-- ============================================================================
-- STEP 10: TEST IMMUTABILITY (Optional - comment out for production)
-- ============================================================================

-- Uncomment to test immutability (should fail)
/*
DO $$
DECLARE
  test_id UUID;
BEGIN
  -- Get a test record
  SELECT id INTO test_id FROM consent_logs LIMIT 1;
  
  IF test_id IS NOT NULL THEN
    BEGIN
      -- This should fail
      UPDATE consent_logs SET consent_type = 'test' WHERE id = test_id;
      RAISE EXCEPTION 'IMMUTABILITY TEST FAILED: Update was allowed!';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '✅ Immutability test passed: UPDATE blocked';
    END;
    
    BEGIN
      -- This should also fail
      DELETE FROM consent_logs WHERE id = test_id;
      RAISE EXCEPTION 'IMMUTABILITY TEST FAILED: Delete was allowed!';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '✅ Immutability test passed: DELETE blocked';
    END;
  END IF;
END $$;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary
SELECT 
  'consent_logs' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT document_type) as unique_document_types,
  COUNT(DISTINCT user_id) as unique_users,
  MIN(consented_at) as first_consent,
  MAX(consented_at) as last_consent
FROM consent_logs;
