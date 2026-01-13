import { isFeatureEnabled } from './featureFlags';

// Utah geo-restriction utility
export const checkUtahLocation = async () => {
  // Feature flag bypass for testing
  if (isFeatureEnabled('BYPASS_GEO_RESTRICTION') || isFeatureEnabled('TESTING_MODE')) {
    return { 
      allowed: true, 
      location: 'Testing Mode - Geo Bypass Enabled', 
      testing: true 
    };
  }

  try {
    // Try multiple IP geolocation services for reliability
    const services = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/',
      'https://ipinfo.io/json'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        
        // Check different response formats
        const region = data.region || data.regionName || data.region_name;
        const regionCode = data.region_code || data.region;
        const state = data.state;
        
        // Utah variations to check
        const utahVariations = ['Utah', 'UT', 'utah', 'UTAH'];
        
        if (utahVariations.includes(region) || 
            utahVariations.includes(regionCode) || 
            utahVariations.includes(state)) {
          return { allowed: true, location: region || regionCode || state };
        }
        
        // If we got a clear non-Utah result, block
        if (region || regionCode || state) {
          return { 
            allowed: false, 
            location: region || regionCode || state,
            message: 'This service is currently only available in Utah.'
          };
        }
      } catch (serviceError) {
        console.log(`Geolocation service failed: ${service}`, serviceError);
        continue; // Try next service
      }
    }
    
    // If all services fail, allow access (don't block due to technical issues)
    console.log('All geolocation services failed, allowing access');
    return { allowed: true, location: 'Unknown', fallback: true };
    
  } catch (error) {
    console.log('Geolocation check failed completely, allowing access', error);
    return { allowed: true, location: 'Unknown', fallback: true };
  }
};

// Check if user is in development mode or testing
export const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         isFeatureEnabled('TESTING_MODE');
};
