/**
 * Configuration manager for handling environment-specific settings
 */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

class ConfigManager {
  constructor() {
    this.config = {};
    this.loadEnvVariables();
    this.loadTestConfig();
  }

  /**
   * Load environment variables from .env file
   * @private
   */
  loadEnvVariables() {
    // Load .env file if it exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
    
    // Set environment
    this.environment = process.env.TEST_ENV || 'production';
  }

  /**
   * Load test configuration based on environment
   * @private
   */
  loadTestConfig() {
    // Load base config
    const baseConfig = require('../test-data/test-config');
    this.config = { ...baseConfig };
    
    // Load environment-specific config if exists
    try {
      const envConfigPath = path.join(process.cwd(), 'test-data', `test-config.${this.environment}.js`);
      if (fs.existsSync(envConfigPath)) {
        const envConfig = require(envConfigPath);
        this.config = this.mergeConfigs(this.config, envConfig);
      }
    } catch (error) {
      console.warn(`Could not load environment config: ${error.message}`);
    }
    
    // Override with environment variables
    this.overrideWithEnvVars();
  }

  /**
   * Merge configuration objects
   * @private
   * @param {Object} base Base configuration
   * @param {Object} override Override configuration
   * @returns {Object} Merged configuration
   */
  mergeConfigs(base, override) {
    const result = { ...base };
    
    for (const key in override) {
      if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
        result[key] = this.mergeConfigs(result[key] || {}, override[key]);
      } else {
        result[key] = override[key];
      }
    }
    
    return result;
  }

  /**
   * Override configuration with environment variables
   * @private
   */
  overrideWithEnvVars() {
    // Example: TEST_TIMEOUT=30000 overrides config.timeouts.defaultTimeout
    for (const key in process.env) {
      if (key.startsWith('TEST_')) {
        const configKey = key.replace('TEST_', '').toLowerCase();
        
        if (configKey === 'baseurl') {
          this.config.baseUrl = process.env[key];
        } else if (configKey === 'timeout') {
          this.config.timeouts.defaultTimeout = parseInt(process.env[key]);
        }
        // Add more mappings as needed
      }
    }
  }

  /**
   * Get configuration value
   * @param {string} key Configuration key (dot notation supported)
   * @param {any} defaultValue Default value if key not found
   * @returns {any} Configuration value
   */
  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value === undefined || value === null) {
        return defaultValue;
      }
      value = value[k];
    }
    
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get all configuration
   * @returns {Object} Complete configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Get current environment
   * @returns {string} Current environment
   */
  getEnvironment() {
    return this.environment;
  }
}

module.exports = new ConfigManager();
