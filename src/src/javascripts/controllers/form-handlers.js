import NotificationUtils from '../helpers/notification-utils.js';
import { generateInvoiceId } from '../helpers/invoice-id-utils.js';
/**
 * Setup event listener for any form related actions
 * @param {Function} onDiscountChange - callback function to handle discount input changes
 */
export function setupFormEventListeners(onDiscountChange) {
  setupFormCloseButton();
  setupCreateFormButton();
  setupDiscountInputHandler(onDiscountChange);
}

/**
 * Setup event listener for button to close forms
 */
export function setupFormCloseButton() {
  document.querySelectorAll('.form__header-close').forEach((btn) => {
    btn.addEventListener('click', () => closeForm());
  });
}

/**
 * setup event listener for the create form button
 */
export function setupCreateFormButton() {
  document.querySelector('.btn--primary').addEventListener('click', () => showCreateForm());
}

/**
 * setup event listener for discount input field
 * @param {Function} onDiscountChange - callback function to handle input discount changes
 */
export function setupDiscountInputHandler(onDiscountChange) {
  const discountInput = document.querySelectorAll('.discount-input');
  discountInput.forEach((input) => {
    input.addEventListener('input', (e) => {
      const discountPercentage = parseFloat(e.target.value) || 0;
      onDiscountChange?.(discountPercentage);
    });
  });
}

/**
 * Helper methods to show/hide forms
 *
 * @param {Object} options - to control which form to show/hide
 * @param {boolean} options.showCreate - to show create form
 * @param {boolean} options.showEdit - to show edit form
 */
export function toggleForm({ showCreate = false, showEdit = false }) {
  document.querySelector('.main').classList.toggle('hidden', showCreate || showEdit);
  document.querySelector('.content').style.display = showCreate || showEdit ? 'grid' : 'none';
  document.querySelector('.form--create').classList.toggle('hidden', !showCreate);
  document.querySelector('.form--edit').classList.toggle('hidden', !showEdit);
}

/**
 * Closes the currently open form and resets it.
 */
export function closeForm() {
  toggleForm({});
  resetForm();
}

/**
 * Shows the create form and resets it.
 */
export function showCreateForm() {
  toggleForm({ showCreate: true });
  resetForm();
}

/**
 * Shows the edit form and resets it
 */
export function showEditForm() {
  toggleForm({ showEdit: true });
}

/**
 * Resets the form states by hiding all forms.
 */
export function resetFormStates() {
  toggleForm({});
}

/**
 * Resets the form fields to their default states and clears the product list.
 * @param {Function} onResetForm - Callback function to handle additional reset actions.
 */
export function resetForm(onResetForm) {
  const inputs = document.querySelectorAll('.form__group-input');
  inputs.forEach((input) => (input.value = ''));

  const activeForm = document.querySelector('.form--create:not(.hidden), .form--edit:not(.hidden)');
  if (activeForm) {
    const tbody = activeForm.querySelector('.product-list__table .product-list__table-body');
    tbody.innerHTML = '';
    onResetForm?.(tbody);
  }
}

/**
 * Collects form data from active form (create or edit)
 * @returns {Object} - the collected from data, null if no form is active
 */
export function collectFormData() {
  const activeForm =
    document.querySelector('.form--create:not(.hidden)') ||
    document.querySelector('.form--edit:not(.hidden)');

  if (!activeForm) return null;
  const isEditForm = activeForm.classList.contains('form--edit');

  const idInput = activeForm.querySelector('.form__group-input, input[name="invoice-id"]');
  const idValue = isEditForm
    ? idInput.value
    : idInput.value || idInput.placeholder || generateInvoiceId();

  return {
    id: idValue,
    name: activeForm.querySelector('input[placeholder="Alison G."]')?.value || '',
    email: activeForm.querySelector('input[type="email"]')?.value || '',
    date: activeForm.querySelector('input[type="date"]')?.value || '',
    address: activeForm.querySelector('input[placeholder="Street"]')?.value || '',
    status: activeForm.querySelector('#status').value,
  };
}

/**
 * Sets form data for the edit form based on the provided invoice and discount percentage.
 * @param {Object} invoice - The invoice data to populate the form.
 * @param {number} discountPercentage - The discount percentage to set in the form.
 */
export function setFormData(invoice, discountPercentage) {
  const editForm = document.querySelector('.form--edit');
  const fields = {
    'input[placeholder="#876370"]': invoice.id,
    'input[placeholder="Alison G."]': invoice.name,
    'input[type="email"]': invoice.email,
    'input[type="date"]': invoice.date,
    'input[placeholder="Street"]': invoice.address,
    '#status': invoice.status,
  };

  Object.entries(fields).forEach(([selector, value]) => {
    const element = editForm.querySelector(selector);
    if (element) element.value = value;
  });

  const discountInput = editForm.querySelector('.discount-input');
  if (discountInput) {
    discountInput.value = discountPercentage;
  }
}

/**
 * validates the collected form data
 * @param {Object} - form data to validate
 * @returns {boolean} - true of form data is valid
 */
export function validateFormData(data) {
  if (!data.name || !data.email || !data.date) {
    new NotificationUtils().alert(
      'Please fill in all required fields and add at least one product',
      { type: 'warning' },
    );
    return false;
  }
  return true;
}
