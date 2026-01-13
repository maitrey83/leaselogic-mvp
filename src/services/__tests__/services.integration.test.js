import { documentService, validationService, templateService } from '../index';

describe('Services Integration', () => {
  test('document and validation services work together', () => {
    // Get document
    const doc = documentService.getDocument('utah-3day-notice');
    
    // Get fields
    const fields = doc.fields;
    
    // Validate form data
    const formData = {
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
    
    const result = validationService.validateForm(formData, fields);
    expect(result.valid).toBe(true);
    expect(result.errorCount).toBe(0);
  });

  test('document and template services work together', () => {
    // Get document
    const doc = documentService.getDocument('utah-3day-notice');
    
    // Render template
    const data = {
      tenantNames: 'John Doe',
      street: '123 Main St',
      city: 'Salt Lake City',
      state: 'UT',
      zipCode: '84101',
      pastDueAmount: '$1,200.00',
      landlordName: 'ABC Property'
    };
    
    const rendered = templateService.render('utah-3day-notice-preview', data);
    
    expect(rendered).toContain('John Doe');
    expect(rendered).toContain('123 Main St');
    expect(rendered).toContain('$1,200.00');
  });

  test('all services work in complete workflow', () => {
    // 1. Get document
    const doc = documentService.getDocument('utah-rent-increase');
    expect(doc.id).toBe('utah-rent-increase');
    
    // 2. Validate form data
    const formData = {
      street: '456 Oak Ave',
      city: 'Provo',
      state: 'UT',
      zipCode: '84601',
      tenantNames: 'Jane Smith',
      landlordName: 'XYZ Rentals',
      landlordPhone: '(801) 555-9999',
      leaseType: 'month-to-month',
      currentRent: '1200',
      newRent: '1350',
      noticeDate: '2025-11-01',
      effectiveDate: '2025-12-01'
    };
    
    const validation = validationService.validateForm(formData, doc.fields);
    expect(validation.valid).toBe(true);
    
    // 3. Format values
    const formattedCurrent = validationService.formatValue(formData.currentRent, 'currency');
    const formattedNew = validationService.formatValue(formData.newRent, 'currency');
    
    expect(formattedCurrent).toBe('$1,200.00');
    expect(formattedNew).toBe('$1,350.00');
    
    // 4. Render template
    const rendered = templateService.render('utah-rent-increase-preview', {
      ...formData,
      currentRent: formattedCurrent,
      newRent: formattedNew
    });
    
    expect(rendered).toContain('Jane Smith');
    expect(rendered).toContain('$1,200.00');
    expect(rendered).toContain('$1,350.00');
  });

  test('validation catches errors for document fields', () => {
    const doc = documentService.getDocument('utah-3day-notice');
    
    // Invalid data
    const invalidData = {
      street: '',  // Required but empty
      zipCode: '90210',  // Not Utah zip
      pastDueAmount: '-100'  // Negative amount
    };
    
    const result = validationService.validateForm(invalidData, doc.fields);
    
    expect(result.valid).toBe(false);
    expect(result.errorCount).toBeGreaterThan(0);
    expect(result.errors.street).toBeDefined();
    expect(result.errors.zipCode).toBeDefined();
  });

  test('services handle multiple documents', () => {
    const docs = documentService.getDocumentsByState('UT');
    expect(docs.length).toBe(2);
    
    docs.forEach(doc => {
      // Each document should have fields
      expect(doc.fields.length).toBeGreaterThan(0);
      
      // Each document should have a template
      const templateId = `${doc.id}-preview`;
      expect(templateService.hasTemplate(templateId)).toBe(true);
    });
  });
});
