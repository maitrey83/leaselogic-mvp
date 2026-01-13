// Form validation utilities
export const validateForm = (formData) => {
  const errors = {};

  // Property Address validation
  if (!formData.street.trim()) errors.street = 'Street address is required';
  if (!formData.city.trim()) errors.city = 'City is required';
  if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';
  if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
    errors.zipCode = 'Invalid ZIP code format';
  }

  // Tenant/Landlord validation
  if (!formData.tenantNames.trim()) errors.tenantNames = 'Tenant name(s) required';
  if (!formData.landlordName.trim()) errors.landlordName = 'Landlord name is required';
  if (!formData.landlordPhone.trim()) errors.landlordPhone = 'Landlord phone is required';
  if (!formData.landlordEmail.trim()) errors.landlordEmail = 'Landlord email is required';
  
  // Email validation
  if (formData.landlordEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.landlordEmail)) {
    errors.landlordEmail = 'Invalid email format';
  }

  // Phone validation
  if (formData.landlordPhone && !/^[\d\s\-\(\)\.+]+$/.test(formData.landlordPhone)) {
    errors.landlordPhone = 'Invalid phone format';
  }

  // Financial validation
  if (!formData.pastDueAmount) errors.pastDueAmount = 'Past-due amount is required';
  if (formData.pastDueAmount && (isNaN(formData.pastDueAmount) || parseFloat(formData.pastDueAmount) <= 0)) {
    errors.pastDueAmount = 'Amount must be greater than $0';
  }
  if (!formData.originalDueDate) errors.originalDueDate = 'Original due date is required';
  if (!formData.noticeDate) errors.noticeDate = 'Notice date is required';

  return errors;
};

// Currency formatting - only format on blur, not during typing
export const formatCurrency = (amount) => {
  if (!amount) return '';
  // Remove any non-digit characters except decimal point
  const cleaned = amount.toString().replace(/[^\d.]/g, '');
  return cleaned;
};

// Phone formatting
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};
