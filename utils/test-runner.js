/**
 * Test runner utility for enhanced test execution and reporting
 */
const { test: baseTest } = require('@playwright/test');
const TestReporter = require('./test-reporter');
const NetworkLogger = require('./network-logger');
const RetryHelper = require('./retry-helper');
const CustomAssertions = require('./custom-assertions');
const configManager = require('./config-manager');

/**
 * Enhanced test function with additional utilities
 */
const test = baseTest.extend({
  /**
   * Test reporter for capturing screenshots and logging test steps
   */
  testReporter: async ({ page }, use, testInfo) => {
    const testReporter = new TestReporter(page, testInfo.title);
    await use(testReporter);
  },
  
  /**
   * Network logger for tracking API requests and responses
   */
  networkLogger: async ({ page }, use) => {
    const networkLogger = new NetworkLogger(page);
    await use(networkLogger);
  },
  
  /**
   * Retry helper for handling flaky elements and actions
   */
  retryHelper: async ({}, use) => {
    const retryHelper = new RetryHelper(
      configManager.get('retries.elementRetries', 3),
      1000
    );
    await use(retryHelper);
  },
  
  /**
   * Custom assertions for e-commerce specific validations
   */
  assertions: async ({ page }, use) => {
    const assertions = new CustomAssertions(page);
    await use(assertions);
  },
  
  /**
   * Configuration manager for handling environment-specific settings
   */
  config: async ({}, use) => {
    await use(configManager);
  },
  
  /**
   * Enhanced page with additional utilities
   */
  page: async ({ page }, use) => {
    // Set default timeout from config
    page.setDefaultTimeout(configManager.get('timeouts.defaultTimeout', 30000));
    
    // Set default navigation timeout from config
    page.setDefaultNavigationTimeout(configManager.get('timeouts.navigationTimeout', 45000));
    
    // Add helper to capture screenshot with timestamp
    page.captureScreenshot = async (name) => {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const screenshotPath = `./screenshots/${name}-${timestamp}.png`;
      return await page.screenshot({ path: screenshotPath, fullPage: true });
    };
    
    // Add helper to get all cookies
    page.getAllCookies = async () => {
      return await page.context().cookies();
    };
    
    // Add helper to clear cookies
    page.clearCookies = async () => {
      await page.context().clearCookies();
    };
    
    await use(page);
  }
});

/**
 * Setup function to run before all tests
 * @param {Function} fn Setup function
 */
const globalSetup = (fn) => {
  test.beforeAll(async ({ browser }) => {
    await fn({ browser });
  });
};

/**
 * Teardown function to run after all tests
 * @param {Function} fn Teardown function
 */
const globalTeardown = (fn) => {
  test.afterAll(async ({ browser }) => {
    await fn({ browser });
  });
};

/**
 * Setup function to run before each test
 * @param {Function} fn Setup function
 */
const testSetup = (fn) => {
  test.beforeEach(async ({ page, testReporter }) => {
    await fn({ page, testReporter });
  });
};

/**
 * Teardown function to run after each test
 * @param {Function} fn Teardown function
 */
const testTeardown = (fn) => {
  test.afterEach(async ({ page, testReporter }) => {
    await fn({ page, testReporter });
  });
};

module.exports = {
  test,
  globalSetup,
  globalTeardown,
  testSetup,
  testTeardown
};
