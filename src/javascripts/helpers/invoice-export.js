import * as XLSX from '../../../node_modules/xlsx/xlsx.mjs';
import NotificationUtils from './notification-utils.js';

export default class InvoiceExport {
  /**
   * Export selected invoices to Excel file
   * @param {Array} selectedInvoices - Array of invoice objects to export
   */
  static exportToExcel(selectedInvoices) {
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
    const productSheet = XLSX.utils.json_to_sheet(productData);

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
