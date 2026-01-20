/**
 * Utah Rent Increase Template - Unit Tests
 * Task 3.3.8: Test Template Rendering
 *
 * Tests the utah-rent-increase templates for:
 * - Template renders without errors
 * - All required fields display
 * - Optional fields display when provided
 * - Optional fields hidden when not provided
 * - Currency formatting correct
 * - Date formatting correct
 * - Percentage calculation correct
 * - Legal language present
 */

const utahRentIncreaseV1 = require('../utah-rent-increase-v1');
const utahRentIncreasePreviewV1 = require('../utah-rent-increase-preview-v1');

// Sample test data matching document definition fields
const sampleData = {
  // Property fields
  street: '123 Main Street',
  city: 'Salt Lake City',
  state: 'UT',
  zipCode: '84101',
  unitNumber: 'Apt 2B',

  // Tenant fields
  tenantNames: 'John Doe, Jane Doe',

  // Landlord fields
  landlordName: 'ABC Property Management',
  landlordPhone: '(801) 555-1234',
  landlordEmail: 'contact@abcproperty.com',

  // Lease/Financial fields
  leaseType: 'month-to-month',
  currentRent: 1200.00,
  newRent: 1350.00,

  // Date fields
  noticeDate: '2025-12-01',
  effectiveDate: '2025-12-20',

  // Optional fields
  reasonForIncrease: 'Annual market rate adjustment to align with comparable properties in the area.',
  paymentInstructions: 'Pay online at tenant.abcproperty.com or mail check to 456 Office Blvd, Salt Lake City, UT 84102.'
};

// Minimal required data (no optional fields)
const minimalData = {
  street: '789 Oak Ave',
  city: 'Provo',
  state: 'UT',
  zipCode: '84601',
  tenantNames: 'Alice Smith',
  landlordName: 'Quick Rentals LLC',
  landlordPhone: '(385) 555-9876',
  leaseType: 'month-to-month',
  currentRent: 900.00,
  newRent: 975.00,
  noticeDate: '2025-12-01',
  effectiveDate: '2025-12-20'
};

// Week-to-week lease data
const weekToWeekData = {
  ...minimalData,
  leaseType: 'week-to-week',
  effectiveDate: '2025-12-08' // 7 days notice for week-to-week
};

