import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    preference: false,
    analytics: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('leaselogic_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      const saved = JSON.parse(consent);
      setPreferences(saved);
      applyConsent(saved);
    }
  }, []);

  const applyConsent = (prefs) => {
    // Apply Google Analytics based on consent
    if (prefs.analytics && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    } else if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
  };

  const saveConsent = (prefs) => {
    const consentData = {
      ...prefs,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('leaselogic_cookie_consent', JSON.stringify(consentData));

    // Set cookie for 1 year
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `cookie_consent=accepted; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

    applyConsent(prefs);
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      preference: true,
      analytics: true
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      essential: true,
      preference: false,
      analytics: false
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
    setShowCustomize(false);
  };

  const handleToggle = (key) => {
    if (key === 'essential') return; // Can't disable essential
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Expose function to reopen banner (for Cookie Settings link)
  useEffect(() => {
    window.reopenCookieConsent = () => {
      setIsVisible(true);
      setShowCustomize(false);
    };
    return () => {
      delete window.reopenCookieConsent;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!showCustomize ? (
          // Main consent screen
          <div className="p-6">
            <div className="flex items-start mb-4">
              <div className="text-3xl mr-3">🍪</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Cookie Preferences</h2>
                <p className="text-sm text-gray-600 mt-1">
                  We use cookies to improve your experience and analyze site usage.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Your Privacy Matters:</strong> We respect your data rights under GDPR and CPRA.
                You can customize your cookie preferences or accept/reject all non-essential cookies.
              </p>
            </div>

            <div className="space-y-3 mb-6 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900">Essential Cookies (Always Active)</h3>
                <p className="text-xs text-gray-600">
                  Required for core functionality like authentication and security.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Preference Cookies (Optional)</h3>
                <p className="text-xs text-gray-600">
                  Remember your settings and preferences for a better experience.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics Cookies (Optional)</h3>
                <p className="text-xs text-gray-600">
                  Help us understand how you use our site to improve our services.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                data-cy="cookie-accept-all"
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium text-sm"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                data-cy="cookie-reject-non-essential"
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 font-medium text-sm"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                data-cy="cookie-customize"
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 font-medium text-sm"
              >
                Customize
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              By clicking "Accept All", you consent to our use of cookies.
              Learn more in our{' '}
              <a href="/cookie-policy" className="text-blue-600 hover:underline">
                Cookie Policy
              </a>
              {' '}and{' '}
              <a href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        ) : (
          // Customize screen
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customize Cookie Preferences</h2>

            <div className="space-y-4 mb-6">
              {/* Essential Cookies */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Essential Cookies</h3>
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Always Active
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Required for authentication, security, and core functionality. Cannot be disabled.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Examples: session_id, auth_token, csrf_token
                </p>
              </div>

              {/* Preference Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Preference Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.preference}
                      onChange={() => handleToggle('preference')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Remember your settings, language preferences, and UI customizations.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Examples: user_preferences, theme, language
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handleToggle('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Help us understand site usage and improve our services through Google Analytics.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Examples: _ga, _gid, _gat (Google Analytics)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCustomize(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 font-medium text-sm"
              >
                Back
              </button>
              <button
                onClick={handleSaveCustom}
                data-cy="cookie-save-preferences"
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium text-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
