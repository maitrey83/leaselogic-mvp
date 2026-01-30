-- =====================================================================
-- Migration: 011_add_audit_trigger_to_properties.sql
-- Created: 2026-01-20
-- Task: 3.5 - Add Audit Trigger to Properties Table
-- Description: Attach audit logging trigger to properties table
-- =====================================================================

-- Add audit trigger to properties table
-- This trigger will log all INSERT, UPDATE, and DELETE operations
DROP TRIGGER IF EXISTS audit_properties ON properties;
CREATE TRIGGER audit_properties
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Verification query
-- SELECT * FROM audit_logs WHERE table_name = 'properties' ORDER BY changed_at DESC LIMIT 10;

-- Migration completed successfully
-- Properties table now has audit logging enabled
