const { supabaseAdmin } = require('../config/supabase');

/**
 * Log user consent to legal policies
 * CRITICAL: Server-side IP capture for legal evidence
 * v2: Enhanced with validation and metadata support
 */
async function logConsent(req, res) {
  try {
    const { 
      userId, 
      documentType, 
      consentType, 
      policyVersion
    } = req.body;
    
    // Validation
    if (!documentType) {
      return res.status(400).json({ 
        success: false, 
        error: 'documentType is required' 
      });
    }
    
    if (!consentType) {
      return res.status(400).json({ 
        success: false, 
        error: 'consentType is required' 
      });
    }
    
    // Server-side IP capture (CRITICAL for legal validity)
    const ipAddress = req.ip || 
                      req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress ||
                      '0.0.0.0';
    
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Insert into consent_logs (immutable)
    const { data, error } = await supabaseAdmin
      .from('consent_logs')
      .insert({
        user_id: userId || null,
        document_type: documentType,
        consent_type: consentType,
        policy_version: policyVersion || 'v1.3',
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();
    
    if (error) {
      console.error('Consent logging error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    console.log('✅ Consent logged to database:', {
      id: data.id,
      documentType,
      consentType,
      ipAddress,
      timestamp: data.consented_at
    });
    
    res.status(201).json({ 
      success: true, 
      consentId: data.id,
      timestamp: data.consented_at
    });
    
  } catch (error) {
    console.error('Consent logging exception:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to log consent' 
    });
  }
}

/**
 * Get user's consent history
 * v2: Added filtering by document_type
 */
async function getConsentHistory(req, res) {
  try {
    const { userId } = req.params;
    const { documentType } = req.query;
    
    let query = supabaseAdmin
      .from('consent_logs')
      .select('*')
      .eq('user_id', userId);
    
    if (documentType) {
      query = query.eq('document_type', documentType);
    }
    
    const { data, error } = await query
      .order('consented_at', { ascending: false });
    
    if (error) throw error;
    
    res.status(200).json({ 
      success: true, 
      consents: data 
    });
    
  } catch (error) {
    console.error('Get consent history error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Get consent statistics (admin only)
 * NEW: Analytics endpoint
 */
async function getConsentStats(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('consent_logs')
      .select('document_type, consent_type, consented_at');
    
    if (error) throw error;
    
    // Group by document_type and consent_type
    const stats = data.reduce((acc, log) => {
      const key = `${log.document_type}:${log.consent_type}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    res.status(200).json({ 
      success: true, 
      stats,
      total: data.length
    });
    
  } catch (error) {
    console.error('Get consent stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

module.exports = {
  logConsent,
  getConsentHistory,
  getConsentStats
};
