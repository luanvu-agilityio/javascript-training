import NotificationUtils from '../helpers/notification-utils.js';
import ValidationUtils from '../helpers/validation-utils.js';
import { generateInvoiceId } from '../helpers/invoice-id-utils.js';
import UserErrorMessage from '../helpers/user-error-message.js';
import Templates from '../templates/templates.js';
import avatarImages from '../helpers/avatar-image.js';
/**
 * Setup event listener for any form related actions
 * @param {Function} onDiscountChange - callback function to handle discount input changes
 */
const userErrorMessage = new UserErrorMessage();
export function setupFormEventListeners(onDiscountChange) {
  try {
    setupFormCloseButton();
    setupCreateFormButton();
    setupDiscountInputHandler(onDiscountChange);
    setupAvatarSelection();
    setupPhoneCountryCode();
  } catch (error) {
    userErrorMessage.handleError(error, {
      context: 'FormHandlers',
      operation: 'setup',
    });
  }
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
  const activeForm = document.querySelector('.form--create:not(.hidden), .form--edit:not(.hidden)');
  if (activeForm) {
    resetAvatarState(activeForm);
    originalAvatarState = null;
  }
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
  inputs.forEach((input) => (input.value = ''));
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
  try {
    const activeForm =
      document.querySelector('.form--create:not(.hidden)') ||
      document.querySelector('.form--edit:not(.hidden)');

    if (!activeForm) return null;
    const isEditForm = activeForm.classList.contains('form--edit');

    // Get all form inputs

    const inputs = {
      id: activeForm.querySelector(
        '.form__group-input[name="invoice-id"], input[name="invoice-id"]',
      ),
      name: activeForm.querySelector('input[placeholder="Alison G."]'),
      email: activeForm.querySelector('input[type="email"]'),
      phoneNum: activeForm.querySelector('input[type="tel"]'),
      date: activeForm.querySelector('input[type="date"]'),
      address: activeForm.querySelector('input[placeholder="Street"]'),
      status: activeForm.querySelector('#status'),
      avatar: activeForm.querySelector('.selected-avatar'),
    };

    //Validate all required input
    const requiredInputs = ['name', 'email', 'date', 'address', 'status', 'phoneNum'];
    const missingInputs = requiredInputs.filter((key) => !inputs[key]);

    if (missingInputs.length > 0) {
      const notification = new NotificationUtils();
      notification.alert(`Form is missing required fields: ${missingInputs.join(', ')}`, {
        type: 'error',
      });
      return null;
    }

    const idValue = isEditForm
      ? inputs.id?.value
      : inputs.id?.value || inputs.id?.placeholder || generateInvoiceId();

    const formData = {
      id: idValue,
      name: inputs.name.value.trim(),
      email: inputs.email.value.trim(),
      phoneNum: inputs.phoneNum.value.trim(),
      date: inputs.date.value,
      address: inputs.address.value.trim(),
      status: inputs.status.value,
      avatarSrc: inputs.avatar?.value || './assets/images/recipient-image.png',
    };

    const phoneInput = activeForm.querySelector('.phone-input');
    const countryCode = activeForm.querySelector('.country-code').textContent;
    formData.phoneNum = countryCode + ' ' + phoneInput.value.trim();
    return formData;
  } catch {
    userErrorMessage.handleError(error, {
      context: 'FormHandlers',
      operation: 'data-collection',
    });
    return null;
  }
}

/**
 * Sets form data for the edit form based on the provided invoice and discount percentage.
 * @param {Object} invoice - The invoice data to populate the form.
 * @param {number} discountPercentage - The discount percentage to set in the form.
 */
export function setFormData(invoice, discountPercentage) {
  try {
    const editForm = document.querySelector('.form--edit');
    storeOriginalAvatarState(editForm);
    const fields = {
      'input[placeholder="#876370"]': invoice.id,
      'input[placeholder="Alison G."]': invoice.name,
      'input[type="email"]': invoice.email,
      'input[type="tel"]': invoice.phoneNum,
      'input[type="date"]': invoice.date,
      'input[placeholder="Street"]': invoice.address,
      '#status': invoice.status,
    };

    Object.entries(fields).forEach(([selector, value]) => {
      const element = editForm.querySelector(selector);
      if (element) element.value = value;
    });

    // Handle avatar
    if (invoice.avatarSrc) {
      const camera = editForm.querySelector('.form__camera');
      const cameraIcon = camera.querySelector('.form__camera-icon, img');
      const hiddenAvatarInput = editForm.querySelector('.selected-avatar');

      if (cameraIcon) {
        if (cameraIcon.src !== invoice.avatarSrc) {
          cameraIcon.src = invoice.avatarSrc;
          cameraIcon.classList.remove('form__camera-icon');
          cameraIcon.classList.add('form__avatar-preview');
          camera.classList.add('has-avatar');
        }
      }

      if (hiddenAvatarInput) {
        hiddenAvatarInput.value = invoice.avatarSrc;
      }
    }

    const discountInput = editForm.querySelector('.discount-input');
    if (discountInput) {
      discountInput.value = discountPercentage;
    }
  } catch (error) {
    userErrorMessage.handleError(error, {
      context: 'FormHandlers',
      operation: 'form-data-setting',
    });
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
    const errorMessages = validator.formatValidationErrors({ form: validation.errors });
    new NotificationUtils().alert(errorMessages, { type: 'warning' });
    return false;
  }
  return true;
}

