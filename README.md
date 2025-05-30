# Playwright E2E Test Automation for AutomationExercise.com

This project implements a comprehensive end-to-end test automation suite for AutomationExercise.com using Playwright with MCP server integration. The test suite automates a complete e-commerce user journey from registration to order completion.

[![Playwright Tests](https://github.com/username/playwright-automation-exercise/actions/workflows/playwright.yml/badge.svg)](https://github.com/username/playwright-automation-exercise/actions/workflows/playwright.yml)

## Project Structure

```
playwright-automation-exercise/
├── page-objects/         # Page Object Models
│   ├── HomePage.js
│   ├── LoginPage.js
│   ├── SignupPage.js
│   ├── ProductsPage.js
│   ├── ProductDetailsPage.js
│   ├── CartPage.js
│   └── CheckoutPage.js
├── test-data/            # Test data and configuration
│   └── test-config.js
├── tests/                # Test scripts
│   └── e2e-user-journey.spec.js
├── utils/                # Utility functions
│   ├── test-data-generator.js
│   ├── network-logger.js
│   └── test-reporter.js
├── playwright.config.js  # Playwright configuration
└── package.json          # Project dependencies
```

## Features

- **Complete E2E Testing**: Automates the entire user journey from registration to order completion
- **Page Object Model**: Well-structured code using the Page Object pattern for maintainability
- **Dynamic Test Data**: Generates unique test data for each test run
- **Network Monitoring**: Captures and validates API requests and responses
- **Comprehensive Reporting**: Generates detailed HTML reports with screenshots
- **Performance Metrics**: Captures and reports performance metrics
- **Error Handling**: Implements retry mechanisms and proper error handling

## Test Flow

1. **Initial Setup & Configuration**
   - Initializes browser context with appropriate viewport and user agent
   - Sets up test data generation for unique user credentials
   - Configures screenshot capture for key verification points

2. **User Registration Flow**
   - Navigates to login/signup page
   - Generates dynamic test data for registration
   - Fills and submits registration form
   - Verifies successful account creation

3. **User Authentication**
   - Uses created credentials to login
   - Verifies successful login

4. **Product Search & Selection**
   - Navigates to Products page
   - Searches for "Babyhug" brand products
   - Verifies product availability and details
   - Selects specific products

5. **Shopping Cart Management**
   - Adds selected products to cart
   - Verifies cart contents and pricing
   - Calculates and validates total amount

6. **Checkout & Order Placement**
   - Proceeds to checkout
   - Reviews shipping information
   - Fills payment details
   - Places order

7. **Order Verification**
   - Captures and verifies order confirmation
   - Downloads invoice
   - Completes the user journey

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Running Tests

To run the tests in headless mode:

```bash
npm test
```

To run the tests in headed mode (with browser UI):

```bash
npm run test:headed
```

To view the HTML report after test execution:

```bash
npm run report
```

## Test Reports

Test reports are generated in the `test-results` directory. Each test run creates a new directory with:

- JSON report with detailed test data
- HTML report with screenshots and step details
- Screenshots captured during test execution

## Configuration

Test configuration can be modified in `test-data/test-config.js` to adjust:

- Timeouts and retry settings
- Product search criteria
- Screenshot and reporting options
- Test account cleanup settings

## Error Handling & Resilience

The framework implements:

- Retry mechanisms for flaky elements
- Explicit waits for dynamic content loading
- Detailed error logging for debugging
- Fallback strategies for element selection

## MCP Server Integration

The framework is designed to work with MCP servers for:

- Test data generation and management
- Email verification services
- Payment processing simulation
- Order status tracking
- External API validations

## CI/CD Integration

This project includes configuration for multiple CI/CD platforms to enable automated testing in various environments.

### GitHub Actions

The GitHub Actions workflow is configured in `.github/workflows/playwright.yml` and includes:

- Parallel test execution across multiple browsers (Chromium, Firefox)
- Test categorization (E2E, Smoke)
- Daily scheduled runs
- Artifact storage for test reports and screenshots

To use GitHub Actions:
1. Push your code to GitHub
2. Tests will run automatically on push to main/master branches
3. View results in the Actions tab of your repository

### Docker

The project includes Docker configuration for containerized test execution:

```bash
# Run tests in Docker
docker-compose up playwright-tests

# Run the report UI
docker-compose up playwright-ui
```

### Jenkins

A Jenkinsfile is provided for teams using Jenkins as their CI/CD platform. It includes:

- Docker-based execution
- Parallel test execution across browsers
- HTML report publishing

### Azure DevOps

The `azure-pipelines.yml` file configures test execution in Azure DevOps with:

- Matrix strategy for browser/test combinations
- Test result publishing
- Artifact storage

### CircleCI

The `.circleci/config.yml` file configures test execution in CircleCI with:

- Matrix jobs for different browser/test combinations
- Scheduled nightly runs
- Artifact storage
