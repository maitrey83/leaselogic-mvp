import React, { useState } from 'react';

function TestDownload() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const testData = {
    propertyAddress: "123 Test Street",
    propertyCity: "Salt Lake City",
    propertyState: "UT",
    propertyZip: "84101",
    tenantName: "John Doe",
    landlordName: "Jane Smith",
    landlordPhone: "801-555-1234",
    pastDueAmount: "1500.00",
    noticeDate: "2025-11-21"
  };

  const testBackend = async () => {
    setStatus('Testing backend connection...');
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();
      setStatus(`✅ Backend connected: ${data.message}`);
    } catch (err) {
      setError(`❌ Backend error: ${err.message}`);
    }
  };

  const testPDFDownload = async () => {
    setStatus('Testing PDF download...');
    setError('');
    
    try {
      console.log('Fetching from:', `${API_URL}/api/pdf/preview`);
      console.log('Data:', testData);
      
      const response = await fetch(`${API_URL}/api/pdf/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const blob = await response.blob();
        console.log('Blob size:', blob.size);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test-download.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setStatus(`✅ PDF downloaded successfully! (${blob.size} bytes)`);
      } else {
        const text = await response.text();
        setError(`❌ PDF generation failed: ${response.status} - ${text}`);
      }
    } catch (err) {
      console.error('Download error:', err);
      setError(`❌ Download error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 Download Diagnostic Test</h1>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Environment Check:</h3>
        <p><strong>API_URL:</strong> {API_URL}</p>
        <p><strong>REACT_APP_API_URL:</strong> {process.env.REACT_APP_API_URL || 'NOT SET'}</p>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={testBackend}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Test Backend Connection
        </button>
        <button 
          onClick={testPDFDownload}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Test PDF Download
        </button>
      </div>

      {status && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb',
          borderRadius: '5px'
        }}>
          {status}
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          color: '#721c24'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Test Backend Connection" first</li>
          <li>If that works, click "Test PDF Download"</li>
          <li>Check browser console (F12) for detailed logs</li>
          <li>Check browser's download folder for test-download.pdf</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          ← Back to Main Form
        </a>
      </div>
    </div>
  );
}

export default TestDownload;
