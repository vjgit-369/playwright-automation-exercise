/**
 * Network logger utility for tracking API requests and responses
 */
class NetworkLogger {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.requests = [];
    this.responses = [];
    this.setupListeners();
  }

  /**
   * Set up network event listeners
   * @private
   */
  setupListeners() {
    // Track requests
    this.page.on('request', request => {
      this.requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString(),
        resourceType: request.resourceType()
      });
    });

    // Track responses
    this.page.on('response', response => {
      const request = response.request();
      this.responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        method: request.method(),
        timestamp: new Date().toISOString(),
        resourceType: request.resourceType()
      });
    });
  }

  /**
   * Get all captured requests
   * @param {Object} options Filter options
   * @returns {Array} Filtered requests
   */
  getRequests(options = {}) {
    let filtered = [...this.requests];
    
    if (options.url) {
      filtered = filtered.filter(req => req.url.includes(options.url));
    }
    
    if (options.method) {
      filtered = filtered.filter(req => req.method === options.method);
    }
    
    if (options.resourceType) {
      filtered = filtered.filter(req => req.resourceType === options.resourceType);
    }
    
    return filtered;
  }

  /**
   * Get all captured responses
   * @param {Object} options Filter options
   * @returns {Array} Filtered responses
   */
  getResponses(options = {}) {
    let filtered = [...this.responses];
    
    if (options.url) {
      filtered = filtered.filter(res => res.url.includes(options.url));
    }
    
    if (options.status) {
      filtered = filtered.filter(res => res.status === options.status);
    }
    
    if (options.method) {
      filtered = filtered.filter(res => res.method === options.method);
    }
    
    if (options.resourceType) {
      filtered = filtered.filter(res => res.resourceType === options.resourceType);
    }
    
    return filtered;
  }

  /**
   * Wait for a specific API request
   * @param {string} urlPattern URL pattern to match
   * @param {Object} options Additional options
   * @returns {Promise<Object>} The captured request
   */
  async waitForRequest(urlPattern, options = {}) {
    return new Promise(resolve => {
      const checkExisting = () => {
        const existing = this.getRequests({ url: urlPattern, ...options });
        if (existing.length > 0) {
          return existing[0];
        }
        return null;
      };
      
      // Check if we already have the request
      const existing = checkExisting();
      if (existing) {
        resolve(existing);
        return;
      }
      
      // Set up listener for future request
      const listener = request => {
        if (request.url().includes(urlPattern)) {
          let match = true;
          
          if (options.method && request.method() !== options.method) {
            match = false;
          }
          
          if (options.resourceType && request.resourceType() !== options.resourceType) {
            match = false;
          }
          
          if (match) {
            this.page.removeListener('request', listener);
            resolve({
              url: request.url(),
              method: request.method(),
              headers: request.headers(),
              timestamp: new Date().toISOString(),
              resourceType: request.resourceType()
            });
          }
        }
      };
      
      this.page.on('request', listener);
    });
  }

  /**
   * Wait for a specific API response
   * @param {string} urlPattern URL pattern to match
   * @param {Object} options Additional options
   * @returns {Promise<Object>} The captured response
   */
  async waitForResponse(urlPattern, options = {}) {
    return new Promise(resolve => {
      const checkExisting = () => {
        const existing = this.getResponses({ url: urlPattern, ...options });
        if (existing.length > 0) {
          return existing[0];
        }
        return null;
      };
      
      // Check if we already have the response
      const existing = checkExisting();
      if (existing) {
        resolve(existing);
        return;
      }
      
      // Set up listener for future response
      const listener = response => {
        if (response.url().includes(urlPattern)) {
          let match = true;
          
          if (options.status && response.status() !== options.status) {
            match = false;
          }
          
          if (options.method && response.request().method() !== options.method) {
            match = false;
          }
          
          if (options.resourceType && response.request().resourceType() !== options.resourceType) {
            match = false;
          }
          
          if (match) {
            this.page.removeListener('response', listener);
            resolve({
              url: response.url(),
              status: response.status(),
              statusText: response.statusText(),
              headers: response.headers(),
              method: response.request().method(),
              timestamp: new Date().toISOString(),
              resourceType: response.request().resourceType()
            });
          }
        }
      };
      
      this.page.on('response', listener);
    });
  }

  /**
   * Clear all captured requests and responses
   */
  clear() {
    this.requests = [];
    this.responses = [];
  }
}

module.exports = NetworkLogger;
