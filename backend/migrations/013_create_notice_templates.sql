-- Migration 013: Create notice_templates Table
-- Task 3.7: Notice Templates
-- Purpose: Store user-defined templates for reusable form data
-- Created: 2026-01-26

-- ============================================================================
-- TABLE: notice_templates
-- ============================================================================
-- Stores reusable form templates for faster notice generation
-- Users can save frequently used form data and load it later

CREATE TABLE IF NOT EXISTS notice_templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,

  -- Template Metadata
  document_type TEXT NOT NULL CHECK (document_type IN ('utah-3day-notice', 'utah-rent-increase')),
  template_name TEXT NOT NULL,

  -- Template Data (JSONB stores all form field values)
  template_data JSONB NOT NULL,

  -- Usage Tracking
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique Constraint: Prevent duplicate template names per user/document type
  CONSTRAINT unique_user_template_name UNIQUE(user_id, template_name, document_type)
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE notice_templates IS 'Stores reusable form templates for notice generation';
COMMENT ON COLUMN notice_templates.id IS 'Unique template identifier';
COMMENT ON COLUMN notice_templates.user_id IS 'Owner of the template (FK to users)';
COMMENT ON COLUMN notice_templates.property_id IS 'Optional linked property (FK to properties)';
COMMENT ON COLUMN notice_templates.document_type IS 'Type of notice (utah-3day-notice or utah-rent-increase)';
COMMENT ON COLUMN notice_templates.template_name IS 'User-defined name for the template (e.g., "Standard 3-Day Notice")';
COMMENT ON COLUMN notice_templates.template_data IS 'JSONB storage of all form field values for pre-filling';
COMMENT ON COLUMN notice_templates.usage_count IS 'Number of times template has been loaded';
COMMENT ON COLUMN notice_templates.last_used_at IS 'Timestamp of last template use';
COMMENT ON COLUMN notice_templates.created_at IS 'Template creation timestamp';
COMMENT ON COLUMN notice_templates.updated_at IS 'Template last update timestamp';

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Performance optimization for common queries

-- Index on user_id for fast user-specific queries
CREATE INDEX idx_notice_templates_user_id
  ON notice_templates(user_id);

-- Index on document_type for filtering by document type
CREATE INDEX idx_notice_templates_document_type
  ON notice_templates(document_type);

-- Index on created_at for sorting (newest first)
CREATE INDEX idx_notice_templates_created_at
  ON notice_templates(created_at DESC);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
-- Automatically update updated_at timestamp on row updates

CREATE TRIGGER update_notice_templates_updated_at
  BEFORE UPDATE ON notice_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Ensure users can only access their own templates

-- Enable RLS
ALTER TABLE notice_templates ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own templates
CREATE POLICY "Users can view own templates"
  ON notice_templates FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can create templates
CREATE POLICY "Users can create templates"
  ON notice_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON notice_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON notice_templates FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- AUDIT TRIGGER (if audit system exists)
-- ============================================================================
-- Attach audit trigger if the audit_changes function exists

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'audit_changes'
  ) THEN
    CREATE TRIGGER audit_notice_templates
      AFTER INSERT OR UPDATE OR DELETE ON notice_templates
      FOR EACH ROW
      EXECUTE FUNCTION audit_changes();

    RAISE NOTICE 'Audit trigger attached to notice_templates table';
  ELSE
    RAISE NOTICE 'audit_changes function not found - skipping audit trigger';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table structure
DO $$
DECLARE
  table_exists BOOLEAN;
  rls_enabled BOOLEAN;
  policy_count INTEGER;
BEGIN
  -- Check table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'notice_templates'
  ) INTO table_exists;

  IF table_exists THEN
    RAISE NOTICE '✅ Table notice_templates created successfully';

    -- Check RLS enabled
    SELECT relrowsecurity
    FROM pg_class
    WHERE relname = 'notice_templates'
    INTO rls_enabled;

    IF rls_enabled THEN
      RAISE NOTICE '✅ RLS enabled on notice_templates';
    ELSE
      RAISE WARNING '⚠️  RLS not enabled on notice_templates';
    END IF;

    -- Check policies
    SELECT COUNT(*)
    FROM pg_policies
    WHERE tablename = 'notice_templates'
    INTO policy_count;

    RAISE NOTICE '✅ Created % RLS policies on notice_templates', policy_count;

    -- Check indexes
    RAISE NOTICE '✅ Indexes created on: user_id, document_type, created_at';

    -- Check unique constraint
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'unique_user_template_name'
    ) THEN
      RAISE NOTICE '✅ Unique constraint created: unique_user_template_name';
    END IF;

    -- Check trigger
    IF EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'update_notice_templates_updated_at'
    ) THEN
      RAISE NOTICE '✅ Trigger created: update_notice_templates_updated_at';
    END IF;

  ELSE
    RAISE EXCEPTION '❌ Failed to create notice_templates table';
  END IF;
END $$;

-- ============================================================================
-- SAMPLE USAGE (for testing)
-- ============================================================================

-- Example template_data structure:
-- {
--   "landlordName": "John Doe",
--   "landlordPhone": "(801) 555-1234",
--   "landlordEmail": "john@example.com",
--   "tenantNames": "Jane Smith",
--   "street": "123 Main St",
--   "city": "Salt Lake City",
--   "state": "UT",
--   "zipCode": "84101",
--   "pastDueAmount": "1200.00",
--   "originalDueDate": "2026-01-01",
--   "noticeDate": "2026-01-15"
-- }

-- Migration 013 Complete
-- notice_templates table ready for use
