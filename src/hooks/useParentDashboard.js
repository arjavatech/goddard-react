// Main hook for parent dashboard data management
import { useState, useEffect, useCallback } from 'react';
import { UnifiedParentService } from '../services/parentDashboard/unifiedParentService.js';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';

export function useParentDashboard(email) {
  const { getAccessTokenSilently } = useAuth0();
  
  const [state, setState] = useState({
    loading: true,
    error: null,
    parentName: '',
    children: [],
    totalChildren: 0,
    activeChildId: null,
    activeChild: null,
    overallStats: null,
    lastUpdated: null,
    isStale: false
  });

  // Load all dashboard data once on mount
  useEffect(() => {
    if (!email) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Email is required'
      }));
      return;
    }

    // Debug: Log the email being used for API calls
    console.log('useParentDashboard: Loading data for email:', email);
    loadDashboardData();
  }, [email]);

  // Set active child when children data is loaded
  useEffect(() => {
    if (state.children.length > 0 && !state.activeChildId) {
      // Try to get child from session storage first
      const sessionChildId = sessionStorage.getItem('putcallId');
      if (sessionChildId) {
        const childId = parseInt(sessionChildId);
        const child = state.children.find(c => c.childId === childId);
        if (child) {
          switchChild(childId);
          return;
        }
      }

      // Default to first child
      switchChild(state.children[0].childId);
    }
  }, [state.children]);

  const loadDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('Loading parent dashboard data...');
      const startTime = performance.now();
      
      const data = await UnifiedParentService.getParentDashboardData(
        email, 
        getAccessTokenSilently
      );
      
      const loadTime = performance.now() - startTime;
      console.log(`Dashboard data loaded in ${loadTime.toFixed(2)}ms`);

      setState(prev => ({
        ...prev,
        parentName: data.parentName,
        children: data.children,
        totalChildren: data.totalChildren,
        overallStats: data.overallStats,
        lastUpdated: data.lastUpdated,
        isStale: data.isStale || false,
        loading: false,
        error: null
      }));

      // Store parent name in localStorage for compatibility
      if (data.parentName) {
        localStorage.setItem('parent_name', data.parentName);
      }

      // Store number of children
      localStorage.setItem('number_of_children', data.totalChildren.toString());

      // Show stale data warning if applicable
      if (data.isStale) {
        toast.warning('Showing cached data - some information may be outdated', {
          duration: 5000
        });
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load dashboard data',
        loading: false
      }));

      // Show user-friendly error message
      if (error.name === 'NetworkError') {
        toast.error('Network connection failed. Please check your internet connection.');
      } else if (error.name === 'ServiceUnavailableError') {
        toast.error('Service is temporarily unavailable. Please try again later.');
      } else {
        toast.error('Failed to load dashboard data. Please refresh the page.');
      }
    }
  }, [email, getAccessTokenSilently]);

  // Switch active child (no API call needed!)
  const switchChild = useCallback((childId) => {
    const child = state.children.find(c => c.childId === childId);
    if (!child) {
      console.error(`Child with ID ${childId} not found`);
      return;
    }

    console.log(`Switching to child: ${child.firstName} (${childId})`);
    const startTime = performance.now();

    setState(prev => ({
      ...prev,
      activeChildId: childId,
      activeChild: child
    }));

    const switchTime = performance.now() - startTime;
    console.log(`Child switch completed in ${switchTime.toFixed(2)}ms`);

    // Update localStorage for compatibility
    localStorage.setItem('child_name', child.firstName);
    localStorage.setItem('child_id', childId.toString());
    
    // Update session storage
    sessionStorage.setItem('putcallId', childId.toString());

    // Show success toast
    toast.success(`Selected child: ${child.firstName}`, {
      duration: 2000
    });
  }, [state.children]);

  // Refresh data (invalidate cache and reload)
  const refreshData = useCallback(async () => {
    console.log('Refreshing dashboard data...');
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await UnifiedParentService.refreshParentData(
        email, 
        getAccessTokenSilently
      );

      setState(prev => ({
        ...prev,
        parentName: data.parentName,
        children: data.children,
        totalChildren: data.totalChildren,
        overallStats: data.overallStats,
        lastUpdated: data.lastUpdated,
        isStale: false,
        loading: false,
        error: null
      }));

      // Re-select active child if it still exists
      if (state.activeChildId) {
        const child = data.children.find(c => c.childId === state.activeChildId);
        if (child) {
          setState(prev => ({ ...prev, activeChild: child }));
        } else if (data.children.length > 0) {
          switchChild(data.children[0].childId);
        }
      }

      toast.success('Dashboard data refreshed');
      
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh data',
        loading: false
      }));
      
      toast.error('Failed to refresh data. Please try again.');
    }
  }, [email, getAccessTokenSilently, state.activeChildId, switchChild]);

  // Get specific child data
  const getChildData = useCallback((childId) => {
    return state.children.find(c => c.childId === childId);
  }, [state.children]);

  // Check if child has incomplete forms
  const hasIncompleteForms = useCallback((childId) => {
    const child = getChildData(childId);
    return child ? child.incompleteForms.length > 0 : false;
  }, [getChildData]);

  // Get form completion percentage for child
  const getChildProgress = useCallback((childId) => {
    const child = getChildData(childId);
    return child ? child.stats.progress : 0;
  }, [getChildData]);

  // Get welcome message - using Auth0 email parameter
  const getWelcomeMessage = useCallback(() => {
    // REMOVED: localStorage dependency - using email parameter instead
    if (email === 'goddard01arjava@gmail.com') {
      return 'Welcome Admin';
    }
    return `Welcome ${state.parentName}`;
  }, [state.parentName, email]);

  return {
    // State
    ...state,
    
    // Actions
    switchChild,
    refreshData,
    loadDashboardData,
    
    // Computed values
    getChildData,
    hasIncompleteForms,
    getChildProgress,
    getWelcomeMessage,
    
    // Derived state
    hasData: !state.loading && !state.error && state.children.length > 0,
    hasMultipleChildren: state.children.length > 1,
    allFormsComplete: state.overallStats?.progress === 100,
    
    // Performance info
    isDataCached: state.lastUpdated && !state.loading
  };
}