import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-600 mb-8">
            Version 1.3 | Last Updated: November 21, 2025 | Effective Date: November 21, 2025
          </p>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies?</h2>
              <p className="text-gray-700">
                Cookies are small text files stored on your device when you visit our website. They help us provide, secure, and improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Types of Cookies We Use</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Essential Cookies (Always Active)</h3>
              <p className="text-gray-700 mb-2"><strong>Purpose:</strong> Required for core functionality. <strong>Cannot be disabled.</strong></p>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left">Cookie Name</th>
                      <th className="border px-4 py-2 text-left">Purpose</th>
                      <th className="border px-4 py-2 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">session_id</td>
                      <td className="border px-4 py-2">Maintains user session</td>
                      <td className="border px-4 py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">auth_token</td>
                      <td className="border px-4 py-2">Authentication and security</td>
                      <td className="border px-4 py-2">30 days</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">csrf_token</td>
                      <td className="border px-4 py-2">Prevents cross-site request forgery</td>
                      <td className="border px-4 py-2">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 Preference Cookies (Optional)</h3>
              <p className="text-gray-700 mb-2"><strong>Purpose:</strong> Remember your settings and preferences. <strong>User consent required.</strong></p>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left">Cookie Name</th>
                      <th className="border px-4 py-2 text-left">Purpose</th>
                      <th className="border px-4 py-2 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">user_preferences</td>
                      <td className="border px-4 py-2">UI settings, language, theme</td>
                      <td className="border px-4 py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">cookie_consent</td>
                      <td className="border px-4 py-2">Stores your cookie preferences</td>
                      <td className="border px-4 py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Analytics Cookies (Optional)</h3>
              <p className="text-gray-700 mb-2"><strong>Purpose:</strong> Understand how users interact with our service. <strong>User consent required.</strong></p>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left">Cookie Name</th>
                      <th className="border px-4 py-2 text-left">Purpose</th>
                      <th className="border px-4 py-2 text-left">Duration</th>
                      <th className="border px-4 py-2 text-left">Provider</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">_ga</td>
                      <td className="border px-4 py-2">Google Analytics - user identification</td>
                      <td className="border px-4 py-2">2 years</td>
                      <td className="border px-4 py-2">Google</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">_gid</td>
                      <td className="border px-4 py-2">Google Analytics - session tracking</td>
                      <td className="border px-4 py-2">24 hours</td>
                      <td className="border px-4 py-2">Google</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">_gat</td>
                      <td className="border px-4 py-2">Google Analytics - request throttling</td>
                      <td className="border px-4 py-2">1 minute</td>
                      <td className="border px-4 py-2">Google</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-700 mt-2 text-sm">
                <strong>Data Collected:</strong> Pages visited, time spent on site, click patterns, device and browser information, geographic location (city-level)
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Third-Party:</strong> Google Analytics (see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google's Privacy Policy</a>)
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cookie Consent Banner</h2>
              <p className="text-gray-700 mb-2">
                When you first visit LeaseLogic, you will see a cookie consent banner with options to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Accept All:</strong> Enable all cookies</li>
                <li><strong>Reject Non-Essential:</strong> Only essential cookies</li>
                <li><strong>Customize:</strong> Choose specific cookie categories</li>
              </ul>
              <p className="text-gray-700 mt-2">
                <strong>Non-essential cookies load only after consent.</strong> Your choice is stored in the <code className="bg-gray-100 px-1 py-0.5 rounded">cookie_consent</code> cookie for 1 year.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. How to Manage Cookies</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.1 Through Our Cookie Banner</h3>
              <p className="text-gray-700">
                Click the "Cookie Settings" link in the footer to update your preferences at any time.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.2 Through Your Browser</h3>
              <p className="text-gray-700 mb-2">You can control cookies through browser settings:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies</li>
                <li><strong>Firefox:</strong> Settings &gt; Privacy & Security &gt; Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies and Website Data</li>
                <li><strong>Edge:</strong> Settings &gt; Cookies and Site Permissions</li>
              </ul>
              <p className="text-gray-700 mt-2">
                <strong>Note:</strong> Disabling essential cookies may prevent core functionality.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.3 Opt-Out Tools</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Google Analytics Opt-Out:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Browser Add-On</a></li>
                <li><strong>Do Not Track (DNT):</strong> We honor DNT browser signals</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-2">We use third-party services that may set their own cookies:</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left">Service</th>
                      <th className="border px-4 py-2 text-left">Purpose</th>
                      <th className="border px-4 py-2 text-left">Privacy Policy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">Google Analytics</td>
                      <td className="border px-4 py-2">Usage analytics</td>
                      <td className="border px-4 py-2">
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a>
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">Stripe</td>
                      <td className="border px-4 py-2">Payment processing</td>
                      <td className="border px-4 py-2">
                        <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-700 mt-2">
                We do not control third-party cookies. Review their privacy policies for details.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Do Not Track (DNT)</h2>
              <p className="text-gray-700">
                We respect browser Do Not Track (DNT) signals. When DNT is enabled in your browser, we will not load non-essential cookies or tracking technologies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. GDPR and CPRA Compliance</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.1 GDPR (EU Users)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We obtain explicit consent before setting non-essential cookies</li>
                <li>You can withdraw consent at any time</li>
                <li>Essential cookies are exempt under GDPR Article 6(1)(f) (legitimate interest)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.2 CPRA (California Users)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We disclose all tracking technologies</li>
                <li>You can opt out via cookie banner or "Do Not Sell or Share My Data" link</li>
                <li>We do NOT sell or share data collected via cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy. Changes will be posted with a new "Last Updated" date. If we add new cookie types requiring consent, we will request renewed consent via the cookie banner.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
              <p className="text-gray-700">
                Questions about cookies or this policy?<br />
                <strong>Email:</strong> <a href="mailto:privacy@leaselogic.app" className="text-blue-600 hover:underline">privacy@leaselogic.app</a><br />
                <strong>General Support:</strong> <a href="mailto:support@leaselogic.app" className="text-blue-600 hover:underline">support@leaselogic.app</a>
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

export default CookiePolicy;
