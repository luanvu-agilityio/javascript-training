import NotificationUtils from './notification-utils.js';
export default class InvoiceExport {
  /**
   *
   * Export selected invoices to Excel file
   * @param {Array} selectedInvoices - Array of invoice objects to export
   */
  static async exportToExcel(selectedInvoices) {
    try {
      await this.loadXLSX();
    } catch (err) {
      console.error('Failed to load XLSX:', err);
      new NotificationUtils().show('Failed to initialize export functionality', {
        type: 'error',
      });
      return;
    }
    if (!selectedInvoices || selectedInvoices.length === 0) {
      new NotificationUtils().show('Please select invoices to export', { type: 'warning' });
      return;
    }

    // Prepare data for export
    const exportData = selectedInvoices.map((invoice) => {
      const subtotal = invoice.products
        ? invoice.products.reduce((sum, product) => sum + product.rate * product.quantity, 0)
        : 0;
      const discountPercentage = 5;
      const discountAmount = subtotal * (discountPercentage / 100);
      const totalAfterDiscount = subtotal - discountAmount;

      return {
        'Invoice ID': invoice.id,
        'Customer Name': invoice.name,
        Email: invoice.email,
        'Phone Number': invoice.phoneNum,
        'Invoice Date': invoice.date,
        Address: invoice.address,
        Status: invoice.status,
        'Total Products': invoice.products ? invoice.products.length : 0,
        Subtotal: subtotal.toFixed(2),
        'Discount Percentage': `${discountPercentage}%`,
        'Discount Amount': discountAmount.toFixed(2),
        'Total After Discount': totalAfterDiscount.toFixed(2),
      };
    });

    // Detailed product information in a separate sheet
    const productData = selectedInvoices.flatMap((invoice) =>
      (invoice.products || []).map((product) => ({
        'Invoice ID': invoice.id,
        'Customer Name': invoice.name,
        'Product Name': product.name,
        Rate: product.rate,
        Quantity: product.quantity,
        'Total Product Amount': product.rate * product.quantity,
      })),
    );

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const invoiceSheet = XLSX.utils.json_to_sheet(exportData, {
      origin: 'A2',
    });

    // Add headers to invoice sheet
    const invoiceHeaders = [
      ['Invoice Summary'],
      [
        'Invoice ID',
        'Customer Name',
        'Email',
        'Phone Number',
        'Invoice Date',
        'Address',
        'Status',
        'Total Products',
        'Subtotal',
        'Discount Percentage',
        'Discount Amount',
        'Total After Discount',
      ],
    ];

    XLSX.utils.sheet_add_aoa(invoiceSheet, invoiceHeaders, { origin: 'A1' });

    // Style headers
    invoiceSheet['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center' },
    };

    // Define column widths
    invoiceSheet['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
    ];

    // product sheet
    const productSheet = XLSX.utils.json_to_sheet(productData, {
      origin: 'A2',
    });

    // Add headers to product sheet
    const productHeaders = [
      ['Product Details'],
      ['Invoice ID', 'Customer Name', 'Product Name', 'Rate', 'Quantity', 'Total Product Amount'],
    ];

    XLSX.utils.sheet_add_aoa(productSheet, productHeaders, { origin: 'A1' });

    // Style headers for product sheet
    productSheet['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center' },
    };

    // Define column widths for product sheet
    productSheet['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
    ];
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, invoiceSheet, 'Invoices');
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Products');

    // Set merge ranges for titles
    invoiceSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }];
    productSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

    // Generate file name
    const fileName = `Invoice_Export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Write to file
    XLSX.writeFile(workbook, fileName);

    // Show success notification
    new NotificationUtils().show(`Exported ${selectedInvoices.length} invoice(s)`, {
      type: 'success',
    });
  }
  static loadXLSX() {
    return new Promise((resolve, reject) => {
      if (window.XLSX) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.integrity =
        'sha512-r22gChDnGvBylk90+2e/ycr3RVrDi8DIOkIGNhJlKfuyQM4tIRAI062MaV8sfjQKYVGjOBaZBOA87z+IhZE9DA==';
      script.crossOrigin = 'anonymous';

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load XLSX library'));

      document.head.appendChild(script);
    });
  }
}
