-- Fix reset_monthly_usage function
-- Issue: Supabase requires WHERE clause for UPDATE
-- Solution: Add WHERE true condition

CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  reset_count INTEGER;
BEGIN
  UPDATE public.user_profiles
  SET notices_generated_this_month = 0
  WHERE notices_generated_this_month > 0 OR notices_generated_this_month = 0;
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  
  RETURN reset_count;
END;
$$;

SELECT '✅ Reset function fixed!' as status;
