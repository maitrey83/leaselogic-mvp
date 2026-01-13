import React, { useState, useEffect } from 'react';
import { documentService, templateService, validationService } from '../../services';

/**
 * DynamicPreview - Config-driven preview with template service
 */
const DynamicPreview = ({ documentId, data }) => {
  const [preview, setPreview] = useState('');
  const [document, setDocument] = useState(null);

  useEffect(() => {
    const doc = documentService.getDocument(documentId);
    setDocument(doc);
  }, [documentId]);

  useEffect(() => {
    if (!document || !data) return;

    // Format data for display
    const formattedData = {};
    document.fields.forEach(field => {
      const value = data[field.id];
      if (value) {
        formattedData[field.id] = validationService.formatValue(value, field.type);
      }
    });

    // Render template
    const templateId = `${documentId}-preview`;
    if (templateService.hasTemplate(templateId)) {
      const rendered = templateService.render(templateId, formattedData);
      setPreview(rendered);
    }
  }, [document, data, documentId]);

  if (!document) {
    return <div>Loading...</div>;
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-500">
        Fill out the form to see a preview
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Preview</h2>
      <div 
        className="border rounded-lg p-6 bg-white shadow"
        dangerouslySetInnerHTML={{ __html: preview }}
      />
    </div>
  );
};

export default DynamicPreview;
