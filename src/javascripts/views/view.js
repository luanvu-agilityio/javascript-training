import Templates from '../templates/templates.js';
import { updateInvoiceIdPlaceholder } from '../helpers/invoice-id-utils.js';

/**
 * This class handles the rendering of invoices in the view, including the invoice list and invoice preview.
 */
class InvoiceView {
  constructor() {
    this.invoiceList = document.querySelector('.table__body');
    this.previewSection = document.querySelector('.preview');
    this.headerCheckbox = document.querySelector('.table__head .checkbox');
    this.tableBody = document.querySelector('.table__body');
    this.setupPopupMenu();
  }

  /**
   * Update the state of the header checkbox base on the individual checkboxes
   * If all checkboxes are checked, header checkbox will be checked and vice versa
   */
  updateHeaderCheckbox() {
    const totalRows = this.tableBody.querySelectorAll('.table__checkbox').length;
    const checkedRows = this.tableBody.querySelectorAll(`${'.table__checkbox'}:checked`).length;

    this.headerCheckbox.checked = totalRows > 0 && totalRows === checkedRows;
  }

  /**
   * Setup event listener to hide popup when user uses specific actions
   */
  setupPopupMenu() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.popup-menu')) {
        const activePopups = document.querySelectorAll('.popup-content.active');
        activePopups.forEach((popup) => popup.classList.remove('active'));
      }

      if (e.target.closest('.btn-trigger')) {
        e.preventDefault();
        e.stopPropagation();
        const popup = e.target.closest('.table__row').querySelector('.popup-content');
        popup?.classList.toggle('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        const activePopups = document.querySelectorAll('.popup-content.active');
        activePopups.forEach((popup) => popup.classList.remove('active'));
      }
    });
  }

  /**
   * Renders the create and edit forms using templates.
   */
  renderForms() {
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
      formContainer.innerHTML = Templates.genericForm('create') + Templates.genericForm('edit');
    }
    updateInvoiceIdPlaceholder();
  }

  /**
   * Renders the list of invoices.
   * @param {Array[Object]} invoices - An array of invoice objects to render.
   */
  renderInvoiceList(invoices) {
    this.invoiceList.innerHTML = invoices
      .map((invoice) => {
        if (!invoice.id) {
          console.error('Invoice missing ID:', invoice);
          return '';
        }
        const favoriteClass = invoice.favorite ? 'favorite-icon-active' : 'favorite-icon-inactive';
        const favoriteIconSrc = invoice.favorite
          ? './assets/images/icons/main-view-icons/favorite-icon-active.svg'
          : './assets/images/icons/main-view-icons/favorite-icon-inactive.svg';

        return Templates.invoiceTemplate
          .replace(/{{id}}/g, invoice.id)
          .replace(/{{name}}/g, invoice.name)
          .replace(/{{email}}/g, invoice.email)
          .replace(/{{date}}/g, invoice.date)
          .replace(/{{status}}/g, invoice.status)
          .replace('favorite-icon-inactive', favoriteClass)
          .replace(/{{statusLower}}/g, invoice.status.toLowerCase())
          .replace(/favorite-icon-inactive\.svg/, favoriteIconSrc.split('/').pop());
      })
      .join('');
  }

  /**
   * Clears the invoice preview section
   */
  clearInvoicePreview() {
    if (this.previewSection) {
      // Clear the product rows in preview table
      const previewTbody = this.previewSection.querySelector('.preview-table tbody');
      if (previewTbody) {
        previewTbody.innerHTML = '';
      }

      // Clear summary amounts
      const summaryValues = this.previewSection.querySelectorAll('.preview-summary__value');
      summaryValues.forEach((value) => {
        value.textContent = '$0.00';
      });
    }
  }

  /**
   * Renders the preview of a single invoice.
   * @param {Object} invoice - The invoice object to render in the preview.
   */
  renderInvoicePreview(invoice) {
    if (!invoice || !invoice.products || invoice.products.length === 0) {
      this.clearInvoicePreview();
      return;
    }
    this.previewSection.querySelector('.preview__invoice-label--id').innerHTML = `Invoice ID: <br/>
      <span>${invoice.id}</span>`;
    this.previewSection.querySelector('.preview-company__email .email-address').innerHTML =
      invoice.email;

    this.previewSection.querySelector('.preview__invoice .recipient__name').innerHTML =
      invoice.name;
    this.previewSection.querySelector('.preview__invoice .recipient__address').innerHTML =
      invoice.address;
    this.previewSection.querySelector('.preview__invoice-label--date').innerHTML =
      `Invoice Date: <br/>
      <span>${invoice.date}</span>`;

    const previewTbody = this.previewSection.querySelector('tbody');
    previewTbody.innerHTML = '';
    const productRows = invoice.products
      .map(
        (product) => `
        <tr class="preview-table__row">
          <td class="product-list__cell">${product.name}</td>
          <td class="product-list__cell">${product.rate}</td>
          <td class="product-list__cell">${product.quantity}</td>
          <td class="product-list__cell">${(product.rate * product.quantity).toFixed(2)}</td>
        </tr>`,
      )
      .join('');

    previewTbody.innerHTML = productRows;
  }

  /**
   * Setup favi=orite icon click handler
   * @param {Function} onFavoriteToggle - callback to handle favorite state update
   */

  setupFavoriteHandler(onFavoriteToggle) {
    this.invoiceList.addEventListener('click', (e) => {
      const favoriteIcon = e.target.closest('.favorite-icon-inactive, .favorite-icon-active');
      if (!favoriteIcon) return;

      const isActive = favoriteIcon.classList.contains('favorite-icon-active');
      const row = favoriteIcon.closest('.table__row');
      const invoiceId = row.querySelector('[data-label="Invoice Id"]').textContent;

      favoriteIcon.src = isActive
        ? './assets/images/icons/main-view-icons/favorite-icon-inactive.svg'
        : './assets/images/icons/main-view-icons/favorite-icon-active.svg';

      favoriteIcon.classList.toggle('favorite-icon-inactive', isActive);
      favoriteIcon.classList.toggle('favorite-icon-active', !isActive);

      onFavoriteToggle(invoiceId, !isActive);
    });
  }
}
export default InvoiceView;
