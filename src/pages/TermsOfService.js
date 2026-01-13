import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">
            Version 1.3 | Last Updated: November 21, 2025
          </p>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Overview</h2>
              <p className="text-gray-700">
                LeaseLogic ("Company," "we," "our," "us") provides software tools that help landlords generate legally compliant notices. LeaseLogic is <strong>not a law firm</strong> and <strong>does not provide legal advice</strong>. By using our services ("Services"), you agree to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. No Legal Advice – Not a Law Firm</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>LeaseLogic is <strong>not a substitute for an attorney</strong>.</li>
                <li>No attorney-client relationship is created.</li>
                <li>Generated documents are provided <strong>AS-IS</strong> for informational purposes only.</li>
                <li>You should seek legal counsel before relying on generated materials.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Responsibilities</h2>
              <p className="text-gray-700 mb-2">You agree that:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You are the <strong>sole preparer</strong> of any generated document.</li>
                <li>You are solely responsible for verifying the accuracy and completeness of all information you provide.</li>
                <li>You are responsible for determining whether a document is appropriate for your situation.</li>
                <li>You will consult a licensed attorney for legal advice or representation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Service Scope</h2>
              <p className="text-gray-700">
                LeaseLogic generates <strong>jurisdiction-specific landlord notices</strong>, starting with the Utah 3-Day Notice to Pay or Vacate. Coverage may vary by municipality, court requirements, and legislative changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Accuracy & Statute-Change Notice</h2>
              <p className="text-gray-700 mb-2">We do not guarantee that:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>generated documents reflect the latest legal changes,</li>
                <li>formatting or content satisfies local court rules,</li>
                <li>output is error-free or legally sufficient.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. No Warranty</h2>
              <p className="text-gray-700">
                The Services are provided <strong>"AS IS" and "AS AVAILABLE."</strong> We disclaim all implied and express warranties, including merchantability and fitness for a particular purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Payments & Refunds</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Fees are transactional per generated document.</li>
                <li>All sales are final due to instant digital delivery.</li>
                <li>Refunds are granted only for accidental duplicate purchases.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. PDF Storage (Permanent Storage)</h2>
              <p className="text-gray-700 mb-2">By using the Service, you acknowledge that:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>LeaseLogic permanently stores PDFs you generate.</li>
                <li>PDFs are linked to your account for retrieval and audit purposes.</li>
                <li>You may request deletion at any time (see Privacy Policy).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Indemnification</h2>
              <p className="text-gray-700">
                You agree to defend, indemnify, and hold LeaseLogic harmless from claims arising out of:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>your use of generated documents,</li>
                <li>inaccurate or incomplete information you provide,</li>
                <li>disputes involving tenants or eviction processes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
              <p className="text-gray-700">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We are not liable for indirect, special, incidental, or consequential damages.</li>
                <li>Our total liability will not exceed the total paid by you for the Service in the prior 12 months.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Arbitration & Class Action Waiver</h2>
              <p className="text-gray-700">
                Any dispute must be resolved through <strong>binding arbitration</strong> in Utah. You waive the right to participate in a class action.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. DMCA Safe Harbor</h2>
              <p className="text-gray-700">
                If you believe material infringes your copyright, send a DMCA notice to: <a href="mailto:dmca@leaselogic.app" className="text-blue-600 hover:underline">dmca@leaselogic.app</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Termination</h2>
              <p className="text-gray-700">
                We may suspend or terminate access for misuse, fraud, or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Governing Law</h2>
              <p className="text-gray-700">
                These Terms are governed by the laws of the State of Utah.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Contact</h2>
              <p className="text-gray-700">
                <a href="mailto:support@leaselogic.app" className="text-blue-600 hover:underline">support@leaselogic.app</a>
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t">
            <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
