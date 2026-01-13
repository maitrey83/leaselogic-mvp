import React from 'react';
import { documentService } from '../../services';

/**
 * DocumentSelector - Choose document type
 */
const DocumentSelector = ({ stateCode = 'UT', onSelect }) => {
  const documents = documentService.getDocumentsByState(stateCode);

  const handleSelect = (docId) => {
    if (onSelect) {
      onSelect(docId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Select Document Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map(doc => (
          <div
            key={doc.id}
            className="border rounded-lg p-6 hover:shadow-lg cursor-pointer transition"
            onClick={() => handleSelect(doc.id)}
          >
            <h3 className="text-xl font-semibold mb-2">{doc.name}</h3>
            <p className="text-gray-600 mb-4">{doc.metadata.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {doc.metadata.category}
              </span>
              <span className="text-lg font-bold text-blue-600">
                ${doc.pricing.final}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentSelector;
