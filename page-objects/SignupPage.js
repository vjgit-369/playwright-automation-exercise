/**
 * Signup form page object for AutomationExercise.com
 */
class SignupPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Account information selectors
    this.titleMrRadio = '#id_gender1';
    this.titleMrsRadio = '#id_gender2';
    this.passwordInput = '#password';
    this.daySelect = '#days';
    this.monthSelect = '#months';
    this.yearSelect = '#years';
    this.newsletterCheckbox = '#newsletter';
    this.specialOffersCheckbox = '#optin';
    
    // Address information selectors
    this.firstNameInput = '#first_name';
    this.lastNameInput = '#last_name';
    this.companyInput = '#company';
    this.address1Input = '#address1';
    this.address2Input = '#address2';
    this.countrySelect = '#country';
    this.stateInput = '#state';
    this.cityInput = '#city';
    this.zipcodeInput = '#zipcode';
    this.mobileNumberInput = '#mobile_number';
    
    // Form submission
    this.createAccountButton = 'button[data-qa="create-account"]';
    
    // Account created confirmation
    this.accountCreatedMessage = '[data-qa="account-created"], .title:text-matches("ACCOUNT CREATED!", "i")';
    this.continueButton = '[data-qa="continue-button"], .btn.btn-primary';
    this.accountCreatedTitle = 'h2.title';
  }

  /**
   * Fill account information section
   * @param {Object} userData User data object
   */
  async fillAccountInfo(userData) {
    // Select title
    await this.page.check(this.titleMrRadio);
    
    // Fill password
    await this.page.fill(this.passwordInput, userData.password);
    
    // Select date of birth
    await this.page.selectOption(this.daySelect, '15');
    await this.page.selectOption(this.monthSelect, '6');
    await this.page.selectOption(this.yearSelect, '1990');
    
    // Check newsletter and special offers
    await this.page.check(this.newsletterCheckbox);
    await this.page.check(this.specialOffersCheckbox);
  }

  /**
   * Fill address information section
   * @param {Object} userData User data object
   */
  async fillAddressInfo(userData) {
    await this.page.fill(this.firstNameInput, userData.firstName);
    await this.page.fill(this.lastNameInput, userData.lastName);
    await this.page.fill(this.companyInput, userData.company);
    await this.page.fill(this.address1Input, userData.address1);
    await this.page.fill(this.address2Input, userData.address2);
    await this.page.selectOption(this.countrySelect, userData.country);
    await this.page.fill(this.stateInput, userData.state);
    await this.page.fill(this.cityInput, userData.city);
    await this.page.fill(this.zipcodeInput, userData.zipcode);
    await this.page.fill(this.mobileNumberInput, userData.mobileNumber);
  }

  /**
   * Submit the signup form
   */
  async createAccount() {
    await this.page.click(this.createAccountButton);
  }

  /**
   * Check if account was created successfully
   * @returns {Promise<boolean>} True if account was created
   */
  async isAccountCreated() {
    try {
      // Wait for navigation after form submission
      await this.page.waitForURL('**/account_created**', { timeout: 15000 });
      console.log('Current URL:', this.page.url());

      // Wait for the title element and check its content
      const titleElement = await this.page.waitForSelector(this.accountCreatedTitle, {
        state: 'visible',
        timeout: 10000
      });

      if (titleElement) {
        const titleText = await titleElement.textContent();
        console.log('Account creation title:', titleText);
        
        // Screenshot for debugging
        await this.page.screenshot({ path: 'account-created-page.png' });
        
        // Return true if the title contains "ACCOUNT CREATED" (case insensitive)
        return titleText.toUpperCase().includes('ACCOUNT CREATED');
      }

      return false;
    } catch (error) {
      console.log('Error during account creation verification:', error.message);
      await this.page.screenshot({ path: 'account-creation-error.png' });
      return false;
    }
  }

  /**
   * Continue after account creation
   */
  async continueAfterCreation() {
    try {
      // Wait for the continue button and click it
      await this.page.waitForSelector(this.continueButton, {
        state: 'visible',
        timeout: 10000
      });
      
      await Promise.all([
        this.page.waitForLoadState('networkidle'),
        this.page.click(this.continueButton)
      ]);
      
      // Wait for navigation to complete
      await this.page.waitForLoadState('load');
    } catch (error) {
      console.log('Error during continue after creation:', error.message);
      throw error;
    }
  }

  /**
   * Continue after account creation
   */
  async continueAfterCreation() {
    await this.page.click(this.continueButton);
  }
}

module.exports = SignupPage;
