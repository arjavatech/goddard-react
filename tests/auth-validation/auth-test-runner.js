#!/usr/bin/env node

/**
 * Authentication Test Runner
 * Comprehensive test execution and reporting for authentication flow
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AuthTestRunner {
  constructor() {
    this.results = {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      },
      suites: [],
      errors: [],
      performance: {}
    };
    
    this.config = {
      testTimeout: 30000,
      maxRetries: 2,
      parallel: false,
      coverage: true,
      verbose: true
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Authentication Flow Validation Tests\n');
    
    const startTime = Date.now();
    
    try {
      await this.runPreTestValidation();
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.runPerformanceTests();
      await this.runManualTestValidation();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      process.exit(1);
    }
    
    const endTime = Date.now();
    this.results.summary.duration = endTime - startTime;
    
    await this.displaySummary();
  }

  async runPreTestValidation() {
    console.log('📋 Running Pre-Test Validation...');
    
    const validations = [
      () => this.validateEnvironmentVariables(),
      () => this.validateTestDependencies(),
      () => this.validateTestEnvironment()
    ];

    for (const validation of validations) {
      try {
        await validation();
        console.log('  ✅ Validation passed');
      } catch (error) {
        console.error('  ❌ Validation failed:', error.message);
        throw error;
      }
    }
  }

  validateEnvironmentVariables() {
    const requiredVars = [
      'REACT_APP_AUTH0_DOMAIN',
      'REACT_APP_AUTH0_CLIENT_ID',
      'REACT_APP_AUTH0_AUDIENCE'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate format
    const domain = process.env.REACT_APP_AUTH0_DOMAIN;
    if (!domain.includes('.auth0.com')) {
      throw new Error('Invalid Auth0 domain format');
    }

    const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
    if (!audience.startsWith('https://')) {
      throw new Error('Invalid Auth0 audience format');
    }
  }

  validateTestDependencies() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'jest'
    ];

    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );

    if (missingDeps.length > 0) {
      throw new Error(`Missing test dependencies: ${missingDeps.join(', ')}`);
    }
  }

  validateTestEnvironment() {
    // Check if test files exist
    const testFiles = [
      'tests/auth-validation/auth-flow-validation.js',
      'tests/integration/complete-auth-integration.test.js',
      'tests/performance/auth-performance-tests.js'
    ];

    const missingFiles = testFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing test files: ${missingFiles.join(', ')}`);
    }
  }

  async runUnitTests() {
    console.log('\n🧪 Running Unit Tests...');
    
    try {
      const output = execSync(
        'npm test -- --testPathPattern=auth-flow-validation --watchAll=false --coverage=false --verbose',
        { 
          encoding: 'utf8',
          timeout: this.config.testTimeout 
        }
      );
      
      this.parseTestOutput('Unit Tests', output);
      console.log('  ✅ Unit tests completed');
    } catch (error) {
      console.error('  ❌ Unit tests failed');
      this.results.errors.push({
        suite: 'Unit Tests',
        error: error.message,
        output: error.stdout
      });
    }
  }

  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...');
    
    try {
      const output = execSync(
        'npm test -- --testPathPattern=complete-auth-integration --watchAll=false --coverage=false --verbose',
        { 
          encoding: 'utf8',
          timeout: this.config.testTimeout * 2 // Integration tests take longer
        }
      );
      
      this.parseTestOutput('Integration Tests', output);
      console.log('  ✅ Integration tests completed');
    } catch (error) {
      console.error('  ❌ Integration tests failed');
      this.results.errors.push({
        suite: 'Integration Tests',
        error: error.message,
        output: error.stdout
      });
    }
  }

  async runPerformanceTests() {
    console.log('\n⚡ Running Performance Tests...');
    
    try {
      const output = execSync(
        'npm test -- --testPathPattern=auth-performance-tests --watchAll=false --coverage=false --verbose',
        { 
          encoding: 'utf8',
          timeout: this.config.testTimeout 
        }
      );
      
      this.parseTestOutput('Performance Tests', output);
      this.parsePerformanceMetrics(output);
      console.log('  ✅ Performance tests completed');
    } catch (error) {
      console.error('  ❌ Performance tests failed');
      this.results.errors.push({
        suite: 'Performance Tests',
        error: error.message,
        output: error.stdout
      });
    }
  }

  async runManualTestValidation() {
    console.log('\n📝 Validating Manual Test Checklist...');
    
    const manualTestFile = 'tests/auth-validation/manual-testing-guide.md';
    
    if (!fs.existsSync(manualTestFile)) {
      console.error('  ❌ Manual testing guide not found');
      return;
    }

    const content = fs.readFileSync(manualTestFile, 'utf8');
    
    // Check for required sections
    const requiredSections = [
      'Pre-Testing Setup',
      'Testing Scenarios',
      'Console Monitoring',
      'Troubleshooting'
    ];

    const missingSections = requiredSections.filter(section => 
      !content.includes(section)
    );

    if (missingSections.length > 0) {
      console.error(`  ❌ Missing manual test sections: ${missingSections.join(', ')}`);
    } else {
      console.log('  ✅ Manual testing guide validated');
    }
  }

  parseTestOutput(suiteName, output) {
    // Simple test output parsing
    const lines = output.split('\n');
    
    const suite = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    let currentTest = null;
    
    for (const line of lines) {
      // Jest test results parsing
      if (line.includes('✓') || line.includes('PASS')) {
        suite.passed++;
      } else if (line.includes('✕') || line.includes('FAIL')) {
        suite.failed++;
      }
      
      // Extract timing if available
      const timeMatch = line.match(/Time:\s*(\d+\.?\d*)\s*s/);
      if (timeMatch) {
        suite.duration = parseFloat(timeMatch[1]) * 1000; // Convert to ms
      }
    }

    this.results.suites.push(suite);
    this.results.summary.total += suite.passed + suite.failed;
    this.results.summary.passed += suite.passed;
    this.results.summary.failed += suite.failed;
  }

  parsePerformanceMetrics(output) {
    // Extract performance metrics from test output
    const metrics = {};
    
    const lines = output.split('\n');
    for (const line of lines) {
      // Look for timing information
      const tokenMatch = line.match(/Token acquisition.*?(\d+)ms/);
      if (tokenMatch) {
        metrics.tokenAcquisition = parseInt(tokenMatch[1]);
      }
      
      const permissionMatch = line.match(/Permission check.*?(\d+)ms/);
      if (permissionMatch) {
        metrics.permissionCheck = parseInt(permissionMatch[1]);
      }
      
      const fullFlowMatch = line.match(/Full auth flow.*?(\d+)ms/);
      if (fullFlowMatch) {
        metrics.fullAuthFlow = parseInt(fullFlowMatch[1]);
      }
    }

    this.results.performance = metrics;
  }

  async generateReport() {
    console.log('\n📊 Generating Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        auth0Domain: process.env.REACT_APP_AUTH0_DOMAIN,
        testTimeout: this.config.testTimeout
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(__dirname, '../../reports/auth-test-report.json');
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    await this.generateHTMLReport(report);
    
    console.log(`  ✅ Report generated: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Performance recommendations
    if (this.results.performance.tokenAcquisition > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Token acquisition time exceeds 1 second. Consider optimizing Auth0 configuration.'
      });
    }

    if (this.results.performance.fullAuthFlow > 3000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Full authentication flow exceeds 3 seconds. Review implementation for bottlenecks.'
      });
    }

    // Test coverage recommendations
    const passRate = (this.results.summary.passed / this.results.summary.total) * 100;
    if (passRate < 95) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        message: `Test pass rate is ${passRate.toFixed(1)}%. Aim for >95% pass rate.`
      });
    }

    // Error analysis
    if (this.results.errors.length > 0) {
      recommendations.push({
        type: 'stability',
        priority: 'critical',
        message: `${this.results.errors.length} test suite(s) failed. Review error details.`
      });
    }

    return recommendations;
  }

  async generateHTMLReport(report) {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Authentication Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; flex: 1; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .performance { background: #e9ecef; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .recommendations { margin: 20px 0; }
        .recommendation { padding: 10px; margin: 10px 0; border-left: 4px solid #007bff; background: #f8f9fa; }
        .critical { border-left-color: #dc3545; }
        .high { border-left-color: #fd7e14; }
        .medium { border-left-color: #ffc107; }
        .error-details { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Authentication Flow Test Report</h1>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <p><strong>Environment:</strong> ${report.environment.platform} ${report.environment.nodeVersion}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.results.summary.total}</div>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <div style="font-size: 2em; font-weight: bold;" class="passed">${report.results.summary.passed}</div>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <div style="font-size: 2em; font-weight: bold;" class="failed">${report.results.summary.failed}</div>
        </div>
        <div class="metric">
            <h3>Duration</h3>
            <div style="font-size: 2em; font-weight: bold;">${(report.results.summary.duration / 1000).toFixed(1)}s</div>
        </div>
    </div>

    <div class="performance">
        <h3>Performance Metrics</h3>
        ${Object.entries(report.results.performance).map(([key, value]) => 
          `<p><strong>${key}:</strong> ${value}ms</p>`
        ).join('')}
    </div>

    <div class="recommendations">
        <h3>Recommendations</h3>
        ${report.recommendations.map(rec => 
          `<div class="recommendation ${rec.priority}">
            <strong>${rec.type.toUpperCase()}:</strong> ${rec.message}
          </div>`
        ).join('')}
    </div>

    ${report.results.errors.length > 0 ? `
    <div class="errors">
        <h3>Error Details</h3>
        ${report.results.errors.map(error => 
          `<div class="error-details">
            <h4>${error.suite}</h4>
            <pre>${error.error}</pre>
          </div>`
        ).join('')}
    </div>
    ` : ''}
</body>
</html>
    `;

    const htmlPath = path.join(__dirname, '../../reports/auth-test-report.html');
    fs.writeFileSync(htmlPath, htmlTemplate);
  }

  async displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 AUTHENTICATION TEST SUMMARY');
    console.log('='.repeat(60));
    
    const { summary } = this.results;
    const passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
    
    console.log(`Total Tests:     ${summary.total}`);
    console.log(`Passed:          ${summary.passed} (${passRate.toFixed(1)}%)`);
    console.log(`Failed:          ${summary.failed}`);
    console.log(`Duration:        ${(summary.duration / 1000).toFixed(1)}s`);
    
    if (Object.keys(this.results.performance).length > 0) {
      console.log('\nPerformance Metrics:');
      Object.entries(this.results.performance).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}ms`);
      });
    }

    if (this.results.errors.length > 0) {
      console.log('\n❌ Test Failures:');
      this.results.errors.forEach(error => {
        console.log(`  ${error.suite}: ${error.error}`);
      });
    }

    const overallStatus = summary.failed === 0 ? 'PASSED' : 'FAILED';
    const statusEmoji = overallStatus === 'PASSED' ? '✅' : '❌';
    
    console.log(`\n${statusEmoji} Overall Status: ${overallStatus}`);
    
    if (overallStatus === 'PASSED') {
      console.log('\n🎉 Authentication flow validation completed successfully!');
      console.log('✅ System is ready for production deployment');
    } else {
      console.log('\n🔧 Authentication flow requires fixes before deployment');
      console.log('📋 Review test report for detailed error information');
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const runner = new AuthTestRunner();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
Auth Test Runner Usage:
  node auth-test-runner.js [options]

Options:
  --help          Show this help message
  --verbose       Enable verbose output
  --no-coverage   Disable coverage reporting
  --parallel      Run tests in parallel
  --timeout=ms    Set test timeout (default: 30000)

Examples:
  node auth-test-runner.js
  node auth-test-runner.js --verbose --timeout=60000
    `);
    process.exit(0);
  }

  if (args.includes('--verbose')) {
    runner.config.verbose = true;
  }

  if (args.includes('--no-coverage')) {
    runner.config.coverage = false;
  }

  if (args.includes('--parallel')) {
    runner.config.parallel = true;
  }

  const timeoutArg = args.find(arg => arg.startsWith('--timeout='));
  if (timeoutArg) {
    runner.config.testTimeout = parseInt(timeoutArg.split('=')[1]);
  }

  runner.runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = AuthTestRunner;