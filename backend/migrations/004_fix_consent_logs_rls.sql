-- Fix consent_logs RLS for service role
-- Issue: Service role INSERT policy not working correctly

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Service role can insert consent logs" ON consent_logs;

-- Create new INSERT policy that works with service role
CREATE POLICY "Service role can insert consent logs"
  ON consent_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Also allow authenticated users to insert their own consent
CREATE POLICY "Users can insert own consent logs"
  ON consent_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Verify policies
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'consent_logs';

SELECT '✅ consent_logs RLS policies fixed!' as status;
