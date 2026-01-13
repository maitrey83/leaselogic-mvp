const { supabaseAdmin } = require('../config/supabase');

/**
 * Get audit history for a specific record
 * Uses authenticateUser middleware - req.user is populated
 */
const getRecordHistory = async (req, res) => {
  try {
    const { tableName, recordId } = req.params;

    const { data, error } = await supabaseAdmin.rpc('get_audit_history', {
      p_table_name: tableName,
      p_record_id: recordId
    });

    if (error) {
      console.error('Error fetching audit history:', error);
      return res.status(500).json({ error: 'Failed to fetch audit history' });
    }

    res.json({ history: data });
  } catch (error) {
    console.error('Get record history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user's recent audit activity
 * Uses authenticateUser middleware - req.user is populated
 */
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    // Users can only view their own activity
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabaseAdmin.rpc('get_user_audit_logs', {
      p_user_id: userId,
      p_limit: limit
    });

    if (error) {
      console.error('Error fetching user activity:', error);
      return res.status(500).json({ error: 'Failed to fetch user activity' });
    }

    res.json({ activity: data });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get table changes in date range (admin only)
 * Uses authenticateUser middleware - req.user is populated
 */
const getTableChanges = async (req, res) => {
  try {
    const { tableName } = req.params;
    const { startDate, endDate } = req.query;

    // Build query
    let query = supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('table_name', tableName)
      .order('changed_at', { ascending: false });

    if (startDate) {
      query = query.gte('changed_at', startDate);
    }
    if (endDate) {
      query = query.lte('changed_at', endDate);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching table changes:', error);
      return res.status(500).json({ error: 'Failed to fetch table changes' });
    }

    res.json({ changes: data });
  } catch (error) {
    console.error('Get table changes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getRecordHistory,
  getUserActivity,
  getTableChanges
};
