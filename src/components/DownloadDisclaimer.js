import React, { useState } from 'react';
import { logConsent } from '../utils/consentLogger';

const DownloadDisclaimer = ({ onAccept, onCancel, isPreview = false, isPurchase = false }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    if (accepted) {
      // Log consent before proceeding
      const consentType = isPurchase ? 'purchase' : isPreview ? 'download-preview' : 'download-final';
      await logConsent(consentType);
      
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-lg bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4">
          <div className="text-red-500 text-4xl mb-2">WARNING</div>
          <h2 className="text-xl font-bold text-gray-900">
            {isPurchase ? 'Purchase Final Document' : isPreview ? 'Download Preview' : 'Download Final Document'}
          </h2>
          <p className="text-red-600 font-semibold text-sm">
            Legal Disclaimer Required
          </p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
          <p className="text-red-800 font-bold text-sm">NOT LEGAL ADVICE</p>
          <p className="text-red-700 text-xs">
            This document is a template only. We do not provide legal advice.
          </p>
        </div>

        <div className="text-sm text-gray-700 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900">By downloading, you acknowledge:</h3>
            <ul className="list-disc list-inside text-xs space-y-1 mt-2">
              <li>This is a document template, not legal advice</li>
              <li>You are the <strong>sole preparer</strong> of this document</li>
              <li>You are responsible for legal compliance</li>
              <li>Laws change - verify current requirements</li>
              <li>Consult an attorney for legal guidance</li>
              <li>You use this document at your own risk</li>
              <li>We are not liable for any legal consequences</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
            <p className="text-yellow-900 text-xs font-semibold mb-2">
              By proceeding, you agree to:
            </p>
            <ul className="text-yellow-800 text-xs space-y-1">
              <li>• <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">Terms of Service v1.3</a></li>
              <li>• <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">Privacy Policy v1.3</a></li>
              <li>• <a href="/cookie-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">Cookie Policy v1.3</a></li>
              <li>• All disclaimers and limitations of liability</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-3 rounded">
            <p className="text-blue-800 text-xs font-semibold">
              STRONGLY RECOMMENDED: Consult with a qualified Utah attorney 
              before using any legal documents, especially for complex situations.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              data-cy="disclaimer-checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="text-xs text-gray-700">
              <strong>I understand and accept</strong> that this is a template service only, 
              not legal advice. I am the sole preparer of this document and downloading at my own risk. 
              I agree to the Terms of Service, Privacy Policy, and Cookie Policy. 
              I should consult an attorney for legal guidance.
            </span>
          </label>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            data-cy="disclaimer-cancel-btn"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
          <button
            data-cy="disclaimer-accept-btn"
            onClick={handleAccept}
            disabled={!accepted}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              accepted
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isPurchase ? 'Accept & Continue to Payment' : 'Accept & Download'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          This disclaimer is required before each download
        </p>
      </div>
    </div>
  );
};

export default DownloadDisclaimer;
