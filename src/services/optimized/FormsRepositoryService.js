// Optimized Forms Repository Service with caching and parallel loading
import { cacheManager } from '../cache/multiLayerCache.js';
import { performanceMonitor } from '../monitoring/performanceMonitor.js';
import { api_base_url, school_id } from '../../utils/const.js';
import { getAuthHeaders } from '../../utils/auth.js';

class FormsRepositoryService {
  constructor() {
    this.requestCache = new Map(); // For request deduplication
    this.abortControllers = new Map(); // For request cancellation
  }

  /**
   * Load all forms repository data in parallel with caching
   * Replaces the 5 sequential API calls with optimized parallel loading
   */
  async loadAllFormsRepositoryData(getAccessTokenSilently, options = {}) {
    const { useCache = true, forceRefresh = false } = options;
    const cacheKey = `forms_repository_data:${school_id}`;
    const startTime = performance.now();

    // Check cache first
    if (useCache && !forceRefresh) {
      const cachedData = await cacheManager.get(cacheKey);
      if (cachedData) {
        performanceMonitor.trackCacheHit(cacheKey, 'memory');
        performanceMonitor.trackApiCall(startTime, 'forms_repository_cached', 200, { cached: true });
        return cachedData;
      }
      performanceMonitor.trackCacheMiss(cacheKey);
    }

    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      
      // Execute all API calls in parallel
      const [
        classroomData,
        formsData,
        studentFormsData,
        availableFormsData
      ] = await Promise.all([
        this.fetchClassroomData(headers),
        this.fetchFormsFromAPI(),
        this.fetchStudentFormsData(headers),
        this.fetchAvailableFormsData(headers)
      ]);

      // Combine and transform data
      const transformedData = this.transformFormsRepositoryData({
        classroomData,
        formsData,
        studentFormsData,
        availableFormsData
      });

      // Cache the results (10 minute TTL)
      if (useCache) {
        cacheManager.set(cacheKey, transformedData, 600000, {
          persistToSession: true,
          persistToStorage: false
        });
      }

      const loadTime = performanceMonitor.trackApiCall(startTime, 'forms_repository_parallel', 200, {
        cached: false,
        parallelCalls: 4
      });

      console.log(`Forms repository data loaded in ${loadTime.toFixed(2)}ms`);
      return transformedData;

    } catch (error) {
      performanceMonitor.trackError(error, { service: 'FormsRepositoryService' });
      
      // Fallback to stale cache data
      const staleData = await cacheManager.get(cacheKey, { fallbackToSession: true });
      if (staleData) {
        console.warn('Serving stale forms repository data due to API error');
        return { ...staleData, isStale: true };
      }
      
      throw error;
    }
  }

  /**
   * Deduplicated API request wrapper
   */
  async makeRequest(url, options = {}, cacheKey = null) {
    // Request deduplication
    if (this.requestCache.has(cacheKey || url)) {
      console.log(`Deduplicating request to ${url}`);
      return this.requestCache.get(cacheKey || url);
    }

    // Create abort controller for this request
    const abortController = new AbortController();
    const requestKey = cacheKey || url;
    this.abortControllers.set(requestKey, abortController);

    const requestPromise = fetch(url, {
      ...options,
      signal: abortController.signal
    }).finally(() => {
      // Cleanup
      this.requestCache.delete(requestKey);
      this.abortControllers.delete(requestKey);
    });

    // Cache the promise to deduplicate concurrent requests
    this.requestCache.set(requestKey, requestPromise);
    
    return requestPromise;
  }

  /**
   * Optimized classroom data fetch with retry logic
   */
  async fetchClassroomData(headers, retries = 3) {
    const url = `${api_base_url}/child_count_with_class_name/${school_id}`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.makeRequest(url, { headers }, 'classroom_data');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Failed to fetch classroom data after ${retries} attempts: ${error.message}`);
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.warn(`Classroom data fetch attempt ${attempt} failed, retrying in ${delay}ms`);
        await this.delay(delay);
      }
    }
  }

  /**
   * Optimized forms data fetch (no auth needed)
   */
  async fetchFormsFromAPI() {
    const cacheKey = 'forms_api_data';
    const cachedData = await cacheManager.get(cacheKey);
    
    if (cachedData) {
      performanceMonitor.trackCacheHit(cacheKey, 'memory');
      return cachedData;
    }

    const url = 'https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/get_all_form_details';
    const response = await this.makeRequest(url, {}, 'forms_api');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch forms data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache for 1 hour (forms data changes less frequently)
    cacheManager.set(cacheKey, data, 3600000);
    
    return data;
  }

  /**
   * Optimized student forms data fetch
   */
  async fetchStudentFormsData(headers) {
    const url = `${api_base_url}/admission_child_personal/all_child_status/${school_id}`;
    const response = await this.makeRequest(url, { headers }, 'student_forms');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch student forms: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Optimized available forms data fetch
   */
  async fetchAvailableFormsData(headers) {
    const url = `${api_base_url}/form/school/${school_id}`;
    const response = await this.makeRequest(url, { headers }, 'available_forms');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch available forms: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Transform and combine all data sources
   */
  transformFormsRepositoryData({ classroomData, formsData, studentFormsData, availableFormsData }) {
    // Process classrooms with forms
    const classroomsWithForms = (classroomData || []).map(classroom => {
      const formsList = [];
      if (classroom.forms && Object.keys(classroom.forms).length > 0) {
        Object.values(classroom.forms).forEach(formName => {
          formsList.push(formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        });
      }
      return {
        ...classroom,
        processedForms: formsList
      };
    });

    // Process forms data
    const processedForms = [];
    let idCounter = 1;

    if (formsData) {
      Object.keys(formsData).forEach(status => {
        const changeType = status.charAt(0).toUpperCase() + status.slice(1);
        if (changeType === 'All') return;
        
        if (typeof formsData[status] === 'object' && formsData[status] !== null) {
          Object.keys(formsData[status]).forEach(formName => {
            processedForms.push({
              id: idCounter++,
              formName: formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              changeType: changeType
            });
          });
        }
      });
    }

    // Process student forms (deduplicated since two endpoints returned same data)
    const processedStudentForms = (studentFormsData || []).map(item => {
      const formsList = [];
      if (item.forms && Object.keys(item.forms).length > 0) {
        Object.values(item.forms).forEach(formName => {
          formsList.push(formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        });
      }

      return {
        id: item.child_id,
        childName: item.child_first_name || 'No name',
        classroom: item.class_name || 'Unassigned',
        parentEmail: item.primary_email || 'No email provided',
        forms: formsList
      };
    });

    // Process available forms
    const processedAvailableForms = (availableFormsData || []).map(item => ({
      id: item.form_id,
      name: item.form_name ? item.form_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''
    })).filter(form => form.id && form.name);

    // Extract unique dropdown forms
    const dropdownFormsSet = new Set();
    processedStudentForms.forEach(student => {
      student.forms.forEach(form => dropdownFormsSet.add(form));
    });

    return {
      classrooms: classroomsWithForms,
      forms: processedForms,
      studentForms: processedStudentForms,
      availableForms: processedAvailableForms,
      dropdownForms: Array.from(dropdownFormsSet),
      stats: {
        totalClassrooms: classroomsWithForms.length,
        totalChildren: classroomsWithForms.reduce((sum, classroom) => sum + (classroom.count || 0), 0),
        activeClassrooms: classroomsWithForms.filter(classroom => classroom.class_name !== 'Unassign').length,
        totalForms: processedForms.length,
        totalStudents: processedStudentForms.length
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Invalidate cache when data changes
   */
  invalidateCache() {
    cacheManager.invalidateRelated(`forms_repository_data:*`);
    cacheManager.invalidateRelated('classroom_data');
    cacheManager.invalidateRelated('student_forms');
    cacheManager.invalidateRelated('available_forms');
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests() {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
    this.requestCache.clear();
  }

  /**
   * Utility: delay function for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Preload data in background
   */
  async preloadData(getAccessTokenSilently) {
    try {
      await this.loadAllFormsRepositoryData(getAccessTokenSilently, { useCache: true });
      console.log('Forms repository data preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload forms repository data:', error);
    }
  }
}

export const formsRepositoryService = new FormsRepositoryService();