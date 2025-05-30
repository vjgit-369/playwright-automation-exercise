/**
 * Test reporter utility for capturing screenshots and logging test steps
 */
const fs = require('fs');
const path = require('path');

class TestReporter {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} testName Name of the test for reporting
   */
  constructor(page, testName) {
    this.page = page;
    this.testName = testName;
    this.steps = [];
    this.screenshotCount = 0;
    this.startTime = Date.now();
    this.setupReportDir();
  }

  /**
   * Set up report directory structure
   * @private
   */
  setupReportDir() {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    this.reportDir = path.join(process.cwd(), 'test-results', `${this.testName}-${timestamp}`);
    this.screenshotDir = path.join(this.reportDir, 'screenshots');
    
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Log a test step with optional screenshot
   * @param {string} description Step description
   * @param {boolean} takeScreenshot Whether to take a screenshot
   * @param {Object} data Additional data to log
   */
  async logStep(description, takeScreenshot = false, data = {}) {
    const step = {
      step: this.steps.length + 1,
      description,
      timestamp: new Date().toISOString(),
      data
    };
    
    if (takeScreenshot) {
      step.screenshot = await this.captureScreenshot(description);
    }
    
    this.steps.push(step);
    console.log(`Step ${step.step}: ${description}`);
  }

  /**
   * Capture a screenshot
   * @param {string} name Screenshot name
   * @returns {Promise<string>} Screenshot path
   */
  async captureScreenshot(name) {
    this.screenshotCount++;
    const fileName = `${this.screenshotCount}-${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    const filePath = path.join(this.screenshotDir, fileName);
    
    await this.page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  /**
   * Log performance metrics
   */
  async logPerformanceMetrics() {
    try {
      // Get client-side metrics
      const metrics = await this.page.evaluate(() => {
        const perfEntries = performance.getEntriesByType('navigation');
        if (perfEntries.length > 0) {
          const navigationEntry = perfEntries[0];
          return {
            domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
            load: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
            domInteractive: navigationEntry.domInteractive - navigationEntry.startTime,
            firstPaint: navigationEntry.responseEnd - navigationEntry.requestStart,
            totalDuration: navigationEntry.duration
          };
        }
        return null;
      });
      
      this.steps.push({
        step: 'Performance Metrics',
        timestamp: new Date().toISOString(),
        data: metrics || { note: 'Performance metrics not available' }
      });
    } catch (error) {
      console.error('Error capturing performance metrics:', error);
    }
  }

  /**
   * Generate and save final test report
   */
  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const report = {
      testName: this.testName,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: `${(duration / 1000).toFixed(2)} seconds`,
      steps: this.steps,
      screenshots: this.screenshotCount
    };
    
    const reportPath = path.join(this.reportDir, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport(report);
    const htmlReportPath = path.join(this.reportDir, 'report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    console.log(`Test report generated: ${reportPath}`);
    console.log(`HTML report generated: ${htmlReportPath}`);
    
    return {
      reportPath,
      htmlReportPath,
      report
    };
  }

  /**
   * Generate HTML report from JSON data
   * @private
   * @param {Object} reportData Report data
   * @returns {string} HTML report
   */
  generateHtmlReport(reportData) {
    const screenshotHtml = reportData.steps
      .filter(step => step.screenshot)
      .map(step => {
        const screenshotRelativePath = path.relative(this.reportDir, step.screenshot);
        return `
          <div class="screenshot-container">
            <h3>Step ${step.step}: ${step.description}</h3>
            <p>Timestamp: ${step.timestamp}</p>
            <img src="${screenshotRelativePath}" alt="Step ${step.step}" />
            ${step.data && Object.keys(step.data).length > 0 ? 
              `<pre>${JSON.stringify(step.data, null, 2)}</pre>` : ''}
          </div>
        `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportData.testName} - Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h1 { color: #333; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .summary p { margin: 5px 0; }
          .steps { margin-bottom: 30px; }
          .step { margin-bottom: 10px; padding: 10px; background: #f9f9f9; border-left: 4px solid #ddd; }
          .screenshot-container { margin: 20px 0; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .screenshot-container img { max-width: 100%; border: 1px solid #eee; }
          pre { background: #f0f0f0; padding: 10px; border-radius: 3px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>${reportData.testName} - Test Report</h1>
        
        <div class="summary">
          <p><strong>Start Time:</strong> ${reportData.startTime}</p>
          <p><strong>End Time:</strong> ${reportData.endTime}</p>
          <p><strong>Duration:</strong> ${reportData.duration}</p>
          <p><strong>Total Steps:</strong> ${reportData.steps.length}</p>
          <p><strong>Screenshots:</strong> ${reportData.screenshots}</p>
        </div>
        
        <h2>Test Steps</h2>
        <div class="steps">
          ${reportData.steps.map(step => `
            <div class="step">
              <p><strong>Step ${step.step}:</strong> ${step.description}</p>
              <p><small>Timestamp: ${step.timestamp}</small></p>
              ${step.data && Object.keys(step.data).length > 0 ? 
                `<pre>${JSON.stringify(step.data, null, 2)}</pre>` : ''}
            </div>
          `).join('')}
        </div>
        
        <h2>Screenshots</h2>
        ${screenshotHtml}
      </body>
      </html>
    `;
  }
}

module.exports = TestReporter;
