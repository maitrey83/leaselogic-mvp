-- ============================================================================
-- LeaseLogic Database - Legal Compliance Tables (PRIORITY 1)
-- Created: 2025-11-21
-- Purpose: Consent logging, audit trails, GDPR compliance
-- ============================================================================

-- ============================================================================
-- TABLE 1: consent_logs (HIGHEST PRIORITY)
-- Purpose: Immutable proof of user consent to legal policies
-- ============================================================================

CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'utah-3day-pay-or-quit', 'utah-rent-increase', etc.
  legal_document_id UUID, -- Links to legal_documents table
  consent_type TEXT NOT NULL, -- 'download-preview', 'download-final', 'purchase', 'registration'
  policy_version TEXT NOT NULL, -- 'v1.3'
  ip_address INET NOT NULL, -- Server-side captured IP (legal evidence)
  user_agent TEXT, -- Browser/device info
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_consent_logs_user_id ON consent_logs(user_id);
CREATE INDEX idx_consent_logs_document_type ON consent_logs(document_type);
CREATE INDEX idx_consent_logs_consented_at ON consent_logs(consented_at);

-- Enable Row Level Security
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own consent logs
CREATE POLICY "Users can view own consent logs"
  ON consent_logs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Only service role can insert (server-side only)
CREATE POLICY "Service role can insert consent logs"
  ON consent_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Immutability trigger: Prevent updates and deletes
CREATE OR REPLACE FUNCTION prevent_consent_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Consent logs are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_consent_update
  BEFORE UPDATE ON consent_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_consent_modification();

CREATE TRIGGER prevent_consent_delete
  BEFORE DELETE ON consent_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_consent_modification();

-- ============================================================================
-- TABLE 2: legal_documents
-- Purpose: Track versions of legal policies (TOS, Privacy, Cookie)
-- ============================================================================

CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL, -- 'terms-of-service', 'privacy-policy', 'cookie-policy'
  document_name TEXT NOT NULL,
  version TEXT NOT NULL, -- 'v1.3'
  content TEXT NOT NULL, -- Full document content
  effective_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: Only one active document per type
CREATE UNIQUE INDEX idx_legal_documents_active 
  ON legal_documents(document_type, document_name) 
  WHERE is_active = true;

-- Enable RLS
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read active documents
CREATE POLICY "Anyone can read active legal documents"
  ON legal_documents FOR SELECT
  USING (is_active = true);

-- Seed initial documents (v1.3)
INSERT INTO legal_documents (document_type, document_name, version, content, effective_date) VALUES
('terms-of-service', 'Terms of Service', 'v1.3', 'Full TOS content from /terms-of-service page', '2025-11-21'),
('privacy-policy', 'Privacy Policy', 'v1.3', 'Full Privacy Policy content from /privacy-policy page', '2025-11-21'),
('cookie-policy', 'Cookie Policy', 'v1.3', 'Full Cookie Policy content from /cookie-policy page', '2025-11-21')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TABLE 3: audit_logs
-- Purpose: Complete audit trail of all database changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  document_type TEXT, -- For document-specific auditing
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB, -- Previous values (for UPDATE/DELETE)
  new_values JSONB, -- New values (for INSERT/UPDATE)
  changed_fields TEXT[], -- List of changed field names
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);
CREATE INDEX idx_audit_logs_document_type ON audit_logs(document_type);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view audit logs for their own records
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (changed_by = auth.uid());

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Triggers will be applied to tables as they are created

-- ============================================================================
-- TABLE 4: data_requests
-- Purpose: GDPR/CPRA data subject requests (export/delete)
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  export_url TEXT, -- For export requests
  notes TEXT
);

-- Indexes
CREATE INDEX idx_data_requests_user_id ON data_requests(user_id);
CREATE INDEX idx_data_requests_status ON data_requests(status);

-- Enable RLS
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own requests
CREATE POLICY "Users can view own data requests"
  ON data_requests FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own requests
CREATE POLICY "Users can create data requests"
  ON data_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- GDPR Functions
-- ============================================================================

-- Function: Export user data
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', target_user_id,
    'exported_at', NOW(),
    'consent_logs', (SELECT jsonb_agg(row_to_json(c)) FROM consent_logs c WHERE c.user_id = target_user_id),
    'data_requests', (SELECT jsonb_agg(row_to_json(d)) FROM data_requests d WHERE d.user_id = target_user_id)
    -- Add more tables as they are created
  ) INTO user_data;
  
  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete user data (soft delete, preserve legal records)
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- DO NOT delete consent_logs (legal requirement to preserve)
  -- DO NOT delete audit_logs (legal requirement to preserve)
  -- DO NOT delete payment records (legal requirement - 7 years)
  
  -- Mark data_requests as completed
  UPDATE data_requests 
  SET status = 'completed', completed_at = NOW()
  WHERE user_id = target_user_id AND request_type = 'delete';
  
  -- Future: Anonymize user_profiles, properties, etc. (when those tables exist)
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('consent_logs', 'legal_documents', 'audit_logs', 'data_requests')
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('consent_logs', 'legal_documents', 'audit_logs', 'data_requests');

-- Check legal documents seeded
SELECT document_type, document_name, version, effective_date, is_active 
FROM legal_documents 
ORDER BY document_type;

-- ============================================================================
-- DEPLOYMENT COMPLETE
-- ============================================================================
-- Next Steps:
-- 1. Create backend API endpoint: POST /api/consent/log
-- 2. Update consentLogger.js to call API instead of localStorage
-- 3. Test consent logging with real IP capture
-- 4. Verify immutability (try to UPDATE/DELETE consent_logs - should fail)
-- ============================================================================
