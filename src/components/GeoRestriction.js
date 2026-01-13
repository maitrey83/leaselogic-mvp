import React, { useState, useEffect } from 'react';
import { checkUtahLocation, isDevelopmentMode } from '../utils/geolocation';
import { isFeatureEnabled, getActiveFlags } from '../utils/featureFlags';

const GeoRestriction = ({ children }) => {
  const [geoStatus, setGeoStatus] = useState({
    loading: true,
    allowed: false,
    location: '',
    message: '',
    isDev: false
  });

  useEffect(() => {
    const checkLocation = async () => {
      const isDev = isDevelopmentMode();
      
      if (isDev) {
        // Allow access in development mode
        setGeoStatus({
          loading: false,
          allowed: true,
          location: 'Development Mode',
          isDev: true
        });
        return;
      }

      // Check geolocation in production
      const result = await checkUtahLocation();
      setGeoStatus({
        loading: false,
        allowed: result.allowed,
        location: result.location,
        message: result.message || '',
        fallback: result.fallback || false,
        isDev: false
      });
    };

    checkLocation();
  }, []);

  if (geoStatus.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking service availability...</p>
        </div>
      </div>
    );
  }

  if (!geoStatus.allowed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-6xl mb-4">BLOCKED</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Service Not Available
          </h1>
          <p className="text-gray-600 mb-4">
            {geoStatus.message}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Detected location: {geoStatus.location}
          </p>
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">Coming Soon!</h3>
            <p className="text-blue-700 text-sm">
              We're working to expand our service to other states. 
              Check back soon or contact us for updates.
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show testing mode indicator
  if (geoStatus.testing || isFeatureEnabled('TESTING_MODE')) {
    return (
      <div>
        <div className="bg-orange-100 border-l-4 border-orange-500 p-2 mb-4">
          <p className="text-orange-700 text-sm">
            TESTING MODE - Geo-restriction bypassed for development
            {isFeatureEnabled('DEBUG_MODE') && (
              <span className="ml-2 text-xs">
                (Flags: {getActiveFlags().join(', ')})
              </span>
            )}
          </p>
        </div>
        {children}
      </div>
    );
  }

  // Show success message for Utah users
  return (
    <div>
      <div className="bg-green-100 border-l-4 border-green-500 p-2 mb-4">
        <p className="text-green-700 text-sm">
          Service available in {geoStatus.location}
          {geoStatus.fallback && ' (Location detection limited)'}
        </p>
      </div>
      {children}
    </div>
  );
};

export default GeoRestriction;
