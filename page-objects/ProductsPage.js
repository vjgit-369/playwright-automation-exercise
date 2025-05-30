/**
 * Products page object for AutomationExercise.com
 */
class ProductsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Search and filter selectors
    this.searchInput = '#search_product';
    this.searchButton = '#submit_search';
    this.brandsSection = '.brands-name';
    this.brandLinks = '.brands-name ul li a';
    
    // Product selectors
    this.productCards = '.features_items .product-image-wrapper';
    this.productNames = '.product-information h2';
    this.productPrices = '.product-information h2 + p';
    this.productBrands = '.product-information p:has-text("Brand:")';
    
    // Add to cart selectors
    this.addToCartButtons = '.add-to-cart';
    this.viewCartLink = 'p.text-center a[href="/view_cart"]';
    this.continueShoppingButton = '.modal-footer button';
    this.viewProductLinks = '.choose a';
  }

  /**
   * Search for products
   * @param {string} query Search query
   */
  async searchProducts(query) {
    await this.page.fill(this.searchInput, query);
    await this.page.click(this.searchButton);
  }

  /**
   * Filter products by brand
   * @param {string} brand Brand name
   */
  async filterByBrand(brand) {
    // Find the brand link that contains the text (case insensitive)
    const brandLinkSelector = `${this.brandLinks}:text-matches("${brand}", "i")`;
    await this.page.waitForSelector(brandLinkSelector);
    await this.page.click(brandLinkSelector);
  }

  /**
   * Get all products on the page
   * @returns {Promise<Array<ElementHandle>>} Array of product elements
   */
  async getAllProducts() {
    return await this.page.$$(this.productCards);
  }

  /**
   * Get product details by index
   * @param {number} index Product index
   * @returns {Promise<Object>} Product details
   */
  async getProductDetails(index) {
    const products = await this.getAllProducts();
    
    if (index >= products.length) {
      throw new Error(`Product index ${index} is out of range. Only ${products.length} products available.`);
    }
    
    const product = products[index];
    
    // Get product name
    const nameElement = await product.$('.productinfo h2');
    const name = await nameElement.textContent();
    
    // Get product price
    const priceElement = await product.$('.productinfo h2 + p');
    const priceText = await priceElement.textContent();
    const price = priceText.replace('Rs. ', '');
    
    return {
      name,
      price,
      index
    };
  }

  /**
   * Add product to cart by index
   * @param {number} index Product index
   */
  async addProductToCart(index) {
    const products = await this.getAllProducts();
    
    if (index >= products.length) {
      throw new Error(`Product index ${index} is out of range. Only ${products.length} products available.`);
    }
    
    // Hover over product to show add to cart button
    await products[index].hover();
    
    // Get the add to cart button for this product
    const addToCartButton = await products[index].$(this.addToCartButtons);
    await addToCartButton.click();
    
    // Wait for modal to appear
    await this.page.waitForSelector(this.viewCartLink);
  }

  /**
   * Continue shopping after adding product to cart
   */
  async continueShopping() {
    await this.page.click(this.continueShoppingButton);
  }

  /**
   * View cart after adding product
   */
  async viewCart() {
    await this.page.click(this.viewCartLink);
  }

  /**
   * View product details by index
   * @param {number} index Product index
   */
  async viewProductDetails(index) {
    const products = await this.getAllProducts();
    
    if (index >= products.length) {
      throw new Error(`Product index ${index} is out of range. Only ${products.length} products available.`);
    }
    
    const viewProductLink = await products[index].$(this.viewProductLinks);
    await viewProductLink.click();
  }

  /**
   * Check if products matching criteria exist
   * @param {Object} criteria Search criteria
   * @returns {Promise<boolean>} True if matching products exist
   */
  async hasProductsMatchingCriteria(criteria) {
    const products = await this.getAllProducts();
    
    if (products.length === 0) {
      return false;
    }
    
    // If no criteria specified, just check if any products exist
    if (!criteria || Object.keys(criteria).length === 0) {
      return products.length > 0;
    }
    
    // TODO: Implement more sophisticated filtering based on criteria
    return true;
  }
}

module.exports = ProductsPage;
