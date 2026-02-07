/**
 * FieldRenderer - Dynamically renders form fields from document definitions
 * Task 3.4 Phase 3B: Long-term fix for dynamic form rendering
 *
 * Supports field types:
 * - text, email, phone, date, currency, select, textarea, calculated
 */
import React from 'react';
import { formatPhone } from '../../utils/validation';

const FieldRenderer = ({ field, value, onChange, error, formData }) => {
  const { id, label, type, placeholder, validation, options, helpText } = field;

  // Common input props for most field types
  const commonProps = {
    name: id,
    'data-cy': id,
    value: value || '',
    onChange: (e) => onChange(id, e.target.value),
    className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'
      }`,
    required: validation?.required,
    placeholder: placeholder || ''
  };

  // Calculated fields (read-only, computed values)
  if (type === 'calculated') {
    const calculatedValue = calculateValue(field, formData);
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type="text"
          value={calculatedValue}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
        />
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  }

  // Currency fields (with $ prefix)
  if (type === 'currency') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {validation?.required && '*'}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            {...commonProps}
            type="text"
            className={`${commonProps.className} pl-8`}
            value={value || ''}
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  }

  // Select/Dropdown fields
  if (type === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {validation?.required && '*'}
        </label>
        <select {...commonProps}>
          <option value="">Select...</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  }

  // Textarea fields
  if (type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {validation?.required && '*'}
        </label>
        <textarea
          {...commonProps}
          rows={4}
          maxLength={validation?.maxLength}
        />
        {validation?.maxLength && (
          <p className="text-xs text-gray-500 mt-1">
            {value?.length || 0} / {validation.maxLength}
          </p>
        )}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  }

  // Date fields
  if (type === 'date') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {validation?.required && '*'}
        </label>
        <input {...commonProps} type="date" />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  }

  // Phone fields
  if (type === 'phone') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {validation?.required && '*'}
        </label>
        <input
          {...commonProps}
          type="tel"
          placeholder={placeholder || '(801) 555-1234'}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  }

  // Email fields
  if (type === 'email') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {validation?.required && '*'}
        </label>
        <input {...commonProps} type="email" />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  }

  // Default: text input
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {validation?.required && '*'}
      </label>
      <input {...commonProps} type="text" />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
};

/**
 * Helper to calculate values for calculated fields
 */
const calculateValue = (field, formData) => {
  const calc = field.calculation;

  if (!calc) return '';

  try {
    // Rent increase amount: newRent - currentRent
    if (calc === 'newRent - currentRent') {
      const current = parseFloat(formData.currentRent) || 0;
      const newRent = parseFloat(formData.newRent) || 0;
      const increase = newRent - current;
      return increase >= 0 ? `$${increase.toFixed(2)}` : '$0.00';
    }

    // Rent increase percentage: ((newRent - currentRent) / currentRent) * 100
    if (calc === '((newRent - currentRent) / currentRent) * 100') {
      const current = parseFloat(formData.currentRent) || 0;
      const newRent = parseFloat(formData.newRent) || 0;
      if (current === 0) return '0.0%';
      const percentage = ((newRent - current) / current) * 100;
      return `${percentage.toFixed(1)}%`;
    }

    // Days between dates: daysBetween(noticeDate, effectiveDate)
    if (calc.startsWith('daysBetween')) {
      const match = calc.match(/daysBetween\((\w+),\s*(\w+)\)/);
      if (match) {
        const startField = match[1];
        const endField = match[2];
        const startDate = new Date(formData[startField]);
        const endDate = new Date(formData[endField]);

        if (formData[startField] && formData[endField]) {
          const diffTime = Math.abs(endDate - startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return `${diffDays} days`;
        }
      }
    }
  } catch (error) {
    console.error('[FieldRenderer] Calculation error:', error);
  }

  return '';
};

export default FieldRenderer;
