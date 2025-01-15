import Invoice from '../model/model.js';
import Templates from '../templates/templates.js';
import InvoiceView from '../views/view.js';
import ValidationUtils from '../helpers/validation-utils.js';
import NotificationUtils from '../helpers/notification-utils.js';
import DataHandler from '../data-handler.js';
import * as formHandlers from './form-handlers.js';
import * as productHandlers from './product-handlers.js';
import { sortHandlers } from './sort-handler.js';
import { generateInvoiceId, updateInvoiceIdPlaceholder } from '../helpers/invoice-id-utils.js';

/**
 * This class handles the main logic for managing invoices, including rendering forms,
 * setting up event listeners, and handling invoice actions such as adding and saving invoices.
 *
 * Dependencies:
 * - Invoice: The model representing an invoice.
 * - Templates: Contains HTML templates for rendering forms and invoice lists.
 * - InvoiceView: Handles the rendering of invoices in the view.
 * - formHandlers: Contains functions for handling form-related events.
 * - productHandlers: Contains functions for handling product list-related events.
 */
class InvoiceController {
  constructor() {
    this.initializeServices();
    this.initializeState();
    this.init();
  }

  initializeServices() {
    this.invoice = new Invoice();
    this.view = new InvoiceView();
    this.validator = new ValidationUtils();
    this.notification = new NotificationUtils();

    this.dataHandler = new DataHandler();
  }

  initializeState() {
    this.invoices = [];
    this.discountPercentage = 5;
  }

