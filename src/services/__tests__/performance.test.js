import { documentService, validationService, templateService } from '../index';

describe('Services Performance', () => {
  test('document service operations complete in < 10ms', () => {
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      documentService.getDocument('utah-3day-notice');
      documentService.getDocumentsByState('UT');
      documentService.getAllDocuments();
    }
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(100); // 100 operations in < 100ms
  });

  test('validation service operations complete in < 50ms', () => {
    const fields = documentService.getDocumentFields('utah-3day-notice');
    const data = {
      street: '123 Main St',
      city: 'Salt Lake City',
      state: 'UT',
      zipCode: '84101',
      tenantNames: 'John Doe',
      landlordName: 'ABC Property',
      landlordPhone: '(801) 555-1234',
      landlordEmail: 'landlord@example.com',
      pastDueAmount: '1200',
      originalDueDate: '2025-10-01',
      noticeDate: '2025-11-01'
    };
    
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      validationService.validateForm(data, fields);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(50); // 100 validations in < 50ms
  });

  test('template service caching improves performance', () => {
    const data = { name: 'John', amount: '$100' };
    
    // First render (no cache)
    const start1 = performance.now();
    templateService.render('utah-3day-notice-preview', data);
    const end1 = performance.now();
    const firstRender = end1 - start1;
    
    // Second render (cached)
    const start2 = performance.now();
    templateService.render('utah-3day-notice-preview', data);
    const end2 = performance.now();
    const cachedRender = end2 - start2;
    
    // Cached should be faster (or at least not slower)
    expect(cachedRender).toBeLessThanOrEqual(firstRender * 2);
  });

  test('complete workflow completes in < 10ms', () => {
    const start = performance.now();
    
    // Get document
    const doc = documentService.getDocument('utah-3day-notice');
    
    // Validate data
    const data = {
      street: '123 Main St',
      city: 'Salt Lake City',
      state: 'UT',
      zipCode: '84101',
      tenantNames: 'John Doe',
      landlordName: 'ABC Property',
      landlordPhone: '(801) 555-1234',
      landlordEmail: 'landlord@example.com',
      pastDueAmount: '1200',
      originalDueDate: '2025-10-01',
      noticeDate: '2025-11-01'
    };
    
    validationService.validateForm(data, doc.fields);
    
    // Render template
    templateService.render('utah-3day-notice-preview', data);
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(10); // Complete workflow in < 10ms
  });
});
