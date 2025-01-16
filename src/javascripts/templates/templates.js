const Templates = {
  genericForm: (type) => `
  <div class="form--${type} ${type === 'edit' ? 'hidden' : ''}">
    <div class="form__header">
      <h3 class="form__header-title">${type === 'create' ? 'Create New Invoice' : 'Edit This Invoice'}</h3>
      <button class="btn form__header-close">
        <img src="./assets/images/icons/create-invoice-modal-icons/close-icon.png" alt="close icon" />
      </button>
    </div>

    <div class="form__camera">
      <img class="form__camera-icon" src="./assets/images/icons/create-invoice-modal-icons/camera-icon.svg" alt="picture icon" />
    </div>

    <div class="form-grid">
      <div class="form__group">
        <label class="form__group-label">Invoice ID</label>
        <input
          name="invoice-id" 
          class="form__group-input" 
          type="text" 
          ${type === 'create' ? 'placeholder="Loading..." data-auto-id="true"' : 'placeholder="#876370"'}
          disabled
          />
      </div>
      <div class="form__group">
        <label class="form__group-label">Date</label>
        <div class="form__group-date">
          <input class="form__group-input" type="date" />
          <img 
            class="form__group-date-icon"
            src="./assets/images/icons/create-invoice-modal-icons/calendar-icon.svg" 
            alt="Date icon"
          />
        </div>
      </div>
      <div class="form__group">
        <label class="form__group-label">Name</label>
        <input class="form__group-input" type="text" placeholder="Alison G." />
      </div>
      <div class="form__group">
        <label class="form__group-label">Email</label>
        <input class="form__group-input" type="email" placeholder="example@gmail.com" />
      </div>
      <div class="form__group">
        <label class="form__group-label">Address</label>
        <div class="form__group-address">
          <input class="form__group-input" type="text" placeholder="Street" />
          <img class="form__group-address-icon" src="./assets/images/icons/create-invoice-modal-icons/location-icon.svg" alt="location icon" />
        </div>
      </div>
      <div class="form__group">
        <label for="status" class="form__group-label">Status</label>
        <select id="status" name="status" class="form__group-input form__group-input--select">
          <option value="Pending">Pending</option>
          <option value="Complete">Completed</option>
          <option value="Cancel">Cancel</option>
        </select>
      </div>
    </div>

    <div class="product-list">
      <div class="product-list__title">
        <h4 class="product-list__title-text">Product Description</h4>
        <button class="btn product-list__action-buttons product-list__action-button--button-add">+</button>
      </div>
      <table class="product-list__table">
        <thead class="product-list__table-head">
          <tr class="product-list__table-row">
            <th class="product-list__header">Product Name</th>
            <th class="product-list__header">Rate</th>
            <th class="product-list__header">Qty</th>
            <th class="product-list__header">Amount</th>
            <th class="product-list__header"></th>
          </tr>
        </thead>
        <tbody class="product-list__table-body"></tbody>
      </table>
    </div>

    <div class="form__action-buttons">
      <button class="btn form__action-buttons--button-send">Send Invoice</button>
      <button class="btn form__action-buttons--button-${type === 'create' ? 'create' : 'save'}">${type === 'create' ? 'Create Invoice' : 'Save Changes'}</button>
    </div>
  </div>
`,
  invoiceTableTemplate: `
  <table class="table__content">
    <thead class="table__head">
      <tr class="table__row">
        <th class="table__header"><input type="checkbox" class="checkbox" /></th>
        <th class="table__header" data-field="id">ID <span class="sort-icon"></span></th>
        <th class="table__header" data-field="name">Name <span class="sort-icon"></span></th>
        <th class="table__header"  data-field="date">Date <span class="sort-icon"></span></th>
        <th class="table__header" data-field="email">Email <span class="sort-icon"></span></th>
        <th class="table__header" data-field="status">Status <span class="sort-icon"></span></th>
      </tr>
    </thead>
    <tbody class="table__body"></tbody>
  </table>
`,
  previewTemplate: `
  <div class="preview__header">
    <h2 class="preview__header-title">Preview</h2>
    <div class="preview__main__actions">
      <a href="javascript:void(0)">
        <img
          src="./assets/images/icons/preview-section-icons/download-icon.svg"
          alt="download icon"
        />
      </a>
      <a href="javascript:void(0)">
        <img
          src="./assets/images/icons/preview-section-icons/print-icon.svg"
          alt="printer icon"
        />
      </a>
    </div>
  </div>

  <div class="preview__content">
    <div class="preview__customer">
      <div class="preview__customer-logo">
        <img 
          class="preview__recipient-logo"
          src="./assets/images/recipient-logo.png"
          alt="recipient logo"
        />
      </div>
      <div class="preview__customer-info">
        <div class="preview__customer-email">
          &#64; <span class="email-address">your.mail@gmail.com</span>
        </div>
        <div class="preview__customer-phone">
          m <span class="phone-number">+388 953 217 3815</span>
        </div>
      </div>
    </div>

    <div class="preview__invoice">
      <div class="preview__invoice-details">
        <div class="recipient-details">
          <span class="recipient__info">recipient</span><br />
          <div class="contact-details">
            <p class="recipient__name"></p>
            <p class="recipient__address"></p>
          </div>
          <div class="preview-company__info">
            <div class="preview-company__email">&#64; <span class="email-address"> </span></div>
            <div class="preview-company__phone">
              m <span class="phone-number"> +386 714 505 8385</span>
            </div>
          </div>
        </div>

        <div class="preview__invoice-header">
          <div class="preview__invoice-title">Invoice</div>
          <div class="invoice-number">
            <div class="preview__invoice-label--id"></div>
            <div class="preview__invoice-label--date"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <table class="preview-table">
    <thead>
      <tr class="preview-table__row">
        <th class="product-list__header">Product Description</th>
        <th class="product-list__header">Rates</th>
        <th class="product-list__header">Qty</th>
        <th class="product-list__header">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr class="preview-table__row"></tr>
    </tbody>
  </table>

  <div class="preview-summary">
    <div class="preview-summary__row">
      <span class="preview-summary__label">Subtotal:</span>
      <span class="preview-summary__value">&#36;</span>
    </div>
    <div class="preview-summary__row">
      <span class="preview-summary__label">Discount (5&#37;):</span>
      <span class="preview-summary__value">&#36;</span>
    </div>
    <div class="preview-summary__row preview-summary__total">
      <span class="preview-summary__label">Total:</span>
      <span class="preview-summary__value">&#36;</span>
    </div>
  </div>

  <div class="preview-footer">
    <div class="preview-footer__payment">
      <p>to the business account below. Please include invoice number on your check.</p>
      <p class="payment__bank-acc">
        BANK:
        <span class="bank-acc__info"> FTSBUS33</span>
        IBAN: <span class="bank-acc__info"> GB82-1111-2222-3333</span>
      </p>
    </div>

    <div class="preview-footer__notes">
      <h3 class="notes__header">NOTES</h3>
      <p class="notes__content">
        All amounts are in dollars. Please make the payment within 15 days from the issue of
        date of this invoice. Tax is not charged on the basis of paragraph 1 of Article 94
        of the Value Added Tax Act (I am not liable for VAT).
      </p>
      <p>Thank you for your confidence in my work.<br />Signature</p>
    </div>

    <div class="preview-footer__company">
      <div class="preview-footer__company-details">
        <p>YOUR COMPANY</p>
        <p>1331 Hart Ridge Road, 49436 Gaines, MI</p>
      </div>
      <div class="preview__customer-info">
        <div class="preview__customer-email">
          &#64; <span class="email-address">your.mail@gmail.com</span>
        </div>
        <div class="preview__customer-phone">
          m <span class="phone-number">+388 953 217 3815</span>
        </div>
      </div>

      <div class="preview-footer__company-copyright">
        <p>The company is registered in the<br />business register under no. 87600000</p>
      </div>
    </div>
  </div>
`,
  invoiceTemplate: `
<tr class="table__row">
  <td class="table__cell"><input type="checkbox" class="table__checkbox" /></td>
  <td class="table__cell" data-label="Invoice Id">{{id}}</td>
  <td class="table__cell" data-label="Name">
    <div class="table__user">
      <img class="table__user-avatar" src="./assets/images/recipient-image.png" alt="avatar" />
      <span class="table__user-name">{{name}}</span>
    </div>
  </td>
  <td class="table__cell" data-label="Email">
    <div class="table__user-email">
      <img src="./assets/images/icons/main-view-icons/email-icon.svg" alt="email icon" />
      <span class="table__user-email-text">{{email}}</span>
    </div>
  </td>
  <td class="table__cell" data-label="Date">
    <div class="table__date">
      <img class="table__date-icon" src="./assets/images/icons/main-view-icons/date-icon.svg" alt="date icon" />
      <span class="table__date-text">{{date}}</span>
    </div>
  </td>
  <td class="table__cell" data-label="Status">
    <span class="status status-{{statusLower}}">{{status}}</span>
  </td>
  <td class="table__cell" data-label="Favorite">
    <img 
      alt="favorite icon" 
      class="favorite-icon-inactive"
      src="./assets/images/icons/main-view-icons/favorite-icon-inactive.svg" 
    />
  </td>
  <td class="table__cell table__cell--actions" data-label="Actions">
    <div class="popup-menu">
      <button class="btn-trigger">...</button>
      <div class="popup-content hidden ">
        <button class="btn btn--edit" data-id="{{id}}">
          <img src="./assets/images/icons/main-view-icons/edit-icon.svg" alt="edit icon" />
          Edit
        </button>
        <button class="btn btn--delete" data-id="{{id}}">
          <img src="./assets/images/icons/create-invoice-modal-icons/Delete-icon.svg" alt="delete-icon" />
          Delete
        </button>
      </div>
    </div>
  </td>
</tr>
`,
  addProductRowTemplate: `
<tr class="product-list__table-row">
  <td class="product-list__cell"><input type="text" class="product-input"/></td>
  <td class="product-list__cell"><input type="number" class="rate-input"/></td>
  <td class="product-list__cell"><input type="number" class="qty-input"/></td>
  <td class="product-list__cell">$0.00</td>
  <td class="product-list__cell">
    <button class="btn product-list__action-buttons product-list__action-button--button-delete">
      <img
        class="delete-icon"
        src="./assets/images/icons/create-invoice-modal-icons/Delete-icon.svg"
        alt="delete icon"
      />
    </button>
  </td>
</tr>
`,
  addProductPriceCalculation: (product) => `
<tr class="product-list__table-row">
  <td class="product-list__cell"><input type="text" class="product-input" value="${product.name}"></td>
  <td class="product-list__cell"><input type="number" class="rate-input" value="${product.rate}"></td>
  <td class="product-list__cell"><input type="number" class="qty-input" value="${product.quantity}"></td>
  <td class="product-list__cell">$${(product.rate * product.quantity).toFixed(2)}</td>
  <td class="product-list__cell">
    <button class="btn product-list__action-buttons product-list__action-button--button-delete">
      <img src="./assets/images/icons/create-invoice-modal-icons/Delete-icon.svg" alt="delete icon" class="delete-icon">
    </button>
  </td>
</tr>
`,
};

export default Templates;
