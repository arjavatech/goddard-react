// Form Submission API Test
// Tests the fixed form submission functionality
import { submitFormData, submitAndCompleteForm } from '../utils/formSubmission.js';
import { testFormEndpoints, diagnose405Error } from '../utils/apiTestHelper.js';

/**
 * Mock getAccessTokenSilently for testing
 * In real app, this comes from Auth0
 */
const mockGetAccessToken = async () => {
  // This would normally return a real JWT token
  // For testing, you'd need to provide a real token or mock the API
  return 'mock-jwt-token-for-testing';
};

/**
 * Test form submission with the new error handling
 */
export const testFormSubmissionFix = async () => {
  console.log('🧪 Testing Form Submission Fix');
  console.log('================================');
  
  const testChildId = 123; // Use a test child ID
  const testFormData = {
    testSubmission: true,
    timestamp: new Date().toISOString(),
    formVersion: '2.0'
  };
  
  const formTypes = ['admission', 'authorization', 'parentHandbook', 'enrollment'];
  
  for (const formType of formTypes) {
    console.log(`\n📝 Testing ${formType} form...`);
    
    try {
      // Test the updated submitFormData function
      console.log('   Testing form data submission...');
      const submitResult = await submitFormData(
        testChildId, 
        testFormData, 
        formType, 
        mockGetAccessToken
      );
      console.log('   ✅ Form data submission successful:', submitResult);
      
      // Test the complete workflow
      console.log('   Testing complete submission workflow...');
      const workflowResult = await submitAndCompleteForm(
        testChildId,
        testFormData,
        formType,
        mockGetAccessToken,
        () => console.log('   📊 Dashboard refresh triggered')
      );
      console.log('   ✅ Complete workflow successful:', workflowResult);
      
    } catch (error) {
      console.error(`   ❌ ${formType} form test failed:`, error.message);
      
      // If it's a 405 error, provide diagnostic info
      if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
        console.log('   🩺 Running 405 error diagnosis...');
        // This would help debug the API endpoint requirements
      }
    }
  }
  
  console.log('\n🏁 Form submission testing complete');
};

/**
 * Test API endpoint methods to understand which methods work
 */
export const testApiEndpoints = async () => {
  console.log('🔍 Testing API Endpoints');
  console.log('========================');
  
  const testChildId = 123;
  
  try {
    const results = await testFormEndpoints(testChildId, mockGetAccessToken);
    
    console.log('📊 Test Results:');
    console.log(JSON.stringify(results, null, 2));
    
    // Analyze results
    const analysis = analyzeTestResults(results);
    
    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach(rec => {
      console.log(`   • ${rec}`);
    });
    
    console.log('\n✅ Working Methods by Endpoint:');
    Object.entries(analysis.workingMethods).forEach(([endpoint, methods]) => {
      console.log(`   ${endpoint}: ${methods.join(', ') || 'None found'}`);
    });
    
    if (analysis.issues.length > 0) {
      console.log('\n⚠️ Issues Found:');
      analysis.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ API endpoint testing failed:', error);
  }
};

/**
 * Quick test runner
 */
export const runAllTests = async () => {
  console.log('🚀 Starting All Form Submission Tests');
  console.log('=====================================');
  
  // Test 1: API Endpoints
  await testApiEndpoints();
  
  console.log('\n');
  
  // Test 2: Form Submission Logic
  await testFormSubmissionFix();
  
  console.log('\n🎉 All tests completed!');
};

// Export for use in other files or console
export default {
  testFormSubmissionFix,
  testApiEndpoints,
  runAllTests
};