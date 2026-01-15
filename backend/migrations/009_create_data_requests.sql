-- Migration 009: Create data_requests Table
-- Purpose: GDPR-compliant data export/deletion request tracking
-- Created: 2025-01-15
-- Task: Phase 2, Task 2.10
-- Status: PENDING

-- ============================================================================
-- 1. CREATE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_requests (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Key to users
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Request Details
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Additional Data
  export_url TEXT,  -- URL to download exported data (for export requests)
  notes TEXT,       -- Error messages or processing notes

  -- Standard timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add table comment
COMMENT ON TABLE data_requests IS 'GDPR-compliant data export and deletion request tracking';
COMMENT ON COLUMN data_requests.request_type IS 'Type of request: export (data portability) or delete (right to erasure)';
COMMENT ON COLUMN data_requests.status IS 'Request status: pending, processing, completed, or failed';
COMMENT ON COLUMN data_requests.export_url IS 'Temporary URL to download exported data (export requests only)';

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

-- Index on user_id (most common query - get user's requests)
CREATE INDEX IF NOT EXISTS idx_data_requests_user_id
  ON data_requests(user_id);

-- Index on status (filter pending/processing requests)
CREATE INDEX IF NOT EXISTS idx_data_requests_status
  ON data_requests(status);

-- Index on request_type (filter by export/delete)
CREATE INDEX IF NOT EXISTS idx_data_requests_type
  ON data_requests(request_type);

-- Index on requested_at (sort by date, find old requests)
CREATE INDEX IF NOT EXISTS idx_data_requests_requested_at
  ON data_requests(requested_at DESC);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_data_requests_user_status
  ON data_requests(user_id, status);

-- ============================================================================
-- 3. CREATE updated_at TRIGGER
-- ============================================================================

-- Reuse existing update_updated_at_column function from users table
DROP TRIGGER IF EXISTS update_data_requests_updated_at ON data_requests;
CREATE TRIGGER update_data_requests_updated_at
  BEFORE UPDATE ON data_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES
-- ============================================================================

-- Policy 1: Users can view their own data requests
DROP POLICY IF EXISTS "Users can view own data requests" ON data_requests;
CREATE POLICY "Users can view own data requests"
  ON data_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can create data requests for themselves
DROP POLICY IF EXISTS "Users can create own data requests" ON data_requests;
CREATE POLICY "Users can create own data requests"
  ON data_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Service role can do everything (for system processing)
DROP POLICY IF EXISTS "Service role full access to data requests" ON data_requests;
CREATE POLICY "Service role full access to data requests"
  ON data_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Note: No UPDATE policy for regular users - only system can update status
-- Note: No DELETE policy - requests are permanent records for audit trail

-- ============================================================================
-- 6. ADD AUDIT TRIGGER
-- ============================================================================

-- Apply audit trigger to track all changes to data_requests
DROP TRIGGER IF EXISTS audit_data_requests ON data_requests;
CREATE TRIGGER audit_data_requests
  AFTER INSERT OR UPDATE OR DELETE ON data_requests
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- 7. VERIFICATION
-- ============================================================================

-- Check table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'data_requests') THEN
    RAISE NOTICE '✅ data_requests table created';
  ELSE
    RAISE EXCEPTION '❌ data_requests table not found';
  END IF;
END $$;

-- Check indexes exist
DO $$
DECLARE
  idx_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO idx_count
  FROM pg_indexes
  WHERE tablename = 'data_requests'
    AND indexname LIKE 'idx_data_requests%';

  IF idx_count >= 4 THEN
    RAISE NOTICE '✅ % indexes created for data_requests', idx_count;
  ELSE
    RAISE EXCEPTION '❌ Expected at least 4 indexes, found %', idx_count;
  END IF;
END $$;

-- Check RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'data_requests'
      AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS enabled on data_requests';
  ELSE
    RAISE EXCEPTION '❌ RLS not enabled on data_requests';
  END IF;
END $$;

-- Check policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'data_requests';

  IF policy_count >= 3 THEN
    RAISE NOTICE '✅ % RLS policies created', policy_count;
  ELSE
    RAISE EXCEPTION '❌ Expected at least 3 policies, found %', policy_count;
  END IF;
END $$;

-- Check audit trigger exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'audit_data_requests'
  ) THEN
    RAISE NOTICE '✅ Audit trigger created for data_requests';
  ELSE
    RAISE EXCEPTION '❌ Audit trigger not found for data_requests';
  END IF;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Migration 009 complete: data_requests table operational';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Table: data_requests';
  RAISE NOTICE 'Indexes: user_id, status, request_type, requested_at, user_status';
  RAISE NOTICE 'RLS: Enabled with 3 policies';
  RAISE NOTICE 'Audit: Enabled via audit_data_requests trigger';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;

-- ============================================================================
-- PHASE 2: EXPORT FUNCTIONALITY
-- ============================================================================

-- ============================================================================
-- 8. CREATE export_user_data() FUNCTION
-- ============================================================================
-- GDPR Article 15 & 20: Right of Access and Data Portability
-- Returns all user data as JSONB for export

