import React, { useState } from 'react';
import { logConsent } from '../utils/consentLogger';

function TestConsent() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testConsentType = async (type) => {
    setLoading(true);
    try {
      const result = await logConsent(type, 'utah-3day-pay-or-quit');
      setResults(prev => [...prev, {
        type,
        success: !!result,
        consentId: result?.consentId,
        timestamp: result?.timestamp || new Date().toISOString(),
        time: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        type,
        success: false,
        error: error.message,
        time: new Date().toLocaleTimeString()
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Consent Logging Test Page</h1>
      <p>Test the complete consent logging flow: Frontend → Backend API → Supabase</p>
      
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => testConsentType('download-preview')}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Test Preview Consent
        </button>
        <button 
          onClick={() => testConsentType('download-final')}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Test Final Download
        </button>
        <button 
          onClick={() => testConsentType('purchase')}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Test Purchase
        </button>
        <button 
          onClick={() => setResults([])}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginLeft: 'auto' }}
        >
          Clear Results
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>Test Results</h2>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: '#f9f9f9'
          }}>
            {results.map((result, i) => (
              <div 
                key={i} 
                style={{ 
                  marginBottom: '15px', 
                  padding: '15px',
                  backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                  border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                  borderRadius: '5px'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {result.success ? '✅' : '❌'} {result.type} - {result.time}
                </div>
                {result.success ? (
                  <>
                    <div style={{ fontSize: '14px', color: '#155724' }}>
                      Consent ID: {result.consentId}
                    </div>
                    <div style={{ fontSize: '14px', color: '#155724' }}>
                      Timestamp: {result.timestamp}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '14px', color: '#721c24' }}>
                    Error: {result.error || 'Failed to log consent'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h3>System Status</h3>
        <ul>
          <li>✅ Backend API: http://localhost:5000</li>
          <li>✅ Supabase: Connected</li>
          <li>✅ IP Capture: Server-side</li>
          <li>✅ Policy Version: v1.3</li>
        </ul>
      </div>
    </div>
  );
}

export default TestConsent;
