/**
 * Utah Rent Increase Notice - Document Definition Tests
 * Task 3.2.9: Unit Tests
 *
 * Tests the utah-rent-increase document definition for:
 * - Document loads correctly
 * - All fields present and properly configured
 * - Validation rules work
 * - Pricing correct
 * - Templates referenced
 * - Metadata complete
 */

// Import from index to ensure all documents are registered in the registry
import documentRegistry, { utahRentIncrease } from '../index';

describe('Utah Rent Increase Document Definition', () => {

  // ============================================
  // 1. Document Loading Tests
  // ============================================
  describe('Document Loading', () => {
    test('document definition exists and is valid', () => {
      expect(utahRentIncrease).toBeDefined();
      expect(utahRentIncrease.id).toBe('utah-rent-increase');
    });

    test('document is registered in registry', () => {
      expect(documentRegistry.hasDocument('utah-rent-increase')).toBe(true);
    });

    test('document can be retrieved from registry', () => {
      const doc = documentRegistry.getDocument('utah-rent-increase');
      expect(doc).toBeDefined();
      expect(doc.id).toBe('utah-rent-increase');
    });

    test('document has required top-level properties', () => {
      expect(utahRentIncrease.id).toBeDefined();
      expect(utahRentIncrease.name).toBeDefined();
      expect(utahRentIncrease.description).toBeDefined();
      expect(utahRentIncrease.state).toBeDefined();
      expect(utahRentIncrease.version).toBeDefined();
      expect(utahRentIncrease.fields).toBeDefined();
      expect(utahRentIncrease.pricing).toBeDefined();
      expect(utahRentIncrease.templates).toBeDefined();
    });
  });

  // ============================================
  // 2. Document Metadata Tests
  // ============================================
  describe('Document Metadata', () => {
    test('has correct document ID', () => {
      expect(utahRentIncrease.id).toBe('utah-rent-increase');
    });

    test('has correct document name', () => {
      expect(utahRentIncrease.name).toBe('Utah Rent Increase Notice');
    });

    test('has description', () => {
      expect(utahRentIncrease.description).toBeTruthy();
      expect(typeof utahRentIncrease.description).toBe('string');
    });

    test('is for Utah state', () => {
      expect(utahRentIncrease.state).toBe('UT');
    });

    test('has version number', () => {
      expect(utahRentIncrease.version).toBeDefined();
      expect(utahRentIncrease.version).toMatch(/^\d+\.\d+$/);
    });

    test('has metadata with legal references', () => {
      expect(utahRentIncrease.metadata).toBeDefined();
      expect(utahRentIncrease.metadata.legalReferences).toBeDefined();
      expect(Array.isArray(utahRentIncrease.metadata.legalReferences)).toBe(true);
      expect(utahRentIncrease.metadata.legalReferences.length).toBeGreaterThan(0);
    });

    test('references Utah Code for rent increases', () => {
      const refs = utahRentIncrease.metadata.legalReferences;
      const hasUtahCode = refs.some(ref => ref.includes('57-22'));
      expect(hasUtahCode).toBe(true);
    });

    test('has category in metadata', () => {
      expect(utahRentIncrease.metadata.category).toBeDefined();
    });

    test('has tags in metadata', () => {
      expect(utahRentIncrease.metadata.tags).toBeDefined();
      expect(Array.isArray(utahRentIncrease.metadata.tags)).toBe(true);
      expect(utahRentIncrease.metadata.tags).toContain('rent-increase');
    });
  });

  // ============================================
  // 3. Pricing Tests
  // ============================================
  describe('Pricing', () => {
    test('has pricing object', () => {
      expect(utahRentIncrease.pricing).toBeDefined();
      expect(typeof utahRentIncrease.pricing).toBe('object');
    });

    test('preview is free', () => {
      expect(utahRentIncrease.pricing.preview).toBe(0);
    });

    test('final PDF is $7.99', () => {
      expect(utahRentIncrease.pricing.final).toBe(7.99);
    });
  });

  // ============================================
  // 4. Templates Tests
  // ============================================
  describe('Templates', () => {
    test('has templates object', () => {
      expect(utahRentIncrease.templates).toBeDefined();
      expect(typeof utahRentIncrease.templates).toBe('object');
    });

    test('has preview template reference', () => {
      expect(utahRentIncrease.templates.preview).toBeDefined();
      expect(utahRentIncrease.templates.preview).toContain('rent-increase');
    });

    test('has final template reference', () => {
      expect(utahRentIncrease.templates.final).toBeDefined();
      expect(utahRentIncrease.templates.final).toContain('rent-increase');
    });
  });

  // ============================================
  // 5. Fields Tests
  // ============================================
  describe('Fields', () => {
    test('has fields array', () => {
      expect(Array.isArray(utahRentIncrease.fields)).toBe(true);
    });

    test('has at least 15 fields', () => {
      // Minimum fields for a complete rent increase notice
      expect(utahRentIncrease.fields.length).toBeGreaterThanOrEqual(15);
    });

    test('each field has required properties', () => {
      utahRentIncrease.fields.forEach(field => {
        expect(field.id).toBeDefined();
        expect(field.label).toBeDefined();
        expect(field.type).toBeDefined();
      });
    });

    test('each field has a group', () => {
      utahRentIncrease.fields.forEach(field => {
        expect(field.group).toBeDefined();
      });
    });

    // Property Fields
    describe('Property Fields', () => {
      test('has street/propertyAddress field', () => {
        const field = utahRentIncrease.fields.find(f =>
          f.id === 'street' || f.id === 'propertyAddress'
        );
        expect(field).toBeDefined();
        expect(field.type).toBe('text');
      });

      test('has city field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'city');
        expect(field).toBeDefined();
        expect(field.type).toBe('text');
      });

      test('has state field with UT default', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'state');
        expect(field).toBeDefined();
        expect(field.defaultValue).toBe('UT');
      });

      test('has zipCode field', () => {
        const field = utahRentIncrease.fields.find(f =>
          f.id === 'zipCode' || f.id === 'propertyZip'
        );
        expect(field).toBeDefined();
      });

      test('has unitNumber field (optional)', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'unitNumber');
        expect(field).toBeDefined();
        // unitNumber should be optional (no required validation or required: false)
        const isOptional = !field.validation?.required;
        expect(isOptional).toBe(true);
      });
    });

    // Tenant Fields
    describe('Tenant Fields', () => {
      test('has tenantNames field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'tenantNames');
        expect(field).toBeDefined();
        expect(field.type).toBe('text');
      });
    });

    // Landlord Fields
    describe('Landlord Fields', () => {
      test('has landlordName field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'landlordName');
        expect(field).toBeDefined();
      });

      test('has landlordPhone field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'landlordPhone');
        expect(field).toBeDefined();
        expect(['phone', 'tel']).toContain(field.type);
      });

      test('has landlordEmail field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'landlordEmail');
        expect(field).toBeDefined();
        expect(field.type).toBe('email');
      });
    });

    // Lease/Financial Fields
    describe('Lease and Financial Fields', () => {
      test('has leaseType field with options', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'leaseType');
        expect(field).toBeDefined();
        expect(field.type).toBe('select');
        expect(field.options).toBeDefined();
        expect(field.options.length).toBeGreaterThanOrEqual(2);
      });

      test('leaseType has month-to-month option', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'leaseType');
        const hasMonthToMonth = field.options.some(opt =>
          opt.value?.toLowerCase().includes('month') ||
          opt.label?.toLowerCase().includes('month')
        );
        expect(hasMonthToMonth).toBe(true);
      });

      test('leaseType has week-to-week option', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'leaseType');
        const hasWeekToWeek = field.options.some(opt =>
          opt.value?.toLowerCase().includes('week') ||
          opt.label?.toLowerCase().includes('week')
        );
        expect(hasWeekToWeek).toBe(true);
      });

      test('has currentRent field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'currentRent');
        expect(field).toBeDefined();
        expect(field.type).toBe('currency');
      });

      test('has newRent field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'newRent');
        expect(field).toBeDefined();
        expect(field.type).toBe('currency');
      });

      test('has increaseAmount calculated field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'increaseAmount');
        expect(field).toBeDefined();
        expect(field.type).toBe('calculated');
      });

      test('has increasePercentage calculated field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'increasePercentage');
        expect(field).toBeDefined();
        expect(field.type).toBe('calculated');
      });
    });

    // Date Fields
    describe('Date Fields', () => {
      test('has noticeDate field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'noticeDate');
        expect(field).toBeDefined();
        expect(field.type).toBe('date');
      });

      test('has effectiveDate field', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'effectiveDate');
        expect(field).toBeDefined();
        expect(field.type).toBe('date');
      });

      test('effectiveDate has help text about 15-day minimum', () => {
        const field = utahRentIncrease.fields.find(f => f.id === 'effectiveDate');
        expect(field.helpText).toBeDefined();
        expect(field.helpText.toLowerCase()).toContain('15');
      });

      test('has daysNotice calculated field', () => {
        const field = utahRentIncrease.fields.find(f =>
          f.id === 'daysNotice' || f.id === 'daysNoticeGiven'
        );
        expect(field).toBeDefined();
        expect(field.type).toBe('calculated');
      });
    });
  });

  // ============================================
  // 6. Validation Rules Tests
  // ============================================
  describe('Validation Rules', () => {
    test('street/propertyAddress is required', () => {
      const field = utahRentIncrease.fields.find(f =>
        f.id === 'street' || f.id === 'propertyAddress'
      );
      expect(field.validation?.required).toBe(true);
    });

    test('city is required', () => {
      const field = utahRentIncrease.fields.find(f => f.id === 'city');
      expect(field.validation?.required).toBe(true);
    });

    test('tenantNames is required', () => {
      const field = utahRentIncrease.fields.find(f => f.id === 'tenantNames');
      expect(field.validation?.required).toBe(true);
    });

    test('landlordName is required', () => {
      const field = utahRentIncrease.fields.find(f => f.id === 'landlordName');
      expect(field.validation?.required).toBe(true);
    });

    test('landlordPhone is required', () => {
      const field = utahRentIncrease.fields.find(f => f.id === 'landlordPhone');
      expect(field.validation?.required).toBe(true);
    });

    test('currentRent is required with min value', () => {
      const field = utahRentIncrease.fields.find(f => f.id === 'currentRent');
      expect(field.validation?.required).toBe(true);
      expect(field.validation?.min).toBeGreaterThan(0);
    });

    test('newRent is required with min value', () => {
      const field = utahRentIncrease.fields.find(f => f.id === 'newRent');
      expect(field.validation?.required).toBe(true);
      expect(field.validation?.min).toBeGreaterThan(0);
    });

    test('newRent has custom validation for greater than current', () => {
      const field = utahRentIncrease.fields.find(f => f.id === 'newRent');
      // Should have custom validation to ensure new > current
      expect(field.validation?.custom).toBeDefined();
    });

    test('effectiveDate is required', () => {
      const field = utahRentIncrease.fields.find(f => f.id === 'effectiveDate');
      expect(field.validation?.required).toBe(true);
    });

    test('effectiveDate has custom validation for minimum notice period', () => {
      const field = utahRentIncrease.fields.find(f => f.id === 'effectiveDate');
      // Should have custom validation for 15-day minimum
      expect(field.validation?.custom).toBeDefined();
    });

    test('zipCode has pattern validation', () => {
      const field = utahRentIncrease.fields.find(f =>
        f.id === 'zipCode' || f.id === 'propertyZip'
      );
      expect(field.validation?.pattern).toBeDefined();
    });

    test('landlordPhone has pattern validation', () => {
      const field = utahRentIncrease.fields.find(f => f.id === 'landlordPhone');
      expect(field.validation?.pattern).toBeDefined();
    });
  });

  // ============================================
  // 7. Field Groups Tests
  // ============================================
  describe('Field Groups', () => {
    test('fields are organized into groups', () => {
      const groups = new Set(utahRentIncrease.fields.map(f => f.group));
      expect(groups.size).toBeGreaterThanOrEqual(3);
    });

    test('has property group', () => {
      const propertyFields = utahRentIncrease.fields.filter(f => f.group === 'property');
      expect(propertyFields.length).toBeGreaterThanOrEqual(3);
    });

    test('has parties group', () => {
      const partiesFields = utahRentIncrease.fields.filter(f => f.group === 'parties');
      expect(partiesFields.length).toBeGreaterThanOrEqual(2);
    });

    test('has financial group', () => {
      const financialFields = utahRentIncrease.fields.filter(f => f.group === 'financial');
      expect(financialFields.length).toBeGreaterThanOrEqual(2);
    });

    test('has dates group', () => {
      const dateFields = utahRentIncrease.fields.filter(f => f.group === 'dates');
      expect(dateFields.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================
  // 8. State Registry Integration Tests
  // ============================================
  describe('State Registry Integration', () => {
    test('document appears in Utah documents list', () => {
      const utahDocs = documentRegistry.getDocumentsByState('UT');
      const hasRentIncrease = utahDocs.some(doc => doc.id === 'utah-rent-increase');
      expect(hasRentIncrease).toBe(true);
    });

    test('Utah has at least 2 documents (3-day notice + rent increase)', () => {
      const utahDocs = documentRegistry.getDocumentsByState('UT');
      expect(utahDocs.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================
  // 9. Consistency with 3-Day Notice Tests
  // ============================================
  describe('Consistency with 3-Day Notice', () => {
    let threeDayNotice;

    beforeAll(() => {
      threeDayNotice = documentRegistry.getDocument('utah-3day-notice');
    });

    test('both documents exist', () => {
      expect(utahRentIncrease).toBeDefined();
      expect(threeDayNotice).toBeDefined();
    });

    test('both have same state (UT)', () => {
      expect(utahRentIncrease.state).toBe(threeDayNotice.state);
    });

    test('both have pricing structure', () => {
      expect(utahRentIncrease.pricing).toBeDefined();
      expect(threeDayNotice.pricing).toBeDefined();
    });

    test('both have templates structure', () => {
      expect(utahRentIncrease.templates).toBeDefined();
      expect(threeDayNotice.templates).toBeDefined();
    });

    test('both have metadata structure', () => {
      expect(utahRentIncrease.metadata).toBeDefined();
      expect(threeDayNotice.metadata).toBeDefined();
    });

    test('shared field structure consistency', () => {
      // Check that common fields (street, city, tenantNames, landlordName)
      // have similar structure
      const rentIncreaseStreet = utahRentIncrease.fields.find(f =>
        f.id === 'street' || f.id === 'propertyAddress'
      );
      const threeDayStreet = threeDayNotice.fields.find(f => f.id === 'street');

      expect(rentIncreaseStreet.type).toBe(threeDayStreet.type);
    });
  });
});
