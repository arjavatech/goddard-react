import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.js';
import { NetworkMonitor } from '../helpers/network-monitor.js';

test.describe('Enrollment Agreement Debug', () => {
  let authHelper;
  let networkMonitor;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    networkMonitor = new NetworkMonitor(page);
    
    // Start network monitoring
    await networkMonitor.startMonitoring();
  });

  test.afterEach(async () => {
    // Stop monitoring and generate report
    const report = await networkMonitor.captureNetworkTraffic('Test Complete');
    console.log('\n📋 Final Network Report:', JSON.stringify(report.summary, null, 2));
    networkMonitor.stopMonitoring();
  });

  test('Navigate to parent dashboard and authenticate', async ({ page }) => {
    console.log('🚀 Starting navigation and authentication test...');
    
    // Step 1: Navigate to parent dashboard
    await authHelper.navigateToParentDashboard('logeshwari.arjava@gmail.com');
    await networkMonitor.captureNetworkTraffic('Initial Navigation');

    // Step 2: Handle authentication if required
    await authHelper.handleAuth0Login();
    
    // Try direct login if still on login page
    const currentUrl = page.url();
    if (currentUrl.includes('login') || !currentUrl.includes('parent-dashboard')) {
      console.log('Still on login page, attempting direct login...');
      await authHelper.login();
    }

    await networkMonitor.captureNetworkTraffic('After Authentication');

    // Step 3: Verify we're on the dashboard
    await expect(page).toHaveURL(/parent-dashboard/);
    
    // Take screenshot for reference
    await page.screenshot({ path: 'test-results/01-dashboard-loaded.png', fullPage: true });
    
    console.log('✅ Successfully navigated to parent dashboard');
  });

  test('Find and interact with anush K user', async ({ page }) => {
    console.log('🔍 Starting user search and interaction test...');
    
    // Navigate and authenticate first
    await authHelper.navigateToParentDashboard('logeshwari.arjava@gmail.com');
    await authHelper.handleAuth0Login();
    
    const currentUrl = page.url();
    if (currentUrl.includes('login') || !currentUrl.includes('parent-dashboard')) {
      await authHelper.login();
    }

    await page.waitForLoadState('networkidle');
    await networkMonitor.captureNetworkTraffic('Dashboard Loaded');

    // Look for anush K user in various possible locations
    console.log('🔍 Searching for "anush K" user...');
    
    // Wait a bit for dynamic content to load
    await page.waitForTimeout(2000);
    
    // Try different selectors to find the user
    const possibleSelectors = [
      'text=anush K',
      'text=anush',
      '[data-testid*="user"]',
      '.user-card',
      '.child-card',
      '.student-card',
      'div:has-text("anush")',
      'button:has-text("anush")',
      'a:has-text("anush")'
    ];

    let userElement = null;
    let foundSelector = null;

    for (const selector of possibleSelectors) {
      try {
        console.log(`Trying selector: ${selector}`);
        await page.waitForSelector(selector, { timeout: 3000 });
        userElement = page.locator(selector).first();
        const isVisible = await userElement.isVisible();
        if (isVisible) {
          foundSelector = selector;
          console.log(`✅ Found user with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Selector ${selector} not found:`, error.message);
      }
    }

    // If not found, let's see what's actually on the page
    if (!userElement || !foundSelector) {
      console.log('🔍 User not found with standard selectors, analyzing page content...');
      
      // Get page content for analysis
      const pageText = await page.textContent('body');
      console.log('Page text includes "anush":', pageText.toLowerCase().includes('anush'));
      
      // Get all text elements to see what users are available
      const allText = await page.locator('body *').evaluateAll(elements => 
        elements
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 2 && text.length < 100)
          .slice(0, 50) // Limit output
      );
      
      console.log('Available text elements:', allText);
      
      // Take a screenshot to see the current state
      await page.screenshot({ path: 'test-results/02-user-search.png', fullPage: true });
      
      // Try to find any user-like elements
      const userElements = await page.locator('[class*="user"], [class*="child"], [class*="student"], [data-testid*="user"]').count();
      console.log(`Found ${userElements} potential user elements`);
      
      if (userElements > 0) {
        userElement = page.locator('[class*="user"], [class*="child"], [class*="student"], [data-testid*="user"]').first();
        foundSelector = 'generic user element';
      }
    }

    await networkMonitor.captureNetworkTraffic('User Search Complete');

    if (userElement && foundSelector) {
      console.log(`✅ Found user element with: ${foundSelector}`);
      
      // Try to interact with the user element
      try {
        await userElement.click();
        console.log('✅ Successfully clicked on user element');
        
        await page.waitForTimeout(1000);
        await networkMonitor.captureNetworkTraffic('After User Click');
        
        // Take screenshot after interaction
        await page.screenshot({ path: 'test-results/03-after-user-click.png', fullPage: true });
        
      } catch (error) {
        console.log('❌ Error clicking user element:', error.message);
      }
    } else {
      console.log('❌ Could not find anush K user on the page');
      throw new Error('User "anush K" not found on dashboard');
    }
  });

  test('Test enrollment agreement form submission', async ({ page }) => {
    console.log('📝 Starting enrollment agreement form test...');
    
    // Navigate and authenticate
    await authHelper.navigateToParentDashboard('logeshwari.arjava@gmail.com');
    await authHelper.handleAuth0Login();
    
    const currentUrl = page.url();
    if (currentUrl.includes('login') || !currentUrl.includes('parent-dashboard')) {
      await authHelper.login();
    }

    await page.waitForLoadState('networkidle');
    
    // Try to find and click on user first
    try {
      const userElement = await page.locator('text=anush K, [data-testid*="user"], .user-card, .child-card').first();
      if (await userElement.isVisible()) {
        await userElement.click();
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('User element not found, continuing with form search...');
    }

    await networkMonitor.captureNetworkTraffic('Before Form Search');

    // Look for enrollment agreement form or related elements
    console.log('🔍 Searching for enrollment agreement form...');
    
    const formSelectors = [
      'text=enrollment agreement',
      'text=Enrollment Agreement',
      'form[action*="enrollment"]',
      'form[action*="agreement"]',
      '[data-testid*="enrollment"]',
      '[data-testid*="agreement"]',
      'button:has-text("Save")',
      'button:has-text("Submit")',
      'button:has-text("Agreement")',
      'input[type="checkbox"]',
      'textarea',
      'form'
    ];

    let formElement = null;
    let formSelector = null;

    for (const selector of formSelectors) {
      try {
        console.log(`Checking for form selector: ${selector}`);
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          formElement = element;
          formSelector = selector;
          console.log(`✅ Found form element with: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`Selector ${selector} not found or not visible`);
      }
    }

    // Take screenshot of current page state
    await page.screenshot({ path: 'test-results/04-form-search.png', fullPage: true });

    if (formElement) {
      console.log(`📝 Found form with selector: ${formSelector}`);
      
      // Try to interact with form elements
      try {
        // Look for checkboxes to check
        const checkboxes = await page.locator('input[type="checkbox"]').count();
        console.log(`Found ${checkboxes} checkboxes`);
        
        if (checkboxes > 0) {
          // Check all checkboxes
          for (let i = 0; i < Math.min(checkboxes, 10); i++) {
            try {
              await page.locator('input[type="checkbox"]').nth(i).check();
              console.log(`✅ Checked checkbox ${i + 1}`);
            } catch (error) {
              console.log(`❌ Could not check checkbox ${i + 1}:`, error.message);
            }
          }
        }

        // Look for text areas to fill
        const textareas = await page.locator('textarea').count();
        console.log(`Found ${textareas} textareas`);
        
        if (textareas > 0) {
          try {
            await page.locator('textarea').first().fill('Test enrollment agreement data - Playwright automated test');
            console.log('✅ Filled textarea');
          } catch (error) {
            console.log('❌ Could not fill textarea:', error.message);
          }
        }

        await networkMonitor.captureNetworkTraffic('After Form Fill');

        // Look for save/submit button
        const saveButtons = [
          'button:has-text("Save")',
          'button:has-text("Submit")',
          'button:has-text("Save Agreement")',
          'button[type="submit"]',
          'input[type="submit"]'
        ];

        let saveButton = null;
        for (const buttonSelector of saveButtons) {
          try {
            const button = page.locator(buttonSelector).first();
            if (await button.isVisible({ timeout: 1000 })) {
              saveButton = button;
              console.log(`✅ Found save button: ${buttonSelector}`);
              break;
            }
          } catch (error) {
            console.log(`Save button ${buttonSelector} not found`);
          }
        }

        if (saveButton) {
          console.log('🎯 Attempting to save enrollment agreement...');
          
          // Clear previous network data to focus on save operation
          networkMonitor.clear();
          
          // Click save and monitor network traffic
          await saveButton.click();
          console.log('✅ Clicked save button');

          // Wait a bit for network requests to complete
          await page.waitForTimeout(3000);
          
          // Capture network traffic from the save operation
          const saveReport = await networkMonitor.captureNetworkTraffic('Save Agreement Operation');
          
          // Take screenshot after save attempt
          await page.screenshot({ path: 'test-results/05-after-save.png', fullPage: true });
          
          // Check for any success/error messages
          try {
            const successMessage = await page.locator('text=success, text=saved, .success, .alert-success').first().textContent({ timeout: 2000 });
            console.log('✅ Success message found:', successMessage);
          } catch (error) {
            console.log('No success message found');
          }

          try {
            const errorMessage = await page.locator('text=error, text=failed, .error, .alert-error, .alert-danger').first().textContent({ timeout: 2000 });
            console.log('❌ Error message found:', errorMessage);
          } catch (error) {
            console.log('No error message found');
          }

          // Log the enrollment-related network activity
          console.log('\n🎯 ENROLLMENT AGREEMENT SAVE ANALYSIS');
          console.log('=' .repeat(60));
          console.log('Save Report Summary:', JSON.stringify(saveReport.summary, null, 2));
          
          if (saveReport.enrollmentData.requests.length > 0) {
            console.log('\n📤 Enrollment-related requests:');
            saveReport.enrollmentData.requests.forEach((req, i) => {
              console.log(`${i + 1}. ${req.method} ${req.url}`);
              if (req.postData) {
                console.log(`   Data: ${req.postData.substring(0, 300)}...`);
              }
            });
          }

          if (saveReport.enrollmentData.responses.length > 0) {
            console.log('\n📥 Enrollment-related responses:');
            saveReport.enrollmentData.responses.forEach((res, i) => {
              console.log(`${i + 1}. ${res.status} ${res.url}`);
            });
          }

          if (saveReport.enrollmentData.failures.length > 0) {
            console.log('\n🚨 Failed enrollment-related requests:');
            saveReport.enrollmentData.failures.forEach((fail, i) => {
              console.log(`${i + 1}. ${fail.method || 'RESPONSE'} ${fail.url} - ${fail.error || `Status: ${fail.status}`}`);
            });
          } else {
            console.log('\n✅ No failed enrollment-related requests detected');
          }

        } else {
          console.log('❌ No save button found');
          throw new Error('Save button not found for enrollment agreement');
        }

      } catch (error) {
        console.log('❌ Error interacting with form:', error.message);
        await page.screenshot({ path: 'test-results/06-form-error.png', fullPage: true });
        throw error;
      }

    } else {
      console.log('❌ No enrollment agreement form found');
      
      // Get all forms on page for debugging
      const allForms = await page.locator('form').count();
      console.log(`Found ${allForms} total forms on page`);
      
      if (allForms > 0) {
        for (let i = 0; i < Math.min(allForms, 5); i++) {
          const formHTML = await page.locator('form').nth(i).innerHTML();
          console.log(`Form ${i + 1}:`, formHTML.substring(0, 200) + '...');
        }
      }
      
      throw new Error('Enrollment agreement form not found');
    }
  });

  test('Comprehensive network debugging session', async ({ page }) => {
    console.log('🔬 Starting comprehensive debugging session...');
    
    // Start with fresh monitoring
    networkMonitor.clear();
    
    try {
      // Step 1: Navigate to parent dashboard
      console.log('\n🚀 Step 1: Initial Navigation');
      await authHelper.navigateToParentDashboard('logeshwari.arjava@gmail.com');
      await page.waitForTimeout(2000);
      const step1Report = await networkMonitor.captureNetworkTraffic('Step 1: Navigation');
      
      // Step 2: Handle authentication
      console.log('\n🔐 Step 2: Authentication');
      await authHelper.handleAuth0Login();
      const currentUrl = page.url();
      if (currentUrl.includes('login') || !currentUrl.includes('parent-dashboard')) {
        await authHelper.login();
      }
      await page.waitForTimeout(2000);
      const step2Report = await networkMonitor.captureNetworkTraffic('Step 2: Authentication');
      
      // Step 3: Wait for dashboard to fully load
      console.log('\n⏳ Step 3: Dashboard Loading');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      const step3Report = await networkMonitor.captureNetworkTraffic('Step 3: Dashboard Load');
      
      // Step 4: Look for user elements
      console.log('\n👤 Step 4: User Search');
      const pageContent = await page.content();
      const hasAnush = pageContent.toLowerCase().includes('anush');
      console.log(`Page contains "anush": ${hasAnush}`);
      
      // Try to find and click user
      try {
        const userSelectors = ['text=anush', '[data-testid*="user"]', '.user-card', '.child-card'];
        for (const selector of userSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              await element.click();
              console.log(`✅ Clicked user element: ${selector}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
      } catch (error) {
        console.log('Could not find/click user element');
      }
      
      await page.waitForTimeout(2000);
      const step4Report = await networkMonitor.captureNetworkTraffic('Step 4: User Interaction');
      
      // Step 5: Look for any forms
      console.log('\n📝 Step 5: Form Detection');
      const forms = await page.locator('form').count();
      const buttons = await page.locator('button').count();
      const inputs = await page.locator('input').count();
      
      console.log(`Found: ${forms} forms, ${buttons} buttons, ${inputs} inputs`);
      
      // Try to interact with any form elements
      if (forms > 0 || buttons > 0) {
        try {
          // Fill any visible text inputs
          const textInputs = await page.locator('input[type="text"], input[type="email"], textarea').count();
          if (textInputs > 0) {
            await page.locator('input[type="text"], input[type="email"], textarea').first().fill('test data');
            console.log('✅ Filled form input');
          }

          // Check any checkboxes
          const checkboxes = await page.locator('input[type="checkbox"]').count();
          if (checkboxes > 0) {
            await page.locator('input[type="checkbox"]').first().check();
            console.log('✅ Checked checkbox');
          }

          // Try to click a save/submit button
          const actionButtons = await page.locator('button:has-text("Save"), button:has-text("Submit"), button[type="submit"]').count();
          if (actionButtons > 0) {
            console.log('🎯 Attempting form submission...');
            await page.locator('button:has-text("Save"), button:has-text("Submit"), button[type="submit"]').first().click();
            
            // Wait for any network requests
            await page.waitForTimeout(5000);
          }
        } catch (error) {
          console.log('Error with form interaction:', error.message);
        }
      }
      
      const step5Report = await networkMonitor.captureNetworkTraffic('Step 5: Form Interaction');
      
      // Final comprehensive report
      console.log('\n📊 COMPREHENSIVE DEBUGGING REPORT');
      console.log('=' .repeat(70));
      
      const allReports = [step1Report, step2Report, step3Report, step4Report, step5Report];
      
      allReports.forEach((report, index) => {
        console.log(`\n📋 ${report.actionName}:`);
        console.log(`   Requests: ${report.summary.totalRequests}`);
        console.log(`   Responses: ${report.summary.totalResponses}`);
        console.log(`   Errors: ${report.summary.totalErrors}`);
        console.log(`   Enrollment Related: ${report.summary.enrollmentRequests} requests, ${report.summary.enrollmentResponses} responses`);
      });
      
      // Save detailed report to file
      const detailedReport = {
        timestamp: new Date().toISOString(),
        testType: 'Comprehensive Network Debugging',
        steps: allReports,
        summary: {
          totalSteps: allReports.length,
          totalRequests: allReports.reduce((sum, r) => sum + r.summary.totalRequests, 0),
          totalResponses: allReports.reduce((sum, r) => sum + r.summary.totalResponses, 0),
          totalErrors: allReports.reduce((sum, r) => sum + r.summary.totalErrors, 0),
          enrollmentRequests: allReports.reduce((sum, r) => sum + r.summary.enrollmentRequests, 0),
          enrollmentResponses: allReports.reduce((sum, r) => sum + r.summary.enrollmentResponses, 0)
        }
      };
      
      // Write report to file
      await page.evaluate((report) => {
        console.log('='.repeat(50));
        console.log('FINAL DEBUGGING REPORT');
        console.log('='.repeat(50));
        console.log(JSON.stringify(report, null, 2));
      }, detailedReport);
      
      // Take final screenshot
      await page.screenshot({ path: 'test-results/07-final-state.png', fullPage: true });
      
    } catch (error) {
      console.log('❌ Debugging session error:', error.message);
      await page.screenshot({ path: 'test-results/08-debug-error.png', fullPage: true });
      throw error;
    }
  });
});