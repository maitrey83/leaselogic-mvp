-- Migration 015: Create subscriptions table
-- Task 4.6 - Stripe subscription tracking and plan enforcement
-- Dependencies: users (003), audit_logs (008)
-- Created: 2026-02-08

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- Tracks Stripe subscription lifecycle for plan enforcement
-- ============================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Subscription owner
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Stripe identifiers
  stripe_subscription_id TEXT UNIQUE NOT NULL,  -- sub_...
  stripe_customer_id TEXT NOT NULL,              -- cus_...

  -- Plan tier (drives monthly_limit in user_profiles)
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'pro')),

  -- Stripe subscription status
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),

  -- Current billing period
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,

  -- Cancellation tracking
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE subscriptions IS 'Stripe subscription records for plan enforcement and billing';
COMMENT ON COLUMN subscriptions.user_id IS 'User who owns this subscription';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe Subscription ID (sub_...)';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe Customer ID (cus_...) for webhook lookups';
COMMENT ON COLUMN subscriptions.plan IS 'Subscription tier: free (3/mo), basic (25/mo), pro (unlimited)';
COMMENT ON COLUMN subscriptions.status IS 'Stripe status: active, canceled, past_due, incomplete, trialing';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Start of current billing period';
COMMENT ON COLUMN subscriptions.current_period_end IS 'End of current billing period (access expires here on cancel)';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Whether subscription cancels at period end (grace period)';
COMMENT ON COLUMN subscriptions.canceled_at IS 'When the user initiated cancellation';

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (webhooks) can insert subscriptions
CREATE POLICY "Service role can insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

-- Only service role (webhooks) can update subscriptions
CREATE POLICY "Service role can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Audit trail — track all INSERT/UPDATE/DELETE
CREATE TRIGGER audit_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();