export function setupAvatarSelection() {
  const cameraTriggers = document.querySelectorAll('.form__camera');

  cameraTriggers.forEach((camera) => {
    let currentAvatarSrc = null; // Track current avatar

    camera.addEventListener('click', () => {
      // Remove any existing popups first
      const existingPopup = document.querySelector('.avatar-popup');
      if (existingPopup) {
        existingPopup.remove();
      }

      // Create and append avatar popup
      const popupContainer = document.createElement('div');
      popupContainer.innerHTML = Templates.avatarPopupTemplate;
      const avatarPopup = popupContainer.firstElementChild;
      document.body.appendChild(avatarPopup);

      const closeButton = avatarPopup.querySelector('.avatar-popup__close');

      // Handler for avatar selection
      const handleAvatarSelection = (e) => {
        const avatarItem = e.target.closest('.avatar-popup__item');
        if (!avatarItem) return;

        const avatarImg = avatarItem.querySelector('img');
        if (!avatarImg) return;

        const selectedAvatarSrc = avatarImg.src;
        // currentAvatarSrc = selectedAvatarSrc;

        // Update form elements
        const form = camera.closest('.form--create, .form--edit');
        if (form) {
          // Update hidden input
          const hiddenInput = form.querySelector('.selected-avatar');
          if (hiddenInput) {
            hiddenInput.value = selectedAvatarSrc;
          }

          // Update camera icon
          // First, find existing icon or create new one
          let imageElement = camera.querySelector('img');
          if (!imageElement) {
            imageElement = document.createElement('img');
            camera.appendChild(imageElement);
          }

          // Update image properties
          imageElement.src = selectedAvatarSrc;
          imageElement.classList.remove('form__camera-icon');
          imageElement.classList.add('form__avatar-preview');
          camera.classList.add('has-avatar');

          // Store original camera icon source if not already stored
          if (!imageElement.dataset.originalSrc) {
            imageElement.dataset.originalSrc =
              './assets/images/icons/create-invoice-modal-icons/camera-icon.svg';
          }
          if (form.classList.contains('form--edit')) {
            const invoiceIdInput = form.querySelector('input[name="invoice-id"]');
            if (invoiceIdInput && window.invoiceView) {
              window.invoiceView.updateInvoiceAvatar(invoiceIdInput.value, selectedAvatarSrc);
            }
          }
        }

        removePopupAndListeners();
      };

      // Handler for clicking outside popup
      const handleClickOutside = (e) => {
        if (!avatarPopup.contains(e.target) && !camera.contains(e.target)) {
          removePopupAndListeners();
        }
      };

      // Handler for escape key
      const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
          removePopupAndListeners();
        }
      };

      // Clean up function to remove popup and all listeners
      const removePopupAndListeners = () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
        closeButton.removeEventListener('click', handleCloseClick);
        avatarPopup.removeEventListener('click', handleAvatarSelection);
        avatarPopup.remove();
      };

      // Handler for close button
      const handleCloseClick = (e) => {
        e.stopPropagation();
        removePopupAndListeners();
      };

      // Add all event listeners
      avatarPopup.addEventListener('click', handleAvatarSelection);
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      closeButton.addEventListener('click', handleCloseClick);
    });
  });
}

let originalAvatarState = null;

export function storeOriginalAvatarState(form) {
  const camera = form.querySelector('.form__camera');
  const cameraIcon = camera?.querySelector('img');
  if (cameraIcon) {
    originalAvatarState = {
      src: cameraIcon.src,
      isAvatar: cameraIcon.classList.contains('form__avatar-preview'),
      hasAvatar: camera.classList.contains('has-avatar'),
    };
  }
}

export function resetAvatarState(form) {
  if (!originalAvatarState) return;

  const camera = form.querySelector('.form__camera');
  const cameraIcon = camera?.querySelector('img');
  if (cameraIcon) {
    cameraIcon.src = originalAvatarState.src;
    cameraIcon.classList.toggle('form__avatar-preview', originalAvatarState.isAvatar);
    cameraIcon.classList.toggle('form__camera-icon', !originalAvatarState.isAvatar);
    camera.classList.toggle('has-avatar', originalAvatarState.hasAvatar);
  }
}

export function setupPhoneCountryCode() {
  document.querySelectorAll('.country-select').forEach((select) => {
    const selectedCountry = select.querySelector('.selected-country');
    const dropdown = select.querySelector('.country-dropdown');
    const options = select.querySelectorAll('.country-option');

    // Toggle dropdown
    selectedCountry.addEventListener('click', () => {
      dropdown.classList.remove('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!select.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // Handle option selection
    options.forEach((option) => {
      option.addEventListener('click', () => {
        const code = option.dataset.code;
        const flag = option.dataset.flag;

        // Update selected country display
        selectedCountry.querySelector('.country-flag').textContent = flag;
        selectedCountry.querySelector('.country-code').textContent = code;

        // Hide dropdown
        dropdown.classList.add('hidden');

        // Update phone input - look for closest form container instead of form element
        const formContainer = select.closest('.form--create, .form--edit');
        if (formContainer) {
          const phoneInput = formContainer.querySelector('.phone-input');
          if (phoneInput) {
            // Remove any existing country code from the phone number
            const phoneNumber = phoneInput.value.replace(/^\+?\d+\s*/, '');
            // Keep just the number portion
            phoneInput.value = phoneNumber;
          }
        }
      });
    });
  });
}
