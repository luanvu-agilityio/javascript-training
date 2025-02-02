import NotificationUtils from './notification-utils.js';
let XLSX;

export default class InvoiceExport {
  /**
   *
   * Export selected invoices to Excel file
   * @param {Array} selectedInvoices - Array of invoice objects to export
   */
  static async exportToExcel(selectedInvoices) {
    try {
      XLSX = await import('xlsx');
    } catch (e) {
      try {
        XLSX = await import('../../../node_modules/xlsx/xlsx.mjs');
      } catch (err) {
        console.error('Failed to load XLSX:', err);
        new NotificationUtils().show('Failed to initialize export functionality', {
          type: 'error',
        });
        return;
      }
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
    const invoiceSheet = XLSX.utils.json_to_sheet(exportData);
    // Add title to invoice sheet
    invoiceSheet['A1'] = { v: 'Invoice Summary', t: 's' };
    invoiceSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }];

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

    const productSheet = XLSX.utils.json_to_sheet(productData);

    // Add title to product sheet
    productSheet['A1'] = { v: 'Product Details', t: 's' };
    productSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

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

    // Generate file name
    const fileName = `Invoice_Export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Write to file
    XLSX.writeFile(workbook, fileName);

    // Show success notification
    new NotificationUtils().show(`Exported ${selectedInvoices.length} invoice(s)`, {
      type: 'success',
    });
  }
}
