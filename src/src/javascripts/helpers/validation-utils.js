class ValidationUtils {
  constructor() {
    this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // this.invoiceIdRegex = /^#?\d{6,}$/;
  }

  /**
   * Validates invoice form data
   * @param {Object} formData - The form data to validate
   * @returns {Object} Object containing validation result and any error messages
   */
  validateInvoiceForm(formData) {
    const errors = {};

    // Validate Invoice ID
    // if (!formData.id) {
    //   errors.id = 'Invoice ID is required';
    // } else if (!this.invoiceIdRegex.test(formData.id)) {
    //   errors.id = 'Invoice ID must have at least 6-digit number with optional # prefix';
    // }

    // Validate Name
    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.length > 50) {
      errors.name = 'Name must not exceed 50 characters';
    }

    // Validate Email
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!this.emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate Date
    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        errors.date = 'Invoice date cannot be in the future';
      }
    }

    // Validate Address
    if (!formData.address) {
      errors.address = 'Address is required';
    } else if (formData.address.length < 5) {
      errors.address = 'Address must be at least 5 characters long';
    } else if (formData.address.length > 200) {
      errors.address = 'Address must not exceed 200 characters';
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
      errors.name = 'Product name is required';
    } else if (product.name.length < 2) {
      errors.name = 'Product name must be at least 2 characters long';
    } else if (product.name.length > 50) {
      errors.name = 'Product name must not exceed 50 characters';
    }

    // Validate Rate
    if (!product.rate && product.rate !== 0) {
      errors.rate = 'Rate is required';
    } else if (isNaN(product.rate)) {
      errors.rate = 'Rate must be a number';
    } else if (product.rate < 0) {
      errors.rate = 'Rate cannot be negative';
    }

    // Validate Quantity
    if (!product.quantity && product.quantity !== 0) {
      errors.quantity = 'Quantity is required';
    } else if (!Number.isInteger(product.quantity)) {
      errors.quantity = 'Quantity must be a whole number';
    } else if (product.quantity < 1) {
      errors.quantity = 'Quantity must be at least 1';
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
        errors: { general: 'Invalid product data format' },
      };
    }

    if (products.length === 0) {
      return {
        isValid: false,
        errors: { general: 'At least one product is required' },
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

    return messages;
  }
}

export default ValidationUtils;
