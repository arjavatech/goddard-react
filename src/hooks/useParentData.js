// Single hook for all parent dashboard data management
// Makes ONE API call and handles all child switching via state updates
import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { api_base_url, school_id } from '@/utils/const';
import { getAuthHeaders } from '@/utils/auth';
import { toast } from 'sonner';

// Simplified form status calculator for FormSidebar
const calculateFormStatus = (formData, completedForms) => {
  const isValidValue = (value) => {
    return value !== undefined && value !== null && value !== '' && value !== false;
  };

  // Basic form completion checks (simplified from FormStatusLogic)
  const enrollment = {
    completed: completedForms.some(f => f.formname === 'enrollment_form')
  };
  
  const authorization = {
    completed: completedForms.some(f => f.formname === 'authorization_form')
  };
  
  const parentHandbook = {
    completed: completedForms.some(f => f.formname === 'parent_handbook')
  };
  
  const admission = {
    completed: completedForms.some(f => f.formname === 'admission_form')
  };

  // Check for basic field completion (simplified validation)
  const enrollmentBasic = formData.enrollment_form && 
    isValidValue(formData.enrollment_form.point_one_field_three);
  
  const authorizationBasic = formData.authorization_form && 
    isValidValue(formData.authorization_form.bank_routing);
  
  const handbookBasic = formData.parent_handbook && 
    isValidValue(formData.parent_handbook.welcome_goddard_agreement);
  
  const admissionBasic = formData.admission_form && 
    isValidValue(formData.admission_form.nick_name);

  return {
    enrollment: {
      completed: enrollment.completed || enrollmentBasic
    },
    authorization: {
      completed: authorization.completed || authorizationBasic
    },
    parentHandbook: {
      completed: parentHandbook.completed || handbookBasic
    },
    admission: {
      completed: admission.completed || admissionBasic
    }
  };
};

export const useParentData = (email) => {
  const { getAccessTokenSilently } = useAuth0();
  
  const [state, setState] = useState({
    loading: true,
    error: null,
    parentName: '',
    children: [],
    activeChildId: null
  });

  // Single API call to get ALL data - no more API calls needed!
  const fetchData = useCallback(async () => {
    if (!email) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Email is required' 
      }));
      return;
    }

    try {
      console.log('🚀 Making single API call for email:', email);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const startTime = performance.now();
      
      const response = await fetch(
        `${api_base_url}/admission_child_personal/parent_email/${school_id}/${email}`,
        { headers }
      );
      
      const loadTime = performance.now() - startTime;
      console.log(`📊 API response time: ${loadTime.toFixed(2)}ms`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📝 API data loaded:', data.length, 'children');
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No children found for this parent');
      }

      // Transform API data for frontend use
      const transformedChildren = data.map(child => {
        const completedForms = child.CompletedFormStatus || [];
        const incompleteForms = child.InCompletedFormStatus || [];
        const formData = child.child_information || {};
        
        // Calculate basic form status for FormSidebar (simplified version)
        const formStatus = calculateFormStatus(formData, completedForms);
        
        return {
          id: child.child_id,
          firstName: child.child_first_name,
          lastName: child.child_last_name,
          completedForms,
          incompleteForms,
          formData,
          formStatus, // Add calculated form status
          stats: {
            total: 4, // admission, authorization, handbook, enrollment
            completed: completedForms.length,
            incomplete: incompleteForms.length,
            progress: Math.round((completedForms.length / 4) * 100)
          }
        };
      });

      // Set active child from session storage or first child
      const sessionChildId = sessionStorage.getItem('putcallId');
      const activeChildId = sessionChildId ? 
        parseInt(sessionChildId) : 
        transformedChildren[0]?.id;

      setState({
        loading: false,
        error: null,
        parentName: data[0]?.parent_name || '',
        children: transformedChildren,
        activeChildId: activeChildId
      });

      // Update localStorage for compatibility
      if (data[0]?.parent_name) {
        localStorage.setItem('parent_name', data[0].parent_name);
      }
      localStorage.setItem('number_of_children', transformedChildren.length.toString());
      
      console.log('✅ Data loading complete:', {
        parent: data[0]?.parent_name,
        children: transformedChildren.length,
        activeChild: activeChildId
      });
      
    } catch (error) {
      console.error('❌ Data loading failed:', error);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to load dashboard data' 
      }));

      // Show user-friendly error message
      if (error.message.includes('Network')) {
        toast.error('Network connection failed. Please check your internet connection.');
      } else if (error.message.includes('500')) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to load dashboard data. Please refresh the page.');
      }
    }
  }, [email, getAccessTokenSilently]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Child switching - pure state update (NO API calls!)
  const switchChild = useCallback((childId) => {
    const child = state.children.find(c => c.id === childId);
    if (!child) {
      console.error(`❌ Child with ID ${childId} not found`);
      toast.error('Child not found');
      return;
    }

    console.log(`🔄 Switching to child: ${child.firstName} (${childId}) - NO API call!`);
    const startTime = performance.now();

    setState(prev => ({ ...prev, activeChildId: childId }));

    const switchTime = performance.now() - startTime;
    console.log(`⚡ Child switch completed in ${switchTime.toFixed(2)}ms`);

    // Update storage for compatibility
    localStorage.setItem('child_name', child.firstName);
    localStorage.setItem('child_id', childId.toString());
    sessionStorage.setItem('putcallId', childId.toString());

    // Show success message
    toast.success(`Selected child: ${child.firstName}`, {
      duration: 2000
    });
  }, [state.children]);

  // Refresh data after form submission
  const refresh = useCallback(() => {
    console.log('🔄 Refreshing parent data after form submission...');
    fetchData();
  }, [fetchData]);

  // Get welcome message - updated to use Auth0 email parameter
  const getWelcomeMessage = useCallback(() => {
    // REMOVED: localStorage dependency - using email parameter instead
    if (email === 'goddard01arjava@gmail.com') {
      return 'Welcome Admin';
    }
    return `Welcome ${state.parentName}`;
  }, [state.parentName, email]);

  // Computed values
  const activeChild = state.children.find(c => c.id === state.activeChildId);
  const hasMultipleChildren = state.children.length > 1;
  const hasData = !state.loading && !state.error && state.children.length > 0;

  return {
    // Core state
    loading: state.loading,
    error: state.error,
    parentName: state.parentName,
    children: state.children,
    activeChildId: state.activeChildId,
    
    // Active child data
    activeChild,
    completedForms: activeChild?.completedForms || [],
    incompleteForms: activeChild?.incompleteForms || [],
    formData: activeChild?.formData || {},
    formStatus: activeChild?.formStatus || {},
    
    // Actions
    switchChild,
    refresh,
    
    // Computed values
    getWelcomeMessage,
    hasMultipleChildren,
    hasData,
    
    // Overall stats
    overallStats: hasData ? {
      totalForms: state.children.length * 4,
      completedForms: state.children.reduce((sum, child) => sum + child.stats.completed, 0),
      progress: Math.round((state.children.reduce((sum, child) => sum + child.stats.completed, 0) / (state.children.length * 4)) * 100)
    } : null
  };
};