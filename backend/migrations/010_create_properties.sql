-- =====================================================================
-- Migration: 010_create_properties.sql
-- Created: 2026-01-20
-- Task: 3.5 - Properties Table
-- Description: Create properties table with full-text search and RLS
-- =====================================================================

-- =====================================================================
-- PART 1: TABLE SCHEMA
-- =====================================================================

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign key to users (cascade delete)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Property identification
  property_name TEXT,  -- Optional nickname (e.g., "Downtown Apartment")

  -- Address fields
  street_address TEXT NOT NULL,
  unit_number TEXT,  -- Apartment/unit number (optional)
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'UT',
  zip_code TEXT NOT NULL CHECK (zip_code ~ '^\d{5}$'),  -- 5-digit zip code

  -- Property metadata
  property_type TEXT CHECK (property_type IN ('single-family', 'apartment', 'condo', 'townhouse', 'other')),
  notes TEXT,  -- Additional property notes

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PART 2: INDEXES
-- =====================================================================

-- Index on user_id for fast property lookups by user
CREATE INDEX idx_properties_user_id ON properties(user_id);

-- Index on created_at for sorting (most recent first)
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

-- =====================================================================
-- PART 3: UPDATED_AT TRIGGER
-- =====================================================================

-- Trigger to automatically update updated_at timestamp
-- Note: update_updated_at_column() function should already exist from previous migrations
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- PART 4: FULL-TEXT SEARCH (GIN INDEX)
-- =====================================================================

-- Add search_vector column for full-text search
ALTER TABLE properties ADD COLUMN search_vector tsvector;

-- Create GIN index for fast full-text search
-- GIN (Generalized Inverted Index) is optimized for full-text search
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);

-- Function to update search vector
-- Weights: A=highest, B=high, C=medium, D=low
-- This allows us to prioritize property_name matches over unit_number matches
CREATE OR REPLACE FUNCTION properties_search_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    -- Weight A: Property name (highest priority)
    setweight(to_tsvector('english', COALESCE(NEW.property_name, '')), 'A') ||
    -- Weight B: Street address (high priority)
    setweight(to_tsvector('english', COALESCE(NEW.street_address, '')), 'B') ||
    -- Weight C: City (medium priority)
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
    -- Weight D: Unit number (low priority)
    setweight(to_tsvector('english', COALESCE(NEW.unit_number, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search_vector on INSERT or UPDATE
CREATE TRIGGER properties_search_update
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION properties_search_trigger();

-- =====================================================================
-- PART 5: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view only their own properties (SELECT)
-- This ensures User A cannot see User B's properties
CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can create properties (INSERT)
-- Users can only create properties for themselves
CREATE POLICY "Users can create properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update only their own properties (UPDATE)
-- Prevents users from modifying other users' properties
CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete only their own properties (DELETE)
-- Prevents users from deleting other users' properties
CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================================
-- PART 6: AUDIT TRAIL INTEGRATION
-- =====================================================================

-- Note: Audit logging is handled automatically by triggers created in migration 008
-- The audit_logs table will capture:
-- - INSERT events when properties are created
-- - UPDATE events when properties are modified
-- - DELETE events when properties are removed
-- All changes include old_values and new_values in JSONB format

-- =====================================================================
-- VERIFICATION QUERIES (for testing)
-- =====================================================================

-- Test 1: Verify table created
-- SELECT * FROM properties LIMIT 1;

-- Test 2: Verify indexes created
-- SELECT indexname FROM pg_indexes WHERE tablename = 'properties';

-- Test 3: Verify RLS enabled
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'properties';

-- Test 4: Verify RLS policies
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'properties';

-- Test 5: Test full-text search (example)
-- INSERT INTO properties (user_id, street_address, city, state, zip_code, property_name)
-- VALUES (auth.uid(), '123 Main St', 'Salt Lake City', 'UT', '84101', 'Downtown Property');
--
-- SELECT * FROM properties
-- WHERE search_vector @@ to_tsquery('english', 'main | downtown');

-- =====================================================================
-- ROLLBACK (if needed)
-- =====================================================================

-- To rollback this migration:
-- DROP TRIGGER IF EXISTS properties_search_update ON properties;
-- DROP FUNCTION IF EXISTS properties_search_trigger();
-- DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
-- DROP TABLE IF EXISTS properties CASCADE;

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================

-- Migration completed successfully
-- Properties table ready for use with:
-- ✓ User isolation (RLS)
-- ✓ Full-text search (GIN index)
-- ✓ Automatic audit logging
-- ✓ Timestamp tracking
