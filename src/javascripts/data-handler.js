import { getApiUrl } from './config.js';

class DataHandler {
  constructor() {
    this.rootUrl = getApiUrl();
  }

  /**
   * Gets an invoice with its associated products in a single request
   * @param {string} id - Invoice ID
   * @returns {Promise<Object>} Invoice data with products array
   */
  async getInvoiceWithProducts(id) {
    try {
      const [invoice, products] = await Promise.all([
        this.getInvoiceById(id),
        this.getProductsByInvoiceId(id),
      ]);
      return {
        ...invoice,
        products,
      };
    } catch (error) {
      console.error('Error fetching invoice with products:', error);
      throw new Error('Failed to fetch invoice with products');
    }
  }

  /**
   * Creates an invoice and its products in a single transaction
   * @param {Object} invoiceData - Invoice data
   * @param {Array} products - Array of product objects
   * @returns {Promise<Object>} Created invoice with products array
   */
  async createInvoiceWithProducts(invoiceData, products) {
    try {
      // First create the invoice
      const invoice = await fetch(`${this.rootUrl}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...invoiceData,
          favorite: false,
        }),
      });

      if (!invoice.ok) {
        const errorText = await invoice.text();
        throw new Error(`Failed to create invoice: ${invoice.status} ${errorText}`);
      }

      const createdInvoice = await invoice.json();

      // Then create all products with the new invoice ID
      const productPromises = products.map((product) =>
        fetch(`${this.rootUrl}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...product,
            invoiceId: createdInvoice.id,
          }),
        }),
      );

      const productResponses = await Promise.all(productPromises);
      const createdProducts = await Promise.all(
        productResponses.map(async (response) => {
          if (!response.ok) throw new Error('Failed to create product');
          return response.json();
        }),
      );

      return {
        ...createdInvoice,
        products: createdProducts,
      };
    } catch (error) {
      console.error('Error creating invoice with products:', error);
      throw error;
    }
  }

  /**
   * Updates an invoice and its products in a single transaction
   * @param {string} id - Invoice ID
   * @param {Object} invoiceData - Updated invoice data
   * @param {Array} products - Array of updated product objects
   * @returns {Promise<Object>} Updated invoice with products array
   */
  async updateInvoiceWithProducts(id, invoiceData, products) {
    try {
      // Get existing products to delete them
      const existingProducts = await this.getProductsByInvoiceId(id);

      // Delete all existing products
      await Promise.all(
        existingProducts.map((product) =>
          fetch(`${this.rootUrl}/products/${product.id}`, {
            method: 'DELETE',
          }),
        ),
      );

      // Update the invoice
      const invoiceResponse = await fetch(`${this.rootUrl}/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!invoiceResponse.ok) throw new Error('Failed to update invoice');
      const updatedInvoice = await invoiceResponse.json();

      // Create new products
      const productPromises = products.map((product) =>
        fetch(`${this.rootUrl}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...product,
            invoiceId: id,
          }),
        }),
      );

      const productResponses = await Promise.all(productPromises);
      const updatedProducts = await Promise.all(
        productResponses.map(async (response) => {
          if (!response.ok) throw new Error('Failed to create new product');
          return response.json();
        }),
      );

      return {
        ...updatedInvoice,
        products: updatedProducts,
      };
    } catch (error) {
      console.error('Error updating invoice with products:', error);
      throw error;
    }
  }

  /**
   * Deletes an invoice and its associated products
   * @param {string} id - Invoice ID
   * @returns {Promise<boolean>} True if deletion was successful
   */
  async deleteInvoiceWithProducts(id) {
    try {
      // Get and delete all products first
      const products = await this.getProductsByInvoiceId(id);
      await Promise.all(
        products.map((product) =>
          fetch(`${this.rootUrl}/products/${product.id}`, {
            method: 'DELETE',
          }),
        ),
      );

      // Then delete the invoice
      const response = await fetch(`${this.rootUrl}/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete invoice');
      return true;
    } catch (error) {
      console.error('Error deleting invoice with products:', error);
      throw error;
    }
  }

  /**
   * Deletes multiple invoices and their associated products
   * @param {Array<string>} ids - Array of invoice IDs
   * @returns {Promise<boolean>} True if deletion was successful
   */
  async deleteMultipleInvoicesWithProducts(ids) {
    try {
      await Promise.all(ids.map((id) => this.deleteInvoiceWithProducts(id)));
      return true;
    } catch (error) {
      console.error('Error deleting multiple invoices:', error);
      throw error;
    }
  }

  // Keep existing individual methods for flexibility
  async getInvoiceList() {
    try {
      const response = await fetch(`${this.rootUrl}/invoices`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoiceById(id) {
    try {
      const response = await fetch(`${this.rootUrl}/invoices/${id}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async getProductsByInvoiceId(invoiceId) {
    try {
      const response = await fetch(`${this.rootUrl}/products?invoiceId=${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
}

export default DataHandler;
