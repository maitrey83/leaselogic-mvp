const TemplateEngine = require('../services/TemplateEngine');

describe('TemplateEngine', () => {
  const mockData3Day = {
    street: '123 Main St',
    city: 'Salt Lake City',
    state: 'UT',
    zipCode: '84101',
    tenantNames: 'John Doe',
    landlordName: 'Jane Smith',
    landlordPhone: '(801) 555-1234',
    landlordEmail: 'jane@example.com',
    pastDueAmount: '1200.00',
    noticeDate: '2025-12-01',
    originalDueDate: '2025-11-01'
  };

  const mockDataRentIncrease = {
    street: '123 Main St',
    city: 'Salt Lake City',
    state: 'UT',
    zipCode: '84101',
    tenantNames: 'John Doe',
    landlordName: 'Jane Smith',
    landlordPhone: '(801) 555-1234',
    landlordEmail: 'jane@example.com',
    currentRent: '1200.00',
    newRent: '1350.00',
    noticeDate: '2025-12-01',
    effectiveDate: '2025-12-20',
    leaseType: 'month-to-month'
  };

  describe('Template Loading', () => {
    test('should load all templates on initialization', () => {
      const templates = TemplateEngine.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    test('should load utah-3day-notice-v1 template', () => {
      const template = TemplateEngine.getTemplate('utah-3day-notice-v1');
      expect(template).toBeDefined();
      expect(template.id).toBe('utah-3day-notice-v1');
      expect(template.render).toBeDefined();
    });

    test('should load utah-3day-notice-preview-v1 template', () => {
      const template = TemplateEngine.getTemplate('utah-3day-notice-preview-v1');
      expect(template).toBeDefined();
      expect(template.id).toBe('utah-3day-notice-preview-v1');
    });

    test('should load utah-rent-increase-v1 template', () => {
      const template = TemplateEngine.getTemplate('utah-rent-increase-v1');
      expect(template).toBeDefined();
      expect(template.id).toBe('utah-rent-increase-v1');
    });

    test('should load utah-rent-increase-preview-v1 template', () => {
      const template = TemplateEngine.getTemplate('utah-rent-increase-preview-v1');
      expect(template).toBeDefined();
      expect(template.id).toBe('utah-rent-increase-preview-v1');
    });

    test('should throw error for non-existent template', () => {
      expect(() => {
        TemplateEngine.getTemplate('non-existent-template');
      }).toThrow('Template not found: non-existent-template');
    });
  });

  describe('Template Rendering - 3-Day Notice', () => {
    test('should render utah-3day-notice-v1 with valid data', () => {
      const html = TemplateEngine.render('utah-3day-notice-v1', mockData3Day);
      expect(html).toContain('NOTICE TO PAY RENT OR VACATE PREMISES');
      expect(html).toContain('John Doe');
      expect(html).toContain('123 Main St');
      expect(html).toContain('Jane Smith');
      expect(html).toContain('$1,200.00');
    });

    test('should render preview with watermark', () => {
      const html = TemplateEngine.render('utah-3day-notice-preview-v1', mockData3Day);
      expect(html).toContain('DRAFT - NOT LEGAL');
      expect(html).toContain('NOTICE TO PAY RENT OR VACATE PREMISES');
    });

    test('should handle missing optional fields', () => {
      const minimalData = {
        street: '123 Main St',
        city: 'Salt Lake City',
        state: 'UT',
        zipCode: '84101',
        tenantNames: 'John Doe',
        pastDueAmount: '1200.00',
        noticeDate: '2025-12-01'
      };
      const html = TemplateEngine.render('utah-3day-notice-v1', minimalData);
      expect(html).toContain('123 Main St');
      expect(html).toContain('John Doe');
    });
  });

  describe('Template Rendering - Rent Increase', () => {
    test('should render utah-rent-increase-v1 with valid data', () => {
      const html = TemplateEngine.render('utah-rent-increase-v1', mockDataRentIncrease);
      expect(html).toContain('NOTICE OF RENT INCREASE');
      expect(html).toContain('John Doe');
      expect(html).toContain('123 Main St');
      expect(html).toContain('$1,200.00');
      expect(html).toContain('$1,350.00');
      expect(html).toContain('$150.00');
    });

    test('should calculate increase percentage correctly', () => {
      const html = TemplateEngine.render('utah-rent-increase-v1', mockDataRentIncrease);
      expect(html).toContain('12.5%');
    });

    test('should calculate days notice correctly', () => {
      const html = TemplateEngine.render('utah-rent-increase-v1', mockDataRentIncrease);
      expect(html).toContain('19 days');
    });

    test('should render preview with watermark', () => {
      const html = TemplateEngine.render('utah-rent-increase-preview-v1', mockDataRentIncrease);
      expect(html).toContain('DRAFT - NOT LEGAL');
      expect(html).toContain('NOTICE OF RENT INCREASE');
    });

    test('should include optional reason if provided', () => {
      const dataWithReason = { ...mockDataRentIncrease, reason: 'Market rate adjustment' };
      const html = TemplateEngine.render('utah-rent-increase-v1', dataWithReason);
      expect(html).toContain('Market rate adjustment');
    });
  });

  describe('Cache Management', () => {
    test('should clear cache and reload templates', () => {
      const beforeClear = TemplateEngine.getAllTemplates();
      TemplateEngine.clearCache();
      const afterClear = TemplateEngine.getAllTemplates();
      expect(afterClear.length).toBe(beforeClear.length);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid template ID gracefully', () => {
      expect(() => {
        TemplateEngine.render('invalid-template', mockData3Day);
      }).toThrow();
    });
  });
});
