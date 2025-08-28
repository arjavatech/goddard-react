import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { api_base_url, school_id } from '../utils/const';
import { getAuthHeaders } from '../utils/auth';
import { formService } from '../services/formService';

// Example component showing how to use Auth0 token with API calls
const ExampleComponentWithAuth = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Example 1: Direct API call with Auth token
  const fetchDataDirectly = async () => {
    try {
      setLoading(true);
      
      // Get headers with JWT token
      const headers = await getAuthHeaders(getAccessTokenSilently);
      
      // Make API call with Authorization header
      const response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
        method: 'POST',
        headers, // This includes 'Authorization': 'Bearer {token}'
        body: JSON.stringify({ 
          email: user.email.toLowerCase(),
          auth0_user: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setData(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Using formService with Auth token
  const fetchFormData = async () => {
    try {
      setLoading(true);
      
      // Pass getAccessTokenSilently to service methods
      const parentData = await formService.getParentData(
        user.email, 
        getAccessTokenSilently
      );
      
      // Get form details for a specific child
      if (parentData.children && parentData.children.length > 0) {
        const childId = parentData.children[0].id;
        
        const formDetails = await formService.getFormDetails(
          childId, 
          getAccessTokenSilently
        );
        
        setData(formDetails);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Saving form data with Auth token
  const saveFormData = async (formData) => {
    try {
      const childId = '12345'; // Example child ID
      
      const result = await formService.saveFormData(
        childId,
        formData,
        'admission',
        getAccessTokenSilently // Pass the Auth0 function
      );
      
      console.log('Form saved successfully:', result);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  // Example 4: Multiple API calls in parallel with Auth
  const fetchMultipleData = async () => {
    try {
      setLoading(true);
      
      // Get headers once for multiple calls
      const headers = await getAuthHeaders(getAccessTokenSilently);
      
      // Make multiple API calls in parallel
      const [response1, response2] = await Promise.all([
        fetch(`${api_base_url}/admission_child_personal/parent_email/${user.email}`, { headers }),
        fetch(`${api_base_url}/admission_child_personal/completed_form_status_year/${school_id}/123/2024`, { headers })
      ]);

      if (response1.ok && response2.ok) {
        const [data1, data2] = await Promise.all([
          response1.json(),
          response2.json()
        ]);
        
        setData({ parentData: data1, formsData: data2 });
      }
    } catch (error) {
      console.error('Error fetching multiple data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data when component mounts
    if (user?.email) {
      fetchFormData();
    }
  }, [user]);

  return (
    <div>
      <h2>API Call Examples with Auth0 Token</h2>
      
      <div>
        <button onClick={fetchDataDirectly}>Fetch Data Directly</button>
        <button onClick={fetchFormData}>Fetch Form Data</button>
        <button onClick={fetchMultipleData}>Fetch Multiple Data</button>
      </div>

      {loading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

export default ExampleComponentWithAuth;

/*
KEY PATTERNS TO FOLLOW:

1. For direct API calls:
   - Import: import { getAuthHeaders } from '../utils/auth';
   - Get headers: const headers = await getAuthHeaders(getAccessTokenSilently);
   - Use in fetch: fetch(url, { headers, ...otherOptions })

2. For service methods:
   - Pass getAccessTokenSilently as parameter to service methods
   - Example: formService.getParentData(email, getAccessTokenSilently)

3. The Authorization header format is:
   Authorization: Bearer {JWT_TOKEN}

4. Always handle errors properly when getting the token

5. The same pattern as PrivateRoute.jsx:
   const token = await getAccessTokenSilently();
   headers: { 
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
   }
*/