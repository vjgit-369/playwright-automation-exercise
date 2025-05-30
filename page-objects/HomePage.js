/**
 * Home page object for AutomationExercise.com
 */
const BasePage = require('./BasePage');

class HomePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    
    // Selectors
    this.productsLink = 'a[href="/products"]';
    this.signupLoginLink = 'a[href="/login"]';
    this.loggedInUsername = 'a:has-text("Logged in as")';
    this.cartLink = 'a[href="/view_cart"]';
    this.deleteAccountLink = 'a[href="/delete_account"]';
    this.logoutLink = 'a[href="/logout"]';
  }

  /**
   * Navigate to the home page
   */
  async navigate() {
    await super.navigate('/');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to the login/signup page
   */
  async goToLoginPage() {
    await this.click(this.signupLoginLink);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to the products page
   */
  async goToProductsPage() {
    await this.click(this.productsLink);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to the cart page
   */
  async goToCartPage() {
    await this.click(this.cartLink);
    await this.waitForPageLoad();
  }

  /**
   * Check if user is logged in
   * @returns {Promise<boolean>} True if user is logged in
   */
  async isUserLoggedIn() {
    return await this.isVisible(this.loggedInUsername);
  }

  /**
   * Get the logged in username
   * @returns {Promise<string>} Username
   */
  async getLoggedInUsername() {
    const text = await this.getText(this.loggedInUsername);
    return text.replace('Logged in as ', '').trim();
  }

  /**
   * Logout the user
   */
  async logout() {
    await this.click(this.logoutLink);
    await this.waitForPageLoad();
  }

  /**
   * Delete account
   */
  async deleteAccount() {
    await this.click(this.deleteAccountLink);
    await this.waitForPageLoad();
  }
}

module.exports = HomePage;
