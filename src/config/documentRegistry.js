/**
 * Document Registry
 * Manages all document definitions in the system
 */

class DocumentRegistry {
  constructor() {
    this.documents = new Map();
  }

  /**
   * Register a document definition
   */
  register(document) {
    if (!document.id) {
      throw new Error('Document must have an id');
    }
    this.documents.set(document.id, document);
  }

  /**
   * Get document by ID
   */
  getDocument(id) {
    const doc = this.documents.get(id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }
    return doc;
  }

  /**
   * Get all documents for a state
   */
  getDocumentsByState(stateCode) {
    return Array.from(this.documents.values())
      .filter(doc => doc.state === stateCode);
  }

  /**
   * Get all documents
   */
  getAllDocuments() {
    return Array.from(this.documents.values());
  }

  /**
   * Check if document exists
   */
  hasDocument(id) {
    return this.documents.has(id);
  }
}

// Create singleton instance
const registry = new DocumentRegistry();

export default registry;
export { DocumentRegistry };
