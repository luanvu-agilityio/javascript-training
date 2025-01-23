class Invoice {
  constructor(id, name, email, date, address, phoneNum, status, products) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phoneNum = phoneNum;
    this.date = date;
    this.address = address;
    this.status = status;
    this.products = products || [];
  }

  getTotalAmount() {
    return this.products.reduce((total, product) => total + product.rate * product.quantity, 0);
  }
}
export default Invoice;
