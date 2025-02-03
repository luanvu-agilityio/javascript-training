import { v4 as uuidv4 } from 'https://unpkg.com/uuid@9.0.1/dist/esm-browser/index.js';
// Create a utility function to generate invoice IDs
const generateInvoiceId = () => {
  const now = new Date();
  const timestamp = now.getTime();
  const uniqueId = uuidv4().split('-')[0];

  return `INV-${timestamp}-${uniqueId}`;
};

// Function to update placeholder with new ID
const updateInvoiceIdPlaceholder = () => {
  const idInput = document.querySelector('.form--create input[data-auto-id="true"]');
  if (idInput) {
    idInput.placeholder = generateInvoiceId();
  }
};

const generateProductId = () => {
  // Generate a random string of 8 characters
  const timestamp = Date.now();
  const uniqueId = uuidv4().split('-')[0];
  return `PRD-${timestamp}-${uniqueId}`;
};

export { generateInvoiceId, updateInvoiceIdPlaceholder, generateProductId };
