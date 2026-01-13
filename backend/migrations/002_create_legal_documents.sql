-- Migration: Create legal_documents table
-- Purpose: Track versions of legal documents (TOS, Privacy, Cookie policies)
-- Date: 2025-12-01
-- Task: Phase 2, Task 2.5

-- ============================================
-- Step 1: Create legal_documents table
-- ============================================

CREATE TABLE IF NOT EXISTS legal_documents (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Document Information
  document_type TEXT NOT NULL,  -- 'TOS', 'Privacy', 'Cookie', 'Disclaimer'
  version TEXT NOT NULL,        -- '1.0', '1.1', '1.2', '1.3', etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL,        -- Full document content (markdown or HTML)
  
  -- Version Control
  effective_date TIMESTAMPTZ NOT NULL,  -- When this version becomes active
  is_active BOOLEAN DEFAULT false,      -- Only one version per type should be active
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_document_version UNIQUE(document_type, version),
  CONSTRAINT valid_document_type CHECK (document_type IN ('TOS', 'Privacy', 'Cookie', 'Disclaimer')),
  CONSTRAINT valid_version CHECK (version ~ '^\d+\.\d+$')
);

-- ============================================
-- Step 2: Create indexes
-- ============================================

CREATE INDEX idx_legal_documents_type ON legal_documents(document_type);
CREATE INDEX idx_legal_documents_active ON legal_documents(document_type, is_active) WHERE is_active = true;
CREATE INDEX idx_legal_documents_effective_date ON legal_documents(effective_date DESC);

-- ============================================
-- Step 3: Create helper functions
-- ============================================

-- Function: Get active document by type
CREATE OR REPLACE FUNCTION get_active_document(doc_type TEXT)
RETURNS TABLE (
  id UUID,
  document_type TEXT,
  version TEXT,
  title TEXT,
  content TEXT,
  effective_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ld.id,
    ld.document_type,
    ld.version,
    ld.title,
    ld.content,
    ld.effective_date,
    ld.created_at
  FROM legal_documents ld
  WHERE ld.document_type = doc_type
    AND ld.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function: Get document history by type
CREATE OR REPLACE FUNCTION get_document_history(doc_type TEXT)
RETURNS TABLE (
  id UUID,
  document_type TEXT,
  version TEXT,
  title TEXT,
  effective_date TIMESTAMPTZ,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ld.id,
    ld.document_type,
    ld.version,
    ld.title,
    ld.effective_date,
    ld.is_active,
    ld.created_at
  FROM legal_documents ld
  WHERE ld.document_type = doc_type
  ORDER BY ld.effective_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Ensure only one active version per document type
CREATE OR REPLACE FUNCTION ensure_single_active_document()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    -- Deactivate all other versions of this document type
    UPDATE legal_documents
    SET is_active = false
    WHERE document_type = NEW.document_type
      AND id != NEW.id
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER single_active_document
  BEFORE INSERT OR UPDATE ON legal_documents
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_document();

-- ============================================
-- Step 4: Enable RLS
-- ============================================

ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read legal documents (public)
CREATE POLICY "Legal documents are publicly readable"
  ON legal_documents
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update
CREATE POLICY "Service role can manage legal documents"
  ON legal_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Step 5: Seed initial data
-- ============================================

-- Insert Terms of Service v1.3
INSERT INTO legal_documents (document_type, version, title, content, effective_date, is_active)
VALUES (
  'TOS',
  '1.3',
  'Terms of Service',
  '# Terms of Service v1.3

## 1. Acceptance of Terms
By accessing and using LeaseLogic, you accept and agree to be bound by these Terms of Service.

## 2. Description of Service
LeaseLogic provides automated legal document generation services for landlords and property managers.

## 3. No Legal Advice
LeaseLogic does NOT provide legal advice. All documents are templates only. Consult an attorney.

## 4. User Responsibilities
You are responsible for ensuring all information entered is accurate and complies with applicable laws.

## 5. Limitation of Liability
LeaseLogic is not liable for any damages arising from use of generated documents.

## 6. Modifications
We reserve the right to modify these terms at any time. Continued use constitutes acceptance.

Last Updated: November 25, 2025',
  NOW(),
  true
) ON CONFLICT (document_type, version) DO NOTHING;

-- Insert Privacy Policy v1.3
INSERT INTO legal_documents (document_type, version, title, content, effective_date, is_active)
VALUES (
  'Privacy',
  '1.3',
  'Privacy Policy',
  '# Privacy Policy v1.3

## 1. Information We Collect
We collect information you provide when using our service, including property and tenant details.

## 2. How We Use Information
- Generate legal documents
- Improve our services
- Comply with legal obligations

## 3. Information Sharing
We do not sell your personal information. We may share data with service providers.

## 4. Data Security
We implement reasonable security measures to protect your information.

## 5. Your Rights
You have the right to access, correct, or delete your personal information.

## 6. Cookies
We use cookies to improve user experience and track usage.

## 7. Changes to Policy
We may update this policy. Continued use constitutes acceptance of changes.

Last Updated: November 25, 2025',
  NOW(),
  true
) ON CONFLICT (document_type, version) DO NOTHING;

-- Insert Cookie Policy v1.3
INSERT INTO legal_documents (document_type, version, title, content, effective_date, is_active)
VALUES (
  'Cookie',
  '1.3',
  'Cookie Policy',
  '# Cookie Policy v1.3

## 1. What Are Cookies
Cookies are small text files stored on your device when you visit our website.

## 2. How We Use Cookies
- Essential cookies: Required for site functionality
- Analytics cookies: Help us understand how you use our site
- Preference cookies: Remember your settings

## 3. Types of Cookies We Use
- Session cookies (temporary)
- Persistent cookies (stored on device)

## 4. Managing Cookies
You can control cookies through your browser settings.

## 5. Third-Party Cookies
We may use third-party services (e.g., Google Analytics) that set cookies.

Last Updated: November 25, 2025',
  NOW(),
  true
) ON CONFLICT (document_type, version) DO NOTHING;

-- ============================================
-- Step 6: Verification queries
-- ============================================

-- Verify table created
SELECT 'Table created' as status, COUNT(*) as record_count FROM legal_documents;

-- Verify active documents
SELECT document_type, version, is_active FROM legal_documents WHERE is_active = true;

-- Test get_active_document function
SELECT document_type, version FROM get_active_document('TOS');

-- Test get_document_history function
SELECT document_type, version, is_active FROM get_document_history('TOS');

-- ============================================
-- Migration Complete
-- ============================================

SELECT '✅ Migration 002 completed successfully!' as status;
