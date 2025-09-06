/**
 * Authentication helper functions for Playwright tests
 */

export class AuthHelper {
  constructor(page) {
    this.page = page;
  }

  async login(email = 'goddard01arjava@gmail.com', password = 'Admin0001') {
    console.log(`Attempting to login with email: ${email}`);
    
    // Wait for login form to be visible
    await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    
    // Fill in credentials
    const emailInput = await this.page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(email);
    
    const passwordInput = await this.page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(password);
    
    // Submit form
    const submitButton = await this.page.locator('button[type="submit"], button:has-text("Log In"), button:has-text("Sign In")').first();
    await submitButton.click();
    
    // Wait for successful login (redirect or dashboard visible)
    await this.page.waitForURL(/dashboard|parent-dashboard/, { timeout: 30000 });
    
    console.log('Login successful');
  }

  async navigateToParentDashboard(userId = 'logeshwari.arjava@gmail.com') {
    const url = `/parent-dashboard?id=${encodeURIComponent(userId)}`;
    console.log(`Navigating to: ${url}`);
    await this.page.goto(url);
    
    // Wait for page to load
    await this.page.waitForLoadState('networkidle');
  }

  async handleAuth0Login() {
    try {
      // Check if we're redirected to Auth0
      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('auth0.com') || currentUrl.includes('login')) {
        console.log('Auth0 login detected, filling credentials...');
        
        // Wait for Auth0 login form
        await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 15000 });
        
        // Fill Auth0 credentials
        await this.page.fill('input[type="email"], input[name="email"]', 'goddard01arjava@gmail.com');
        await this.page.fill('input[type="password"], input[name="password"]', 'Admin0001');
        
        // Submit Auth0 form
        await this.page.click('button[type="submit"], button[name="submit"]');
        
        // Wait for redirect back to app
        await this.page.waitForURL(/localhost:5174/, { timeout: 30000 });
        console.log('Auth0 login completed');
      }
    } catch (error) {
      console.log('Auth0 login not required or failed:', error.message);
    }
  }
}