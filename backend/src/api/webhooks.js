/**
 * Stripe Webhook Handlers
 * Task 4.5 (payments) + Task 4.6 (subscriptions)
 *
 * Handles all Stripe webhook events:
 *   - payment_intent.succeeded / payment_failed
 *   - charge.refunded
 *   - customer.subscription.created / updated / deleted
 *
 * CRITICAL: This endpoint receives raw body (not JSON-parsed)
 * for Stripe signature verification. The route is mounted
 * BEFORE express.json() in server.js.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { supabaseAdmin } = require('../config/supabase');

// Plan → monthly notice limit mapping
const PLAN_LIMITS = {
  free: 3,
  basic: 25,
  pro: 999999  // effectively unlimited
};

// ============================================================
// MAIN WEBHOOK HANDLER
// ============================================================

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Step 1: Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  // Step 2: Route to handler
  try {
    switch (event.type) {
      // --- Payment events (Task 4.5) ---
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      // --- Subscription events (Task 4.6) ---
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`[Webhook] Handler error for ${event.type}:`, err);
    // Return 500 so Stripe retries
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// ============================================================
// PAYMENT HANDLERS (Task 4.5)
// ============================================================

/**
 * Handle successful payment — insert payment record + link to notice
 */
const handlePaymentSucceeded = async (paymentIntent) => {
  const { id, amount, currency, charges, metadata } = paymentIntent;
  const charge = charges?.data?.[0];

  const userId = metadata?.user_id;
  const noticeId = metadata?.notice_id;
  const documentType = metadata?.document_type || 'unknown';

  if (!userId) {
    console.error('[Webhook] payment_intent.succeeded missing user_id in metadata');
    return;
  }

  // Insert payment record
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .insert({
      user_id: userId,
      notice_id: noticeId || null,
      document_type: documentType,
      amount: amount,
      currency: currency,
      stripe_payment_id: id,
      stripe_charge_id: charge?.id || null,
      status: 'succeeded',
      payment_method: charge?.payment_method_details?.type || null,
      metadata: metadata
    })
    .select()
    .single();

  if (paymentError) {
    console.error('[Webhook] Error inserting payment:', paymentError);
    throw paymentError;
  }

  // Link payment to notice if notice_id provided
  if (noticeId) {
    const { error: noticeError } = await supabaseAdmin
      .from('notices')
      .update({ payment_id: payment.id })
      .eq('id', noticeId);

    if (noticeError) {
      // Payment succeeded but linkage failed — log for manual review
      console.error('[Webhook] Error linking payment to notice:', noticeError);
    } else {
      console.log(`[Webhook] Payment ${payment.id} linked to notice ${noticeId}`);
    }
  }

  console.log(`[Webhook] Payment succeeded: ${id} ($${(amount / 100).toFixed(2)} ${currency}) for user ${userId}`);
};

/**
 * Handle failed payment — insert failed payment record
 */
const handlePaymentFailed = async (paymentIntent) => {
  const { id, amount, currency, last_payment_error, metadata } = paymentIntent;

  const userId = metadata?.user_id;
  const noticeId = metadata?.notice_id;
  const documentType = metadata?.document_type || 'unknown';

  if (!userId) {
    console.error('[Webhook] payment_intent.payment_failed missing user_id in metadata');
    return;
  }

  const { error } = await supabaseAdmin
    .from('payments')
    .insert({
      user_id: userId,
      notice_id: noticeId || null,
      document_type: documentType,
      amount: amount,
      currency: currency,
      stripe_payment_id: id,
      status: 'failed',
      failure_reason: last_payment_error?.message || 'Unknown error',
      metadata: metadata
    });

  if (error) {
    console.error('[Webhook] Error inserting failed payment:', error);
    throw error;
  }

  console.log(`[Webhook] Payment failed: ${id} - ${last_payment_error?.message}`);
};

/**
 * Handle refund — update existing payment record
 */
const handleChargeRefunded = async (charge) => {
  const { id, refunds } = charge;
  const refund = refunds?.data?.[0];

  // Find payment by stripe_charge_id
  const { data: payment, error: findError } = await supabaseAdmin
    .from('payments')
    .select('id')
    .eq('stripe_charge_id', id)
    .single();

  if (findError || !payment) {
    console.error('[Webhook] Payment not found for charge:', id);
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'refunded',
      refund_reason: refund?.reason || null
    })
    .eq('id', payment.id);

  if (updateError) {
    console.error('[Webhook] Error updating payment to refunded:', updateError);
    throw updateError;
  }

  console.log(`[Webhook] Payment refunded: ${payment.id} (charge ${id})`);
};

// ============================================================
// SUBSCRIPTION HANDLERS (Task 4.6)
// ============================================================

/**
 * Handle subscription created/updated — upsert subscription + update user profile
 */
const handleSubscriptionUpdate = async (subscription) => {
  const {
    id,
    customer,
    items,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end
  } = subscription;

  // Get plan from price lookup_key (configured in Stripe Dashboard)
  const plan = items?.data?.[0]?.price?.lookup_key || 'free';

  // Find user by stripe_customer_id
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customer)
    .single();

  if (profileError || !profile) {
    console.error('[Webhook] User profile not found for customer:', customer);
    return;
  }

  // Upsert subscription record
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: profile.user_id,
      stripe_subscription_id: id,
      stripe_customer_id: customer,
      plan: plan,
      status: status,
      current_period_start: new Date(current_period_start * 1000),
      current_period_end: new Date(current_period_end * 1000),
      cancel_at_period_end: cancel_at_period_end
    }, {
      onConflict: 'stripe_subscription_id'
    });

  if (subError) {
    console.error('[Webhook] Error upserting subscription:', subError);
    throw subError;
  }

  // Update user_profiles with plan + monthly_limit
  const monthlyLimit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_plan: plan,
      subscription_status: status,
      monthly_limit: monthlyLimit
    })
    .eq('user_id', profile.user_id);

  if (updateError) {
    console.error('[Webhook] Error updating user profile:', updateError);
  }

  console.log(`[Webhook] Subscription ${status}: ${id} for user ${profile.user_id} (${plan} plan, limit: ${monthlyLimit})`);
};

/**
 * Handle subscription deleted — revert to free plan
 */
const handleSubscriptionCancellation = async (subscription) => {
  const { id, customer } = subscription;

  // Find user by stripe_customer_id
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customer)
    .single();

  if (profileError || !profile) {
    console.error('[Webhook] User profile not found for customer:', customer);
    return;
  }

  // Update subscription status
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date()
    })
    .eq('stripe_subscription_id', id);

  if (subError) {
    console.error('[Webhook] Error updating subscription to canceled:', subError);
  }

  // Revert user to free plan
  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_plan: 'free',
      subscription_status: 'canceled',
      monthly_limit: PLAN_LIMITS.free
    })
    .eq('user_id', profile.user_id);

  if (updateError) {
    console.error('[Webhook] Error reverting user to free plan:', updateError);
  }

  console.log(`[Webhook] Subscription canceled: ${id} for user ${profile.user_id} (reverted to free)`);
};

module.exports = { handleStripeWebhook };
