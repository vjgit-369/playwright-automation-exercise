/**
 * Test configuration and data for AutomationExercise.com tests
 */
module.exports = {
  // Base URL for the application
  baseUrl: 'https://www.automationexercise.com',
  
  // Test timeouts
  timeouts: {
    defaultTimeout: 30000,
    navigationTimeout: 45000,
    elementTimeout: 15000,
    apiTimeout: 20000
  },
  
  // Test retries
  retries: {
    testRetries: 2,
    elementRetries: 3
  },
  
  // Product search criteria
  productCriteria: {
    searchQuery: 'Sleeves Top and Short',
    productTypes: ['top', 'short'],
    minPrice: 0,
    maxPrice: 1000
  },
  
  // Test account cleanup
  cleanup: {
    deleteTestAccounts: true,
    preserveOrderData: true
  },
  
  // Screenshot configuration
  screenshots: {
    takeOnStep: true,
    takeOnFailure: true,
    fullPage: true
  },
  
  // Reporting configuration
  reporting: {
    generateHtml: true,
    includeScreenshots: true,
    includeNetworkLogs: true,
    includePerformanceMetrics: true
  }
};
