import React from 'react';

const Footer = () => {
  const handleCookieSettings = (e) => {
    e.preventDefault();
    if (window.reopenCookieConsent) {
      window.reopenCookieConsent();
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/cookie-policy" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a 
                  href="#cookie-settings" 
                  onClick={handleCookieSettings}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cookie Settings
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@leaselogic.app" className="hover:text-white transition-colors">
                  support@leaselogic.app
                </a>
              </li>
              <li>
                <a href="mailto:privacy@leaselogic.app" className="hover:text-white transition-colors">
                  privacy@leaselogic.app
                </a>
              </li>
              <li>
                <a href="mailto:dmca@leaselogic.app" className="hover:text-white transition-colors">
                  dmca@leaselogic.app
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-3">LeaseLogic</h3>
            <p className="text-sm mb-3">
              Document template generator for Utah landlords. Not a law firm. Not legal advice.
            </p>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} LeaseLogic. All rights reserved.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
            <p>
              LeaseLogic is not a law firm and does not provide legal advice.
            </p>
            <p className="mt-2 md:mt-0">
              <a 
                href="/privacy-policy#do-not-sell" 
                className="hover:text-white transition-colors"
              >
                Do Not Sell or Share My Personal Information
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
