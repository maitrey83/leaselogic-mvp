import React, { useState, useEffect } from 'react';
import { validateForm as validateFormLegacy, formatCurrency, formatPhone } from '../utils/validation';
import DownloadDisclaimer from './DownloadDisclaimer';

// New system imports (Task 3.1)
import documentService from '../services/DocumentService';
import validationService from '../services/ValidationService';

// Phase 3B imports (Task 3.4) - Dynamic form rendering
import SectionRenderer from './fields/SectionRenderer';

// Feature flag for migration (Task 3.1)
const USE_NEW_SYSTEM = process.env.REACT_APP_USE_NEW_DOCUMENT_SYSTEM === 'true';

const NoticeForm = ({ formData, setFormData, setShowPreview, setShowPayment, documentType = 'utah-3day-notice', onDownloadSuccess }) => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [showPreviewDisclaimer, setShowPreviewDisclaimer] = useState(false);
  const [showFinalDisclaimer, setShowFinalDisclaimer] = useState(false);
  const [showPurchaseDisclaimer, setShowPurchaseDisclaimer] = useState(false);

  // New system state (Task 3.1)
  const [documentDef, setDocumentDef] = useState(null);

  // Task 3.5: Property selector state
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Task 3.7: Template selector state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Load document definition when using new system
  useEffect(() => {
    if (USE_NEW_SYSTEM) {
      try {
        const doc = documentService.getDocument(documentType);
        setDocumentDef(doc);
        console.log(`[Task 3.1] Using NEW document system for: ${documentType}`);
      } catch (error) {
        console.error(`[Task 3.1] Failed to load document definition for ${documentType}:`, error);
      }
    } else {
      console.log(`[Task 3.1] Using LEGACY hardcoded system for: ${documentType}`);
    }
  }, [documentType]);

  /**
   * Task 3.5: Fetch user's saved properties on mount
   * Allows users to reuse property information
   */
  useEffect(() => {
    const fetchProperties = async () => {
      // Only fetch if user is authenticated
      // For now, we'll skip auth check (will be added with auth integration)
      // This is a placeholder for future auth integration

      try {
        setLoadingProperties(true);

        // Note: In production, this would require authentication
        // For now, commented out to avoid errors without auth
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('[Task 3.5] No auth token, skipping property fetch');
          setLoadingProperties(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/properties`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProperties(data);
          console.log(`[Task 3.5] Loaded ${data.length} saved properties`);
        } else {
          console.error('[Task 3.5] Failed to fetch properties:', response.status);
        }

        setLoadingProperties(false);
      } catch (error) {
        console.error('[Task 3.5] Error fetching properties:', error);
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [API_URL]);

  /**
   * Task 3.7: Fetch templates for current document_type
   * Allows users to load previously saved templates
   */
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);

        // Note: In production, this requires authentication
        // For now, commented out to avoid errors without auth
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('[Task 3.7] No auth token, skipping template fetch');
          setLoadingTemplates(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/templates?document_type=${documentType}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates || []);
          console.log(`[Task 3.7] Loaded ${data.count || 0} templates for ${documentType}`);
        } else {
          console.error('[Task 3.7] Failed to fetch templates:', response.status);
        }

        setLoadingTemplates(false);
      } catch (error) {
        console.error('[Task 3.7] Error fetching templates:', error);
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [API_URL, documentType]);

  /**
   * Validate form data using appropriate system
   * Task 3.1: Feature flag controls which validation is used
   */
  const validateForm = (data) => {
    if (USE_NEW_SYSTEM && documentDef) {
      // New system: Use ValidationService with document definition
      const result = validationService.validateForm(data, documentDef.fields);
      return result.errors;
    } else {
      // Legacy system: Use hardcoded validation
      return validateFormLegacy(data);
    }
  };

  const handlePurchase = () => {
    setShowPurchaseDisclaimer(false);
    setShowPayment(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format specific fields (same logic for both systems)
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

    // Real-time validation using feature-flagged validator
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
        body: JSON.stringify({ ...formData, documentType }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentType}-final.pdf`;

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

        // Notify parent of successful download
        if (onDownloadSuccess) {
          onDownloadSuccess();
        }
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
        body: JSON.stringify({ ...formData, documentType }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentType}-preview.pdf`;

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

        // Notify parent of successful download
        if (onDownloadSuccess) {
          onDownloadSuccess();
        }
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to generate PDF. Please check your connection.');
    }
  };

  // Get document price (Task 3.4)
  const getDocumentPrice = () => {
    if (documentDef && documentDef.pricing) {
      return documentDef.pricing.final;
    }
    // Default prices
    const prices = {
      'utah-3day-notice': 9.99,
      'utah-rent-increase': 7.99
    };
    return prices[documentType] || 9.99;
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

  // Helper to get field error (works for both systems)
  const getError = (fieldName) => errors[fieldName];

  // Helper to check if field has error
  const hasError = (fieldName) => !!errors[fieldName];

  /**
   * Phase 3B: Group fields by section for dynamic rendering
   * Groups document definition fields into logical sections
   */
  const groupFieldsBySection = (fields) => {
    const sections = {
      property: {
        title: 'Property Address',
        fields: [],
        description: null
      },
      parties: {
        title: 'Tenant & Landlord Information',
        fields: [],
        description: null
      },
      financial: {
        title: 'Financial Information',
        fields: [],
        description: null
      },
      dates: {
        title: 'Important Dates',
        fields: [],
        description: null
      },
      additional: {
        title: 'Additional Information',
        fields: [],
        description: null
      }
    };

    fields.forEach(field => {
      const group = field.group || 'additional';
      if (sections[group]) {
        sections[group].fields.push(field);
      }
    });

    // Filter out empty sections and return as array
    return Object.entries(sections)
      .filter(([_, section]) => section.fields.length > 0)
      .map(([key, section]) => ({ key, ...section }));
  };

  /**
   * Phase 3B: Handle field changes for dynamic forms
   * Works with both legacy and new system
   */
  const handleFieldChange = (fieldId, value) => {
    handleChange({ target: { name: fieldId, value } });
  };

  /**
   * Task 3.5: Handle property selection from dropdown
   * Populates form fields with saved property data
   */
  const handlePropertySelect = (e) => {
    const propertyId = e.target.value;
    setSelectedProperty(propertyId);

    if (!propertyId) {
      // User selected "Enter Manually" - clear selection
      return;
    }

    // Find the selected property
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    // Populate form fields based on system type
    if (USE_NEW_SYSTEM) {
      // New system: Map property fields to form data
      setFormData({
        ...formData,
        street: property.street_address,
        city: property.city,
        state: property.state || 'UT',
        zipCode: property.zip_code,
        // Keep other fields as they were
      });
    } else {
      // Legacy system: Direct mapping
      setFormData({
        ...formData,
        street: property.street_address,
        city: property.city,
        state: property.state || 'UT',
        zipCode: property.zip_code
      });
    }

    console.log(`[Task 3.5] Populated form with property: ${property.property_name || property.street_address}`);
  };

  /**
   * Task 3.7: Handle template selection from dropdown
   * Populates form fields with saved template data
   */
  const handleTemplateSelect = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (!templateId) {
      // User selected "Enter Manually" - clear selection
      return;
    }

    try {
      // Note: In production, this requires authentication
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('[Task 3.7] No auth token');
        return;
      }

      const response = await fetch(`${API_URL}/api/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const template = data.template;

        // Populate form with template data
        setFormData({
          ...formData,
          ...template.template_data
        });

        console.log(`[Task 3.7] Loaded template: ${template.template_name}`);
      } else {
        console.error('[Task 3.7] Failed to load template:', response.status);
      }
    } catch (error) {
      console.error('[Task 3.7] Error loading template:', error);
    }
  };

  /**
   * Task 3.7: Save current form data as a template
   */
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      setSavingTemplate(true);

      // Note: In production, this requires authentication
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('[Task 3.7] No auth token');
        setSavingTemplate(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template_name: templateName,
          document_type: documentType,
          template_data: formData,
          property_id: selectedProperty || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[Task 3.7] Template saved: ${data.template.template_name}`);

        // Refresh templates list
        const refreshResponse = await fetch(`${API_URL}/api/templates?document_type=${documentType}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setTemplates(refreshData.templates || []);
        }

        // Close modal and reset
        setShowSaveTemplateModal(false);
        setTemplateName('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        console.error('[Task 3.7] Failed to save template:', errorData.error);
        alert(`Failed to save template: ${errorData.error}`);
      }

      setSavingTemplate(false);
      console.log('[Task 3.7] Save template placeholder (auth required)');
      alert('Template save functionality requires authentication. Please sign in first.');
    } catch (error) {
      console.error('[Task 3.7] Error saving template:', error);
      alert('Failed to save template. Please try again.');
      setSavingTemplate(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      {saveSuccess && (
        <div data-cy="success-toast" className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          Template saved successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Task 3.5: Property Selector Dropdown */}
        {properties.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Use Saved Property (Optional)
            </label>
            <select
              value={selectedProperty}
              onChange={handlePropertySelect}
              data-cy="property-selector"
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Enter Property Details Manually --</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.property_name || property.street_address}
                  {property.city && ` - ${property.city}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-blue-700 mt-2">
              Select a saved property to auto-fill the address fields below
            </p>
          </div>
        )}

        {loadingProperties && (
          <div className="text-center text-gray-500 text-sm mb-4">
            Loading saved properties...
          </div>
        )}

        {/* Task 3.7: Template Selector Dropdown */}
        {templates.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <label className="block text-sm font-medium text-green-900 mb-2">
              Load Saved Template (Optional)
            </label>
            <select
              value={selectedTemplate}
              onChange={handleTemplateSelect}
              data-cy="template-selector"
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">-- Enter Form Data Manually --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.template_name}
                  {template.usage_count > 0 && ` (Used ${template.usage_count}x)`}
                </option>
              ))}
            </select>
            <p className="text-xs text-green-700 mt-2">
              Select a template to auto-fill all form fields with previously saved values
            </p>
          </div>
        )}

        {loadingTemplates && (
          <div className="text-center text-gray-500 text-sm mb-4">
            Loading saved templates...
          </div>
        )}

        {/* Phase 3B: Dynamic rendering based on feature flag */}
        {USE_NEW_SYSTEM && documentDef ? (
          // NEW SYSTEM: Render fields dynamically from document definition
          <>
            {groupFieldsBySection(documentDef.fields).map((section) => (
              <SectionRenderer
                key={section.key}
                title={section.title}
                fields={section.fields}
                formData={formData}
                errors={errors}
                onChange={handleFieldChange}
                description={section.description}
              />
            ))}
          </>
        ) : (
          // LEGACY SYSTEM: Hard-coded fields for backward compatibility
          <>
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
                    data-cy="street-address"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('street') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                  />
                  {hasError('street') && <p className="text-red-500 text-xs mt-1">{getError('street')}</p>}
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
                    data-cy="city"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('city') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                  />
                  {hasError('city') && <p className="text-red-500 text-xs mt-1">{getError('city')}</p>}
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
                    data-cy="zip-code"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('zipCode') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                  />
                  {hasError('zipCode') && <p className="text-red-500 text-xs mt-1">{getError('zipCode')}</p>}
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
                    data-cy="tenant-names"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('tenantNames') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                  />
                  {hasError('tenantNames') && <p className="text-red-500 text-xs mt-1">{getError('tenantNames')}</p>}
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
                    data-cy="landlord-name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('landlordName') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                  />
                  {hasError('landlordName') && <p className="text-red-500 text-xs mt-1">{getError('landlordName')}</p>}
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
                      data-cy="landlord-phone"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('landlordPhone') ? 'border-red-500' : 'border-gray-300'
                        }`}
                      required
                    />
                    {hasError('landlordPhone') && <p className="text-red-500 text-xs mt-1">{getError('landlordPhone')}</p>}
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
                      data-cy="landlord-email"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('landlordEmail') ? 'border-red-500' : 'border-gray-300'
                        }`}
                      required
                    />
                    {hasError('landlordEmail') && <p className="text-red-500 text-xs mt-1">{getError('landlordEmail')}</p>}
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
                      data-cy="past-due-amount"
                      className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('pastDueAmount') ? 'border-red-500' : 'border-gray-300'
                        }`}
                      required
                    />
                  </div>
                  {hasError('pastDueAmount') && <p className="text-red-500 text-xs mt-1">{getError('pastDueAmount')}</p>}
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
                    data-cy="original-due-date"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('originalDueDate') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                  />
                  {hasError('originalDueDate') && <p className="text-red-500 text-xs mt-1">{getError('originalDueDate')}</p>}
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
                  data-cy="notice-date"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('noticeDate') ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {hasError('noticeDate') && <p className="text-red-500 text-xs mt-1">{getError('noticeDate')}</p>}
              </div>
            </div>
          </>
        )}

        {/* Submit buttons - same for both legacy and new system */}
        <div className="pt-6 space-y-3">
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Generate Preview
          </button>

          {/* Task 3.7: Save as Template button */}
          {isValid && (
            <button
              type="button"
              onClick={() => setShowSaveTemplateModal(true)}
              data-cy="save-template-btn"
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            >
              💾 Save as Template
            </button>
          )}

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
                Purchase Final PDF - ${getDocumentPrice().toFixed(2)}
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
      {
        showPreviewDisclaimer && (
          <DownloadDisclaimer
            isPreview={true}
            onAccept={handleDownloadPDF}
            onCancel={() => setShowPreviewDisclaimer(false)}
          />
        )
      }

      {
        showFinalDisclaimer && (
          <DownloadDisclaimer
            isPreview={false}
            onAccept={handleDownloadFinalPDF}
            onCancel={() => setShowFinalDisclaimer(false)}
          />
        )
      }

      {
        showPurchaseDisclaimer && (
          <DownloadDisclaimer
            isPurchase={true}
            onAccept={handlePurchase}
            onCancel={() => setShowPurchaseDisclaimer(false)}
          />
        )
      }

      {/* Task 3.7: Save Template Modal */}
      {
        showSaveTemplateModal && (
          <div data-cy="save-template-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Save as Template</h3>
              <p className="text-sm text-gray-600 mb-4">
                Save your current form data as a template to quickly fill out similar forms in the future.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Standard 3-Day Notice"
                  data-cy="template-name-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={savingTemplate}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Choose a descriptive name to easily identify this template later
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowSaveTemplateModal(false);
                    setTemplateName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  data-cy="cancel-save-template"
                  disabled={savingTemplate}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={savingTemplate || !templateName.trim()}
                  data-cy="confirm-save-template"
                  className={`flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${savingTemplate || !templateName.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                >
                  {savingTemplate ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default NoticeForm;
