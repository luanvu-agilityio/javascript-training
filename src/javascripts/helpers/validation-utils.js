import { VALIDATION_CRITERIA, EMAIL_REGEX } from '../constants/validation-messages.js';
class ValidationUtils {
  constructor() {
    this.emailRegex = EMAIL_REGEX;
  }

  /**
   * Validates invoice form data
   * @param {Object} formData - The form data to validate
   * @returns {Object} Object containing validation result and any error messages
   */
  validateInvoiceForm(formData) {
    const errors = {};

    // Validate Name
    if (!formData.name) {
      errors.name = VALIDATION_CRITERIA.name.required;
    } else if (formData.name.length < 2) {
      errors.name = VALIDATION_CRITERIA.name.minLength;
    } else if (formData.name.length > 50) {
      errors.name = VALIDATION_CRITERIA.name.maxLength;
    }

    // Validate Email
    if (!formData.email) {
      errors.email = VALIDATION_CRITERIA.email.required;
    } else if (!this.emailRegex.test(formData.email)) {
      errors.email = VALIDATION_CRITERIA.email.invalid;
    }

    // Validate Date
    if (!formData.date) {
      errors.date = VALIDATION_CRITERIA.date.required;
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        errors.date = VALIDATION_CRITERIA.date.future;
      }
    }

    // Validate Address
    if (!formData.address) {
      errors.address = VALIDATION_CRITERIA.address.required;
    } else if (formData.address.length < 5) {
      errors.address = VALIDATION_CRITERIA.address.minLength;
    } else if (formData.address.length > 200) {
      errors.address = VALIDATION_CRITERIA.address.maxLength;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validates a single product entry
   * @param {Object} product - The product data to validate
   * @returns {Object} Object containing validation result and any error messages
   */
  validateProduct(product) {
    const errors = {};

    // Validate Product Name
    if (!product.name) {
      errors.name = VALIDATION_CRITERIA.product.name.required;
    } else if (product.name.length < 2) {
      errors.name = VALIDATION_CRITERIA.product.name.minLength;
    } else if (product.name.length > 50) {
      errors.name = VALIDATION_CRITERIA.product.name.maxLength;
    }

    // Validate Rate
    if (!product.rate && product.rate !== 0) {
      errors.rate = VALIDATION_CRITERIA.product.rate.required;
    } else if (isNaN(product.rate)) {
      errors.rate = VALIDATION_CRITERIA.product.rate.invalid;
    } else if (product.rate < 0) {
      errors.rate = VALIDATION_CRITERIA.product.rate.negative;
    }

    // Validate Quantity
    if (!product.quantity && product.quantity !== 0) {
      errors.quantity = VALIDATION_CRITERIA.product.quantity.required;
    } else if (!Number.isInteger(product.quantity)) {
      errors.quantity = VALIDATION_CRITERIA.product.quantity.integer;
    } else if (product.quantity < 1) {
      errors.quantity = VALIDATION_CRITERIA.product.quantity.minimum;
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validates an array of products
   * @param {Array} products - Array of product data to validate
   * @returns {Object} Object containing validation result and any error messages
   */
  validateProducts(products) {
    if (!Array.isArray(products)) {
      return {
        isValid: false,
        errors: { general: VALIDATION_CRITERIA.product.general.invalidFormat },
      };
    }

    if (products.length === 0) {
      return {
        isValid: false,
        errors: { general: VALIDATION_CRITERIA.product.general.required },
      };
    }

    const errors = {};
    products.forEach((product, index) => {
      const validation = this.validateProduct(product);
      if (!validation.isValid) {
        errors[`product-${index + 1}`] = validation.errors;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validates the complete invoice data including form and products
   * @param {Object} invoiceData - Complete invoice data including form data and products
   * @returns {Object} Object containing validation result and any error messages
   */
  validateCompleteInvoice(invoiceData) {
    const formValidation = this.validateInvoiceForm(invoiceData);
    const productsValidation = this.validateProducts(invoiceData.products);

    const isValid = formValidation.isValid && productsValidation.isValid;
    const errors = {
      form: formValidation.errors,
      products: productsValidation.errors,
    };

    return {
      isValid,
      errors:
        Object.keys(errors.form).length === 0 && Object.keys(errors.products).length === 0
          ? {}
          : errors,
    };
  }

  /**
   * Formats validation errors into user-friendly messages
   * @param {Object} errors - The errors object from validation
   * @returns {string[]} Array of formatted error messages
   */
  formatValidationErrors(errors) {
    const messages = [];

    // Handle form errors
    if (errors.form) {
      Object.entries(errors.form).forEach(([field, message]) => {
        messages.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`);
      });
    }

    // Handle product errors
    if (errors.products) {
      if (errors.products.general) {
        messages.push(errors.products.general);
      } else {
        Object.entries(errors.products).forEach(([productKey, productErrors]) => {
          Object.entries(productErrors).forEach(([field, message]) => {
            messages.push(`${productKey} - ${field}: ${message}`);
          });
        });
      }
    }

    return messages.join('\n').replace(/\n/g, '<br>');
  }
}

export default ValidationUtils;
