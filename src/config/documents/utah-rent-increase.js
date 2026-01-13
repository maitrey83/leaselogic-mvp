/**
 * Utah Rent Increase Notice
 * Document Definition
 */

export default {
  id: 'utah-rent-increase',
  name: 'Utah Rent Increase Notice',
  description: 'Notice of rent increase for Utah tenancies',
  state: 'UT',
  version: '1.0',
  
  pricing: {
    preview: 0,
    final: 7.99
  },
  
  templates: {
    preview: 'utah-rent-increase-preview',
    final: 'utah-rent-increase-final'
  },
  
  fields: [
    {
      id: 'street',
      label: 'Property Street Address',
      type: 'text',
      group: 'property',
      validation: { required: true },
      placeholder: '123 Main Street'
    },
    {
      id: 'city',
      label: 'City',
      type: 'text',
      group: 'property',
      validation: { required: true },
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
        pattern: '^84\\d{3}$'
      },
      placeholder: '84101'
    },
    {
      id: 'unitNumber',
      label: 'Unit Number (Optional)',
      type: 'text',
      group: 'property',
      placeholder: 'Apt 2B'
    },
    {
      id: 'tenantNames',
      label: 'Tenant Name(s)',
      type: 'text',
      group: 'parties',
      validation: { required: true },
      placeholder: 'John Doe, Jane Doe'
    },
    {
      id: 'landlordName',
      label: 'Landlord/Agent Name',
      type: 'text',
      group: 'parties',
      validation: { required: true },
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
      placeholder: 'landlord@example.com'
    },
    {
      id: 'leaseType',
      label: 'Lease Type',
      type: 'select',
      group: 'additional',
      options: [
        { value: 'month-to-month', label: 'Month-to-Month' },
        { value: 'week-to-week', label: 'Week-to-Week' }
      ],
      defaultValue: 'month-to-month',
      validation: { required: true }
    },
    {
      id: 'currentRent',
      label: 'Current Monthly Rent',
      type: 'currency',
      group: 'financial',
      validation: {
        required: true,
        min: 0.01
      },
      placeholder: '$1,200.00'
    },
    {
      id: 'newRent',
      label: 'New Monthly Rent',
      type: 'currency',
      group: 'financial',
      validation: {
        required: true,
        min: 0.01,
        custom: 'validateNewRentGreaterThanCurrent'
      },
      placeholder: '$1,350.00'
    },
    {
      id: 'increaseAmount',
      label: 'Increase Amount',
      type: 'calculated',
      group: 'financial',
      calculation: 'newRent - currentRent'
    },
    {
      id: 'increasePercentage',
      label: 'Increase Percentage',
      type: 'calculated',
      group: 'financial',
      calculation: '((newRent - currentRent) / currentRent) * 100'
    },
    {
      id: 'noticeDate',
      label: 'Notice Date',
      type: 'date',
      group: 'dates',
      defaultValue: 'today',
      validation: { required: true }
    },
    {
      id: 'effectiveDate',
      label: 'Effective Date',
      type: 'date',
      group: 'dates',
      validation: {
        required: true,
        custom: 'validateMinimumNoticePeriod'
      },
      helpText: 'Must be at least 15 days from notice date'
    },
    {
      id: 'daysNotice',
      label: 'Days Notice Given',
      type: 'calculated',
      group: 'dates',
      calculation: 'daysBetween(noticeDate, effectiveDate)'
    },
    {
      id: 'reasonForIncrease',
      label: 'Reason for Increase (Optional)',
      type: 'textarea',
      group: 'additional',
      validation: { maxLength: 500 },
      placeholder: 'Market rate adjustment...'
    },
    {
      id: 'paymentInstructions',
      label: 'Payment Instructions (Optional)',
      type: 'textarea',
      group: 'additional',
      validation: { maxLength: 300 },
      placeholder: 'Pay online at...'
    }
  ],
  
  metadata: {
    legalReferences: ['Utah Code §57-22-4', 'Utah Code §57-22-5'],
    category: 'lease-management',
    tags: ['rent-increase', 'notice', 'utah', 'lease']
  }
};
