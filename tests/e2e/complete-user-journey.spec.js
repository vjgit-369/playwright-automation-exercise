const { test, expect } = require('@playwright/test');
const HomePage = require('../../page-objects/HomePage');
const LoginPage = require('../../page-objects/LoginPage');
const SignupPage = require('../../page-objects/SignupPage');
const ProductsPage = require('../../page-objects/ProductsPage');
const CartPage = require('../../page-objects/CartPage');
const CheckoutPage = require('../../page-objects/CheckoutPage');
const { generateUserData, generatePaymentData } = require('../../utils/test-data-generator');

test.describe('Complete User Journey', () => {
  let userData;
  let paymentData;

  test('End-to-end shopping flow', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const signupPage = new SignupPage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Generate test data
    userData = generateUserData();
    paymentData = generatePaymentData();

    // Start test execution
    test.setTimeout(120000); // 2 minutes for the complete flow

    // 1. Navigate to home page and verify
    await test.step('Navigate to home page', async () => {
      await homePage.navigate();
      await expect(page).toHaveURL(/.*automationexercise.com/);
    });    // 2. User Registration
    await test.step('Complete user registration', async () => {
      await homePage.goToLoginPage();
      
      // Take screenshot before signup
      await page.screenshot({ path: 'before-signup.png' });
      
      await loginPage.signup(userData.name, userData.email);
      
      // Fill signup form with retries for stability
      await test.step('Fill signup form', async () => {
        try {
          await signupPage.fillAccountInfo(userData);
          await signupPage.fillAddressInfo(userData);
          
          // Take screenshot before submitting
          await page.screenshot({ path: 'before-submit.png' });
          
          await signupPage.createAccount();
        } catch (error) {
          console.log('Error during form fill:', error.message);
          throw error;
        }
      });
      
      // Verify account creation with detailed logging
      await test.step('Verify account creation', async () => {
        // Take screenshot after submit
        await page.screenshot({ path: 'after-submit.png' });
        
        const isCreated = await signupPage.isAccountCreated();
        expect(isCreated, 'Account creation verification failed').toBeTruthy();
        
        await signupPage.continueAfterCreation();
        
        // Verify login state with retry
        let retries = 3;
        let isLoggedIn = false;
        while (retries > 0 && !isLoggedIn) {
          isLoggedIn = await homePage.isUserLoggedIn();
          if (!isLoggedIn) {
            await page.waitForTimeout(1000);
            retries--;
          }
        }
        expect(isLoggedIn, 'Login state verification failed').toBeTruthy();
      });
    });

    // 3. Product Search and Selection
    await test.step('Search and select products', async () => {
      await homePage.goToProductsPage();
      
      // Search for Babyhug products
      await productsPage.searchProducts('Babyhug');
      
      // Take screenshot of search results
      await page.screenshot({ path: 'search-results.png' });
      
      // Add products to cart
      const products = await productsPage.getAllProducts();
      expect(products.length).toBeGreaterThan(0);
      
      // Add first product to cart
      await productsPage.addProductToCart(0);
      await productsPage.continueShopping();
      
      // Optionally add second product if available
      if (products.length > 1) {
        await productsPage.addProductToCart(1);
        await productsPage.continueShopping();
      }
    });

    // 4. Shopping Cart Review
    await test.step('Review shopping cart', async () => {
      await homePage.goToCartPage();
      
      // Verify cart contents
      const cartItems = await cartPage.getAllCartItems();
      expect(cartItems.length).toBeGreaterThan(0);
      
      // Get and verify cart details
      const cartDetails = await cartPage.getAllCartItemsDetails();
      expect(cartDetails).toBeDefined();
      
      // Take screenshot of cart
      await page.screenshot({ path: 'shopping-cart.png' });
    });

    // 5. Checkout Process
    await test.step('Complete checkout process', async () => {
      await cartPage.proceedToCheckout();
      
      // Review addresses
      const deliveryAddress = await checkoutPage.getDeliveryAddress();
      const billingAddress = await checkoutPage.getBillingAddress();
      
      expect(deliveryAddress).toBeDefined();
      expect(billingAddress).toBeDefined();
      
      // Review order details
      const orderReview = await checkoutPage.getOrderReviewDetails();
      expect(orderReview.items.length).toBeGreaterThan(0);
      
      // Fill payment details
      await checkoutPage.fillPaymentDetails(paymentData);
      
      // Place order
      await checkoutPage.placeOrder();
    });

    // 6. Order Confirmation
    await test.step('Verify order confirmation', async () => {
      // Get order confirmation details
      const confirmation = await checkoutPage.getOrderConfirmation();
      expect(confirmation.success).toBeTruthy();
      
      // Download invoice if available
      await checkoutPage.downloadInvoice();
      
      // Take screenshot of confirmation
      await page.screenshot({ path: 'order-confirmation.png' });
      
      // Continue shopping
      await checkoutPage.continueShopping();
    });

    // 7. Final Verification
    await test.step('Verify logged in state', async () => {
      const username = await homePage.getLoggedInUsername();
      expect(username).toBe(userData.name);
    });
  });
});
