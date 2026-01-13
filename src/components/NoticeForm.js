import React, { useState, useEffect } from 'react';
import { validateForm, formatCurrency, formatPhone } from '../utils/validation';
import DownloadDisclaimer from './DownloadDisclaimer';

const NoticeForm = ({ formData, setFormData, setShowPreview, setShowPayment }) => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [showPreviewDisclaimer, setShowPreviewDisclaimer] = useState(false);
  const [showFinalDisclaimer, setShowFinalDisclaimer] = useState(false);
  const [showPurchaseDisclaimer, setShowPurchaseDisclaimer] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handlePurchase = () => {
    setShowPurchaseDisclaimer(false);
    setShowPayment(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format specific fields
    if (name === 'pastDueAmount') {
      // Allow user to type freely, just clean the input
      formattedValue = value.replace(/[^\d.]/g, '');
    } else if (name === 'landlordPhone') {
      formattedValue = formatPhone(value);
    }

    const newFormData = {
      ...formData,
      [name]: formattedValue
    };

    setFormData(newFormData);

    // Real-time validation
    const newErrors = validateForm(newFormData);
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  // Update preview visibility when form becomes valid
  useEffect(() => {
    setShowPreview(isValid);
  }, [isValid, setShowPreview]);

  const handleDownloadFinalPDF = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'utah-3day-notice-final.pdf';
        
        // Use MouseEvent to force download
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        
        a.dispatchEvent(clickEvent);
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
        
        setShowFinalDisclaimer(false);
      } else {
        alert('Failed to generate final PDF. Please try again.');
      }
    } catch (error) {
      console.error('Final PDF download error:', error);
      alert('Failed to generate final PDF. Please check your connection.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pdf/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'utah-3day-notice-preview.pdf';
        
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        
        a.dispatchEvent(clickEvent);
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
        
        setShowPreviewDisclaimer(false);
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to generate PDF. Please check your connection.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm(formData);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length === 0) {
      console.log('Form is valid, preview is live!');
      setShowPreview(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Property Address Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.street ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value="UT"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
            </div>
          </div>
        </div>

        {/* Tenant/Landlord Information */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tenant & Landlord Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant Name(s) *
              </label>
              <input
                type="text"
                name="tenantNames"
                value={formData.tenantNames}
                onChange={handleChange}
                placeholder="Enter tenant names (separate multiple with commas)"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tenantNames ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.tenantNames && <p className="text-red-500 text-xs mt-1">{errors.tenantNames}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landlord/Agent Name *
              </label>
              <input
                type="text"
                name="landlordName"
                value={formData.landlordName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.landlordName ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.landlordName && <p className="text-red-500 text-xs mt-1">{errors.landlordName}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landlord Phone *
                </label>
                <input
                  type="tel"
                  name="landlordPhone"
                  value={formData.landlordPhone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.landlordPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.landlordPhone && <p className="text-red-500 text-xs mt-1">{errors.landlordPhone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landlord Email *
                </label>
                <input
                  type="email"
                  name="landlordEmail"
                  value={formData.landlordEmail}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.landlordEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.landlordEmail && <p className="text-red-500 text-xs mt-1">{errors.landlordEmail}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Past-Due Rent Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  name="pastDueAmount"
                  value={formData.pastDueAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.pastDueAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.pastDueAmount && <p className="text-red-500 text-xs mt-1">{errors.pastDueAmount}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Per Utah law, only include rent. Do not include late fees, utilities, or other charges.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Due Date *
              </label>
              <input
                type="date"
                name="originalDueDate"
                value={formData.originalDueDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.originalDueDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.originalDueDate && <p className="text-red-500 text-xs mt-1">{errors.originalDueDate}</p>}
            </div>
          </div>
        </div>

        {/* Notice Date */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notice Date</h2>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Notice Issuance
            </label>
            <input
              type="date"
              name="noticeDate"
              value={formData.noticeDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.noticeDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.noticeDate && <p className="text-red-500 text-xs mt-1">{errors.noticeDate}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 space-y-3">
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isValid 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Generate Preview
          </button>
          
          {isValid && (
            <>
              <button
                type="button"
                onClick={() => setShowPreviewDisclaimer(true)}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
              >
                Download PDF Preview (Watermarked)
              </button>
              
              <button
                type="button"
                onClick={() => setShowPurchaseDisclaimer(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                Purchase Final PDF - $9.99
              </button>
              
              <button
                type="button"
                onClick={() => setShowFinalDisclaimer(true)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm"
              >
                TEST: Download Final PDF (No Payment)
              </button>
            </>
          )}
        </div>
      </form>

      {/* Disclaimer Modals */}
      {showPreviewDisclaimer && (
        <DownloadDisclaimer
          isPreview={true}
          onAccept={handleDownloadPDF}
          onCancel={() => setShowPreviewDisclaimer(false)}
        />
      )}

      {showFinalDisclaimer && (
        <DownloadDisclaimer
          isPreview={false}
          onAccept={handleDownloadFinalPDF}
          onCancel={() => setShowFinalDisclaimer(false)}
        />
      )}

      {showPurchaseDisclaimer && (
        <DownloadDisclaimer
          isPurchase={true}
          onAccept={handlePurchase}
          onCancel={() => setShowPurchaseDisclaimer(false)}
        />
      )}
    </div>
  );
};

export default NoticeForm;
