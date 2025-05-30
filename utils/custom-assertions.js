/**
 * Custom assertions for e-commerce specific validations
 */
const { expect } = require('@playwright/test');

class CustomAssertions {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Assert that user is logged in
   * @param {string} username Expected username
   * @returns {Promise<void>}
   */
  async assertUserLoggedIn(username) {
    const loggedInText = await this.page.textContent('a:has-text("Logged in as")');
    expect(loggedInText, 'User should be logged in').toBeTruthy();
    
    if (username) {
      expect(loggedInText).toContain(username);
    }
  }

  /**
   * Assert that product details match expected criteria
   * @param {Object} product Product details
   * @param {Object} criteria Criteria to match
   * @returns {Promise<void>}
   */
  async assertProductMatchesCriteria(product, criteria) {
    if (criteria.productTypes && criteria.productTypes.length > 0) {
      const matchesType = criteria.productTypes.some(type => 
        product.name.toLowerCase().includes(type.toLowerCase()) || 
        (product.category && product.category.toLowerCase().includes(type.toLowerCase()))
      );
      
      expect(matchesType, `Product should match one of types: ${criteria.productTypes.join(', ')}`).toBeTruthy();
    }
    
    if (criteria.minPrice !== undefined && criteria.maxPrice !== undefined) {
      const price = parseFloat(product.price);
      expect(price).toBeGreaterThanOrEqual(criteria.minPrice);
      expect(price).toBeLessThanOrEqual(criteria.maxPrice);
    }
  }

  /**
   * Assert that cart contains expected products
   * @param {Array<Object>} cartItems Cart items
   * @param {Array<Object>} expectedProducts Expected products
   * @returns {Promise<void>}
   */
  async assertCartContents(cartItems, expectedProducts) {
    expect(cartItems.length).toBe(expectedProducts.length);
    
    for (let i = 0; i < cartItems.length; i++) {
      expect(cartItems[i].name).toContain(expectedProducts[i].name);
      expect(cartItems[i].price).toBe(expectedProducts[i].price);
    }
  }

  /**
   * Assert that cart total is calculated correctly
   * @param {string} cartTotal Cart total as string
   * @param {Array<Object>} cartItems Cart items
   * @returns {Promise<void>}
   */
  async assertCartTotalCorrect(cartTotal, cartItems) {
    const expectedTotal = cartItems.reduce((total, item) => {
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity || '1');
      return total + (price * quantity);
    }, 0).toString();
    
    expect(cartTotal).toBe(expectedTotal);
  }

  /**
   * Assert that order confirmation is successful
   * @param {Object} orderConfirmation Order confirmation details
   * @returns {Promise<void>}
   */
  async assertOrderConfirmed(orderConfirmation) {
    expect(orderConfirmation.success).toBeTruthy();
    expect(orderConfirmation.message).toBeTruthy();
    
    if (orderConfirmation.orderDetails) {
      expect(orderConfirmation.orderDetails).toBeTruthy();
    }
  }

  /**
   * Assert that page has expected elements
   * @param {Array<string>} selectors Selectors to check
   * @returns {Promise<void>}
   */
  async assertPageHasElements(selectors) {
    for (const selector of selectors) {
      await expect(this.page.locator(selector)).toBeVisible();
    }
  }

  /**
   * Assert that API response has expected status and data
   * @param {Object} response API response
   * @param {number} expectedStatus Expected status code
   * @param {Object} expectedData Expected data patterns
   * @returns {Promise<void>}
   */
  async assertApiResponse(response, expectedStatus, expectedData = {}) {
    expect(response.status).toBe(expectedStatus);
    
    if (Object.keys(expectedData).length > 0) {
      // Implement response body validation logic here
    }
  }
}

module.exports = CustomAssertions;
