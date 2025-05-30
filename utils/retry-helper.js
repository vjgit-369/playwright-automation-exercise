/**
 * Retry helper utility for handling flaky elements and actions
 */
class RetryHelper {
  /**
   * @param {number} maxRetries Maximum number of retry attempts
   * @param {number} retryInterval Interval between retries in milliseconds
   */
  constructor(maxRetries = 3, retryInterval = 1000) {
    this.maxRetries = maxRetries;
    this.retryInterval = retryInterval;
  }

  /**
   * Execute an async function with retry logic
   * @param {Function} fn Function to execute
   * @param {string} actionName Name of the action for logging
   * @param {Object} options Additional options
   * @returns {Promise<any>} Result of the function
   */
  async retry(fn, actionName, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt}/${this.maxRetries} failed for ${actionName}: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          console.log(`Retrying in ${this.retryInterval}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryInterval));
          
          // Increase wait time for subsequent retries
          this.retryInterval *= 1.5;
        }
      }
    }
    
    throw new Error(`All ${this.maxRetries} attempts failed for ${actionName}: ${lastError.message}`);
  }

  /**
   * Wait for a condition to be true with retry logic
   * @param {Function} conditionFn Function that returns a boolean or Promise<boolean>
   * @param {string} conditionName Name of the condition for logging
   * @param {Object} options Additional options
   * @returns {Promise<boolean>} True if condition was met
   */
  async waitForCondition(conditionFn, conditionName, options = {}) {
    const timeout = options.timeout || 30000;
    const interval = options.interval || 500;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await conditionFn();
        if (result) {
          return true;
        }
      } catch (error) {
        console.log(`Error checking condition ${conditionName}: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Timeout waiting for condition: ${conditionName}`);
  }

  /**
   * Execute an action with fallback strategies
   * @param {Array<Function>} strategies Array of strategy functions to try
   * @param {string} actionName Name of the action for logging
   * @returns {Promise<any>} Result of the successful strategy
   */
  async tryStrategies(strategies, actionName) {
    let lastError;
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        return await strategies[i]();
      } catch (error) {
        lastError = error;
        console.log(`Strategy ${i + 1}/${strategies.length} failed for ${actionName}: ${error.message}`);
      }
    }
    
    throw new Error(`All strategies failed for ${actionName}: ${lastError.message}`);
  }
}

module.exports = RetryHelper;
