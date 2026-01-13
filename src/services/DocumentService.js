/**
 * Document Service
 * Provides access to document definitions and operations
 */

import { documentRegistry } from '../config';

class DocumentService {
  /**
   * Get document by ID
   */
  getDocument(id) {
    return documentRegistry.getDocument(id);
  }

  /**
   * Get all documents for a state
   */
  getDocumentsByState(stateCode) {
    return documentRegistry.getDocumentsByState(stateCode);
  }

  /**
   * Get all documents
   */
  getAllDocuments() {
    return documentRegistry.getAllDocuments();
  }

  /**
   * Get active documents (from active states)
   */
  getActiveDocuments() {
    return documentRegistry.getAllDocuments();
  }

  /**
   * Get document metadata
   */
  getDocumentMetadata(id) {
    const doc = this.getDocument(id);
    return doc.metadata;
  }

  /**
   * Get document price
   */
  getDocumentPrice(id) {
    const doc = this.getDocument(id);
    return doc.pricing.final;
  }

  /**
   * Check if document is available in state
   */
  isDocumentAvailable(id, stateCode) {
    try {
      const doc = this.getDocument(id);
      return doc.state === stateCode;
    } catch {
      return false;
    }
  }

  /**
   * Get documents by category
   */
  getDocumentsByCategory(category) {
    return documentRegistry.getAllDocuments()
      .filter(doc => doc.metadata.category === category);
  }

  /**
   * Get fields for a document
   */
  getDocumentFields(id) {
    const doc = this.getDocument(id);
    return doc.fields;
  }

  /**
   * Get fields by group
   */
  getFieldsByGroup(id, group) {
    const fields = this.getDocumentFields(id);
    return fields.filter(field => field.group === group);
  }
}

// Create singleton instance
const documentService = new DocumentService();

export default documentService;
export { DocumentService };
