// Create a utility function to generate invoice IDs
const generateInvoiceId = () => {
  // Get current date components
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');

  // Generate a random 4-digit number
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  // Combine components: INV-YY-MM-XXXX
  return parseInt(`${year}${month}${randomNum}`, 10);
};

// Function to update placeholder with new ID
const updateInvoiceIdPlaceholder = () => {
  const idInput = document.querySelector('.form--create input[data-auto-id="true"]');
  if (idInput) {
    idInput.placeholder = generateInvoiceId().toString();
  }
};

export { generateInvoiceId, updateInvoiceIdPlaceholder };
