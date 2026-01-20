import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import NoticeForm from './components/NoticeForm';
import NoticePreview from './components/NoticePreview';
import PaymentForm from './components/PaymentForm';
import GeoRestriction from './components/GeoRestriction';
import DisclaimerBanner from './components/DisclaimerBanner';
import CookieConsent from './components/CookieConsent';
import Footer from './components/Footer';
import DocumentSelector from './components/DocumentSelector';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import documentService from './services/DocumentService';
import './index.css';

// Feature flag for document selector (Task 3.4)
const DOCUMENT_SELECTOR_ENABLED = process.env.REACT_APP_DOCUMENT_SELECTOR_ENABLED === 'true';

// Document titles mapping
const getDocumentTitle = (documentType) => {
  const titles = {
    'utah-3day-notice': 'Utah Compliant 3-Day Notice to Pay or Vacate',
    'utah-rent-increase': 'Utah Rent Increase Notice'
  };
  return titles[documentType] || 'Utah Legal Document';
};

// Layout wrapper for legal pages
function LegalPageLayout({ children }) {
  return (
    <GeoRestriction>
      <CookieConsent />
      {children}
      <Footer />
    </GeoRestriction>
  );
}

// Main form page component
function FormPage({ formData, setFormData, setShowPreview, showPayment, setShowPayment, paymentComplete, setPaymentComplete, documentType = 'utah-3day-notice' }) {
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    setShowPayment(false);
    alert('Payment successful! Your final PDF has been downloaded.');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleBackToSelector = () => {
    navigate('/');
  };

  if (showPayment) {
    return (
      <GeoRestriction>
        <DisclaimerBanner />
        <CookieConsent />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <PaymentForm
            formData={formData}
            documentType={documentType}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
        <Footer />
      </GeoRestriction>
    );
  }

  const title = getDocumentTitle(documentType);

  return (
    <GeoRestriction>
      <DisclaimerBanner />
      <CookieConsent />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Back button - only show if document selector is enabled */}
          {DOCUMENT_SELECTOR_ENABLED && (
            <button
              onClick={handleBackToSelector}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Document Selection
            </button>
          )}

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {title}
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
                documentType={documentType}
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
                <NoticePreview formData={formData} documentType={documentType} />
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

// Wrapper component to extract documentType from URL params
function FormPageWrapper(props) {
  const { documentType } = useParams();
  return <FormPage {...props} documentType={documentType || 'utah-3day-notice'} />;
}

function App() {
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

  // Shared form props
  const formProps = {
    formData,
    setFormData,
    setShowPreview,
    showPayment,
    setShowPayment,
    paymentComplete,
    setPaymentComplete
  };

  return (
    <Routes>
      {/* Legal pages */}
      <Route path="/terms-of-service" element={
        <LegalPageLayout>
          <TermsOfService />
        </LegalPageLayout>
      } />
      <Route path="/privacy-policy" element={
        <LegalPageLayout>
          <PrivacyPolicy />
        </LegalPageLayout>
      } />
      <Route path="/cookie-policy" element={
        <LegalPageLayout>
          <CookiePolicy />
        </LegalPageLayout>
      } />

      {/* Document form route with dynamic document type */}
      <Route path="/form/:documentType" element={
        <GeoRestriction>
          <CookieConsent />
          <FormPageWrapper {...formProps} />
        </GeoRestriction>
      } />

      {/* Home page - Document selector or direct form based on feature flag */}
      <Route path="/" element={
        DOCUMENT_SELECTOR_ENABLED ? (
          <GeoRestriction>
            <CookieConsent />
            <DocumentSelector />
            <Footer />
          </GeoRestriction>
        ) : (
          <FormPage {...formProps} documentType="utah-3day-notice" />
        )
      } />

      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
