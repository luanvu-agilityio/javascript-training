import NotificationUtils from '../helpers/notification-utils.js';
import ValidationUtils from '../helpers/validation-utils.js';
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

  const statusSelect = document.querySelector('.form--create #status');
  if (statusSelect) {
    statusSelect.value = 'Pending';
    const event = new Event('change', { bubble: true });
    statusSelect.dispatchEvent(event);
  }
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
  const inputs = document.querySelectorAll('.form__group-input:not(#status');
  inputs.forEach((input) => input.value === '');
  const statusSelect = document.querySelector('.form-create #status');
  if (statusSelect) {
    statusSelect.value = 'Pending';
  }

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

  // Get all form inputs
  const inputs = {
    id: activeForm.querySelector('.form__group-input, input[name="invoice-id"]'),
    name: activeForm.querySelector('input[placeholder="Alison G."]'),
    email: activeForm.querySelector('input[type="email"]'),
    date: activeForm.querySelector('input[type="date"]'),
    address: activeForm.querySelector('input[placeholder="Street"]'),
    status: activeForm.querySelector('#status'),
  };

  //Validate all required input
  if (!inputs.name || !inputs.email || !inputs.date || !inputs.address || !inputs.status) {
    new NotificationUtils().alert('Form is missing required fields', { type: 'error' });
    return null;
  }

  const idValue = isEditForm
    ? inputs.id?.value
    : inputs.id?.value || inputs.id?.placeholder || generateInvoiceId();

  return {
    id: idValue,
    name: inputs.name.value.trim(),
    email: inputs.email.value.trim(),
    date: inputs.date.value,
    address: inputs.address.value.trim(),
    status: inputs.status.value,
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
  const validator = new ValidationUtils();
  const validation = validator.validateInvoiceForm(data);

  if (!validation.isValid) {
    const errorMessages = Object.values(validation.errors).join('\n');
    new NotificationUtils().alert(errorMessages, { type: 'warning' });
    return false;
  }
  return true;
}
