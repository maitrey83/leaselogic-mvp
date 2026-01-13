import { documentRegistry, stateRegistry } from '../index';

describe('Configuration Integration', () => {
  test('document registry loads all documents', () => {
    const allDocs = documentRegistry.getAllDocuments();
    expect(allDocs.length).toBeGreaterThan(0);
  });

  test('utah 3-day notice is registered', () => {
    expect(documentRegistry.hasDocument('utah-3day-notice')).toBe(true);
    
    const doc = documentRegistry.getDocument('utah-3day-notice');
    expect(doc.name).toBe('Utah 3-Day Notice to Pay or Vacate');
    expect(doc.state).toBe('UT');
    expect(doc.fields.length).toBe(11);
  });

  test('utah rent increase is registered', () => {
    expect(documentRegistry.hasDocument('utah-rent-increase')).toBe(true);
    
    const doc = documentRegistry.getDocument('utah-rent-increase');
    expect(doc.name).toBe('Utah Rent Increase Notice');
    expect(doc.state).toBe('UT');
    expect(doc.fields.length).toBe(19);
  });

  test('state registry loads all states', () => {
    const allStates = stateRegistry.getAllStates();
    expect(allStates.length).toBeGreaterThan(0);
  });

  test('utah state is registered and active', () => {
    expect(stateRegistry.hasState('UT')).toBe(true);
    expect(stateRegistry.isStateActive('UT')).toBe(true);
    
    const utah = stateRegistry.getState('UT');
    expect(utah.name).toBe('Utah');
    expect(utah.active).toBe(true);
  });

  test('utah documents are available in utah state', () => {
    const utah = stateRegistry.getState('UT');
    expect(utah.documents.available).toContain('utah-3day-notice');
    expect(utah.documents.available).toContain('utah-rent-increase');
  });

  test('can get utah documents from registry', () => {
    const utahDocs = documentRegistry.getDocumentsByState('UT');
    expect(utahDocs.length).toBe(2);
    expect(utahDocs.map(d => d.id)).toContain('utah-3day-notice');
    expect(utahDocs.map(d => d.id)).toContain('utah-rent-increase');
  });
});
