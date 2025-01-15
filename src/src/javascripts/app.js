import Invoice from './model/model.js';
import InvoiceView from './views/view.js';
import InvoiceController from './controllers/invoice.js';
class App {
  init() {
    this.invoice = new Invoice();
    this.invoiceView = new InvoiceView();
    this.invoiceController = new InvoiceController(this.invoice, this.invoiceView);
  }
}
export default App;
