import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">
            Version 1.3 | Last Updated: November 21, 2025 | Effective Date: November 21, 2025
          </p>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Overview</h2>
              <p className="text-gray-700">
                LeaseLogic ("we," "our," "us") respects your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Account Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Email address</li>
                <li>Name (optional)</li>
                <li>Payment information (processed by third-party payment processor)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 Document Generation Data</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Property addresses</li>
                <li>Tenant names and contact information</li>
                <li>Rent amounts and payment details</li>
                <li>Lease terms and dates</li>
                <li>Generated PDF documents</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Technical Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Session data</li>
                <li>Cookies and tracking technologies (see Cookie Policy)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-2">We use collected information to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Generate jurisdiction-specific legal notices</li>
                <li>Process payments and maintain account records</li>
                <li>Store generated PDFs for retrieval and audit purposes</li>
                <li>Improve service functionality and user experience</li>
                <li>Communicate service updates and support responses</li>
                <li>Comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Legal Basis for Processing (GDPR)</h2>
              <p className="text-gray-700 mb-2">We process personal data under the following legal bases:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Contract Performance:</strong> To provide document generation services</li>
                <li><strong>Legitimate Interest:</strong> To improve services and prevent fraud</li>
                <li><strong>Legal Obligation:</strong> To comply with tax and financial regulations</li>
                <li><strong>Consent:</strong> For marketing communications (opt-in only)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Storage and Retention</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.1 Permanent PDF Storage</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Generated PDFs are <strong>permanently stored</strong> and linked to your account</li>
                <li>PDFs remain accessible for retrieval and audit purposes</li>
                <li>You may request deletion at any time (see Section 9)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.2 Retention Schedules</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Account data:</strong> Retained while account is active + 7 years after closure</li>
                <li><strong>Generated PDFs:</strong> Permanent storage unless deletion requested</li>
                <li><strong>Payment records:</strong> 7 years (tax compliance requirement)</li>
                <li><strong>Technical logs:</strong> 90 days</li>
                <li><strong>Marketing consent:</strong> Until withdrawn</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-2">
                <strong>We do NOT sell your personal information.</strong>
              </p>
              <p className="text-gray-700 mb-2">We may share data with:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Payment processors:</strong> Stripe or similar (PCI-DSS compliant)</li>
                <li><strong>Cloud hosting providers:</strong> AWS or similar (encrypted storage)</li>
                <li><strong>Legal authorities:</strong> When required by law or court order</li>
                <li><strong>Service providers:</strong> Analytics, email, customer support (under data processing agreements)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. International Data Transfers</h2>
              <p className="text-gray-700">
                Your data may be transferred to and processed in the United States. We ensure adequate safeguards through Standard Contractual Clauses (SCCs) for EU data and compliance with GDPR Article 46 requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Data Security</h2>
              <p className="text-gray-700 mb-2">We implement industry-standard security measures:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Encryption in transit (TLS/SSL)</li>
                <li>Encryption at rest for stored PDFs</li>
                <li>Access controls and authentication</li>
                <li>Regular security audits</li>
                <li>Secure payment processing (PCI-DSS compliant processors)</li>
              </ul>
              <p className="text-gray-700 mt-2">
                No system is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section id="your-rights">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Your Privacy Rights</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">9.1 GDPR Rights (EU Users)</h3>
              <p className="text-gray-700 mb-2">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data - View what data we hold about you</li>
                <li><strong>Rectification:</strong> Correct inaccurate data - Fix any errors in your information</li>
                <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten") - Remove your data from our systems</li>
                <li><strong>Restriction:</strong> Limit how we process your data - Restrict certain uses of your information</li>
                <li><strong>Portability:</strong> Receive your data in machine-readable format - Get your data in a portable format</li>
                <li><strong>Object:</strong> Opt out of processing based on legitimate interest - Object to certain data processing</li>
                <li><strong>Withdraw Consent:</strong> For marketing communications - Revoke consent at any time</li>
              </ul>
              <p className="text-gray-700 mt-2">
                Contact: <strong>privacy@leaselogic.app</strong>
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">9.2 CPRA Rights (California Users)</h3>
              <p className="text-gray-700 mb-2">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Know what personal information is collected</li>
                <li>Know whether personal information is sold or shared</li>
                <li>Opt out of sale/sharing of personal information</li>
                <li>Request deletion of personal information</li>
                <li>Correct inaccurate personal information</li>
                <li>Limit use of sensitive personal information</li>
                <li>Non-discrimination for exercising privacy rights</li>
              </ul>
              <p className="text-gray-700 mt-2">
                <strong>We do NOT sell or share personal information for cross-context behavioral advertising.</strong>
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">9.3 How to Exercise Your Rights</h3>
              <p className="text-gray-700">
                Email: <a href="mailto:privacy@leaselogic.app" className="text-blue-600 hover:underline">privacy@leaselogic.app</a>
              </p>
              <p className="text-gray-700">
                We will respond within 30 days (GDPR requests) or 45 days (CPRA requests).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Children's Privacy (COPPA)</h2>
              <p className="text-gray-700">
                LeaseLogic is not intended for users under 18. We do not knowingly collect data from children. If we discover such collection, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Data Retention</h2>
              <p className="text-gray-700 mb-2">We retain data as follows:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Generated PDFs:</strong> Until user requests deletion</li>
                <li><strong>Financial records:</strong> 7 years (legal requirement)</li>
                <li><strong>Web server logs:</strong> 90 days</li>
                <li><strong>Account data:</strong> Until account deletion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Data Breach Notification</h2>
              <p className="text-gray-700">
                We follow GDPR's 72-hour notification requirement. In the event of a data breach affecting your personal information, we will notify you and relevant authorities within 72 hours of discovery.
              </p>
            </section>

            <section id="do-not-sell">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Do Not Sell or Share My Personal Information</h2>
              <p className="text-gray-700">
                California users: <strong>We do not sell or share your personal information.</strong> If our practices change, we will update this policy and provide an opt-out mechanism.
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Current Status:</strong> No sale or sharing occurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">18. Contact Information</h2>
              <p className="text-gray-700">
                <strong>General Privacy Inquiries:</strong> <a href="mailto:privacy@leaselogic.app" className="text-blue-600 hover:underline">privacy@leaselogic.app</a><br />
                <strong>Data Subject Requests:</strong> <a href="mailto:privacy@leaselogic.app" className="text-blue-600 hover:underline">privacy@leaselogic.app</a><br />
                <strong>General Support:</strong> <a href="mailto:support@leaselogic.app" className="text-blue-600 hover:underline">support@leaselogic.app</a><br />
                <strong>DMCA Notices:</strong> <a href="mailto:dmca@leaselogic.app" className="text-blue-600 hover:underline">dmca@leaselogic.app</a>
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

export default PrivacyPolicy;
