/**
 * E2E test for complete user journey on AutomationExercise.com
 * From registration to order completion
 */
const { test, expect } = require('@playwright/test');
const HomePage = require('../page-objects/HomePage');
const LoginPage = require('../page-objects/LoginPage');
const SignupPage = require('../page-objects/SignupPage');
const ProductsPage = require('../page-objects/ProductsPage');
const ProductDetailsPage = require('../page-objects/ProductDetailsPage');
const CartPage = require('../page-objects/CartPage');
const CheckoutPage = require('../page-objects/CheckoutPage');
const TestReporter = require('../utils/test-reporter');
const NetworkLogger = require('../utils/network-logger');
const { generateUserData, generatePaymentData } = require('../utils/test-data-generator');
const testConfig = require('../test-data/test-config');

test.describe('Complete E-commerce User Journey', () => {
  let homePage;
  let loginPage;
  let signupPage;
  let productsPage;
  let productDetailsPage;
  let cartPage;
  let checkoutPage;
  let testReporter;
  let networkLogger;
  let userData;
  let paymentData;
  let selectedProducts = [];

  // Test for the complete user journey
  test('User completes full journey from registration to order placement', async ({ page }) => {
    // Initialize page objects and utilities
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    signupPage = new SignupPage(page);
    productsPage = new ProductsPage(page);
    productDetailsPage = new ProductDetailsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    testReporter = new TestReporter(page, 'E2E-User-Journey');
    networkLogger = new NetworkLogger(page);
    
    // Generate test data
    userData = generateUserData();
    paymentData = generatePaymentData();
    
    // Set longer timeouts for stability
    page.setDefaultTimeout(testConfig.timeouts.defaultTimeout);
    page.setDefaultNavigationTimeout(testConfig.timeouts.navigationTimeout);
    
    // Configure viewport and user agent
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 1. Initial Setup & Navigation
    await testReporter.logStep('Navigating to home page', true);
    await homePage.navigate();
    
    // Verify site is loaded
    await expect(page).toHaveTitle(/Automation Exercise/);
    
    // 2. User Registration Flow
    await testReporter.logStep('Navigating to login/signup page', true);
    await homePage.goToLoginPage();
    
    await testReporter.logStep('Filling signup form with generated credentials', true, {
      name: userData.name,
      email: userData.email
    });
    await loginPage.signup(userData.name, userData.email);
    
    // Fill account creation form
    await testReporter.logStep('Filling account information', true);
    await signupPage.fillAccountInfo(userData);
    
    await testReporter.logStep('Filling address information', true);
    await signupPage.fillAddressInfo(userData);
    
    // Create account
    await testReporter.logStep('Creating account', true);
    await signupPage.createAccount();
    
    // Verify account creation
    await testReporter.logStep('Verifying account creation', true);
    const isAccountCreated = await signupPage.isAccountCreated();
    expect(isAccountCreated).toBeTruthy();
    
    // Continue after account creation
    await testReporter.logStep('Continuing after account creation', true);
    await signupPage.continueAfterCreation();
    
    // 3. User Authentication
    // Verify user is logged in
    await testReporter.logStep('Verifying user is logged in', true);
    const isLoggedIn = await homePage.isUserLoggedIn();
    expect(isLoggedIn).toBeTruthy();
    
    const loggedInUsername = await homePage.getLoggedInUsername();
    expect(loggedInUsername).toContain(userData.name);
    
    // 4. Product Search & Selection
    await testReporter.logStep('Navigating to products page', true);
    await homePage.goToProductsPage();
    
    // Search for products by search query
    await testReporter.logStep(`Searching for ${testConfig.productCriteria.searchQuery}`, true);
    await productsPage.searchProducts(testConfig.productCriteria.searchQuery);
    
    // Verify search results
    await testReporter.logStep('Verifying search results', true);
    const hasProducts = await productsPage.hasProductsMatchingCriteria(testConfig.productCriteria);
    expect(hasProducts).toBeTruthy();
    
    // Get all products
    const products = await productsPage.getAllProducts();
    expect(products.length).toBeGreaterThan(0);
    
    // Select first two products (if available)
    const numProductsToSelect = Math.min(2, products.length);
    
    for (let i = 0; i < numProductsToSelect; i++) {
      await testReporter.logStep(`Viewing details for product ${i + 1}`, true);
      await productsPage.viewProductDetails(i);
      
      // Get product details
      const productDetails = await productDetailsPage.getProductDetails();
      
      // Verify product matches criteria for product types
      let isTypeMatch = false;
      for (const type of testConfig.productCriteria.productTypes) {
        if (await productDetailsPage.isProductOfType(type)) {
          isTypeMatch = true;
          break;
        }
      }
      expect(isTypeMatch).toBeTruthy();
      
      // Store product details for later verification
      selectedProducts.push(productDetails);
      
      // Add product to cart
      await testReporter.logStep(`Adding product ${i + 1} to cart`, true);
      await productDetailsPage.addToCart();
      
      if (i < numProductsToSelect - 1) {
        // Continue shopping for more products
        await page.click('button.btn-success');
        await homePage.goToProductsPage();
        await productsPage.searchProducts(testConfig.productCriteria.brand);
      } else {
        // View cart after adding last product
        await productDetailsPage.viewCart();
      }
    }
    
    // 5. Shopping Cart Management
    await testReporter.logStep('Verifying cart contents', true);
    
    // Get cart items
    const cartItems = await cartPage.getAllCartItemsDetails();
    expect(cartItems.length).toBe(selectedProducts.length);
    
    // Verify cart contents match selected products
    for (let i = 0; i < cartItems.length; i++) {
      expect(cartItems[i].name).toContain(selectedProducts[i].name);
      expect(cartItems[i].price).toBe(selectedProducts[i].price);
    }
    
    // Get cart total
    const cartTotal = await cartPage.getCartTotalPrice();
    
    // Calculate expected total
    const expectedTotal = selectedProducts.reduce((total, product) => {
      return total + parseInt(product.price);
    }, 0).toString();
    
    expect(cartTotal).toBe(expectedTotal);
    
    // 6. Checkout & Order Placement
    await testReporter.logStep('Proceeding to checkout', true);
    await cartPage.proceedToCheckout();
    
    // Review address details
    await testReporter.logStep('Reviewing delivery address', true);
    const deliveryAddress = await checkoutPage.getDeliveryAddress();
    
    // Review order
    await testReporter.logStep('Reviewing order', true);
    const orderDetails = await checkoutPage.getOrderReviewDetails();
    
    // Add comment and place order
    await testReporter.logStep('Adding order comment', true);
    await checkoutPage.addComment('Please deliver during business hours.');
    
    await testReporter.logStep('Proceeding to payment', true);
    await checkoutPage.proceedToPayment();
    
    // Fill payment details
    await testReporter.logStep('Filling payment information', true, {
      cardType: 'Credit Card',
      nameOnCard: paymentData.nameOnCard
    });
    await checkoutPage.fillPaymentInfo(paymentData);
    
    // Place order
    await testReporter.logStep('Placing order', true);
    await checkoutPage.placeOrder();
    
    // 7. Order Verification
    await testReporter.logStep('Verifying order confirmation', true);
    const orderConfirmation = await checkoutPage.getOrderConfirmation();
    expect(orderConfirmation.success).toBeTruthy();
    
    // Download invoice if available
    await testReporter.logStep('Downloading invoice', true);
    await checkoutPage.downloadInvoice();
    
    // Continue shopping
    await testReporter.logStep('Continuing after order placement', true);
    await checkoutPage.continueShopping();
    
    // Logout
    await testReporter.logStep('Logging out', true);
    await homePage.logout();
    
    // Log performance metrics
    await testReporter.logPerformanceMetrics();
    
    // Generate final test report
    const report = testReporter.generateReport();
    console.log(`Test completed successfully. Report available at: ${report.htmlReportPath}`);
  });
});
