-- Migration: Create notices table for notice metadata storage
-- Task 3.6 - Phase 1: Database Setup
-- Architecture: On-demand PDF generation (no storage)
-- Date: 2026-01-21

-- ============================================================================
-- NOTICES TABLE
-- ============================================================================
-- Stores notice metadata for generated legal notices
-- PDFs are generated on-demand from form_data JSONB (not stored)

CREATE TABLE IF NOT EXISTS notices (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  payment_id UUID, -- Will add foreign key in Phase 4 when payments table created

  -- Notice Metadata
  document_type TEXT NOT NULL CHECK (document_type IN ('utah-3day-notice', 'utah-rent-increase')),
  notice_type TEXT NOT NULL CHECK (notice_type IN ('preview', 'final')),

  -- Form Data (CRITICAL for on-demand PDF regeneration)
  -- Stores complete form field values as JSONB
  -- Must contain ALL fields needed to regenerate PDF
  form_data JSONB NOT NULL,

  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Download Tracking
  download_count INT DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Performance optimization for common queries

-- User-based queries (most common)
CREATE INDEX idx_notices_user_id ON notices(user_id);

-- Property-based queries (filter by property)
CREATE INDEX idx_notices_property_id ON notices(property_id);

-- Document type filtering
CREATE INDEX idx_notices_document_type ON notices(document_type);

-- Sorting by generation date (DESC for recent first)
CREATE INDEX idx_notices_generated_at ON notices(generated_at DESC);

-- Payment-based queries (future use)
CREATE INDEX idx_notices_payment_id ON notices(payment_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enforce user isolation - users can only access their own notices

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notices
CREATE POLICY "Users can view own notices"
  ON notices FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create notices for themselves
CREATE POLICY "Users can create notices"
  ON notices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own notices
CREATE POLICY "Users can delete own notices"
  ON notices FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- AUDIT TRAIL
-- ============================================================================
-- Attach audit trigger to track all changes (INSERT, UPDATE, DELETE)

DROP TRIGGER IF EXISTS audit_notices ON notices;

CREATE TRIGGER audit_notices
  AFTER INSERT OR UPDATE OR DELETE ON notices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE notices IS 'Stores metadata for generated legal notices. PDFs are generated on-demand from form_data JSONB (not stored).';

COMMENT ON COLUMN notices.id IS 'Unique identifier for the notice';
COMMENT ON COLUMN notices.user_id IS 'Reference to the user who generated the notice (owner)';
COMMENT ON COLUMN notices.property_id IS 'Optional reference to the property this notice is for';
COMMENT ON COLUMN notices.payment_id IS 'Optional reference to payment (for final notices, Phase 4)';
COMMENT ON COLUMN notices.document_type IS 'Type of legal document: utah-3day-notice or utah-rent-increase';
COMMENT ON COLUMN notices.notice_type IS 'Preview (free) or final (paid)';
COMMENT ON COLUMN notices.form_data IS 'CRITICAL: Complete form field values as JSONB for PDF regeneration';
COMMENT ON COLUMN notices.generated_at IS 'Timestamp when notice metadata was first created';
COMMENT ON COLUMN notices.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN notices.download_count IS 'Number of times PDF has been downloaded';
COMMENT ON COLUMN notices.last_downloaded_at IS 'Timestamp of most recent download';

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- ON-DEMAND GENERATION APPROACH:
-- - No pdf_url or pdf_storage_path fields (removed from original design)
-- - PDFs generated on-demand when user downloads (1-2s latency)
-- - form_data JSONB contains ALL form field values for regeneration
-- - Benefits: 500x more notices on free tier (1M vs 10k)
--
-- FUTURE MIGRATION PATH:
-- - Easy to add storage later (2-3h, non-breaking)
-- - Add nullable pdf_url and pdf_storage_path columns
-- - Implement hybrid: check if cached, else regenerate
-- - Keep form_data for regeneration capability
--
-- FOREIGN KEY CASCADES:
-- - user_id: ON DELETE CASCADE (delete notices when user deleted)
-- - property_id: ON DELETE SET NULL (preserve notice if property deleted)
-- - payment_id: ON DELETE SET NULL (preserve notice if payment deleted)
--
-- ============================================================================
