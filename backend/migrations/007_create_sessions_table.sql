-- Migration: Create sessions table
-- Description: Session management with auto-cleanup
-- Created: 2025-12-09

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Function: Cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get active sessions for user
CREATE OR REPLACE FUNCTION get_active_sessions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.ip_address, s.user_agent, s.created_at, s.expires_at, s.last_activity
  FROM sessions s
  WHERE s.user_id = p_user_id AND s.expires_at > NOW()
  ORDER BY s.last_activity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update session activity
CREATE OR REPLACE FUNCTION update_session_activity(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sessions 
  SET last_activity = NOW() 
  WHERE id = p_session_id AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view own sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: Service role full access
CREATE POLICY "Service role full access"
  ON sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Schedule daily cleanup at 2 AM (pg_cron)
-- Note: Requires pg_cron extension enabled in Supabase
-- Run manually in Supabase SQL Editor if pg_cron not available:
-- SELECT cron.schedule('cleanup-expired-sessions', '0 2 * * *', $$SELECT cleanup_expired_sessions();$$);

COMMENT ON TABLE sessions IS 'User session tracking with auto-cleanup';
COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Delete expired sessions, returns count deleted';
COMMENT ON FUNCTION get_active_sessions(UUID) IS 'Get active sessions for user';
COMMENT ON FUNCTION update_session_activity(UUID) IS 'Update last activity timestamp';
