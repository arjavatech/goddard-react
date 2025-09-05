#!/usr/bin/env node

/**
 * API Diagnostics CLI Tool
 * 
 * Usage:
 *   node scripts/api-diagnostics.js
 *   node scripts/api-diagnostics.js --token "your-auth0-token"
 *   node scripts/api-diagnostics.js --endpoint "custom-endpoint"
 *   node scripts/api-diagnostics.js --quick
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const API_BASE_URL = 'https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev';
const DEFAULT_ENDPOINT = `${API_BASE_URL}/sign_in/check/1`;

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    token: null,
    endpoint: DEFAULT_ENDPOINT,
    quick: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--token':
      case '-t':
        options.token = args[i + 1];
        i++;
        break;
      case '--endpoint':
      case '-e':
        options.endpoint = args[i + 1];
        i++;
        break;
      case '--quick':
      case '-q':
        options.quick = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
${colors.bright}API Diagnostics CLI Tool${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node scripts/api-diagnostics.js [options]

${colors.cyan}Options:${colors.reset}
  -t, --token <token>      Auth0 JWT token for authenticated requests
  -e, --endpoint <url>     Custom API endpoint to test (default: permission check)
  -q, --quick             Run quick diagnostics only
  -v, --verbose           Enable verbose output
  -h, --help              Show this help message

${colors.cyan}Examples:${colors.reset}
  node scripts/api-diagnostics.js
  node scripts/api-diagnostics.js --token "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
  node scripts/api-diagnostics.js --endpoint "https://api.example.com/test"
  node scripts/api-diagnostics.js --quick --verbose
`);
}

/**
 * Make HTTP request using Node.js built-in modules
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const startTime = Date.now();
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Diagnostics-CLI/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = data;
        }

        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data: parsedData,
          responseTime
        });
      });
    });

    req.on('error', (error) => {
      reject({
        error: error.message,
        code: error.code,
        responseTime: Date.now() - startTime
      });
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Test basic endpoint accessibility
 */
async function testBasicAccess(endpoint, verbose = false) {
  console.log(`${colors.blue}🔍 Testing basic endpoint accessibility...${colors.reset}`);
  
  try {
    const result = await makeRequest(endpoint, {
      method: 'POST',
      body: { email: 'test@test.com', auth0_user: true }
    });

    const success = result.statusCode === 200 || result.statusCode === 401;
    
    console.log(`${success ? colors.green + '✅' : colors.red + '❌'} Basic Access: ${success ? 'ACCESSIBLE' : 'FAILED'}${colors.reset}`);
    console.log(`   Status: ${result.statusCode} ${result.statusMessage}`);
    console.log(`   Response Time: ${result.responseTime}ms`);
    
    if (result.statusCode === 401) {
      console.log(`${colors.yellow}   ℹ️  Authentication required (expected)${colors.reset}`);
    }

    if (verbose) {
      console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
      console.log(`   Headers: ${JSON.stringify(result.headers, null, 2)}`);
    }

    return { success, statusCode: result.statusCode, responseTime: result.responseTime };
    
  } catch (error) {
    console.log(`${colors.red}❌ Basic Access: FAILED${colors.reset}`);
    console.log(`   Error: ${error.error}`);
    console.log(`   Code: ${error.code}`);
    
    if (verbose) {
      console.log(`   Full Error: ${JSON.stringify(error, null, 2)}`);
    }

    return { success: false, error: error.error };
  }
}

/**
 * Test CORS configuration
 */
async function testCORS(endpoint, verbose = false) {
  console.log(`${colors.blue}🌐 Testing CORS configuration...${colors.reset}`);
  
  try {
    const result = await makeRequest(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });

    const corsEnabled = !!(result.headers['access-control-allow-origin'] || 
                          result.headers['access-control-allow-methods']);
    
    console.log(`${corsEnabled ? colors.green + '✅' : colors.red + '❌'} CORS: ${corsEnabled ? 'ENABLED' : 'DISABLED'}${colors.reset}`);
    console.log(`   Status: ${result.statusCode} ${result.statusMessage}`);
    console.log(`   Response Time: ${result.responseTime}ms`);
    
    if (corsEnabled) {
      console.log(`   Allow-Origin: ${result.headers['access-control-allow-origin'] || 'Not set'}`);
      console.log(`   Allow-Methods: ${result.headers['access-control-allow-methods'] || 'Not set'}`);
      console.log(`   Allow-Headers: ${result.headers['access-control-allow-headers'] || 'Not set'}`);
      console.log(`   Allow-Credentials: ${result.headers['access-control-allow-credentials'] || 'Not set'}`);
    }

    if (verbose) {
      console.log(`   All Headers: ${JSON.stringify(result.headers, null, 2)}`);
    }

    return { success: corsEnabled, statusCode: result.statusCode };
    
  } catch (error) {
    console.log(`${colors.red}❌ CORS: FAILED${colors.reset}`);
    console.log(`   Error: ${error.error}`);
    return { success: false, error: error.error };
  }
}

/**
 * Test authenticated request
 */
