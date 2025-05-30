/**
 * Checkout page object for AutomationExercise.com
 */
class CheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Address details review
    this.deliveryAddressSection = '#address_delivery';
    this.billingAddressSection = '#address_invoice';
    
    // Order review selectors
    this.orderReviewTable = '#cart_info';
    this.totalAmount = '.cart_total_price';
    
    // Payment form selectors
    this.nameOnCardInput = 'input[name="name_on_card"]';
    this.cardNumberInput = 'input[name="card_number"]';
    this.cvcInput = 'input[name="cvc"]';
    this.expiryMonthInput = 'input[name="expiry_month"]';
    this.expiryYearInput = 'input[name="expiry_year"]';
    this.payAndConfirmButton = '#submit';
    
    // Order confirmation selectors
    this.orderPlacedHeading = '.title:has-text("Order Placed!")';
    this.orderSuccessMessage = '.alert-success';
    this.orderDetailsSection = '.order-details';
    this.downloadInvoiceButton = '.invoice-btn';
    this.continueButton = '[data-qa="continue-button"]';
  }

  /**
   * Review delivery address
   * @returns {Promise<Object>} Address details
   */
  async getDeliveryAddress() {
    const addressText = await this.page.textContent(this.deliveryAddressSection);
    return this.parseAddressText(addressText);
  }

  /**
   * Review billing address
   * @returns {Promise<Object>} Address details
   */
  async getBillingAddress() {
    const addressText = await this.page.textContent(this.billingAddressSection);
    return this.parseAddressText(addressText);
  }

  /**
   * Get order review details
   * @returns {Promise<Object>} Order details
   */
  async getOrderReviewDetails() {
    const items = await this.page.$$(`${this.orderReviewTable} tr`);
    const orderDetails = [];
    
    for (const item of items) {
      const name = await item.$eval('td:nth-child(2)', el => el.textContent.trim());
      const price = await item.$eval('td:nth-child(3)', el => el.textContent.trim());
      const quantity = await item.$eval('td:nth-child(4)', el => el.textContent.trim());
      const total = await item.$eval('td:nth-child(5)', el => el.textContent.trim());
      
      orderDetails.push({ name, price, quantity, total });
    }
    
    const totalAmount = await this.page.textContent(this.totalAmount);
    
    return {
      items: orderDetails,
      totalAmount: totalAmount.trim()
    };
  }

  /**
   * Fill payment details
   * @param {Object} paymentData Payment information
   */
  async fillPaymentDetails(paymentData) {
    await this.page.fill(this.nameOnCardInput, paymentData.nameOnCard);
    await this.page.fill(this.cardNumberInput, paymentData.cardNumber);
    await this.page.fill(this.cvcInput, paymentData.cvc);
    await this.page.fill(this.expiryMonthInput, paymentData.expiryMonth);
    await this.page.fill(this.expiryYearInput, paymentData.expiryYear);
  }

  /**
   * Place order
   */
  async placeOrder() {
    await this.page.click(this.payAndConfirmButton);
  }

  /**
   * Verify order confirmation
   * @returns {Promise<Object>} Order confirmation details
   */
  async getOrderConfirmation() {
    await this.page.waitForSelector(this.orderPlacedHeading);
    
    const success = await this.page.isVisible(this.orderSuccessMessage);
    const message = await this.page.textContent(this.orderSuccessMessage);
    
    let orderDetails = null;
    if (await this.page.isVisible(this.orderDetailsSection)) {
      const detailsText = await this.page.textContent(this.orderDetailsSection);
      orderDetails = this.parseOrderDetails(detailsText);
    }
    
    return {
      success,
      message,
      orderDetails
    };
  }

  /**
   * Download invoice if available
   */
  async downloadInvoice() {
    if (await this.page.isVisible(this.downloadInvoiceButton)) {
      const downloadPromise = this.page.waitForEvent('download');
      await this.page.click(this.downloadInvoiceButton);
      const download = await downloadPromise;
      await download.saveAs(`order-invoice-${Date.now()}.pdf`);
    }
  }

  /**
   * Continue shopping
   */
  async continueShopping() {
    await this.page.click(this.continueButton);
  }

  /**
   * Helper to parse address text into structure
   * @private
   */
  parseAddressText(text) {
    // Implement address parsing logic
    return {
      fullText: text.trim()
    };
  }

  /**
   * Helper to parse order details text
   * @private
   */
  parseOrderDetails(text) {
    // Implement order details parsing logic
    return {
      fullText: text.trim()
    };
  }
}

module.exports = CheckoutPage;
