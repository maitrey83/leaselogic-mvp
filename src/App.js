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

// Task 3.8: Authentication components
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import './index.css';

// Feature flag for document selector (Task 3.4)
// Task 3.8: Disabled to use authentication flow
const DOCUMENT_SELECTOR_ENABLED = process.env.REACT_APP_DOCUMENT_SELECTOR_ENABLED === 'true';
const USE_NEW_DOCUMENT_SYSTEM = process.env.REACT_APP_USE_NEW_DOCUMENT_SYSTEM === 'true';

/**
 * Phase 3B: Get initial formData based on document type
 * Dynamically generates formData from document definition when new system is enabled
 */
const getInitialFormData = (documentType = 'utah-3day-notice') => {
  if (USE_NEW_DOCUMENT_SYSTEM) {
    try {
      const doc = documentService.getDocument(documentType);
      const initialData = {};

      // Generate initial data from field definitions
      doc.fields.forEach(field => {
        if (field.defaultValue === 'today') {
          initialData[field.id] = new Date().toISOString().split('T')[0];
        } else if (field.defaultValue) {
          initialData[field.id] = field.defaultValue;
        } else {
          initialData[field.id] = '';
        }
      });

      return initialData;
    } catch (error) {
      console.error('[Phase 3B] Failed to get initial form data:', error);
      // Fall through to legacy
    }
  }

  // Legacy system: hard-coded 3-day notice data
  return {
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
  };
};

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
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    setShowPayment(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleDownloadSuccess = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);
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
          {/* Back to Dashboard button - always visible in authenticated flow */}
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Document Template Generator - Not Legal Advice
          </p>

          {downloadSuccess && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
              <strong>Success!</strong> Your notice has been generated and downloaded.
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
                onDownloadSuccess={handleDownloadSuccess}
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
  const currentDocType = documentType || 'utah-3day-notice';

  // Phase 3B: Reset formData when documentType changes
  React.useEffect(() => {
    if (USE_NEW_DOCUMENT_SYSTEM) {
      const newFormData = getInitialFormData(currentDocType);
      props.setFormData(newFormData);
      console.log(`[Phase 3B] Reset formData for document: ${currentDocType}`);
    }
  }, [currentDocType]);

  return <FormPage {...props} documentType={currentDocType} />;
}

function App() {
  // Phase 3B: Use dynamic formData initialization
  const [formData, setFormData] = useState(getInitialFormData('utah-3day-notice'));
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
    <AuthProvider>
      <Routes>
        {/* Public Routes - Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Routes - Legal pages */}
        <Route path="/terms-of-service" element={
          <LegalPageLayout>
            <TermsOfService />
          </LegalPageLayout>
        } />
        <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />
        <Route path="/privacy-policy" element={
          <LegalPageLayout>
            <PrivacyPolicy />
          </LegalPageLayout>
        } />
        <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
        <Route path="/cookie-policy" element={
          <LegalPageLayout>
            <CookiePolicy />
          </LegalPageLayout>
        } />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Document form route with dynamic document type */}
          <Route path="/form/:documentType" element={
            <GeoRestriction>
              <CookieConsent />
              <FormPageWrapper {...formProps} />
            </GeoRestriction>
          } />
        </Route>

        {/* Home page - Document selector or redirect to dashboard */}
        <Route path="/" element={
          DOCUMENT_SELECTOR_ENABLED ? (
            <GeoRestriction>
              <CookieConsent />
              <DocumentSelector />
              <Footer />
            </GeoRestriction>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } />

        {/* Catch-all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
