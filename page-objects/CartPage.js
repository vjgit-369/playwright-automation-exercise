/**
 * Cart page object for AutomationExercise.com
 */
class CartPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Cart item selectors
    this.cartTable = '#cart_info';
    this.cartItems = '.cart_info tbody tr';
    this.productNames = '.cart_description h4 a';
    this.productPrices = '.cart_price p';
    this.productQuantities = '.cart_quantity button';
    this.productTotals = '.cart_total p';
    
    // Cart summary selectors
    this.cartTotalPrice = '#cart_info .cart_total_price';
    
    // Checkout selectors
    this.proceedToCheckoutButton = '.btn.btn-default.check_out';
    this.registerLoginLink = '.modal-body p a';
  }

  /**
   * Get all cart items
   * @returns {Promise<Array<ElementHandle>>} Array of cart item elements
   */
  async getAllCartItems() {
    await this.page.waitForSelector(this.cartItems);
    return await this.page.$$(this.cartItems);
  }

  /**
   * Get cart item details by index
   * @param {number} index Cart item index
   * @returns {Promise<Object>} Cart item details
   */
  async getCartItemDetails(index) {
    const items = await this.getAllCartItems();
    
    if (index >= items.length) {
      throw new Error(`Cart item index ${index} is out of range. Only ${items.length} items available.`);
    }
    
    const item = items[index];
    
    // Get product name
    const nameElement = await item.$(this.productNames);
    const name = await nameElement.textContent();
    
    // Get product price
    const priceElement = await item.$(this.productPrices);
    const priceText = await priceElement.textContent();
    const price = priceText.replace('Rs. ', '');
    
    // Get product quantity
    const quantityElement = await item.$(this.productQuantities);
    const quantity = await quantityElement.textContent();
    
    // Get product total
    const totalElement = await item.$(this.productTotals);
    const totalText = await totalElement.textContent();
    const total = totalText.replace('Rs. ', '');
    
    return {
      name,
      price,
      quantity,
      total
    };
  }

  /**
   * Get all cart items details
   * @returns {Promise<Array<Object>>} Array of cart item details
   */
  async getAllCartItemsDetails() {
    const items = await this.getAllCartItems();
    const itemDetails = [];
    
    for (let i = 0; i < items.length; i++) {
      itemDetails.push(await this.getCartItemDetails(i));
    }
    
    return itemDetails;
  }

  /**
   * Get cart total price
   * @returns {Promise<string>} Cart total price
   */
  async getCartTotalPrice() {
    const totalElement = await this.page.$(this.cartTotalPrice);
    const totalText = await totalElement.textContent();
    return totalText.replace('Rs. ', '');
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.page.click(this.proceedToCheckoutButton);
  }

  /**
   * Click register/login link if modal appears
   */
  async clickRegisterLoginIfNeeded() {
    // Check if the modal with register/login link is visible
    if (await this.page.isVisible(this.registerLoginLink)) {
      await this.page.click(this.registerLoginLink);
    }
  }
}

module.exports = CartPage;
