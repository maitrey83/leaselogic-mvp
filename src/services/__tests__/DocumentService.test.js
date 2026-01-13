import { DocumentService } from '../DocumentService';
import { documentRegistry } from '../../config';

describe('DocumentService', () => {
  let service;

  beforeEach(() => {
    service = new DocumentService();
  });

  test('gets document by id', () => {
    const doc = service.getDocument('utah-3day-notice');
    expect(doc).toBeDefined();
    expect(doc.id).toBe('utah-3day-notice');
    expect(doc.name).toBe('Utah 3-Day Notice to Pay or Vacate');
  });

  test('throws error for non-existent document', () => {
    expect(() => service.getDocument('non-existent')).toThrow();
  });

  test('gets documents by state', () => {
    const docs = service.getDocumentsByState('UT');
    expect(docs.length).toBe(2);
    expect(docs.every(d => d.state === 'UT')).toBe(true);
  });

  test('gets all documents', () => {
    const docs = service.getAllDocuments();
    expect(docs.length).toBeGreaterThan(0);
  });

  test('gets document metadata', () => {
    const metadata = service.getDocumentMetadata('utah-3day-notice');
    expect(metadata).toBeDefined();
    expect(metadata.category).toBe('eviction');
    expect(metadata.legalReferences).toContain('Utah Code §78B-6-802');
  });

  test('gets document price', () => {
    const price = service.getDocumentPrice('utah-3day-notice');
    expect(price).toBe(9.99);
  });

  test('checks if document is available in state', () => {
    expect(service.isDocumentAvailable('utah-3day-notice', 'UT')).toBe(true);
    expect(service.isDocumentAvailable('utah-3day-notice', 'CA')).toBe(false);
    expect(service.isDocumentAvailable('non-existent', 'UT')).toBe(false);
  });

  test('gets documents by category', () => {
    const evictionDocs = service.getDocumentsByCategory('eviction');
    expect(evictionDocs.length).toBeGreaterThan(0);
    expect(evictionDocs.every(d => d.metadata.category === 'eviction')).toBe(true);
  });

  test('gets document fields', () => {
    const fields = service.getDocumentFields('utah-3day-notice');
    expect(fields).toBeDefined();
    expect(fields.length).toBe(11);
  });

  test('gets fields by group', () => {
    const propertyFields = service.getFieldsByGroup('utah-3day-notice', 'property');
    expect(propertyFields.length).toBeGreaterThan(0);
    expect(propertyFields.every(f => f.group === 'property')).toBe(true);
  });
});
