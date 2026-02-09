-- Migration 014: Create payments table
-- Task 4.5 - Revenue tracking with Stripe webhook integration
-- Dependencies: users (003), notices (012), audit_logs (008)
-- Created: 2026-02-08

-- ============================================================
-- PAYMENTS TABLE
-- Tracks all Stripe payment events for revenue and audit trail
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who paid
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- What they paid for (nullable — payment can exist before notice linkage)
  notice_id UUID REFERENCES notices(id) ON DELETE SET NULL,

  -- Document type for analytics ('utah-3day-notice', 'utah-rent-increase')
  document_type TEXT NOT NULL,

  -- Amount in cents (Stripe convention)
  amount INTEGER NOT NULL,

  -- Currency code (USD only for now)
  currency TEXT NOT NULL DEFAULT 'usd' CHECK (currency IN ('usd')),

  -- Stripe identifiers for reconciliation
  stripe_payment_id TEXT UNIQUE NOT NULL,  -- payment_intent ID (pi_...)
  stripe_charge_id TEXT,                    -- charge ID (ch_...)

  -- Payment lifecycle status
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),

  -- How they paid ('card', 'ach', etc.)
  payment_method TEXT,

  -- Full Stripe metadata blob for debugging
  metadata JSONB,

  -- Failure details (populated on payment_intent.payment_failed)
  failure_reason TEXT,

  -- Refund details (populated on charge.refunded)
  refund_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE payments IS 'Stripe payment records for revenue tracking and audit trail';
COMMENT ON COLUMN payments.user_id IS 'User who made the payment';
COMMENT ON COLUMN payments.notice_id IS 'Notice this payment is linked to (nullable)';
COMMENT ON COLUMN payments.document_type IS 'Document type purchased (utah-3day-notice, utah-rent-increase)';
COMMENT ON COLUMN payments.amount IS 'Payment amount in cents (Stripe convention)';
COMMENT ON COLUMN payments.currency IS 'ISO currency code (usd only)';
COMMENT ON COLUMN payments.stripe_payment_id IS 'Stripe PaymentIntent ID for reconciliation';
COMMENT ON COLUMN payments.stripe_charge_id IS 'Stripe Charge ID for refund lookups';
COMMENT ON COLUMN payments.status IS 'Payment lifecycle: pending → succeeded/failed, succeeded → refunded';
COMMENT ON COLUMN payments.payment_method IS 'Payment method type from Stripe (card, ach, etc.)';
COMMENT ON COLUMN payments.metadata IS 'Full Stripe metadata for debugging and analytics';
COMMENT ON COLUMN payments.failure_reason IS 'Stripe error message for failed payments';
COMMENT ON COLUMN payments.refund_reason IS 'Reason provided for refund';

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_notice_id ON payments(notice_id);
CREATE INDEX idx_payments_stripe_payment_id ON payments(stripe_payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment history
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (webhooks) can insert payments
CREATE POLICY "Service role can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Only service role (webhooks) can update payments (refunds)
CREATE POLICY "Service role can update payments"
  ON payments FOR UPDATE
  USING (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Audit trail — track all INSERT/UPDATE/DELETE
CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();
