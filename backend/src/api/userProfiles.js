const { supabaseAdmin } = require('../config/supabase');

/**
 * Get user profile
 * Uses authenticateUser middleware - req.user is populated
 */
const getProfile = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update subscription plan
 * Uses authenticateUser middleware - req.user is populated
 * 
 * TODO: Phase 4 (Task 4.6) - Replace with Stripe webhook integration
 * This endpoint is for TESTING ONLY. Production will use Stripe webhooks to update subscriptions.
 * See: requirements/Phases/guides/TASK-4.6-stripe-webhooks.md
 */
const updateSubscription = async (req, res) => {
  try {
    const { subscription_plan, stripe_customer_id } = req.body;

    if (!['free', 'basic', 'pro'].includes(subscription_plan)) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        subscription_plan,
        stripe_customer_id,
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return res.status(500).json({ error: 'Failed to update subscription' });
    }

    res.json({ 
      message: 'Subscription updated',
      profile: data,
      stripe_integration_pending: true,
      note: 'Direct subscription updates are for testing only. Production will use Stripe webhooks (Phase 4).'
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Check usage limit
 * Uses authenticateUser middleware - req.user is populated
 */
const checkLimit = async (req, res) => {
  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('notices_generated_this_month, monthly_limit, subscription_plan')
      .eq('user_id', req.user.id)
      .single();

    if (profileError) {
      console.error('Error getting profile:', profileError);
      return res.status(500).json({ error: 'Failed to get profile' });
    }

    const canGenerate = profile.notices_generated_this_month < profile.monthly_limit;
    const remaining = profile.monthly_limit - profile.notices_generated_this_month;

    const response = { 
      canGenerate,
      used: profile.notices_generated_this_month,
      limit: profile.monthly_limit,
      remaining: remaining > 0 ? remaining : 0,
      plan: profile.subscription_plan
    };

    if (!canGenerate) {
      response.message = 'You have reached your monthly limit. Please upgrade your subscription to continue generating notices.';
    }

    res.json(response);
  } catch (error) {
    console.error('Check limit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Increment usage counter
 * Uses authenticateUser middleware - req.user is populated
 */
const incrementUsage = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('increment_usage_counter', {
      target_user_id: req.user.id
    });

    if (error) {
      console.error('Error incrementing usage:', error);
      return res.status(500).json({ error: 'Failed to increment usage' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('notices_generated_this_month, monthly_limit')
      .eq('user_id', req.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to get updated profile' });
    }

    res.json({ 
      used: profile.notices_generated_this_month,
      limit: profile.monthly_limit
    });
  } catch (error) {
    console.error('Increment usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get usage stats
 * Uses authenticateUser middleware - req.user is populated
 */
const getUsageStats = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('notices_generated_this_month, monthly_limit, subscription_plan')
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching usage stats:', error);
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      used: data.notices_generated_this_month,
      limit: data.monthly_limit,
      remaining: data.monthly_limit - data.notices_generated_this_month,
      plan: data.subscription_plan
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProfile,
  updateSubscription,
  checkLimit,
  incrementUsage,
  getUsageStats
};