async function testAuthentication(endpoint, token, verbose = false) {
  if (!token) {
    console.log(`${colors.yellow}⏭️  Skipping authentication test (no token provided)${colors.reset}`);
    return { success: false, skipped: true };
  }

  console.log(`${colors.blue}🔐 Testing authenticated request...${colors.reset}`);
  
  try {
    const cleanToken = token.replace(/^Bearer\s+/, '');
    const result = await makeRequest(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`
      },
      body: { email: 'test@test.com', auth0_user: true }
    });

    const success = result.statusCode === 200;
    
    console.log(`${success ? colors.green + '✅' : colors.red + '❌'} Authentication: ${success ? 'SUCCESS' : 'FAILED'}${colors.reset}`);
    console.log(`   Status: ${result.statusCode} ${result.statusMessage}`);
    console.log(`   Response Time: ${result.responseTime}ms`);
    
    if (!success && result.statusCode === 401) {
      console.log(`${colors.yellow}   ℹ️  Token may be invalid or expired${colors.reset}`);
    }

    if (verbose) {
      console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
    }

    return { success, statusCode: result.statusCode, responseTime: result.responseTime };
    
  } catch (error) {
    console.log(`${colors.red}❌ Authentication: FAILED${colors.reset}`);
    console.log(`   Error: ${error.error}`);
    return { success: false, error: error.error };
  }
}

/**
 * Validate JWT token format
 */
function validateToken(token, verbose = false) {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  console.log(`${colors.blue}🔍 Validating token format...${colors.reset}`);
  
  try {
    const cleanToken = token.replace(/^Bearer\s+/, '');
    const parts = cleanToken.split('.');
    
    if (parts.length !== 3) {
      console.log(`${colors.red}❌ Token Format: INVALID${colors.reset}`);
      console.log(`   Error: Expected 3 parts, got ${parts.length}`);
      return { valid: false, error: `Invalid JWT format: expected 3 parts, got ${parts.length}` };
    }

    // Decode header and payload
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    const now = Math.floor(Date.now() / 1000);
    const expired = payload.exp && payload.exp < now;
    
    console.log(`${colors.green}✅ Token Format: VALID${colors.reset}`);
    console.log(`   Type: ${header.typ || 'Unknown'}`);
    console.log(`   Algorithm: ${header.alg || 'Unknown'}`);
    
    if (payload.exp) {
      console.log(`   Expires: ${new Date(payload.exp * 1000).toISOString()}`);
      console.log(`   Expired: ${expired ? colors.red + 'YES' + colors.reset : colors.green + 'NO' + colors.reset}`);
    }
    
    if (payload.sub) {
      console.log(`   Subject: ${payload.sub}`);
    }

    if (verbose) {
      console.log(`   Header: ${JSON.stringify(header, null, 2)}`);
      console.log(`   Payload: ${JSON.stringify(payload, null, 2)}`);
    }

    return { 
      valid: true, 
      header, 
      payload, 
      expired,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : null
    };
    
  } catch (error) {
    console.log(`${colors.red}❌ Token Format: INVALID${colors.reset}`);
    console.log(`   Error: ${error.message}`);
    return { valid: false, error: error.message };
  }
}

/**
 * Generate summary report
 */
function generateSummary(results) {
  console.log(`\n${colors.bright}📊 DIAGNOSTIC SUMMARY${colors.reset}`);
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'Endpoint Accessible', result: results.basicAccess?.success },
    { name: 'CORS Configured', result: results.cors?.success },
    { name: 'Token Valid', result: results.tokenValidation?.valid },
    { name: 'Authentication Working', result: results.authentication?.success }
  ];
  
  tests.forEach(test => {
    if (test.result === undefined) {
      console.log(`${colors.yellow}⏭️  ${test.name}: SKIPPED${colors.reset}`);
    } else {
      const icon = test.result ? `${colors.green}✅` : `${colors.red}❌`;
      const status = test.result ? 'PASS' : 'FAIL';
      console.log(`${icon} ${test.name}: ${status}${colors.reset}`);
    }
  });

  // Overall status
  const passCount = tests.filter(t => t.result === true).length;
  const totalCount = tests.filter(t => t.result !== undefined).length;
  
  let overallStatus;
  if (passCount === totalCount) {
    overallStatus = `${colors.green}SUCCESS${colors.reset}`;
  } else if (passCount > 0) {
    overallStatus = `${colors.yellow}PARTIAL${colors.reset}`;
  } else {
    overallStatus = `${colors.red}FAILED${colors.reset}`;
  }
  
  console.log(`\n${colors.bright}Overall Status: ${overallStatus}${colors.reset}`);
  console.log(`Tests Passed: ${passCount}/${totalCount}`);
  
  if (results.basicAccess?.responseTime) {
    console.log(`Average Response Time: ${results.basicAccess.responseTime}ms`);
  }
}

/**
 * Main diagnostic function
 */
async function runDiagnostics(options) {
  console.log(`${colors.bright}🔍 API ENDPOINT DIAGNOSTICS${colors.reset}`);
  console.log('='.repeat(50));
  console.log(`Endpoint: ${options.endpoint}`);
  console.log(`Mode: ${options.quick ? 'Quick' : 'Full'}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('');

  const results = {};

  try {
    // Test 1: Basic endpoint accessibility
    results.basicAccess = await testBasicAccess(options.endpoint, options.verbose);
    console.log('');

    // Test 2: CORS configuration (skip in quick mode)
    if (!options.quick) {
      results.cors = await testCORS(options.endpoint, options.verbose);
      console.log('');
    }

    // Test 3: Token validation (if token provided)
    if (options.token) {
      results.tokenValidation = validateToken(options.token, options.verbose);
      console.log('');
      
      // Test 4: Authenticated request
      results.authentication = await testAuthentication(options.endpoint, options.token, options.verbose);
      console.log('');
    }

    // Generate summary
    generateSummary(results);

  } catch (error) {
    console.error(`${colors.red}❌ Diagnostics failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    const options = parseArgs();
    await runDiagnostics(options);
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  makeRequest,
  testBasicAccess,
  testCORS,
  testAuthentication,
  validateToken
};