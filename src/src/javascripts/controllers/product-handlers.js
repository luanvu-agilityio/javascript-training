import Templates from '../templates/templates.js';

/**
 * Sets up event listeners for product list actions.
 * @param {Function} onAmountsUpdate - Callback function to handle updates to amounts.
 */
export function setupProductListHandlers(onAmountsUpdate) {
  setupAddProductButtons();
  setupProductTableListeners(onAmountsUpdate);
}

/**
 * Sets up event listeners for the add product buttons.
 */
export function setupAddProductButtons() {
  const addProductBtns = document.querySelectorAll('.product-list__action-button--button-add');
  addProductBtns.forEach((btn) => {
    // Remove old event listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    // Add new event listener
    newBtn.addEventListener('click', () => {
      const activeForm = newBtn.closest('.form--create, .form--edit');
      if (activeForm) {
        const tbody = activeForm.querySelector('.product-list__table tbody');
        addProductRow(tbody);
      }
    });
  });
}

/**
 * Adds a new product row to the product table.
 * @param {HTMLElement} tbody - The tbody element of the product table.
 */
export function addProductRow(tbody) {
  tbody.insertAdjacentHTML('beforeend', Templates.addProductRowTemplate);
}

/**
 * Sets up event listeners for the product table.
 * @param {Function} onAmountsUpdate - Callback function to handle updates to amounts.
 */
export function setupProductTableListeners(onAmountsUpdate) {
  const forms = document.querySelectorAll('.form--create, .form--edit');
  forms.forEach((form) => {
    const tbody = form.querySelector('.product-list__table tbody');
    if (tbody) {
      // Remove old event listeners by cloning and replacing the tbody
      const newTbody = tbody.cloneNode(false);
      tbody.parentNode.replaceChild(newTbody, tbody);

      // Set up new event listeners
      setupTableBodyListeners(newTbody, onAmountsUpdate);
    }
  });
}

/**
 * Sets up event listeners for the delete buttons in the product table.
 * @param {HTMLElement} tbody - The tbody element of the product table.
 * @param {Function} onAmountsUpdate - Callback function to handle updates to amounts.
 */
function setupTableBodyListeners(tbody, onAmountsUpdate) {
  // Sets up event listeners for the delete buttons in the product table.
  tbody.addEventListener('click', (e) => {
    const deleteButton = e.target.closest('.product-list__action-button--button-delete');
    if (deleteButton) {
      const row = deleteButton.closest('tr');
      if (row) {
        row.remove();
        updateAmounts(tbody, onAmountsUpdate);
      }
    }
  });
  // Sets up event listeners for input changes in the product table.
  tbody.addEventListener('input', (e) => {
    if (e.target.matches('.product-input, .rate-input, .qty-input')) {
      updateAmounts(tbody, onAmountsUpdate);
    }
  });
}

/**
 * Updates the amounts in the product table.
 * @param {HTMLElement} tbody - The tbody element of the product table.
 * @param {Function} onAmountsUpdate - Callback function to handle updates to amounts.
 */
export function updateAmounts(tbody, onAmountsUpdate, discountPercentage = 5) {
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  let subtotal = 0;

  rows.forEach((row) => {
    const rate = parseFloat(row.querySelector('.rate-input')?.value) || 0;
    const qty = parseInt(row.querySelector('.qty-input')?.value) || 0;
    const amount = rate * qty;
    subtotal += amount;

    const amountCell = row.querySelector('td:nth-child(4)');
    if (amountCell) {
      amountCell.textContent = `$${amount.toFixed(2)}`;
    }
  });

  const discountAmount = (subtotal * discountPercentage) / 100;
  const total = subtotal - discountAmount;

  updatePreviewTotals(subtotal, discountAmount, total);
  onAmountsUpdate?.();
}

/**
 * Updates the preview totals in the invoice summary.
 * @param {number} subtotal - The subtotal amount.
 * @param {number} discountAmount - The discount amount.
 * @param {number} total - The total amount after discount.
 */
function updatePreviewTotals(subtotal, discountAmount, total) {
  const previewSection = document.querySelector('.preview-summary');
  if (previewSection) {
    const values = previewSection.querySelectorAll('.preview-summary__value');
    if (values[0]) values[0].textContent = `$${subtotal.toFixed(2)}`;
    if (values[1]) values[1].textContent = `$${discountAmount.toFixed(2)}`;
    if (values[2]) values[2].textContent = `$${total.toFixed(2)}`;
  }
}

/**
 * Collects product data from the product table.
 * @returns {Array<Object>} An array of product objects.
 */
export function collectProductData() {
  const activeForm = document.querySelector('.form--create:not(.hidden), .form--edit:not(.hidden)');
  if (!activeForm) return [];

  const tbody = activeForm.querySelector('.product-list__table tbody');
  if (!tbody) return [];

  const products = [];
  const rows = tbody.querySelectorAll('tr');

  rows.forEach((row) => {
    const name = row.querySelector('.product-input')?.value?.trim() || '';
    const rate = parseFloat(row.querySelector('.rate-input')?.value) || 0;
    const quantity = parseInt(row.querySelector('.qty-input')?.value) || 0;

    if (name || rate || quantity) {
      products.push({
        name,
        rate,
        quantity,
        amount: rate * quantity,
      });
    }
  });

  return products;
}

/**
 * sets product data in product table
 * @param {Array[Object]} products - Array of product object
 * @param {HTMLElement} tbody - the body of product table
 */
export function setProductData(products, tbody) {
  if (!tbody || !Array.isArray(products)) return;

  // Clear existing rows first
  tbody.innerHTML = '';

  // Add new rows
  products.forEach((product) => {
    const row = Templates.addProductPriceCalculation(product);
    tbody.insertAdjacentHTML('beforeend', row);
  });

  setupProductTableListeners(() => {
    updateAmounts(tbody);
  });
}
