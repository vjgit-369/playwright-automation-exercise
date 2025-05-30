/**
 * CI-specific test configuration for AutomationExercise.com tests
 * This configuration will override the base configuration when running in CI environment
 */
module.exports = {
  // CI-specific timeouts (longer to account for CI environment variability)
  timeouts: {
    defaultTimeout: 45000,
    navigationTimeout: 60000,
    elementTimeout: 30000,
    apiTimeout: 30000
  },
  
  // CI-specific retry settings
  retries: {
    testRetries: 3,
    elementRetries: 5
  },
  
  // Screenshot configuration for CI
  screenshots: {
    takeOnStep: true,
    takeOnFailure: true,
    fullPage: true
  },
  
  // Reporting configuration for CI
  reporting: {
    generateHtml: true,
    includeScreenshots: true,
    includeNetworkLogs: true,
    includePerformanceMetrics: true,
    uploadToArtifacts: true
  }
};
