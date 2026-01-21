/**
 * SectionRenderer - Groups and renders fields by section
 * Task 3.4 Phase 3B: Long-term fix for dynamic form rendering
 *
 * Renders a section with a title and all its fields in a responsive grid
 */
import React from 'react';
import FieldRenderer from './FieldRenderer';

const SectionRenderer = ({
  title,
  fields,
  formData,
  errors,
  onChange,
  description
}) => {
  // Don't render empty sections
  if (!fields || fields.length === 0) return null;

  return (
    <div className="border-b pb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          // Determine if field should take full width
          const isFullWidth =
            field.type === 'textarea' ||
            field.id === 'street' ||
            field.id === 'tenantNames' ||
            field.id === 'landlordName';

          return (
            <div
              key={field.id}
              className={isFullWidth ? 'md:col-span-2' : ''}
            >
              <FieldRenderer
                field={field}
                value={formData[field.id]}
                onChange={onChange}
                error={errors[field.id]}
                formData={formData}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionRenderer;
