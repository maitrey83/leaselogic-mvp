/**
 * Utah State Configuration
 */

export default {
  code: 'UT',
  name: 'Utah',
  active: true,
  
  legalRequirements: {
    eviction: {
      noticePeriod: 3,
      legalCode: 'Utah Code §78B-6-802',
      serviceMethod: [
        'Personal delivery',
        'Certified mail',
        'Posting on door (if tenant absent)'
      ],
      courtFilingRequired: true,
      restrictions: [
        'Notice must specify exact amount due',
        'Cannot include late fees unless specified in lease',
        'Must include unlawful detainer warning'
      ]
    },
    
    rentIncrease: {
      minimumNoticeDays: {
        monthToMonth: 15,
        weekToWeek: 5
      },
      legalCode: 'Utah Code §57-22-4, §57-22-5',
      caps: {
        hasStateCap: false,
        capPercentage: null,
        capPeriod: null
      },
      restrictions: [
        'Cannot increase during fixed-term lease unless lease allows',
        'Must provide notice before start of next rental period',
        'Increase cannot be retaliatory'
      ],
      retaliationProtection: true
    },
    
    leaseTermination: {
      noticePeriod: {
        monthToMonth: 15,
        weekToWeek: 5
      },
      legalCode: 'Utah Code §57-22-4',
      restrictions: [
        'Notice must be in writing',
        'Must specify termination date',
        'Termination date must be end of rental period'
      ]
    },
    
    rentControl: {
      statewide: false,
      localControl: false,
      exemptions: []
    }
  },
  
  validation: {
    zipCode: {
      pattern: '^84\\d{3}$',
      format: '84XXX',
      example: '84101',
      message: 'Utah zip codes start with 84'
    },
    
    phone: {
      pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$',
      format: '(XXX) XXX-XXXX',
      example: '(801) 555-1234',
      message: 'Phone must be in format (XXX) XXX-XXXX'
    },
    
    address: {
      requiresStreet: true,
      requiresCity: true,
      requiresZip: true,
      allowPOBox: false
    }
  },
  
  documents: {
    available: [
      'utah-3day-notice',
      'utah-rent-increase'
    ],
    pricing: []
  },
  
  disclaimers: {
    general: 'This service provides document templates for Utah landlord-tenant matters. Utah landlord-tenant law is governed by Utah Code Title 57, Chapter 22 (Utah Fit Premises Act) and Title 78B, Chapter 6 (Unlawful Detainer). These templates do not constitute legal advice.',
    
    eviction: 'Utah eviction procedures are strictly regulated. Improper notice or procedure can result in case dismissal. The 3-day notice is only the first step - you must file an unlawful detainer action in court if the tenant does not comply. Consult an attorney before proceeding with eviction.',
    
    rentIncrease: 'Utah law requires 15 days written notice for month-to-month tenancies. Rent increases cannot be retaliatory under Utah Code §57-22-6. Fixed-term leases cannot have rent increased mid-term unless the lease explicitly allows it. Consult an attorney if you have questions about proper notice or retaliation.',
    
    attorneyConsultation: 'We strongly recommend consulting with a qualified Utah attorney before using any legal documents, especially for evictions or complex situations. The Utah State Bar offers a lawyer referral service at (801) 531-9077.'
  },
  
  resources: {
    stateLaws: [
      {
        title: 'Utah Fit Premises Act',
        code: 'Utah Code §57-22',
        url: 'https://le.utah.gov/xcode/Title57/Chapter22/'
      },
      {
        title: 'Unlawful Detainer',
        code: 'Utah Code §78B-6',
        url: 'https://le.utah.gov/xcode/Title78B/Chapter6/'
      }
    ],
    courts: 'https://www.utcourts.gov/howto/landlord/',
    legalAid: 'https://www.utahlegalservices.org/'
  }
};