CREATE OR REPLACE FUNCTION export_user_data(
  p_user_id UUID,
  p_request_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_data JSONB;
  v_profile_data JSONB;
  v_sessions_data JSONB;
  v_consent_data JSONB;
  v_audit_data JSONB;
  v_data_requests_data JSONB;
  v_result JSONB;
  v_error_message TEXT;
BEGIN
  -- Update request status to processing (if request_id provided)
  IF p_request_id IS NOT NULL THEN
    UPDATE data_requests
    SET status = 'processing', updated_at = NOW()
    WHERE id = p_request_id AND user_id = p_user_id;
  END IF;

  BEGIN
    -- 1. Get user data (excluding sensitive auth fields)
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'full_name', u.full_name,
      'created_at', u.created_at,
      'updated_at', u.updated_at
    ) INTO v_user_data
    FROM users u
    WHERE u.id = p_user_id;

    IF v_user_data IS NULL THEN
      RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;

    -- 2. Get user profile data
    SELECT jsonb_build_object(
      'id', up.id,
      'subscription_plan', up.subscription_plan,
      'subscription_status', up.subscription_status,
      'subscription_start_date', up.subscription_start_date,
      'subscription_end_date', up.subscription_end_date,
      'notices_generated_this_month', up.notices_generated_this_month,
      'monthly_limit', up.monthly_limit,
      'billing_email', up.billing_email,
      'created_at', up.created_at,
      'updated_at', up.updated_at
    ) INTO v_profile_data
    FROM user_profiles up
    WHERE up.user_id = p_user_id;

    -- 3. Get sessions data (active and historical)
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'ip_address', s.ip_address::TEXT,
        'user_agent', s.user_agent,
        'created_at', s.created_at,
        'expires_at', s.expires_at,
        'last_activity', s.last_activity
      ) ORDER BY s.created_at DESC
    ), '[]'::jsonb) INTO v_sessions_data
    FROM sessions s
    WHERE s.user_id = p_user_id;

    -- 4. Get consent logs (legal requirement - always included)
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', cl.id,
        'document_type', cl.document_type,
        'consent_type', cl.consent_type,
        'policy_version', cl.policy_version,
        'ip_address', cl.ip_address,
        'user_agent', cl.user_agent,
        'consented_at', cl.consented_at,
        'metadata', cl.metadata
      ) ORDER BY cl.consented_at DESC
    ), '[]'::jsonb) INTO v_consent_data
    FROM consent_logs cl
    WHERE cl.user_id = p_user_id;

    -- 5. Get audit logs for this user
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', al.id,
        'table_name', al.table_name,
        'record_id', al.record_id,
        'action', al.action,
        'changed_fields', al.changed_fields,
        'changed_at', al.changed_at
      ) ORDER BY al.changed_at DESC
    ), '[]'::jsonb) INTO v_audit_data
    FROM audit_logs al
    WHERE al.changed_by = p_user_id;

    -- 6. Get data requests history
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', dr.id,
        'request_type', dr.request_type,
        'status', dr.status,
        'requested_at', dr.requested_at,
        'completed_at', dr.completed_at
      ) ORDER BY dr.requested_at DESC
    ), '[]'::jsonb) INTO v_data_requests_data
    FROM data_requests dr
    WHERE dr.user_id = p_user_id;

    -- Build final result
    v_result := jsonb_build_object(
      'export_info', jsonb_build_object(
        'exported_at', NOW(),
        'user_id', p_user_id,
        'request_id', p_request_id,
        'gdpr_articles', ARRAY['Article 15 - Right of Access', 'Article 20 - Data Portability']
      ),
      'user', v_user_data,
      'profile', COALESCE(v_profile_data, '{}'::jsonb),
      'sessions', v_sessions_data,
      'consent_logs', v_consent_data,
      'audit_logs', v_audit_data,
      'data_requests', v_data_requests_data
    );

    -- Update request status to completed (if request_id provided)
    IF p_request_id IS NOT NULL THEN
      UPDATE data_requests
      SET
        status = 'completed',
        completed_at = NOW(),
        notes = 'Export completed successfully',
        updated_at = NOW()
      WHERE id = p_request_id AND user_id = p_user_id;
    END IF;

    RETURN v_result;

  EXCEPTION
    WHEN OTHERS THEN
      v_error_message := SQLERRM;

      -- Update request status to failed (if request_id provided)
      IF p_request_id IS NOT NULL THEN
        UPDATE data_requests
        SET
          status = 'failed',
          completed_at = NOW(),
          notes = 'Export failed: ' || v_error_message,
          updated_at = NOW()
        WHERE id = p_request_id AND user_id = p_user_id;
      END IF;

      RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function comment
COMMENT ON FUNCTION export_user_data(UUID, UUID) IS
  'GDPR Article 15/20: Export all user data as JSONB for data portability';

-- ============================================================================
-- 9. PHASE 2 VERIFICATION
-- ============================================================================

-- Check export function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'export_user_data'
  ) THEN
    RAISE NOTICE '✅ export_user_data() function created';
  ELSE
    RAISE EXCEPTION '❌ export_user_data() function not found';
  END IF;
END $$;

-- Phase 2 success message
DO $$
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Phase 2 complete: export_user_data() function operational';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- GDPR Compliance:
-- - Article 15: Right of Access (export requests)
-- - Article 17: Right to Erasure (delete requests)
-- - Article 20: Right to Data Portability (export requests)
--
-- Security:
-- - Users can only view/create their own requests
-- - Only service role can update request status
-- - No delete policy - requests are permanent audit trail
--
-- Processing:
-- - export_user_data() function processes export requests (Phase 2 - DONE)
-- - delete_user_data() function processes delete requests (Phase 3 - PENDING)
--
