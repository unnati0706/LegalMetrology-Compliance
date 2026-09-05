export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const ValidationSchemaRegistry = {
  // PCR 2011 Rule 6(1)(e): MRP validation
  validateMrp(value: string): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: false, error: 'Maximum Retail Price (MRP) declaration is required under Rule 6(1)(e).' };
    }
    const clean = value.replace(/[₹\s,]/g, '');
    const num = parseFloat(clean);
    if (isNaN(num) || num <= 0) {
      return { isValid: false, error: 'MRP must be a positive statutory currency amount.' };
    }
    return { isValid: true };
  },

  // PCR 2011 Rule 6(1)(b): Net Quantity validation
  validateNetQuantity(value: string): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: false, error: 'Net quantity declaration is mandatory under Rule 6(1)(b).' };
    }
    const standardUnitRegex = /^(\d+(\.\d+)?)\s*(g|kg|ml|l|m|cm|mm|n|units|pieces|number|count)$/i;
    if (!standardUnitRegex.test(value.trim())) {
      return { isValid: false, error: 'Net quantity must specify valid SI metric symbol (g, kg, ml, l, m, N) per Second Schedule.' };
    }
    return { isValid: true };
  },

  // PCR 2011 Rule 6(1)(a): Manufacturer name and address
  validateManufacturerAddress(value: string): ValidationResult {
    if (!value || value.trim().length < 10) {
      return { isValid: false, error: 'Complete name and statutory registered address of manufacturer/packer is mandatory.' };
    }
    return { isValid: true };
  },

  // PCR 2011 Rule 6(1)(g): Consumer Care contact
  validateConsumerCare(value: string): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: false, error: 'Consumer care contact person, phone/toll-free or email is required under Rule 6(1)(g).' };
    }
    return { isValid: true };
  },

  // PCR 2011 Rule 6(1)(e) Second Proviso: Unit Sale Price
  validateUnitSalePrice(value: string): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: false, error: 'Unit Sale Price (USP) declaration is mandatory for packages > 100g/ml.' };
    }
    const uspRegex = /^(₹|Rs\.?)\s*\d+(\.\d+)?\s*\/\s*(g|kg|ml|l|m|piece|unit)$/i;
    if (!uspRegex.test(value.trim())) {
      return { isValid: false, error: 'USP must be formatted as ₹X.XX / unit (e.g. ₹0.28 / g).' };
    }
    return { isValid: true };
  },

  // Generic non-empty text validation
  validateRequired(value: string, fieldName: string): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: false, error: `${fieldName} is a mandatory declaration.` };
    }
    return { isValid: true };
  }
};
