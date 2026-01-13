import React, { useState, useEffect } from 'react';
import NoticeForm from './components/NoticeForm';
import NoticePreview from './components/NoticePreview';
import PaymentForm from './components/PaymentForm';
import GeoRestriction from './components/GeoRestriction';
import DisclaimerBanner from './components/DisclaimerBanner';
import CookieConsent from './components/CookieConsent';
import Footer from './components/Footer';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: 'UT',
    zipCode: '',
    tenantNames: '',
    landlordName: '',
    landlordPhone: '',
    landlordEmail: '',
    pastDueAmount: '',
    originalDueDate: '',
    noticeDate: new Date().toISOString().split('T')[0]
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Simple routing based on URL path
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/terms-of-service') setCurrentPage('terms');
    else if (path === '/privacy-policy') setCurrentPage('privacy');
    else if (path === '/cookie-policy') setCurrentPage('cookie');
    else setCurrentPage('home');

    // Handle link clicks
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
          e.preventDefault();
          window.history.pushState({}, '', url.pathname);
          if (url.pathname === '/terms-of-service') setCurrentPage('terms');
          else if (url.pathname === '/privacy-policy') setCurrentPage('privacy');
          else if (url.pathname === '/cookie-policy') setCurrentPage('cookie');
          else setCurrentPage('home');
          window.scrollTo(0, 0);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    setShowPayment(false);
    alert('Payment successful! Your final PDF has been downloaded.');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  // Render legal pages
  if (currentPage === 'terms') {
    return (
      <GeoRestriction>
        <CookieConsent />
        <TermsOfService />
        <Footer />
      </GeoRestriction>
    );
  }

  if (currentPage === 'privacy') {
    return (
      <GeoRestriction>
        <CookieConsent />
        <PrivacyPolicy />
        <Footer />
      </GeoRestriction>
    );
  }

  if (currentPage === 'cookie') {
    return (
      <GeoRestriction>
        <CookieConsent />
        <CookiePolicy />
        <Footer />
      </GeoRestriction>
    );
  }

  if (showPayment) {
    return (
      <GeoRestriction>
        <DisclaimerBanner />
        <CookieConsent />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <PaymentForm 
            formData={formData}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
        <Footer />
      </GeoRestriction>
    );
  }

  return (
    <GeoRestriction>
      <DisclaimerBanner />
      <CookieConsent />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Utah Compliant 3-Day Notice to Pay or Vacate
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Document Template Generator - Not Legal Advice
          </p>
          
          {paymentComplete && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
              Payment successful! Your final PDF has been downloaded.
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div>
              <NoticeForm 
                formData={formData} 
                setFormData={setFormData}
                setShowPreview={setShowPreview}
                setShowPayment={setShowPayment}
              />
            </div>
            
            {/* Preview Section */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
                <p className="text-sm text-gray-600">
                  Preview updates as you type. This is a draft version with watermark.
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Template only - Verify legal compliance with an attorney
                </p>
              </div>
              <div className="max-h-screen overflow-y-auto">
                <NoticePreview formData={formData} />
              </div>
            </div>
          </div>
          
          {/* Footer Disclaimer */}
          <div className="mt-12 border-t pt-8">
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Legal Notice</h3>
              <p className="text-sm text-gray-700">
                This service provides document templates only and does not constitute legal advice. 
                Laws change frequently, and proper legal procedures vary by situation. 
                <strong className="text-red-600"> We strongly recommend consulting with a qualified Utah attorney</strong> 
                before using any legal documents, especially for complex situations or if you are unsure about proper procedures.
                You use this service at your own risk.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </GeoRestriction>
  );
}

export default App;
