let currentSort = {
  field: 'name',
  order: 'asc',
};

/**
 * Initialize both mobile and desktop sort handlers
 * @param {Array} invoices - Array of invoice objects
 * @param {Function} onSort - Callback function to handle sorted invoices
 */
export function sortHandlers(invoices, onSort) {
  setupDesktopSort(invoices, onSort);
  setupMobileSort(invoices, onSort);
}

/**
 * Set up desktop sort handlers for table headers
 * @param {Array} invoices - Array of invoice objects
 * @param {Function} onSort - Callback function to handle sorted invoices
 */
function setupDesktopSort(invoices, onSort) {
  const tableHeaders = document.querySelectorAll('.table__header[data-field]');

  tableHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      // Close any open popups when sorting
      const activePopups = document.querySelectorAll('.popup-content.active');
      activePopups.forEach((popup) => popup.classList.remove('active'));

      const field = header.getAttribute('data-field');
      if (!field) return;

      // Toggle sort order if same field, otherwise start with ascending
      const newOrder =
        field === currentSort.field ? (currentSort.order === 'asc' ? 'desc' : 'asc') : 'asc';

      updateSortState(field, newOrder);
      updateDesktopSortIcon(header, newOrder);
      const sortedInvoices = performSort(invoices);
      onSort(sortedInvoices);
    });
  });
}

/**
 * Set up mobile sort dropdown and icon functionality
 * @param {Array} invoices - Array of invoice objects
 * @param {Function} onSort - Callback function to handle sorted invoices
 */
function setupMobileSort(invoices, onSort) {
  const dropdownButton = document.querySelector('.sort-dropdown__button');
  const dropdownMenu = document.querySelector('.sort-dropdown__menu');
  const selectedText = dropdownButton?.querySelector('.sort-dropdown__selected');
  const dropdownOptions = document.querySelectorAll('.sort-dropdown__option');
  const sortIcon = dropdownButton?.querySelector('.sort-icon--mobile');

  if (!dropdownButton || !dropdownMenu || !sortIcon || !selectedText) return;

  // Toggle dropdown on button click
  dropdownButton.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sort-dropdown')) {
      dropdownMenu.classList.remove('active');
    }
  });

  // Handle sort icon click to toggle sort order
  sortIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    const newOrder = currentSort.order === 'asc' ? 'desc' : 'asc';

    updateSortState(currentSort.field, newOrder);
    updateMobileSortIcon(sortIcon, newOrder);
    const sortedInvoices = performSort(invoices);
    onSort(sortedInvoices);
  });

  // Handle option selection
  dropdownOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const field = option.dataset.sort;
      if (!field) return;

      // Update selected text
      selectedText.textContent = option.textContent;

      updateSortState(field, currentSort.order);
      const sortedInvoices = performSort(invoices);
      onSort(sortedInvoices);
      //close dropdown
      dropdownMenu.classList.remove('active');
    });
  });

  // Close dropdown on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdownMenu.classList.contains('active')) {
      dropdownMenu.classList.remove('active');
    }
  });
}

/**
 * Update the current sort state
 * @param {string} field - Field to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 */
function updateSortState(field, order) {
  currentSort.field = field;
  currentSort.order = order;
}

/**
 * Update sort icon for desktop view
 * @param {HTMLElement} activeHeader - Active header element
 * @param {string} order - Sort order ('asc' or 'desc')
 */
function updateDesktopSortIcon(activeHeader, order) {
  const sortIcons = document.querySelectorAll('.sort-icon');
  sortIcons.forEach((icon) => {
    icon.classList.remove('ascending', 'descending');
  });

  const activeIcon = activeHeader.querySelector('.sort-icon');
  if (activeIcon) {
    activeIcon.classList.add(order === 'asc' ? 'ascending' : 'descending');
  }
}

/**
 * Update sort icon for mobile view
 * @param {HTMLElement} sortIcon - Mobile sort icon element
 * @param {string} order - Sort order ('asc' or 'desc')
 */
function updateMobileSortIcon(sortIcon, order) {
  sortIcon.src =
    order === 'asc'
      ? './assets/images/icons/main-view-icons/sort-icon-up.png'
      : './assets/images/icons/main-view-icons/sort-icon-down.png';
}

/**
 * Sort invoices based on current sort state
 * @param {Array} invoices - Array of invoice objects to sort
 * @returns {Array} Sorted array of invoices
 */
function performSort(invoices) {
  const { field, order } = currentSort;
  return [...invoices].sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    // Handle null or undefined values
    if (valA == null) valA = '';
    if (valB == null) valB = '';

    // Special handling for date type data
    if (field === 'date') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
      return order === 'asc' ? valA - valB : valB - valA;
    }

    // Format string type
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    // Sort logic
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}
