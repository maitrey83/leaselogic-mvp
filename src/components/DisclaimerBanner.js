import React from 'react';

const DisclaimerBanner = () => {
  return (
    <div className="bg-red-600 text-white py-2 px-4 text-center text-sm">
      <div className="max-w-6xl mx-auto">
        <strong>IMPORTANT:</strong> This service provides document templates only and does NOT provide legal advice. 
        Consult with a qualified Utah attorney for legal guidance. Use at your own risk.
        <a 
          href="#disclaimer" 
          className="underline ml-2 hover:text-red-200"
          onClick={(e) => {
            e.preventDefault();
            alert('This service generates legal document templates but does not provide legal advice. You are responsible for ensuring compliance with current laws and proper legal procedures. Consult an attorney for legal advice.');
          }}
        >
          Read Full Disclaimer
        </a>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
