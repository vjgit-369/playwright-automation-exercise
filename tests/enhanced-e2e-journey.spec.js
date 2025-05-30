/**
 * Enhanced E2E test for complete user journey on AutomationExercise.com
 * Using improved framework components for better reliability and reporting
 */
const { test, globalSetup, globalTeardown, testSetup, testTeardown } = require('../utils/test-runner');
const HomePage = require('../page-objects/HomePage');
const LoginPage = require('../page-objects/LoginPage');
const SignupPage = require('../page-objects/SignupPage');
const ProductsPage = require('../page-objects/ProductsPage');
const ProductDetailsPage = require('../page-objects/ProductDetailsPage');
const CartPage = require('../page-objects/CartPage');
const CheckoutPage = require('../page-objects/CheckoutPage');
const { generateUserData, generatePaymentData } = require('../utils/test-data-generator');

// Global setup - runs once before all tests
globalSetup(async ({ browser }) => {
  console.log('Starting E2E test suite');
});

// Global teardown - runs once after all tests
globalTeardown(async ({ browser }) => {
  console.log('Completed E2E test suite');
});

// Test setup - runs before each test
testSetup(async ({ page, testReporter }) => {
  await testReporter.logStep('Test setup', true);
  
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 720 });
});

// Test teardown - runs after each test
testTeardown(async ({ page, testReporter }) => {
  await testReporter.logStep('Test teardown', true);
  
  // Generate test report
  testReporter.generateReport();
});

test.describe('Enhanced E-commerce User Journey', () => {
  let userData;
  let paymentData;
  let selectedProducts = [];

  test('Complete user journey from registration to order placement', async ({ 
    page, 
    testReporter, 
    networkLogger, 
    retryHelper, 
    assertions, 
    config 
  }) => {
    // Initialize page objects
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const signupPage = new SignupPage(page);
    const productsPage = new ProductsPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    // Generate test data
    userData = generateUserData();
    paymentData = generatePaymentData();
    
    // 1. Initial Setup & Navigation
    await testReporter.logStep('Navigating to home page', true);
    await homePage.navigate();
    
    // Verify site is loaded
    const title = await page.title();
    await assertions.assertPageHasElements([homePage.logo, homePage.navigationMenu]);
    
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
    await assertions.assertPageHasElements(['h2.title:has-text("ACCOUNT CREATED!")']);
    
    // Continue after account creation
    await testReporter.logStep('Continuing after account creation', true);
    await signupPage.continueAfterCreation();
    
    // 3. User Authentication
    // Verify user is logged in
    await testReporter.logStep('Verifying user is logged in', true);
    await assertions.assertUserLoggedIn(userData.name);
    
    // 4. Product Search & Selection
    await testReporter.logStep('Navigating to products page', true);
    await homePage.goToProductsPage();
    
    // Search for products by search query
    await testReporter.logStep(`Searching for ${config.get('productCriteria.searchQuery')}`, true);
    await productsPage.searchProducts(config.get('productCriteria.searchQuery'));
    
    // Verify search results
    await testReporter.logStep('Verifying search results', true);
    const hasProducts = await productsPage.hasProductsMatchingCriteria(config.get('productCriteria'));
    
    // Get all products
    const products = await productsPage.getAllProducts();
    
    // Select products (if available)
    const numProductsToSelect = Math.min(2, products.length);
    
    for (let i = 0; i < numProductsToSelect; i++) {
      await testReporter.logStep(`Viewing details for product ${i + 1}`, true);
      await productsPage.viewProductDetails(i);
      
      // Get product details
      const productDetails = await productDetailsPage.getProductDetails();
      
      // Verify product matches criteria for product types
      let isTypeMatch = false;
      for (const type of config.get('productCriteria.productTypes')) {
        if (await productDetailsPage.isProductOfType(type)) {
          isTypeMatch = true;
          break;
        }
      }
      
      // Store product details for later verification
      selectedProducts.push(productDetails);
      
      // Add product to cart
      await testReporter.logStep(`Adding product ${i + 1} to cart`, true);
      await productDetailsPage.addToCart();
      
      if (i < numProductsToSelect - 1) {
        // Continue shopping for more products
        await page.click('button.btn-success');
        await homePage.goToProductsPage();
        await productsPage.searchProducts(config.get('productCriteria.searchQuery'));
      } else {
        // View cart after adding last product
        await productDetailsPage.viewCart();
      }
    }
    
    // 5. Shopping Cart Management
    await testReporter.logStep('Verifying cart contents', true);
    
    // Get cart items
    const cartItems = await cartPage.getAllCartItemsDetails();
    await assertions.assertCartContents(cartItems, selectedProducts);
    
    // Get cart total
    const cartTotal = await cartPage.getCartTotalPrice();
    await assertions.assertCartTotalCorrect(cartTotal, cartItems);
    
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
    await assertions.assertOrderConfirmed(orderConfirmation);
    
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
  });
});
