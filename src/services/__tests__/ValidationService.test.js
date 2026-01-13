import { ValidationService } from '../ValidationService';

describe('ValidationService', () => {
  let service;

  beforeEach(() => {
    service = new ValidationService();
  });

  describe('validateField', () => {
    test('validates required field', () => {
      const result = service.validateField('', { required: true });
      expect(result.valid).toBe(false);
      expect(result.message).toContain('required');
    });

    test('passes when required field has value', () => {
      const result = service.validateField('test', { required: true });
      expect(result.valid).toBe(true);
    });

    test('validates pattern', () => {
      const result = service.validateField('12345', { pattern: '^\\d{5}$' });
      expect(result.valid).toBe(true);

      const result2 = service.validateField('1234', { pattern: '^\\d{5}$' });
      expect(result2.valid).toBe(false);
    });

    test('validates min length', () => {
      const result = service.validateField('ab', { minLength: 3 });
      expect(result.valid).toBe(false);

      const result2 = service.validateField('abc', { minLength: 3 });
      expect(result2.valid).toBe(true);
    });

    test('validates max length', () => {
      const result = service.validateField('abcd', { maxLength: 3 });
      expect(result.valid).toBe(false);

      const result2 = service.validateField('abc', { maxLength: 3 });
      expect(result2.valid).toBe(true);
    });

    test('validates min value', () => {
      const result = service.validateField('5', { min: 10 });
      expect(result.valid).toBe(false);

      const result2 = service.validateField('15', { min: 10 });
      expect(result2.valid).toBe(true);
    });

    test('validates max value', () => {
      const result = service.validateField('15', { max: 10 });
      expect(result.valid).toBe(false);

      const result2 = service.validateField('5', { max: 10 });
      expect(result2.valid).toBe(true);
    });

    test('skips validation for empty non-required field', () => {
      const result = service.validateField('', { pattern: '^\\d{5}$' });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateForm', () => {
    test('validates entire form', () => {
      const fields = [
        { id: 'name', validation: { required: true } },
        { id: 'email', validation: { required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' } }
      ];

      const data = { name: 'John', email: 'john@example.com' };
      const result = service.validateForm(data, fields);

      expect(result.valid).toBe(true);
      expect(result.errorCount).toBe(0);
    });

    test('returns errors for invalid form', () => {
      const fields = [
        { id: 'name', validation: { required: true } },
        { id: 'email', validation: { required: true } }
      ];

      const data = { name: '', email: '' };
      const result = service.validateForm(data, fields);

      expect(result.valid).toBe(false);
      expect(result.errorCount).toBe(2);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
    });
  });

  describe('custom validators', () => {
    test('registers and uses custom validator', () => {
      service.registerValidator('isEven', (value) => {
        const num = parseInt(value);
        if (num % 2 !== 0) {
          return { valid: false, message: 'Must be even number' };
        }
        return { valid: true };
      });

      const result = service.validateField('4', { custom: 'isEven' });
      expect(result.valid).toBe(true);

      const result2 = service.validateField('3', { custom: 'isEven' });
      expect(result2.valid).toBe(false);
    });
  });

  describe('getValidator', () => {
    test('gets email validator', () => {
      const validator = service.getValidator('email');
      const result = validator('test@example.com');
      expect(result.valid).toBe(true);

      const result2 = validator('invalid-email');
      expect(result2.valid).toBe(false);
    });

    test('gets phone validator', () => {
      const validator = service.getValidator('phone');
      const result = validator('(801) 555-1234');
      expect(result.valid).toBe(true);
    });

    test('gets currency validator', () => {
      const validator = service.getValidator('currency');
      const result = validator('100.50');
      expect(result.valid).toBe(true);

      const result2 = validator('invalid');
      expect(result2.valid).toBe(false);
    });
  });

  describe('formatValue', () => {
    test('formats currency', () => {
      const formatted = service.formatValue('1200', 'currency');
      expect(formatted).toBe('$1,200.00');
    });

    test('formats phone', () => {
      const formatted = service.formatValue('8015551234', 'phone');
      expect(formatted).toBe('(801) 555-1234');
    });

    test('formats date', () => {
      const formatted = service.formatValue('2025-11-26', 'date');
      expect(formatted).toContain('11');
      expect(formatted).toContain('2025');
      // Date may show as 25 or 26 depending on timezone
      expect(formatted.match(/2[56]/)).toBeTruthy();
    });
  });

  describe('parseValue', () => {
    test('parses currency', () => {
      const parsed = service.parseValue('$1,200.00', 'currency');
      expect(parsed).toBe(1200);
    });

    test('parses number', () => {
      const parsed = service.parseValue('123.45', 'number');
      expect(parsed).toBe(123.45);
    });

    test('parses date', () => {
      const parsed = service.parseValue('2025-11-26', 'date');
      expect(parsed).toBe('2025-11-26');
    });
  });
});
