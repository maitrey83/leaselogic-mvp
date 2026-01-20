/**
 * Utah 3-Day Notice to Pay or Vacate
 * Document Definition
 *
 * IMPORTANT: This definition must match the MVP validation exactly.
 * See: src/utils/validation.js for reference
 * Task 3.1: Migration to config-driven system
 */

export default {
  id: 'utah-3day-notice',
  name: 'Utah 3-Day Notice to Pay or Vacate',
  description: 'Utah-compliant eviction notice for non-payment of rent',
  state: 'UT',
  version: '2.0', // Updated for Task 3.1 migration

  pricing: {
    preview: 0,
    final: 9.99
  },

  templates: {
    preview: 'utah-3day-notice-preview',
    final: 'utah-3day-notice-final'
  },

  // Field groups for UI organization
  fieldGroups: [
    { id: 'property', label: 'Property Address', order: 1 },
    { id: 'parties', label: 'Tenant & Landlord Information', order: 2 },
    { id: 'financial', label: 'Financial Information', order: 3 },
    { id: 'dates', label: 'Notice Date', order: 4 }
  ],

  fields: [
    // ============================================
    // Property Address Section
    // ============================================
    {
      id: 'street',
      label: 'Street Address',
      type: 'text',
      group: 'property',
      required: true,
      validation: {
        required: true,
        message: 'Street address is required'
      },
      ui: {
        colSpan: 2 // Full width in grid
      }
    },
    {
      id: 'city',
      label: 'City',
      type: 'text',
      group: 'property',
      required: true,
      validation: {
        required: true,
        message: 'City is required'
      }
    },
    {
      id: 'state',
      label: 'State',
      type: 'text',
      group: 'property',
      defaultValue: 'UT',
      disabled: true, // Utah only
      validation: {
        required: true
      }
    },
    {
      id: 'zipCode',
      label: 'ZIP Code',
      type: 'text',
      group: 'property',
      required: true,
      validation: {
        required: true,
        pattern: '^\\d{5}(-\\d{4})?$',
        message: 'Invalid ZIP code format'
      },
      placeholder: '84101'
    },

    // ============================================
    // Tenant & Landlord Information Section
    // ============================================
    {
      id: 'tenantNames',
      label: 'Tenant Name(s)',
      type: 'text',
      group: 'parties',
      required: true,
      validation: {
        required: true,
        message: 'Tenant name(s) required'
      },
      placeholder: 'Enter tenant names (separate multiple with commas)',
      helpText: 'Separate multiple names with commas'
    },
    {
      id: 'landlordName',
      label: 'Landlord/Agent Name',
      type: 'text',
      group: 'parties',
      required: true,
      validation: {
        required: true,
        message: 'Landlord name is required'
      }
    },
    {
      id: 'landlordPhone',
      label: 'Landlord Phone',
      type: 'tel',
      group: 'parties',
      required: true,
      validation: {
        required: true,
        pattern: '^[\\d\\s\\-\\(\\)\\.+]+$',
        message: 'Invalid phone format'
      },
      placeholder: '(801) 555-1234'
    },
    {
      id: 'landlordEmail',
      label: 'Landlord Email',
      type: 'email',
      group: 'parties',
      required: true,
      validation: {
        required: true,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        message: 'Invalid email format'
      },
      placeholder: 'landlord@example.com'
    },

    // ============================================
    // Financial Information Section
    // ============================================
    {
      id: 'pastDueAmount',
      label: 'Total Past-Due Rent Amount',
      type: 'currency',
      group: 'financial',
      required: true,
      validation: {
        required: true,
        min: 0.01,
        message: 'Amount must be greater than $0'
      },
      placeholder: '0.00',
      helpText: 'Per Utah law, only include rent. Do not include late fees, utilities, or other charges.',
      ui: {
        prefix: '$'
      }
    },
    {
      id: 'originalDueDate',
      label: 'Original Due Date',
      type: 'date',
      group: 'financial',
      required: true,
      validation: {
        required: true,
        message: 'Original due date is required'
      }
    },

    // ============================================
    // Notice Date Section
    // ============================================
    {
      id: 'noticeDate',
      label: 'Date of Notice Issuance',
      type: 'date',
      group: 'dates',
      required: true,
      validation: {
        required: true,
        message: 'Notice date is required'
      }
    }
  ],

  metadata: {
    legalReferences: ['Utah Code §78B-6-802'],
    category: 'eviction',
    tags: ['eviction', 'non-payment', '3-day-notice', 'utah']
  }
};
