/**
 * Base page object that all page objects can extend
 */
const RetryHelper = require('../utils/retry-helper');

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.retryHelper = new RetryHelper();
    
    // Common selectors across pages
    this.header = 'header';
    this.footer = 'footer';
    this.logo = '.logo';
    this.navigationMenu = '.navbar-nav';
    this.loadingSpinner = '.spinner';
  }

  /**
   * Navigate to a specific URL
   * @param {string} url URL to navigate to
   */
  async navigate(url) {
    await this.retryHelper.retry(
      async () => await this.page.goto(url),
      `Navigate to ${url}`
    );
  }

  /**
   * Wait for page to be loaded
   */
  async waitForPageLoad() {
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    
    // Wait for any loading spinners to disappear
    if (await this.page.isVisible(this.loadingSpinner)) {
      await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden' });
    }
  }

  /**
   * Click on an element with retry logic
   * @param {string} selector Element selector
   * @param {Object} options Click options
   */
  async click(selector, options = {}) {
    await this.retryHelper.retry(
      async () => {
        await this.page.waitForSelector(selector, { state: 'visible' });
        await this.page.click(selector, options);
      },
      `Click on ${selector}`
    );
  }

  /**
   * Fill a form field with retry logic
   * @param {string} selector Element selector
   * @param {string} value Value to fill
   * @param {Object} options Fill options
   */
  async fill(selector, value, options = {}) {
    await this.retryHelper.retry(
      async () => {
        await this.page.waitForSelector(selector, { state: 'visible' });
        await this.page.fill(selector, value, options);
      },
      `Fill ${selector} with ${value}`
    );
  }

  /**
   * Get text content of an element
   * @param {string} selector Element selector
   * @returns {Promise<string>} Text content
   */
  async getText(selector) {
    return await this.retryHelper.retry(
      async () => {
        await this.page.waitForSelector(selector, { state: 'visible' });
        return await this.page.textContent(selector);
      },
      `Get text from ${selector}`
    );
  }

  /**
   * Check if element is visible
   * @param {string} selector Element selector
   * @returns {Promise<boolean>} True if element is visible
   */
  async isVisible(selector) {
    try {
      return await this.page.isVisible(selector);
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for element to be visible
   * @param {string} selector Element selector
   * @param {Object} options Wait options
   */
  async waitForElement(selector, options = {}) {
    await this.retryHelper.retry(
      async () => await this.page.waitForSelector(selector, { state: 'visible', ...options }),
      `Wait for ${selector}`
    );
  }

  /**
   * Select option from dropdown
   * @param {string} selector Element selector
   * @param {string} value Value to select
   */
  async selectOption(selector, value) {
    await this.retryHelper.retry(
      async () => {
        await this.page.waitForSelector(selector, { state: 'visible' });
        await this.page.selectOption(selector, value);
      },
      `Select ${value} from ${selector}`
    );
  }

  /**
   * Take screenshot
   * @param {string} name Screenshot name
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async takeScreenshot(name) {
    const screenshotPath = `./screenshots/${name.replace(/[^a-z0-9]/gi, '_')}.png`;
    return await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }

  /**
   * Get current URL
   * @returns {Promise<string>} Current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getTitle() {
    return this.page.title();
  }
}

module.exports = BasePage;
