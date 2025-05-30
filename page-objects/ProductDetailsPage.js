/**
 * Product Details page object for AutomationExercise.com
 */
class ProductDetailsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Product information selectors
    this.productName = '.product-information h2';
    this.productCategory = '.product-information p:nth-child(3)';
    this.productPrice = '.product-information span span';
    this.productAvailability = '.product-information p:nth-child(6)';
    this.productCondition = '.product-information p:nth-child(7)';
    this.productBrand = '.product-information p:nth-child(8)';
    
    // Product selection selectors
    this.quantityInput = '#quantity';
    this.addToCartButton = 'button.cart';
    this.viewCartLink = 'p.text-center a[href="/view_cart"]';
    
    // Product review selectors
    this.reviewNameInput = '#name';
    this.reviewEmailInput = '#email';
    this.reviewTextarea = '#review';
    this.submitReviewButton = '#button-review';
  }

  /**
   * Get product details
   * @returns {Promise<Object>} Product details
   */
  async getProductDetails() {
    await this.page.waitForSelector(this.productName);
    
    const name = await this.page.textContent(this.productName);
    const category = await this.page.textContent(this.productCategory);
    const priceText = await this.page.textContent(this.productPrice);
    const price = priceText.replace('Rs. ', '');
    const availability = await this.page.textContent(this.productAvailability);
    const condition = await this.page.textContent(this.productCondition);
    const brand = await this.page.textContent(this.productBrand);
    
    return {
      name,
      category,
      price,
      availability,
      condition,
      brand: brand.replace('Brand: ', '')
    };
  }

  /**
   * Set product quantity
   * @param {number} quantity Quantity to set
   */
  async setQuantity(quantity) {
    await this.page.fill(this.quantityInput, quantity.toString());
  }

  /**
   * Add product to cart
   */
  async addToCart() {
    await this.page.click(this.addToCartButton);
    await this.page.waitForSelector(this.viewCartLink);
  }

  /**
   * View cart after adding product
   */
  async viewCart() {
    await this.page.click(this.viewCartLink);
  }

  /**
   * Submit a product review
   * @param {Object} reviewData Review data
   */
  async submitReview(reviewData) {
    await this.page.fill(this.reviewNameInput, reviewData.name);
    await this.page.fill(this.reviewEmailInput, reviewData.email);
    await this.page.fill(this.reviewTextarea, reviewData.review);
    await this.page.click(this.submitReviewButton);
  }

  /**
   * Check if product matches brand criteria
   * @param {string} brandName Brand name to check
   * @returns {Promise<boolean>} True if product matches brand
   */
  async isProductOfBrand(brandName) {
    const details = await this.getProductDetails();
    return details.brand.toLowerCase().includes(brandName.toLowerCase());
  }

  /**
   * Check if product matches type criteria
   * @param {string} productType Product type to check
   * @returns {Promise<boolean>} True if product matches type
   */
  async isProductOfType(productType) {
    const details = await this.getProductDetails();
    return details.name.toLowerCase().includes(productType.toLowerCase()) || 
           details.category.toLowerCase().includes(productType.toLowerCase());
  }
}

module.exports = ProductDetailsPage;
