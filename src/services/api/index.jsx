/**
 * API Services Index
 * Centralized export of all API services
 */

import ApiClient from './core/ApiClient';
import ClassroomService from './ClassroomService';
import FormService from './FormService';
import StudentService from './StudentService';

// Service factory function
export const createApiServices = (getAccessTokenSilently, logout) => {
  // Create the central API client
  const apiClient = new ApiClient(getAccessTokenSilently, logout);

  // Create domain services
  const classroomService = new ClassroomService(apiClient);
  const formService = new FormService(apiClient);
  const studentService = new StudentService(apiClient);

  return {
    apiClient,
    classroomService,
    formService,
    studentService
  };
};

// Individual exports for specific use cases
export { default as ApiClient } from './core/ApiClient';
export { default as ClassroomService } from './ClassroomService';
export { default as FormService } from './FormService';
export { default as StudentService } from './StudentService';

// Hook for using services in components
import React, { createContext, useContext } from 'react';

const ApiServicesContext = createContext(null);

export const ApiServicesProvider = ({ children, getAccessTokenSilently, logout }) => {
  const services = createApiServices(getAccessTokenSilently, logout);

  return (
    <ApiServicesContext.Provider value={services}>
      {children}
    </ApiServicesContext.Provider>
  );
};

export const useApiServices = () => {
  const services = useContext(ApiServicesContext);
  if (!services) {
    throw new Error('useApiServices must be used within an ApiServicesProvider');
  }
  return services;
};

// Individual service hooks
export const useClassroomService = () => {
  const { classroomService } = useApiServices();
  return classroomService;
};

export const useFormService = () => {
  const { formService } = useApiServices();
  return formService;
};

export const useStudentService = () => {
  const { studentService } = useApiServices();
  return studentService;
};

export const useApiClient = () => {
  const { apiClient } = useApiServices();
  return apiClient;
};