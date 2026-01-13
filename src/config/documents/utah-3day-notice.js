/**
 * Utah 3-Day Notice to Pay or Vacate
 * Document Definition
 */

export default {
  id: 'utah-3day-notice',
  name: 'Utah 3-Day Notice to Pay or Vacate',
  description: 'Utah-compliant eviction notice for non-payment of rent',
  state: 'UT',
  version: '1.3',
  
  pricing: {
    preview: 0,
    final: 9.99
  },
  
  templates: {
    preview: 'utah-3day-notice-preview',
    final: 'utah-3day-notice-final'
  },
  
  fields: [
    {
      id: 'street',
      label: 'Property Street Address',
      type: 'text',
      group: 'property',
      validation: {
        required: true,
        minLength: 5,
        maxLength: 100
      },
      placeholder: '123 Main Street'
    },
    {
      id: 'city',
      label: 'City',
      type: 'text',
      group: 'property',
      validation: {
        required: true
      },
      placeholder: 'Salt Lake City'
    },
    {
      id: 'state',
      label: 'State',
      type: 'text',
      group: 'property',
      defaultValue: 'UT',
      validation: {
        required: true,
        pattern: '^UT$'
      }
    },
    {
      id: 'zipCode',
      label: 'Zip Code',
      type: 'text',
      group: 'property',
      validation: {
        required: true,
        pattern: '^84\\d{3}$',
        message: 'Must be a valid Utah zip code'
      },
      placeholder: '84101'
    },
    {
      id: 'tenantNames',
      label: 'Tenant Name(s)',
      type: 'text',
      group: 'parties',
      validation: {
        required: true
      },
      placeholder: 'John Doe, Jane Doe',
      helpText: 'Separate multiple names with commas'
    },
    {
      id: 'landlordName',
      label: 'Landlord/Agent Name',
      type: 'text',
      group: 'parties',
      validation: {
        required: true
      },
      placeholder: 'ABC Property Management'
    },
    {
      id: 'landlordPhone',
      label: 'Landlord Phone',
      type: 'phone',
      group: 'parties',
      validation: {
        required: true,
        pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$'
      },
      placeholder: '(801) 555-1234'
    },
    {
      id: 'landlordEmail',
      label: 'Landlord Email',
      type: 'email',
      group: 'parties',
      validation: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      },
      placeholder: 'landlord@example.com'
    },
    {
      id: 'pastDueAmount',
      label: 'Total Past-Due Rent',
      type: 'currency',
      group: 'financial',
      validation: {
        required: true,
        min: 0.01
      },
      placeholder: '$1,200.00',
      helpText: 'Enter the total amount of unpaid rent'
    },
    {
      id: 'originalDueDate',
      label: 'Original Due Date',
      type: 'date',
      group: 'dates',
      validation: {
        required: true
      },
      helpText: 'When was the rent originally due?'
    },
    {
      id: 'noticeDate',
      label: 'Notice Date',
      type: 'date',
      group: 'dates',
      defaultValue: 'today',
      validation: {
        required: true
      }
    }
  ],
  
  metadata: {
    legalReferences: ['Utah Code §78B-6-802'],
    category: 'eviction',
    tags: ['eviction', 'non-payment', '3-day-notice', 'utah']
  }
};
