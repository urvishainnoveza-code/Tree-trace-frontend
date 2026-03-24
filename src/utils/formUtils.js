/**
 * Validates form fields based on provided rules
 * @param {object} values - key-value pairs of field values
 * @param {object} rules - key-value pairs of rules for each field
 * @returns {object} errors - key-value pairs of error messages
 */
export const validateForm = (values, rules) => {
  const errors = {};

  for (const field in rules) {
    const rule = rules[field];
    const value = values[field];

    // Required - safely handle null/undefined and various types
    if (rule.required) {
      if (value === null || value === undefined) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1')} is required`;
        continue;
      }

      if (typeof value === 'string' && value.trim() === '') {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1')} is required`;
        continue;
      }

      if (Array.isArray(value) && value.length === 0) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1')} is required`;
        continue;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        if (Object.keys(value).length === 0) {
          errors[field] = `${field.replace(/([A-Z])/g, ' $1')} is required`;
          continue;
        }
      }
    }

    // Email format
    if (rule.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field] = 'Invalid email format';
        continue;
      }
    }

    // Mobile number format - Updated to handle international format with country code
    if (rule.mobile && value) {
      // For react-phone-input-2, value will be in format like "919876543210"
      // Remove any non-digit characters and check if it's valid
      const cleanedValue = value.replace(/\D/g, '');
      
      // Check for Indian mobile numbers (with or without country code)
      const indianMobileRegex = /^(91)?[6-9]\d{9}$/;
      // Check for general international format (with country code)
      const internationalMobileRegex = /^\d{10,15}$/;
      
      if (!indianMobileRegex.test(cleanedValue) && !internationalMobileRegex.test(cleanedValue)) {
        errors[field] = 'Please enter a valid mobile number';
        continue;
      }
    }

    // Minimum length
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${field.replace(/([A-Z])/g, ' $1')} must be at least ${rule.minLength} characters`;
      continue;
    }
       if (rule.uppercase && value) {
      const uppercaseRegex = /^[A-Z0-9]+$/;
      if (!uppercaseRegex.test(value)) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1')} must be uppercase and alphanumeric`;
        continue;
      }
    }
  }
  return errors;
};
