/**
 * Network monitoring helper for capturing API calls and debugging
 */

export class NetworkMonitor {
  constructor(page) {
    this.page = page;
    this.requests = [];
    this.responses = [];
    this.errors = [];
    this.isMonitoring = false;
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    console.log('Starting network monitoring...');
    this.isMonitoring = true;

    // Capture requests
    this.page.on('request', (request) => {
      const requestData = {
        timestamp: new Date().toISOString(),
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        resourceType: request.resourceType()
      };
      this.requests.push(requestData);
      
      if (requestData.url.includes('/api/') || requestData.method !== 'GET') {
        console.log(`📤 ${requestData.method} ${requestData.url}`);
        if (requestData.postData) {
          console.log(`   Data: ${requestData.postData.substring(0, 200)}...`);
        }
      }
    });

    // Capture responses
    this.page.on('response', (response) => {
      const responseData = {
        timestamp: new Date().toISOString(),
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        fromCache: response.fromCache(),
        request: {
          method: response.request().method(),
          url: response.request().url()
        }
      };
      this.responses.push(responseData);
      
      if (responseData.url.includes('/api/') || responseData.status >= 400) {
        const statusEmoji = responseData.status >= 400 ? '❌' : '✅';
        console.log(`${statusEmoji} ${responseData.status} ${responseData.url}`);
      }
    });

    // Capture failed requests
    this.page.on('requestfailed', (request) => {
      const errorData = {
        timestamp: new Date().toISOString(),
        url: request.url(),
        method: request.method(),
        failure: request.failure(),
        error: request.failure()?.errorText || 'Unknown error'
      };
      this.errors.push(errorData);
      console.log(`🚨 Request failed: ${errorData.method} ${errorData.url} - ${errorData.error}`);
    });
  }

  stopMonitoring() {
    console.log('Stopping network monitoring...');
    this.isMonitoring = false;
    this.page.removeAllListeners('request');
    this.page.removeAllListeners('response');
    this.page.removeAllListeners('requestfailed');
  }

  getEnrollmentRelatedRequests() {
    return this.requests.filter(req => 
      req.url.includes('enrollment') || 
      req.url.includes('agreement') ||
      req.url.includes('form') ||
      req.url.includes('save') ||
      req.url.includes('submit')
    );
  }

  getEnrollmentRelatedResponses() {
    return this.responses.filter(res => 
      res.url.includes('enrollment') || 
      res.url.includes('agreement') ||
      res.url.includes('form') ||
      res.url.includes('save') ||
      res.url.includes('submit')
    );
  }

  getFailedRequests() {
    return [
      ...this.errors,
      ...this.responses.filter(res => res.status >= 400)
    ];
  }

  async captureNetworkTraffic(actionName) {
    console.log(`\n📊 Network Traffic Summary for: ${actionName}`);
    console.log('=' .repeat(50));
    
    console.log(`\n📤 Requests (${this.requests.length}):`);
    this.requests.forEach((req, i) => {
      console.log(`${i + 1}. ${req.method} ${req.url}`);
      if (req.postData && req.postData.length < 500) {
        console.log(`   Data: ${req.postData}`);
      }
    });

    console.log(`\n📥 Responses (${this.responses.length}):`);
    this.responses.forEach((res, i) => {
      const status = res.status >= 400 ? `❌ ${res.status}` : `✅ ${res.status}`;
      console.log(`${i + 1}. ${status} ${res.url}`);
    });

    console.log(`\n🚨 Errors (${this.errors.length}):`);
    this.errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err.method} ${err.url} - ${err.error}`);
    });

    // Return structured data for analysis
    return {
      actionName,
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: this.requests.length,
        totalResponses: this.responses.length,
        totalErrors: this.errors.length,
        enrollmentRequests: this.getEnrollmentRelatedRequests().length,
        enrollmentResponses: this.getEnrollmentRelatedResponses().length,
        failedRequests: this.getFailedRequests().length
      },
      requests: this.requests,
      responses: this.responses,
      errors: this.errors,
      enrollmentData: {
        requests: this.getEnrollmentRelatedRequests(),
        responses: this.getEnrollmentRelatedResponses(),
        failures: this.getFailedRequests()
      }
    };
  }

  clear() {
    this.requests = [];
    this.responses = [];
    this.errors = [];
  }
}