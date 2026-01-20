/**
 * Consent Logger Utility
 * Logs user consent to Terms of Service, Privacy Policy, and Cookie Policy
 * Server-side logging with IP capture for legal compliance
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const logConsent = async (consentType, documentType = 'utah-3day-pay-or-quit') => {
  const consentData = {
    userId: null, // null for anonymous users
    documentType: documentType,
    consentType: consentType, // 'download-preview', 'download-final', 'purchase'
    policyVersion: {
      termsOfService: 'v1.3',
      privacyPolicy: 'v1.3',
      cookiePolicy: 'v1.3'
    }
  };

  try {
    // Send to backend API for database storage with server-side IP capture
    const response = await fetch(`${API_URL}/api/consent/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consentData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Consent logged to database:', {
        consentId: result.consentId,
        timestamp: result.timestamp,
        documentType,
        consentType
      });
      return result;
    } else {
      console.error('❌ Consent logging failed:', result.error);
      // Fallback to localStorage
      logToLocalStorage(consentType, documentType);
      return null;
    }
  } catch (error) {
    console.error('❌ Consent API error:', error);
    // Fallback to localStorage
    logToLocalStorage(consentType, documentType);
    return null;
  }
};

// Fallback localStorage logging
const logToLocalStorage = (consentType, documentType) => {
  const consentRecord = {
    timestamp: new Date().toISOString(),
    consentType,
    documentType,
    policies: { termsOfService: 'v1.3', privacyPolicy: 'v1.3', cookiePolicy: 'v1.3' },
    userAgent: navigator.userAgent
  };
  const existing = JSON.parse(localStorage.getItem('consentLogs') || '[]');
  existing.push(consentRecord);
  localStorage.setItem('consentLogs', JSON.stringify(existing));
  console.log('⚠️ Consent logged to localStorage (fallback)');
};

export const getConsentHistory = () => {
  return JSON.parse(localStorage.getItem('consentLogs') || '[]');
};

export const hasUserConsented = (consentType) => {
  const consents = getConsentHistory();
  return consents.some(c => c.consentType === consentType);
};
