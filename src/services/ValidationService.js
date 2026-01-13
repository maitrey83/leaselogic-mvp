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
   */
  validateField(value, rules = {}) {
    // Required validation
    if (rules.required && !value) {
      return {
        valid: false,
        message: rules.message || 'This field is required'
      };
    }

    // Skip other validations if empty and not required
    if (!value && !rules.required) {
      return { valid: true };
    }

    // Pattern validation
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        return {
          valid: false,
          message: rules.message || 'Invalid format'
        };
      }
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return {
        valid: false,
        message: `Minimum length is ${rules.minLength} characters`
      };
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        valid: false,
        message: `Maximum length is ${rules.maxLength} characters`
      };
    }

    // Min value validation
    if (rules.min !== undefined && parseFloat(value) < rules.min) {
      return {
        valid: false,
        message: `Minimum value is ${rules.min}`
      };
    }

    // Max value validation
    if (rules.max !== undefined && parseFloat(value) > rules.max) {
      return {
        valid: false,
        message: `Maximum value is ${rules.max}`
      };
    }

    // Custom validator
    if (rules.custom && this.customValidators[rules.custom]) {
      return this.customValidators[rules.custom](value, rules);
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
