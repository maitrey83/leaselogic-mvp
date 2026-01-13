// Feature flags for testing and deployment
const FEATURE_FLAGS = {
  // Geo-restriction bypass for testing
  BYPASS_GEO_RESTRICTION: process.env.REACT_APP_BYPASS_GEO === 'true',
  
  // Testing mode (can be enabled via URL parameter)
  TESTING_MODE: false,
  
  // Payment bypass for testing
  BYPASS_PAYMENT: process.env.REACT_APP_BYPASS_PAYMENT === 'true',
  
  // Debug mode
  DEBUG_MODE: process.env.NODE_ENV === 'development'
};

// Check URL parameters for feature flags
const urlParams = new URLSearchParams(window.location.search);

// Override flags based on URL parameters
if (urlParams.get('test') === 'true') {
  FEATURE_FLAGS.TESTING_MODE = true;
  FEATURE_FLAGS.BYPASS_GEO_RESTRICTION = true;
}

if (urlParams.get('bypass_geo') === 'true') {
  FEATURE_FLAGS.BYPASS_GEO_RESTRICTION = true;
}

if (urlParams.get('debug') === 'true') {
  FEATURE_FLAGS.DEBUG_MODE = true;
}

// Feature flag checker
export const isFeatureEnabled = (flagName) => {
  return FEATURE_FLAGS[flagName] || false;
};

// Get all active flags (for debugging)
export const getActiveFlags = () => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([key, value]) => value)
    .map(([key]) => key);
};

// Log active flags in development
if (FEATURE_FLAGS.DEBUG_MODE) {
  console.log('🚩 Active Feature Flags:', getActiveFlags());
}

export default FEATURE_FLAGS;