  init() {
    this.loadInvoices();
    this.setupSearchInvoice();
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for invoice actions, form events, and product list events.
   */
  setupEventListeners() {
    this.setupInvoiceListListeners();
    this.setupFormListeners();
    this.setupProductListeners();
    this.setupDeletionListeners();
  }

  setupInvoiceListListeners() {
    // Remove any existing listeners first
    const existingInvoiceList = this.view.invoiceList;
    const newInvoiceList = existingInvoiceList.cloneNode(true);
    existingInvoiceList.parentNode.replaceChild(newInvoiceList, existingInvoiceList);
    this.view.invoiceList = newInvoiceList;

    // Set up new listeners
    this.view.invoiceList.addEventListener('click', this.handleInvoiceActions.bind(this), {
      capture: true,
    });
  }

  setupFormListeners() {
    this.view.renderForms();
    //add listener for create form button to update id
    document.querySelector('.btn--primary').addEventListener('click', () => {
      formHandlers.showCreateForm();
      updateInvoiceIdPlaceholder();
    });

    // Sets up the event listener for the "Add Invoice" button.
    document
      .querySelector('.form__action-buttons--button-create')
      .addEventListener('click', () => this.addInvoice());

    // Sets up the event listener for the "Save Changes" button.
    document
      .querySelector('.form--edit .form__action-buttons--button-save')
      .addEventListener('click', () => this.saveChanges());

    formHandlers.setupFormEventListeners(this.handleDiscountUpdate.bind(this));
  }

  setupProductListeners() {
    productHandlers.setupProductListHandlers(() => this.updatePreview());
    formHandlers.setupFormEventListeners((newDiscount) => {
      this.discountPercentage = newDiscount;
      const tbody = this.getActiveFormTbody();
      if (tbody) {
        productHandlers.updateAmounts(tbody, () => this.updatePreview(), this.discountPercentage);
      }
    });
  }

  /**
   * Sets up event listeners for handling multiple invoice deletions.
   * This includes:
   * - Listening for changes to the header checkbox to select/deselect all invoices.
   * - Listening for clicks on the multiple deletion icon to delete selected invoices.
   * - Listening for individual delete button clicks using event delegation.
   */
  setupDeletionListeners() {
    this.tableBody = document.querySelector('.table__body');
    this.headerCheckbox = document.querySelector('.table__head .checkbox');
    this.deleteIcon = document.querySelector('.table__delete-icon');

    this.headerCheckbox?.addEventListener('change', this.handleHeaderCheckboxChange.bind(this));
    this.deleteIcon?.addEventListener('click', this.handleMultiDeletion.bind(this));
  }

  async loadInvoices() {
    try {
      this.invoices = await this.dataHandler.getInvoiceList();
      this.view.renderInvoiceList(this.invoices);
      sortHandlers(this.invoices, (sortedInvoices) => this.view.renderInvoiceList(sortedInvoices));
    } catch (error) {
      this.notification.show('Failed to load invoices', { type: 'error' });
    }
  }

  /**
   * Sets up the search functionality for invoices
   */
  setupSearchInvoice() {
    const searchInput = document.querySelector('.search__input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
  }

  /**
   * Handles the search functionality
   * @param {string} searchInput - the search term entered by user
   */
  handleSearch(searchInput) {
    if (!searchInput) {
      this.view.renderInvoiceList(this.invoices);
      return;
    }

    const formattedInput = searchInput.toLowerCase().trim();
    const filteredInvoices = this.filterInvoices(formattedInput);

    this.view.renderInvoiceList(filteredInvoices);
    this.view.updateHeaderCheckbox();
  }

  filterInvoices(searchTerm) {
    return this.invoices.filter((invoice) =>
      ['id', 'name', 'email', 'date', 'status'].some((field) =>
        invoice[field].toLowerCase().includes(searchTerm),
      ),
    );
  }

  /**
   * Handles actions (edit, delete) on invoices in the invoice list.
   *
   * @param {Event} e - The event object.
   */
  async handleInvoiceActions(e) {
    const row = e.target.closest('.table__row');
    if (!row) return;

    const idCell = row.querySelector('[data-label="Invoice Id"]');
    if (!idCell) return;

    const id = idCell.textContent;

    // Handle delete button click
    if (e.target.closest('.btn--delete')) {
      e.preventDefault();
      e.stopPropagation();

      const popupContent = e.target.closest('.popup-content');
      await this.handleInvoiceDeletion(e);
      if (popupContent) {
        popupContent.classList.remove('active');
      }
      return;
    }

    // Handle edit button click
    if (e.target.closest('.btn--edit')) {
      e.preventDefault();
      e.stopPropagation();
      this.editInvoice(id);
      const popupContent = e.target.closest('.popup-content');
      if (popupContent) {
        popupContent.classList.remove('active');
      }
      return;
    }
  }

  /**
   * Adds a new invoice based on the form data and product data.
   * Validates the form data and product data before creating the invoice.
   * Renders the updated invoice list and invoice preview.
   */
  async addInvoice() {
    const formData = this.collectAndValidateFormData();
    if (!formData) return;

    const products = this.collectAndValidateProducts();
    if (!products) return;

    if (!(await this.validateInvoiceId(formData.id))) return;

    try {
      await this.createInvoiceWithProducts(formData, products);
      this.handleSuccessfulCreation(formData);
    } catch (error) {
      this.notification.show('Failed to create invoice', { type: 'error' });
    }
  }

  /**
   * Edits an invoice by its ID
   * Show edit form and populate it with the invoice data
   * @param {string} id - the ID of the invoice to edit
   */
  async editInvoice(id) {
    try {
      const [invoice, products] = await Promise.all([
        this.dataHandler.getInvoiceById(id),
        this.dataHandler.getProductsByInvoiceId(id),
      ]);

      if (!invoice) {
        this.notification.show('Invoice not found', { type: 'error' });
        return;
      }

      // show edit form and populate data
      formHandlers.showEditForm();
      formHandlers.setFormData(invoice, this.discountPercentage);

      this.populateEditForm(invoice, products);
    } catch (error) {
      this.notification.show('Failed to load invoice data', { type: 'error' });
    }
  }

  populateEditForm(invoice, products) {
    // populate product data into tbody
    const tbody = document.querySelector(
      '.form--edit .product-list__table .product-list__table-body',
    );
    // clear any existing row
    if (tbody) {
      tbody.innerHTML = '';

      //add product row
      products.forEach((product) => {
        //retrieve product template
        const row = Templates.addProductPriceCalculation(product);
        tbody.insertAdjacentHTML('beforeend', row);
      });
      //update total
      productHandlers.updateAmounts(tbody, () => this.updatePreview(), this.discountPercentage);
    }
    //update preview with full invoice data + products
    const fullInvoice = {
      ...invoice,
      products: products,
    };
    this.view.renderInvoicePreview(fullInvoice);
  }

  /**
   * Saves changes to an existing invoice based on the form data and product data
   * Validates form and product data before updating the invoice
   * Render the updated invoice list and invoice preview
   */
  async saveChanges() {
    const formData = this.collectAndValidateFormData();
    if (!formData) return;

    const products = this.collectAndValidateProducts();
    if (!products) return;

    try {
      await this.updateInvoiceWithProducts(formData, products);
      this.handleSuccessfulUpdate(formData, products);
    } catch (error) {
      this.notification.show('Failed to update invoice', { type: 'error' });
    }
  }

  collectAndValidateFormData() {
    const formData = formHandlers.collectFormData();
    if (!formData.id) {
      formData.id = generateInvoiceId();
    }
    return formData && formHandlers.validateFormData(formData) ? formData : null;
  }

  collectAndValidateProducts() {
    const products = productHandlers.collectProductData();
    if (products.length === 0) {
      this.notification.show('Please add at least one product to the invoice', { type: 'warning' });
      return null;
    }
    return products;
  }

  async createInvoiceWithProducts(formData, products) {
    const invoice = await this.dataHandler.createInvoice({
      ...formData,
      favorite: false,
    });

    await Promise.all(
      products.map((product) =>
        this.dataHandler.addProduct({
          ...product,
          invoiceId: invoice.id,
        }),
      ),
    );

    return invoice;
  }

  async updateInvoiceWithProducts(formData, products) {
    const updatedInvoice = await this.dataHandler.updateInvoice(formData.id, {
      ...formData,
      favorite: this.invoices.find((inv) => inv.id === formData.id)?.favorite || false,
    });

    const existingProducts = await this.dataHandler.getProductsByInvoiceId(formData.id);
    await Promise.all(
      existingProducts.map((product) => this.dataHandler.deleteProduct(product.id)),
    );
    await Promise.all(
      products.map((product) =>
        this.dataHandler.addProduct({
          ...product,
          invoiceId: formData.id,
        }),
      ),
    );

    return updatedInvoice;
  }

  handleSuccessfulCreation(invoice) {
    this.invoices.push(invoice);
    this.view.renderInvoiceList(this.invoices);
    this.view.renderInvoicePreview(invoice);
    formHandlers.resetFormStates();
    this.notification.show('Invoice created successfully', { type: 'success' });
  }

  handleSuccessfulUpdate(formData, products) {
    const index = this.invoices.findIndex((inv) => inv.id === formData.id);
    if (index !== -1) {
      this.invoices[index] = { ...formData, products };
      this.view.renderInvoiceList(this.invoices);
      this.view.renderInvoicePreview(this.invoices[index]);
      this.notification.show('Invoice updated successfully', { type: 'success' });
      formHandlers.resetFormStates();
    }
  }

  // Helper Methods
  handleDiscountUpdate(newDiscount) {
    this.discountPercentage = newDiscount;
    const tbody = this.getActiveFormTbody();
    if (tbody) {
      productHandlers.updateAmounts(tbody, () => this.updatePreview(), this.discountPercentage);
    }
  }

  /**
   * Selects all checkbox invoice when users choose header checkbox
   */
  handleHeaderCheckboxChange(event) {
    const isChecked = event.target.checked;
    const rowCheckboxes = this.tableBody.querySelectorAll('.table__checkbox');

    rowCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  /**
   * Return the tbody element of the active form (create form or edit form)
   * @return {HTMLElement}The tbody element of the active form, or null if no form is active.
   */
  getActiveFormTbody() {
    const activeForm =
      document.querySelector('.form--create:not(.hidden)') ||
      document.querySelector('.form--edit:not(.hidden)');
    return activeForm?.querySelector('product-list__table tbody');
  }

  async handleMultiDeletion(e) {
    e.preventDefault();
    e.stopPropagation();
    const checkedRows = this.tableBody.querySelectorAll('.table__checkbox:checked');
    await this.handleInvoiceDeletion(Array.from(checkedRows));
  }

  /**
   * Handle deletion of invoices, for single or multiple invoice at same time
   * @param {Event,Array} identifier - event for single deletion or array of checkboxes for multiple deletion
   */
  async handleInvoiceDeletion(identifier) {
    try {
      // Handle both multiple deletion and single deletion cases
      if (Array.isArray(identifier)) {
        // Multiple deletion
        if (identifier.length === 0) {
          this.notification.show('Please select at least one invoice to delete', {
            type: 'warning',
          });
          return;
        }

        const confirmed = await this.confirmDeletion(identifier.length);
        if (confirmed) {
          // Get array of invoice IDs to delete
          const idsToDelete = identifier.map((checkbox) => {
            const row = checkbox.closest('.table__row');
            return row.querySelector('.btn--delete').dataset.id;
          });

          // Delete all products for these invoices first
          for (const invoiceId of idsToDelete) {
            const products = await this.dataHandler.getProductsByInvoiceId(invoiceId);
            await Promise.all(
              products.map((product) => this.dataHandler.deleteProduct(product.id)),
            );
          }

          // Delete all invoices
          await this.dataHandler.deleteMultipleInvoices(idsToDelete);

          // Update local state
          this.invoices = this.invoices.filter((invoice) => !idsToDelete.includes(invoice.id));
          this.headerCheckbox.checked = false;
          this.notification.show('Invoices deleted successfully', { type: 'success' });
        }
      } else {
        // Single deletion
        const deleteBtn = identifier.target.closest('.btn--delete');
        if (!deleteBtn) return;

        const invoiceId = deleteBtn.dataset.id;

        const confirmed = await this.confirmDeletion(1, invoiceId);
        if (confirmed) {
          // Delete all products for this invoice first
          const products = await this.dataHandler.getProductsByInvoiceId(invoiceId);
          await Promise.all(products.map((product) => this.dataHandler.deleteProduct(product.id)));

          // Delete the invoice
          await this.dataHandler.deleteInvoice(invoiceId);

          // Update local state
          this.invoices = this.invoices.filter((invoice) => invoice.id !== invoiceId);
          this.notification.show('Invoice deleted successfully', { type: 'success' });
        }
      }

      // Update view after any type of deletion
      this.view.renderInvoiceList(this.invoices);
      this.view.updateHeaderCheckbox();
    } catch (error) {
      console.error('Error deleting invoice(s):', error);
      this.notification.show('Failed to delete invoice(s)', { type: 'error' });
    }
  }

  /**
   *  Confirmation dialog for deleting invoices.
   * @param {number} count - The number of invoices to delete.
   * @param {string} [id = null] - The ID of the single invoice to delete (optional).
   * @returns {boolean} True if the user confirms the deletion, false otherwise.
   */
  async confirmDeletion(count, id = null) {
    const message =
      count > 1
        ? `Are you sure you want to delete ${count} selected invoice(s)?`
        : `Are you sure you want to delete invoice #${id}?`;

    return await this.notification.confirm(message, {
      type: 'warning',
      title: 'Delete Invoice',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  }

  /**
   * Updates the invoice preview based on the current form data and product data.
   *  Uses try/catch to log an error if the preview update fails.
   */
  updatePreview() {
    const formData = formHandlers.collectFormData();
    if (!formData) return;

    const products = productHandlers.collectProductData();

    try {
      if (products.length > 0 || document.querySelector('.form--edit:not(.hidden)')) {
        const tempInvoice = new Invoice(
          formData.id,
          formData.name,
          formData.email,
          formData.date,
          formData.address,
          formData.status,
          products,
        );
        this.view.renderInvoicePreview(tempInvoice);
      } else {
        this.view.clearInvoicePreview();
      }
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  }
}
export default InvoiceController;
