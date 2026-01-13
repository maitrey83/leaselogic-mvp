-- Migration: Create user_profiles table
-- Purpose: Subscription management and usage tracking
-- Date: 2025-12-05
-- Task: Phase 2, Task 2.7

-- ============================================
-- Step 1: Create user_profiles table
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key to users
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Subscription Information
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  subscription_start_date DATE,
  subscription_end_date DATE,
  
  -- Usage Tracking
  notices_generated_this_month INTEGER NOT NULL DEFAULT 0,
  monthly_limit INTEGER NOT NULL DEFAULT 3, -- free: 3, basic: 25, pro: 999999
  
  -- Billing Information
  billing_email TEXT,
  stripe_customer_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Step 2: Create indexes
-- ============================================

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_subscription_plan ON public.user_profiles(subscription_plan);
CREATE INDEX idx_user_profiles_stripe_customer_id ON public.user_profiles(stripe_customer_id);

-- ============================================
-- Step 3: Create trigger for updated_at
-- ============================================

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Step 4: Create function to auto-create profile
-- ============================================

CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, subscription_plan, monthly_limit)
  VALUES (NEW.id, 'free', 3)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile when user is created
DROP TRIGGER IF EXISTS on_user_created_create_profile ON public.users;
CREATE TRIGGER on_user_created_create_profile
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_profile();

-- ============================================
-- Step 5: Usage tracking functions
-- ============================================

-- Increment usage counter
CREATE OR REPLACE FUNCTION public.increment_usage_counter(target_user_id UUID)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.user_profiles
  SET notices_generated_this_month = notices_generated_this_month + 1
  WHERE user_id = target_user_id
  RETURNING notices_generated_this_month INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Check if user is under usage limit
CREATE OR REPLACE FUNCTION public.check_usage_limit(target_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_usage INTEGER;
  limit_value INTEGER;
BEGIN
  SELECT notices_generated_this_month, monthly_limit
  INTO current_usage, limit_value
  FROM public.user_profiles
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN current_usage < limit_value;
END;
$$;

-- Reset monthly usage for all users
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
  SET notices_generated_this_month = 0;
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  
  RETURN reset_count;
END;
$$;

-- Update monthly limit based on subscription plan
CREATE OR REPLACE FUNCTION public.update_monthly_limit()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set monthly limit based on plan
  NEW.monthly_limit := CASE NEW.subscription_plan
    WHEN 'free' THEN 3
    WHEN 'basic' THEN 25
    WHEN 'pro' THEN 999999
    ELSE 3
  END;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-update monthly limit when plan changes
DROP TRIGGER IF EXISTS update_limit_on_plan_change ON public.user_profiles;
CREATE TRIGGER update_limit_on_plan_change
  BEFORE INSERT OR UPDATE OF subscription_plan ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_monthly_limit();

-- ============================================
-- Step 6: Enable RLS
-- ============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own billing email
CREATE POLICY "Users can update own billing email"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can view all profiles
CREATE POLICY "Service role can view all profiles"
  ON public.user_profiles
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: Service role can manage all profiles
CREATE POLICY "Service role can manage profiles"
  ON public.user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Step 7: Backfill profiles for existing users
-- ============================================

INSERT INTO public.user_profiles (user_id, subscription_plan, monthly_limit)
SELECT id, 'free', 3
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- Step 8: Verification queries
-- ============================================

-- Verify table created
SELECT 'user_profiles table created' as status, COUNT(*) as record_count 
FROM public.user_profiles;

-- Check RLS policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles';

-- Check triggers
SELECT tgname FROM pg_trigger WHERE tgrelid = 'user_profiles'::regclass;

-- Check functions
SELECT proname FROM pg_proc WHERE proname IN (
  'create_user_profile',
  'increment_usage_counter',
  'check_usage_limit',
  'reset_monthly_usage',
  'update_monthly_limit'
);

-- ============================================
-- Step 9: pg_cron setup (manual step)
-- ============================================

-- NOTE: pg_cron must be enabled in Supabase Dashboard first
-- Dashboard → Database → Extensions → Enable pg_cron

-- Schedule monthly reset (runs at midnight UTC on 1st of each month)
-- Run this after enabling pg_cron:
/*
SELECT cron.schedule(
  'reset-monthly-usage',
  '0 0 1 * *',
  $$SELECT public.reset_monthly_usage();$$
);
*/

-- To verify cron job (after scheduling):
-- SELECT * FROM cron.job;

-- ============================================
-- Migration Complete
-- ============================================

SELECT '✅ Migration 005 completed successfully!' as status;
SELECT 'NOTE: Enable pg_cron extension and schedule monthly reset manually' as reminder;
