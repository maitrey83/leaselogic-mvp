import React, { useState, useEffect } from 'react';
import { documentService, validationService } from '../../services';
import FieldRenderer from './FieldRenderer';

/**
 * DynamicForm - Config-driven form with validation
 */
const DynamicForm = ({ documentId, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [document, setDocument] = useState(null);

  useEffect(() => {
    const doc = documentService.getDocument(documentId);
    setDocument(doc);
  }, [documentId]);

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!document) return;

    // Validate form
    const validation = validationService.validateForm(formData, document.fields);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Clear errors and submit
    setErrors({});
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  if (!document) {
    return <div>Loading...</div>;
  }

  // Group fields by group
  const fieldsByGroup = document.fields.reduce((acc, field) => {
    const group = field.group || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{document.name}</h2>
      
      {Object.entries(fieldsByGroup).map(([group, fields]) => (
        <div key={group} className="mb-8">
          <h3 className="text-lg font-semibold mb-4 capitalize">
            {group.replace('-', ' ')}
          </h3>
          {fields.map(field => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={formData[field.id]}
              onChange={handleFieldChange}
              error={errors[field.id]}
            />
          ))}
        </div>
      ))}

      <div className="flex gap-4">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Preview
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
