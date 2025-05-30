/**
 * Login/Signup page object for AutomationExercise.com
 */
class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Login form selectors
    this.loginEmailInput = 'input[data-qa="login-email"]';
    this.loginPasswordInput = 'input[data-qa="login-password"]';
    this.loginButton = 'button[data-qa="login-button"]';
    
    // Signup form selectors
    this.signupNameInput = 'input[data-qa="signup-name"]';
    this.signupEmailInput = 'input[data-qa="signup-email"]';
    this.signupButton = 'button[data-qa="signup-button"]';
    
    // Error messages
    this.loginErrorMessage = 'p[style*="color: red"]';
  }

  /**
   * Fill login form and submit
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    await this.page.fill(this.loginEmailInput, email);
    await this.page.fill(this.loginPasswordInput, password);
    await this.page.click(this.loginButton);
  }

  /**
   * Fill signup form and submit
   * @param {string} name 
   * @param {string} email 
   */
  async signup(name, email) {
    await this.page.fill(this.signupNameInput, name);
    await this.page.fill(this.signupEmailInput, email);
    await this.page.click(this.signupButton);
  }

  /**
   * Get login error message if present
   * @returns {Promise<string|null>} Error message or null
   */
  async getLoginErrorMessage() {
    if (await this.page.isVisible(this.loginErrorMessage)) {
      return await this.page.textContent(this.loginErrorMessage);
    }
    return null;
  }
}

module.exports = LoginPage;
