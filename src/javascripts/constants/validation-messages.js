export const VALIDATION_CRITERIA = {
  name: {
    required: 'Name is required',
    minLength: 'Name must be at least 2 characters long',
    maxLength: 'Name must not exceed 50 characters',
  },
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
  },
  date: {
    required: 'Date is required',
    future: 'Invoice date cannot be in the future',
  },
  address: {
    required: 'Address is required',
    minLength: 'Address must be at least 5 characters long',
    maxLength: 'Address must not exceed 200 characters',
  },
  product: {
    name: {
      required: 'Product name is required',
      minLength: 'Product name must be at least 2 characters long',
      maxLength: 'Product name must not exceed 50 characters',
    },
    rate: {
      required: 'Rate is required',
      invalid: 'Rate must be a number',
      negative: 'Rate cannot be negative',
    },
    quantity: {
      required: 'Quantity is required',
      integer: 'Quantity must be a whole number',
      minimum: 'Quantity must be at least 1',
    },
    general: {
      invalidFormat: 'Invalid product data format',
      required: 'At least one product is required',
    },
  },
};

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
