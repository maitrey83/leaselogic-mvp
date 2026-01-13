// Feature Flags Configuration
// Controls which documents and features are enabled in LeaseLogic
// Created: 2025-11-25
// Purpose: Isolate MVP during Phase 1-4 multi-document development

const FEATURE_FLAGS = {
  // ============================================================================
  // LEGACY MVP - Utah 3-Day Notice (LOCKED - DO NOT MODIFY)
  // ============================================================================
  UTAH_3DAY_NOTICE_MVP: {
    enabled: true,
    locked: true, // Prevents modification during Phase 1-4 development
    version: '1.3',
    description: 'Original Utah 3-Day Notice to Pay or Vacate MVP',
    completionDate: '2025-11-25',
    routes: ['/'],
    components: [
      'NoticeForm',
      'NoticePreview',
      'PaymentForm',
      'DownloadDisclaimer',
      'DisclaimerBanner',
      'GeoRestriction',
      'CookieConsent',
      'Footer'
    ],
    backend: [
      '/api/pdf/generate',
      '/api/payment/create-checkout',
      '/api/consent/log'
    ]
  },

  // ============================================================================
  // NEW MULTI-DOCUMENT SYSTEM (Phase 1-4 Development)
  // ============================================================================
  MULTI_DOCUMENT_SYSTEM: {
    enabled: false, // Enable after Phase 2 completion
    version: '2.0',
    description: 'New architecture supporting multiple document types and states',
    targetDate: '2025-12-11', // Phase 2 completion
    routes: ['/documents', '/documents/:type'],
    components: [
      'DocumentSelector',
      'DynamicForm',
      'GenericPreview',
      'DocumentService',
      'ValidationService',
      'TemplateService'
    ],
    backend: [
      '/api/v2/documents/*',
      '/api/v2/templates/*',
      '/api/v2/validation/*'
    ]
  },

  // ============================================================================
  // UTAH RENT INCREASE NOTICE (Phase 3)
  // ============================================================================
  UTAH_RENT_INCREASE: {
    enabled: false, // Enable after Phase 3 completion
    version: '2.0',
    description: 'Utah Rent Increase Notice document',
    targetDate: '2025-12-18', // Phase 3 completion
    parentFlag: 'MULTI_DOCUMENT_SYSTEM', // Requires parent to be enabled
    routes: ['/documents/utah-rent-increase'],
    components: ['RentIncreaseForm', 'RentIncreaseTemplate']
  },

  // ============================================================================
  // FUTURE FEATURES (Placeholder)
  // ============================================================================
  MULTI_STATE_SUPPORT: {
    enabled: false,
    version: '3.0',
    description: 'Support for multiple states beyond Utah',
    targetDate: 'TBD',
    parentFlag: 'MULTI_DOCUMENT_SYSTEM'
  },

  USER_ACCOUNTS: {
    enabled: false,
    version: '3.0',
    description: 'User authentication and document history',
    targetDate: 'TBD'
  },

  DOCUMENT_TEMPLATES_LIBRARY: {
    enabled: false,
    version: '3.0',
    description: 'Library of pre-built document templates',
    targetDate: 'TBD',
    parentFlag: 'MULTI_DOCUMENT_SYSTEM'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a feature flag is enabled
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} - True if enabled, false otherwise
 */
export const isFeatureEnabled = (flagName) => {
  const flag = FEATURE_FLAGS[flagName];
  
  if (!flag) {
    console.warn(`Feature flag "${flagName}" not found`);
    return false;
  }
  
  // Check parent flag if exists
  if (flag.parentFlag && !isFeatureEnabled(flag.parentFlag)) {
    return false;
  }
  
  return flag.enabled === true;
};

/**
 * Check if a feature flag is locked (prevents modification)
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} - True if locked, false otherwise
 */
export const isFeatureLocked = (flagName) => {
  const flag = FEATURE_FLAGS[flagName];
  return flag?.locked === true;
};

/**
 * Get feature flag metadata
 * @param {string} flagName - Name of the feature flag
 * @returns {object|null} - Feature flag object or null
 */
export const getFeatureFlag = (flagName) => {
  return FEATURE_FLAGS[flagName] || null;
};

/**
 * Get all enabled features
 * @returns {array} - Array of enabled feature names
 */
export const getEnabledFeatures = () => {
  return Object.keys(FEATURE_FLAGS).filter(key => isFeatureEnabled(key));
};

/**
 * Get all locked features
 * @returns {array} - Array of locked feature names
 */
export const getLockedFeatures = () => {
  return Object.keys(FEATURE_FLAGS).filter(key => isFeatureLocked(key));
};

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

/**
 * Log feature flag status (development only)
 */
export const logFeatureFlags = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group('🚩 Feature Flags Status');
  Object.entries(FEATURE_FLAGS).forEach(([name, flag]) => {
    const status = flag.enabled ? '✅' : '❌';
    const locked = flag.locked ? '🔒' : '🔓';
    console.log(`${status} ${locked} ${name} (v${flag.version})`);
  });
  console.groupEnd();
};

// ============================================================================
// EXPORTS
// ============================================================================

export default FEATURE_FLAGS;