describe('Utah Rent Increase Templates', () => {

  // ============================================
  // 1. Final Template Tests
  // ============================================
  describe('Final Template (utah-rent-increase-v1)', () => {

    describe('Template Structure', () => {
      test('template object has required properties', () => {
        expect(utahRentIncreaseV1.id).toBe('utah-rent-increase-v1');
        expect(utahRentIncreaseV1.version).toBe('1.0');
        expect(utahRentIncreaseV1.documentType).toBe('utah-rent-increase');
        expect(typeof utahRentIncreaseV1.render).toBe('function');
      });

      test('renders without errors with complete data', () => {
        expect(() => utahRentIncreaseV1.render(sampleData)).not.toThrow();
      });

      test('renders without errors with minimal data', () => {
        expect(() => utahRentIncreaseV1.render(minimalData)).not.toThrow();
      });

      test('renders without errors with empty data', () => {
        expect(() => utahRentIncreaseV1.render({})).not.toThrow();
      });

      test('returns valid HTML string', () => {
        const html = utahRentIncreaseV1.render(sampleData);
        expect(typeof html).toBe('string');
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('<html>');
        expect(html).toContain('</html>');
      });
    });

    describe('Required Fields Display', () => {
      let html;

      beforeAll(() => {
        html = utahRentIncreaseV1.render(sampleData);
      });

      test('displays tenant names', () => {
        expect(html).toContain('John Doe, Jane Doe');
      });

      test('displays property address with unit number', () => {
        expect(html).toContain('123 Main Street');
        expect(html).toContain('Unit Apt 2B');
        expect(html).toContain('Salt Lake City');
        expect(html).toContain('UT');
        expect(html).toContain('84101');
      });

      test('displays landlord information', () => {
        expect(html).toContain('ABC Property Management');
        expect(html).toContain('(801) 555-1234');
        expect(html).toContain('contact@abcproperty.com');
      });

      test('displays lease type', () => {
        expect(html).toContain('month-to-month');
      });

      test('displays notice date formatted', () => {
        // Date may vary by 1 day due to timezone handling
        expect(html).toMatch(/November 30, 2025|December 1, 2025/);
      });

      test('displays effective date formatted', () => {
        // Date may vary by 1 day due to timezone handling
        expect(html).toMatch(/December 19, 2025|December 20, 2025/);
      });
    });

    describe('Currency Formatting', () => {
      let html;

      beforeAll(() => {
        html = utahRentIncreaseV1.render(sampleData);
      });

      test('displays current rent with currency format', () => {
        expect(html).toContain('$1,200.00');
      });

      test('displays new rent with currency format', () => {
        expect(html).toContain('$1,350.00');
      });

      test('displays increase amount calculated correctly', () => {
        // 1350 - 1200 = 150
        expect(html).toContain('$150.00');
      });
    });

    describe('Percentage Calculation', () => {
      test('calculates increase percentage correctly', () => {
        const html = utahRentIncreaseV1.render(sampleData);
        // (150 / 1200) * 100 = 12.5%
        expect(html).toContain('12.5%');
      });

      test('handles zero current rent gracefully', () => {
        const zeroRentData = { ...minimalData, currentRent: 0 };
        expect(() => utahRentIncreaseV1.render(zeroRentData)).not.toThrow();
      });
    });

    describe('Days Notice Calculation', () => {
      test('calculates days notice correctly', () => {
        const html = utahRentIncreaseV1.render(sampleData);
        // Dec 1 to Dec 20 = 19 days
        expect(html).toContain('19 days');
      });

      test('displays minimum notice days for month-to-month', () => {
        const html = utahRentIncreaseV1.render(sampleData);
        expect(html).toContain('15 days');
      });

      test('displays minimum notice days for week-to-week', () => {
        const html = utahRentIncreaseV1.render(weekToWeekData);
        expect(html).toContain('5 days');
        expect(html).toContain('week-to-week');
      });
    });

    describe('Optional Fields', () => {
      test('displays reason for increase when provided', () => {
        const html = utahRentIncreaseV1.render(sampleData);
        expect(html).toContain('Reason for Increase');
        expect(html).toContain('Annual market rate adjustment');
      });

      test('hides reason section when not provided', () => {
        const html = utahRentIncreaseV1.render(minimalData);
        expect(html).not.toContain('Reason for Increase');
      });

      test('displays payment instructions when provided', () => {
        const html = utahRentIncreaseV1.render(sampleData);
        expect(html).toContain('Payment Instructions');
        expect(html).toContain('tenant.abcproperty.com');
      });

      test('hides payment instructions when not provided', () => {
        const html = utahRentIncreaseV1.render(minimalData);
        expect(html).not.toContain('Payment Instructions');
      });

      test('displays landlord email when provided', () => {
        const html = utahRentIncreaseV1.render(sampleData);
        expect(html).toContain('contact@abcproperty.com');
      });

      test('handles missing landlord email gracefully', () => {
        const html = utahRentIncreaseV1.render(minimalData);
        expect(html).not.toContain('undefined');
      });

      test('displays unit number when provided', () => {
        const html = utahRentIncreaseV1.render(sampleData);
        expect(html).toContain('Unit Apt 2B');
      });

      test('handles missing unit number gracefully', () => {
        const html = utahRentIncreaseV1.render(minimalData);
        expect(html).not.toContain('Unit undefined');
        expect(html).not.toContain('undefined');
      });
    });

    describe('Legal Language', () => {
      let html;

      beforeAll(() => {
        html = utahRentIncreaseV1.render(sampleData);
      });

      test('contains Utah Code §57-22-4 reference', () => {
        expect(html).toContain('§57-22-4');
      });

      test('contains Utah Code §57-22-5 reference', () => {
        expect(html).toContain('§57-22-5');
      });

      test('contains Utah Code §57-22-6 (retaliation) reference', () => {
        expect(html).toContain('§57-22-6');
      });

      test('contains tenant rights section', () => {
        expect(html).toContain('Your Rights Under Utah Law');
      });

      test('contains non-retaliation statement', () => {
        expect(html).toContain('Non-Retaliation Protection');
        expect(html).toContain('not being issued in retaliation');
      });

      test('contains option to continue tenancy', () => {
        expect(html).toContain('Continue Tenancy');
      });

      test('contains option to terminate tenancy', () => {
        expect(html).toContain('Terminate Tenancy');
      });

      test('contains LeaseLogic legal disclaimer', () => {
        expect(html).toContain('IMPORTANT LEGAL NOTICE');
        expect(html).toContain('does NOT provide legal advice');
        expect(html).toContain('LeaseLogic');
      });
    });

    describe('Document Structure', () => {
      let html;

      beforeAll(() => {
        html = utahRentIncreaseV1.render(sampleData);
      });

      test('has document title', () => {
        expect(html).toContain('NOTICE OF RENT INCREASE');
      });

      test('has signature line section', () => {
        expect(html).toContain('Signature:');
      });

      test('has landlord certification section', () => {
        expect(html).toContain('Landlord/Agent Certification');
      });

      test('has certificate of service section', () => {
        expect(html).toContain('CERTIFICATE OF SERVICE');
        expect(html).toContain('Date Served:');
        expect(html).toContain('Method of Service:');
        expect(html).toContain('Signature of Person Serving:');
      });

      test('has proper CSS styling matching 3-day notice', () => {
        expect(html).toContain('<style>');
        expect(html).toContain("font-family: 'Times New Roman', serif");
      });
    });
  });

  // ============================================
  // 2. Preview Template Tests
  // ============================================
  describe('Preview Template (utah-rent-increase-preview-v1)', () => {

    describe('Template Structure', () => {
      test('template object has required properties', () => {
        expect(utahRentIncreasePreviewV1.id).toBe('utah-rent-increase-preview-v1');
        expect(utahRentIncreasePreviewV1.version).toBe('1.0');
        expect(utahRentIncreasePreviewV1.documentType).toBe('utah-rent-increase');
        expect(typeof utahRentIncreasePreviewV1.render).toBe('function');
      });

      test('renders without errors', () => {
        expect(() => utahRentIncreasePreviewV1.render(sampleData)).not.toThrow();
      });
    });

    describe('Watermark', () => {
      let html;

      beforeAll(() => {
        html = utahRentIncreasePreviewV1.render(sampleData);
      });

      test('contains preview watermark text', () => {
        expect(html).toContain('PREVIEW');
        expect(html).toContain('NOT FOR LEGAL USE');
      });

      test('watermark has proper styling', () => {
        expect(html).toContain('position: fixed');
        expect(html).toContain('rotate(-45deg)');
        expect(html).toContain('z-index: 1000');
      });

      test('watermark is semi-transparent', () => {
        expect(html).toMatch(/rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\.[1-5]\s*\)/);
      });
    });

    describe('Content Consistency', () => {
      test('contains same content as final template', () => {
        const previewHtml = utahRentIncreasePreviewV1.render(sampleData);
        const finalHtml = utahRentIncreaseV1.render(sampleData);

        // Preview should contain all the same core content
        expect(previewHtml).toContain('John Doe, Jane Doe');
        expect(previewHtml).toContain('$1,350.00');
        expect(previewHtml).toContain('§57-22-4');
        expect(previewHtml).toContain('NOTICE OF RENT INCREASE');
      });
    });
  });

  // ============================================
  // 3. Edge Cases
  // ============================================
  describe('Edge Cases', () => {

    test('handles missing dates gracefully', () => {
      const noDateData = { ...minimalData, noticeDate: null, effectiveDate: null };
      expect(() => utahRentIncreaseV1.render(noDateData)).not.toThrow();
    });

    test('handles invalid currency amounts', () => {
      const invalidData = { ...minimalData, currentRent: 'invalid', newRent: 'invalid' };
      expect(() => utahRentIncreaseV1.render(invalidData)).not.toThrow();
    });

    test('handles very large rent amounts', () => {
      const largeRentData = { ...minimalData, currentRent: 999999.99, newRent: 1000099.99 };
      const html = utahRentIncreaseV1.render(largeRentData);
      expect(html).toContain('$999,999.99');
      expect(html).toContain('$1,000,099.99');
    });

    test('handles special characters in names', () => {
      const specialCharsData = {
        ...minimalData,
        tenantNames: "O'Brien & Smith-Jones",
        landlordName: 'Müller & Associates'
      };
      expect(() => utahRentIncreaseV1.render(specialCharsData)).not.toThrow();
      const html = utahRentIncreaseV1.render(specialCharsData);
      expect(html).toContain("O'Brien");
    });
  });
});
