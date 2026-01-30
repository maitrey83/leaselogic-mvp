/**
 * DocumentSelector Component
 * Task 3.4: Document Selection UI
 *
 * Displays available document types and allows users to select one
 * to navigate to the appropriate form.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import documentService from '../services/DocumentService';
import './DocumentSelector.css';

// Icons for document types (using inline SVGs for simplicity)
const DocumentIcon = ({ type }) => {
  if (type === 'eviction' || type === 'utah-3day-notice') {
    return (
      <svg className="document-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    );
  }
  if (type === 'lease-management' || type === 'utah-rent-increase') {
    return (
      <svg className="document-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  // Default document icon
  return (
    <svg className="document-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
};

function DocumentSelector() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    try {
      // Get all Utah documents
      const docs = documentService.getDocumentsByState('UT');
      setDocuments(docs);
      setLoading(false);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please try again.');
      setLoading(false);
    }
  }, []);

  const handleDocumentSelect = (docId) => {
    setSelectedDoc(docId);
  };

  const handleContinue = () => {
    if (selectedDoc) {
      navigate(`/form/${selectedDoc}`);
    }
  };

  const handleCardClick = (docId) => {
    // Navigate directly on card click for better UX
    navigate(`/form/${docId}`);
  };

  if (loading) {
    return (
      <div className="document-selector">
        <div className="selector-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-selector">
        <div className="selector-container">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-selector">
      <div className="selector-container">
        <header className="selector-header">
          <h1>Utah Legal Documents</h1>
          <p className="selector-subtitle">
            Select the document you need to create. All documents are Utah-compliant templates.
          </p>
          <p className="disclaimer-text">
            Document Templates Only - Not Legal Advice
          </p>
        </header>

        <div className="documents-grid">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`document-card ${selectedDoc === doc.id ? 'selected' : ''}`}
              onClick={() => handleCardClick(doc.id)}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(doc.id)}
              role="button"
              tabIndex={0}
              data-cy={`document-card-${doc.id}`}
              aria-label={`Select ${doc.name}`}
            >
              <div className="card-icon">
                <DocumentIcon type={doc.metadata?.category || doc.id} />
              </div>

              <div className="card-content">
                <h2 className="card-title">{doc.name}</h2>
                <p className="card-description">{doc.description}</p>

                <div className="card-meta">
                  {doc.metadata?.legalReferences && (
                    <span className="legal-ref">
                      {doc.metadata.legalReferences.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <span className="price">
                  ${doc.pricing.final.toFixed(2)}
                </span>
                <span className="price-label">per document</span>
              </div>

              <div className="card-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <footer className="selector-footer">
          <div className="footer-notice">
            <h3>Important Notice</h3>
            <p>
              This service provides document templates only and does not constitute legal advice.
              We strongly recommend consulting with a qualified Utah attorney before using any legal documents.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default DocumentSelector;
