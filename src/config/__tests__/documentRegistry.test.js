import { DocumentRegistry } from '../documentRegistry';

describe('DocumentRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new DocumentRegistry();
  });

  test('registers a document', () => {
    const doc = {
      id: 'test-doc',
      name: 'Test Document',
      state: 'UT',
      fields: []
    };

    registry.register(doc);
    expect(registry.hasDocument('test-doc')).toBe(true);
  });

  test('throws error when registering document without id', () => {
    const doc = { name: 'Test' };
    expect(() => registry.register(doc)).toThrow('Document must have an id');
  });

  test('gets document by id', () => {
    const doc = {
      id: 'test-doc',
      name: 'Test Document',
      state: 'UT',
      fields: []
    };

    registry.register(doc);
    const retrieved = registry.getDocument('test-doc');
    expect(retrieved.id).toBe('test-doc');
    expect(retrieved.name).toBe('Test Document');
  });

  test('throws error when getting non-existent document', () => {
    expect(() => registry.getDocument('non-existent')).toThrow('Document not found');
  });

  test('gets documents by state', () => {
    registry.register({ id: 'ut-doc-1', state: 'UT', fields: [] });
    registry.register({ id: 'ut-doc-2', state: 'UT', fields: [] });
    registry.register({ id: 'ca-doc-1', state: 'CA', fields: [] });

    const utahDocs = registry.getDocumentsByState('UT');
    expect(utahDocs).toHaveLength(2);
    expect(utahDocs.every(doc => doc.state === 'UT')).toBe(true);
  });

  test('gets all documents', () => {
    registry.register({ id: 'doc-1', state: 'UT', fields: [] });
    registry.register({ id: 'doc-2', state: 'CA', fields: [] });

    const allDocs = registry.getAllDocuments();
    expect(allDocs).toHaveLength(2);
  });

  test('checks if document exists', () => {
    registry.register({ id: 'test-doc', state: 'UT', fields: [] });

    expect(registry.hasDocument('test-doc')).toBe(true);
    expect(registry.hasDocument('non-existent')).toBe(false);
  });
});
