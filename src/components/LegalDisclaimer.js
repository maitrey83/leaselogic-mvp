import React, { useState } from 'react';

const LegalDisclaimer = ({ onAccept }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      localStorage.setItem('leaselogic_disclaimer_accepted', 'true');
      onAccept();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-yellow-500 text-6xl mb-4">WARNING</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Important Legal Notice
          </h1>
          <p className="text-red-600 font-semibold">
            Please read carefully before proceeding
          </p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <h2 className="font-bold text-red-800 mb-2">NOT LEGAL ADVICE</h2>
          <p className="text-red-700 text-sm">
            This service provides document templates only. It does NOT provide legal advice, 
            legal representation, or legal services of any kind.
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-700 max-h-64 overflow-y-auto border p-4 rounded">
          <div>
            <h3 className="font-semibold text-gray-900">DISCLAIMER OF WARRANTIES</h3>
            <p>
              LeaseLogic provides this document generation service "AS IS" without any warranties, 
              express or implied. We make no guarantees about the accuracy, completeness, or 
              legal sufficiency of any documents generated.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">NO ATTORNEY-CLIENT RELATIONSHIP</h3>
            <p>
              Use of this service does not create an attorney-client relationship. We are not 
              a law firm and do not provide legal advice. You should consult with a qualified 
              attorney for legal advice specific to your situation.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">USER RESPONSIBILITY</h3>
            <p>
              You are solely responsible for:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Ensuring the accuracy of all information entered</li>
              <li>Verifying compliance with current Utah laws</li>
              <li>Proper service of legal documents</li>
              <li>Following all applicable legal procedures</li>
              <li>Consulting with an attorney when needed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">LIMITATION OF LIABILITY</h3>
            <p>
              LeaseLogic and its operators shall not be liable for any damages, losses, or 
              legal consequences arising from the use of this service or any documents generated, 
              including but not limited to failed eviction proceedings, legal fees, or other costs.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">LEGAL COMPLIANCE</h3>
            <p>
              Laws change frequently. While we strive to keep our templates current with Utah 
              Code § 78B-6-802, you are responsible for ensuring compliance with the most 
              current laws and regulations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">RECOMMENDATION</h3>
            <p className="font-semibold text-blue-800">
              We strongly recommend consulting with a qualified Utah attorney before using 
              any legal documents, especially in complex situations or if you are unsure 
              about proper procedures.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              I understand and acknowledge that:
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>This service does NOT provide legal advice</li>
                <li>I am using this service at my own risk</li>
                <li>I should consult an attorney for legal advice</li>
                <li>I am responsible for ensuring legal compliance</li>
                <li>LeaseLogic is not liable for any legal consequences</li>
              </ul>
            </span>
          </label>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => window.location.href = 'https://google.com'}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400"
          >
            I Do Not Accept - Exit
          </button>
          <button
            onClick={handleAccept}
            disabled={!accepted}
            className={`flex-1 py-3 px-4 rounded-md font-medium ${
              accepted 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            I Accept - Continue
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          By clicking "I Accept", you agree to these terms and acknowledge you have read this disclaimer.
        </p>
      </div>
    </div>
  );
};

export default LegalDisclaimer;
