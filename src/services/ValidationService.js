/**
 * Validation Service
 * Validates form fields and data
 */

class ValidationService {
  constructor() {
    this.customValidators = {};
  }

  /**
   * Validate a single field
   * Updated for Task 3.1: Uses custom messages from document definition
   */
  validateField(value, rules = {}) {
    // Normalize value - treat empty strings as falsy
    const normalizedValue = typeof value === 'string' ? value.trim() : value;

    // Required validation
    if (rules.required && !normalizedValue) {
      return {
        valid: false,
        message: rules.message || 'This field is required'
      };
    }

    // Skip other validations if empty and not required
    if (!normalizedValue && !rules.required) {
      return { valid: true };
    }

    // Pattern validation
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(normalizedValue)) {
        return {
          valid: false,
          message: rules.message || 'Invalid format'
        };
      }
    }

    // Min length validation
    if (rules.minLength && normalizedValue.length < rules.minLength) {
      return {
        valid: false,
        message: rules.message || `Minimum length is ${rules.minLength} characters`
      };
    }

    // Max length validation
    if (rules.maxLength && normalizedValue.length > rules.maxLength) {
      return {
        valid: false,
        message: rules.message || `Maximum length is ${rules.maxLength} characters`
      };
    }

    // Min value validation (for currency/number fields)
    if (rules.min !== undefined) {
      const numValue = parseFloat(normalizedValue);
      if (isNaN(numValue) || numValue < rules.min) {
        return {
          valid: false,
          message: rules.message || `Minimum value is ${rules.min}`
        };
      }
    }

    // Max value validation
    if (rules.max !== undefined) {
      const numValue = parseFloat(normalizedValue);
      if (isNaN(numValue) || numValue > rules.max) {
        return {
          valid: false,
          message: rules.message || `Maximum value is ${rules.max}`
        };
      }
    }

    // Custom validator
    if (rules.custom && this.customValidators[rules.custom]) {
      return this.customValidators[rules.custom](normalizedValue, rules);
    }

    return { valid: true };
  }

  /**
   * Validate entire form
   */
  validateForm(data, fields) {
    const errors = {};
    let errorCount = 0;

    fields.forEach(field => {
      const value = data[field.id];
      const result = this.validateField(value, field.validation);

      if (!result.valid) {
        errors[field.id] = result.message;
        errorCount++;
      }
    });

    return {
      valid: errorCount === 0,
      errors,
      fieldCount: fields.length,
      errorCount
    };
  }

  /**
   * Register custom validator
   */
  registerValidator(name, validator) {
    this.customValidators[name] = validator;
  }

  /**
   * Get validator for field type
   */
  getValidator(type) {
    const validators = {
      text: (value) => ({ valid: true }),
      email: (value) => this.validateField(value, {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        message: 'Invalid email address'
      }),
      phone: (value) => this.validateField(value, {
        pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$',
        message: 'Phone must be (XXX) XXX-XXXX'
      }),
      currency: (value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          return { valid: false, message: 'Invalid currency amount' };
        }
        return { valid: true };
      },
      date: (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { valid: false, message: 'Invalid date' };
        }
        return { valid: true };
      }
    };

    return validators[type] || validators.text;
  }

  /**
   * Format value for display
   */
  formatValue(value, type) {
    if (!value) return '';

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);

      case 'phone':
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 10) {
          return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return value;

      case 'date':
        const date = new Date(value);
        return date.toLocaleDateString('en-US');

      default:
        return value;
    }
  }

  /**
   * Parse value from string
   */
  parseValue(value, type) {
    if (!value) return null;

    switch (type) {
      case 'currency':
        return parseFloat(value.replace(/[^0-9.-]+/g, ''));

      case 'number':
        return parseFloat(value);

      case 'date':
        return new Date(value).toISOString().split('T')[0];

      default:
        return value;
    }
  }
}

// Create singleton instance
const validationService = new ValidationService();

export default validationService;
export { ValidationService };
