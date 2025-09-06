# Enrollment Agreement Debug Tests

This test suite is specifically designed to debug the enrollment agreement save issue by capturing detailed network traffic and user interactions.

## Test Overview

The tests will:
1. Navigate to `http://localhost:5174/parent-dashboard?id=logeshwari.arjava@gmail.com`
2. Authenticate with provided credentials (`goddard01arjava@gmail.com` / `Admin0001`)
3. Find and interact with the "anush K" user
4. Attempt to save enrollment agreement forms
5. Capture all network requests, responses, and errors

## Running the Tests

### Prerequisites
1. Make sure the development server is running:
   ```bash
   npm run dev
   ```

2. Ensure the app is accessible at `http://localhost:5174`

### Execute the debug tests:
```bash
# Run all enrollment debug tests with detailed reporting
npm run test:enrollment-debug

# Run with UI mode for interactive debugging
npm run test:e2e:ui

# Run with step-by-step debugging
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/enrollment-debug/enrollment-agreement-debug.spec.js --reporter=list
```

## Test Structure

### Helper Classes

#### AuthHelper (`helpers/auth.js`)
- Handles authentication flow (Auth0 and direct login)
- Manages navigation to parent dashboard
- Provides reusable login methods

#### NetworkMonitor (`helpers/network-monitor.js`)
- Captures all HTTP requests and responses
- Monitors for enrollment-related API calls
- Tracks failed requests and error conditions
- Provides detailed network traffic analysis

### Test Cases

#### 1. Navigation and Authentication Test
- Tests basic navigation to parent dashboard
- Verifies authentication flow works correctly
- Captures initial network traffic

#### 2. User Search and Interaction Test
- Attempts to find "anush K" user on dashboard
- Tests various selector strategies
- Captures user interaction network calls

#### 3. Enrollment Agreement Form Test
- Locates enrollment agreement forms
- Fills out form fields (checkboxes, text areas)
- Attempts to save/submit the form
- **Captures critical save operation network traffic**

#### 4. Comprehensive Debugging Session
- Performs step-by-step debugging workflow
- Captures network traffic at each stage
- Provides detailed analysis of all API calls

## Network Traffic Analysis

The tests will capture and analyze:

- **Request Details**: Method, URL, headers, POST data
- **Response Analysis**: Status codes, response headers, timing
- **Error Tracking**: Failed requests, timeout issues, server errors
- **Enrollment-Specific**: Filters for agreement/enrollment related calls

## Expected Outputs

### Screenshots
Tests will generate screenshots at key points:
- `01-dashboard-loaded.png` - Initial dashboard state
- `02-user-search.png` - During user search
- `03-after-user-click.png` - After user interaction
- `04-form-search.png` - During form detection
- `05-after-save.png` - After save attempt
- `06-form-error.png` - If errors occur
- `07-final-state.png` - Final page state

### Network Reports
Console output will include:
- Step-by-step network traffic summaries
- Enrollment-specific API call analysis
- Failed request details with error messages
- Comprehensive debugging reports

### Test Results
- HTML test report in `test-results/`
- JSON results for programmatic analysis
- Trace files for detailed debugging

## Debugging the Issue

The tests are specifically designed to identify:

1. **Missing API Endpoints**: Are save requests being made to the correct URLs?
2. **Authentication Issues**: Are requests properly authenticated?
3. **Request Payload Problems**: Is the form data being sent correctly?
4. **Server Response Issues**: Are there server errors or validation failures?
5. **JavaScript Errors**: Are there frontend errors preventing form submission?

## Key Areas to Monitor

When running the tests, pay attention to:

- **Network Tab Output**: Look for enrollment/agreement related API calls
- **Error Messages**: Both console errors and UI error messages
- **Form Element Detection**: Whether forms and buttons are found correctly
- **Authentication State**: Verify login is successful and persistent
- **Request/Response Flow**: Ensure save operations trigger appropriate API calls

## Troubleshooting

If tests fail:

1. **Server Not Running**: Ensure `npm run dev` is running and app is accessible
2. **Authentication Issues**: Check if credentials are correct and Auth0 is configured
3. **User Not Found**: Verify "anush K" user exists in the dashboard
4. **Form Not Found**: Check if enrollment agreement forms are present
5. **Network Issues**: Monitor console for CORS, timeout, or connection errors

## Next Steps

After running these tests, analyze the network traffic output to:

1. Identify exactly which API calls are made during save operations
2. Determine if requests are reaching the server
3. Check response codes and error messages
4. Verify authentication headers and payload structure
5. Identify any missing error handling or user feedback mechanisms

The detailed network analysis will provide the exact failure point and help guide the debugging process for the enrollment agreement save issue.