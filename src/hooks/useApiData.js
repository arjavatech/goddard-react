/**
 * Custom React hooks for API data management
 * Provides loading states, error handling, and data management
 */

import { useState, useEffect, useCallback } from 'react';
import { useApiServices } from '../services/api';

/**
 * Generic hook for API requests with loading and error states
 */
export const useApiRequest = (apiFunction, dependencies = [], options = {}) => {
  const {
    immediate = true,
    onSuccess = null,
    onError = null,
    initialData = null
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const refetch = useCallback(() => execute(), [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    setData
  };
};

/**
 * Hook for classroom data with statistics
 */
export const useClassrooms = (options = {}) => {
  const { classroomService } = useApiServices();
  const [classrooms, setClassrooms] = useState([]);
  const [stats, setStats] = useState({ totalClassrooms: 0, totalChildren: 0, activeClassrooms: 0 });
  const [formsByClassroom, setFormsByClassroom] = useState({});

  const {
    data,
    loading,
    error,
    execute: loadClassrooms,
    refetch
  } = useApiRequest(
    () => classroomService.getClassrooms(),
    [],
    {
      onSuccess: (result) => {
        setClassrooms(result.classrooms);
        setStats(result.stats);
        setFormsByClassroom(result.formsByClassroom);
      },
      ...options
    }
  );

  const createClassroom = useCallback(async (classroomData) => {
    const result = await classroomService.createClassroom(classroomData);
    await refetch(); // Refresh data after creation
    return result;
  }, [classroomService, refetch]);

  const updateClassroom = useCallback(async (classroomId, updates) => {
    const result = await classroomService.updateClassroom(classroomId, updates);
    await refetch(); // Refresh data after update
    return result;
  }, [classroomService, refetch]);

  const deleteClassroom = useCallback(async (classroomId) => {
    const result = await classroomService.deleteClassroom(classroomId);
    await refetch(); // Refresh data after deletion
    return result;
  }, [classroomService, refetch]);

  return {
    classrooms,
    stats,
    formsByClassroom,
    loading,
    error,
    refetch,
    createClassroom,
    updateClassroom,
    deleteClassroom
  };
};

/**
 * Hook for form data with filtering
 */
export const useForms = (options = {}) => {
  const { formService } = useApiServices();
  const [allForms, setAllForms] = useState([]);
  const [availableForms, setAvailableForms] = useState([]);
  const [formSubmissions, setFormSubmissions] = useState([]);
  const [formDropdownOptions, setFormDropdownOptions] = useState([]);

  const { loading, error, refetch } = useApiRequest(
    async () => {
      const [all, available, submissions, dropdownOptions] = await Promise.all([
        formService.getAllForms(),
        formService.getAvailableForms(),
        formService.getFormSubmissions(),
        formService.getFormDropdownOptions()
      ]);

      setAllForms(all);
      setAvailableForms(available);
      setFormSubmissions(submissions);
      setFormDropdownOptions(dropdownOptions);

      return { all, available, submissions, dropdownOptions };
    },
    [],
    options
  );

  const createForm = useCallback(async (formData) => {
    const result = await formService.createForm(formData);
    await refetch(); // Refresh data after creation
    return result;
  }, [formService, refetch]);

  const updateForm = useCallback(async (formId, updates) => {
    const result = await formService.updateForm(formId, updates);
    await refetch(); // Refresh data after update
    return result;
  }, [formService, refetch]);

  const deleteForm = useCallback(async (formId) => {
    const result = await formService.deleteForm(formId);
    await refetch(); // Refresh data after deletion
    return result;
  }, [formService, refetch]);

  const filterForms = useCallback((searchTerm, typeFilter) => {
    return formService.filterForms(allForms, searchTerm, typeFilter);
  }, [formService, allForms]);

  return {
    allForms,
    availableForms,
    formSubmissions,
    formDropdownOptions,
    loading,
    error,
    refetch,
    createForm,
    updateForm,
    deleteForm,
    filterForms
  };
};

/**
 * Hook for student data with classroom assignments
 */
export const useStudents = (filters = {}, options = {}) => {
  const { studentService } = useApiServices();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});

  const { loading, error, refetch } = useApiRequest(
    async () => {
      const studentsData = await studentService.getStudents(filters);
      const statsData = studentService.getStudentStats(studentsData);
      
      setStudents(studentsData);
      setStats(statsData);

      return { students: studentsData, stats: statsData };
    },
    [JSON.stringify(filters)], // Re-run when filters change
    options
  );

  const createStudent = useCallback(async (studentData) => {
    const result = await studentService.createStudent(studentData);
    await refetch(); // Refresh data after creation
    return result;
  }, [studentService, refetch]);

  const updateStudent = useCallback(async (studentId, updates) => {
    const result = await studentService.updateStudent(studentId, updates);
    await refetch(); // Refresh data after update
    return result;
  }, [studentService, refetch]);

  const deleteStudent = useCallback(async (studentId) => {
    const result = await studentService.deleteStudent(studentId);
    await refetch(); // Refresh data after deletion
    return result;
  }, [studentService, refetch]);

  const assignToClassroom = useCallback(async (studentId, classroomId) => {
    const result = await studentService.assignToClassroom(studentId, classroomId);
    await refetch(); // Refresh data after assignment
    return result;
  }, [studentService, refetch]);

  const filterStudents = useCallback((searchTerm, filterOptions) => {
    return studentService.filterStudents(students, searchTerm, filterOptions);
  }, [studentService, students]);

  return {
    students,
    stats,
    loading,
    error,
    refetch,
    createStudent,
    updateStudent,
    deleteStudent,
    assignToClassroom,
    filterStudents
  };
};

/**
 * Hook for student form status
 */
export const useStudentForms = (studentId, options = {}) => {
  const { studentService } = useApiServices();

  const { data: formStatus, loading, error, refetch } = useApiRequest(
    () => studentService.getStudentFormStatus(studentId),
    [studentId],
    {
      initialData: { completed: [], pending: [], total: 0 },
      ...options
    }
  );

  const updateFormCompletion = useCallback(async (formId, completionData) => {
    const result = await studentService.updateFormCompletion(studentId, formId, completionData);
    await refetch(); // Refresh form status after update
    return result;
  }, [studentService, studentId, refetch]);

  return {
    formStatus,
    loading,
    error,
    refetch,
    updateFormCompletion
  };
};

/**
 * Hook for API metrics and monitoring
 */
export const useApiMetrics = () => {
  const { apiClient } = useApiServices();
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(apiClient.getMetrics());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [apiClient]);

  const clearCache = useCallback((pattern) => {
    apiClient.clearCache(pattern);
  }, [apiClient]);

  const healthCheck = useCallback(async () => {
    return apiClient.healthCheck();
  }, [apiClient]);

  return {
    metrics,
    clearCache,
    healthCheck
  };
};

/**
 * Hook for handling loading states across multiple operations
 */
export const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((key, loading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates
  };
};