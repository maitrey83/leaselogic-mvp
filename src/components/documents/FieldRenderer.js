import React from 'react';

/**
 * FieldRenderer - Renders form fields based on type
 */
const FieldRenderer = ({ field, value, onChange, error }) => {
  const { id, label, type, placeholder, required, options } = field;

  const handleChange = (e) => {
    onChange(id, e.target.value);
  };

  const commonProps = {
    id,
    name: id,
    value: value || '',
    onChange: handleChange,
    className: `w-full px-3 py-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`,
    ...(required && { required: true })
  };

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={placeholder}
            rows={4}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select...</option>
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return <input {...commonProps} type="date" />;

      case 'email':
        return <input {...commonProps} type="email" placeholder={placeholder} />;

      case 'tel':
      case 'phone':
        return <input {...commonProps} type="tel" placeholder={placeholder} />;

      case 'currency':
      case 'number':
        return <input {...commonProps} type="number" step="0.01" placeholder={placeholder} />;

      default:
        return <input {...commonProps} type="text" placeholder={placeholder} />;
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FieldRenderer;
