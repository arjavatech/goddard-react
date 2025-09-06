/**
 * Form submission-specific React hooks
 * Provides convenient hooks for form management operations
 */

import { useCallback } from 'react';
import { formService } from '../endpoints/formService';
import { 
  useApiRequest, 
  usePaginatedApi, 
  UseApiRequestResult, 
  UsePaginatedApiResult 
} from './useApiRequest';
import { 
  FormSubmission, 
  CreateFormSubmissionRequest, 
  UpdateFormSubmissionRequest, 
  QueryOptions 
} from '../types';

export interface UseFormSubmissionsResult extends UsePaginatedApiResult<FormSubmission> {
  filterByStatus: (status: string) => Promise<void>;
  filterByUser: (userId: string) => Promise<void>;
  filterByForm: (formId: string) => Promise<void>;
}

export interface UseFormSubmissionResult extends UseApiRequestResult<FormSubmission> {
  submit: () => Promise<FormSubmission>;
  approve: (comments?: string) => Promise<FormSubmission>;
  reject: (comments: string) => Promise<FormSubmission>;
  uploadAttachment: (file: File, fieldName: string) => Promise<{ url: string; fileId: string }>;
  deleteAttachment: (fileId: string) => Promise<void>;
}

// Hook for getting paginated form submissions
export function useFormSubmissions(options?: QueryOptions): UseFormSubmissionsResult {
  const paginatedResult = usePaginatedApi<FormSubmission>('/api/forms/submissions', {
    immediate: true,
    ...options
  });

  const filterByStatus = useCallback(async (status: string) => {
    await paginatedResult.execute({ 
      url: '/api/forms/submissions/by-status',
      params: { status }
    });
  }, [paginatedResult.execute]);

  const filterByUser = useCallback(async (userId: string) => {
    await paginatedResult.execute({ 
      url: `/api/forms/submissions/by-user/${userId}`
    });
  }, [paginatedResult.execute]);

  const filterByForm = useCallback(async (formId: string) => {
    await paginatedResult.execute({ 
      url: `/api/forms/submissions/by-form/${formId}`
    });
  }, [paginatedResult.execute]);

  return {
    ...paginatedResult,
    filterByStatus,
    filterByUser,
    filterByForm
  };
}

// Hook for getting a single form submission
export function useFormSubmission(id: string, immediate: boolean = true): UseFormSubmissionResult {
  const result = useApiRequest<FormSubmission>(
    { url: `/api/forms/submissions/${id}`, method: 'GET' },
    { immediate }
  );

  const submit = useCallback(async (): Promise<FormSubmission> => {
    return formService.submitForm(id);
  }, [id]);

  const approve = useCallback(async (comments?: string): Promise<FormSubmission> => {
    return formService.approveFormSubmission(id, comments);
  }, [id]);

  const reject = useCallback(async (comments: string): Promise<FormSubmission> => {
    return formService.rejectFormSubmission(id, comments);
  }, [id]);

  const uploadAttachment = useCallback(async (file: File, fieldName: string): Promise<{ url: string; fileId: string }> => {
    return formService.uploadFormAttachment(id, file, fieldName);
  }, [id]);

  const deleteAttachment = useCallback(async (fileId: string): Promise<void> => {
    return formService.deleteFormAttachment(id, fileId);
  }, [id]);

  return {
    ...result,
    submit,
    approve,
    reject,
    uploadAttachment,
    deleteAttachment
  };
}

// Hook for creating a form submission
export function useCreateFormSubmission() {
  return useApiRequest<FormSubmission>(
    { url: '/api/forms/submissions', method: 'POST' },
    { immediate: false }
  );
}

// Hook for updating a form submission
export function useUpdateFormSubmission(id: string) {
  return useApiRequest<FormSubmission>(
    { url: `/api/forms/submissions/${id}`, method: 'PUT' },
    { immediate: false }
  );
}

// Hook for submitting a form
export function useSubmitForm() {
  return useApiRequest<FormSubmission>(
    { url: '', method: 'POST' },
    { immediate: false }
  );
}

// Advanced form management hook
export function useFormManagement() {
  const createSubmission = useCreateFormSubmission();
  const updateSubmission = useApiRequest<FormSubmission>(
    { url: '', method: 'PUT' },
    { immediate: false }
  );
  const submitForm = useSubmitForm();
  const approveSubmission = useApiRequest<FormSubmission>(
    { url: '', method: 'POST' },
    { immediate: false }
  );
  const rejectSubmission = useApiRequest<FormSubmission>(
    { url: '', method: 'POST' },
    { immediate: false }
  );

  const handleCreateSubmission = useCallback(async (submissionData: CreateFormSubmissionRequest): Promise<FormSubmission> => {
    return createSubmission.execute({ data: submissionData });
  }, [createSubmission.execute]);

  const handleUpdateSubmission = useCallback(async (id: string, submissionData: UpdateFormSubmissionRequest): Promise<FormSubmission> => {
    return updateSubmission.execute({ 
      url: `/api/forms/submissions/${id}`,
      data: submissionData 
    });
  }, [updateSubmission.execute]);

  const handleSubmitForm = useCallback(async (id: string): Promise<FormSubmission> => {
    return submitForm.execute({ url: `/api/forms/submissions/${id}/submit` });
  }, [submitForm.execute]);

  const handleApproveSubmission = useCallback(async (id: string, comments?: string): Promise<FormSubmission> => {
    return approveSubmission.execute({ 
      url: `/api/forms/submissions/${id}/approve`,
      data: { comments }
    });
  }, [approveSubmission.execute]);

  const handleRejectSubmission = useCallback(async (id: string, comments: string): Promise<FormSubmission> => {
    return rejectSubmission.execute({ 
      url: `/api/forms/submissions/${id}/reject`,
      data: { comments }
    });
  }, [rejectSubmission.execute]);

  return {
    createSubmission: {
      ...createSubmission,
      execute: handleCreateSubmission
    },
    updateSubmission: {
      ...updateSubmission,
      execute: handleUpdateSubmission
    },
    submitForm: {
      ...submitForm,
      execute: handleSubmitForm
    },
    approveSubmission: {
      ...approveSubmission,
      execute: handleApproveSubmission
    },
    rejectSubmission: {
      ...rejectSubmission,
      execute: handleRejectSubmission
    }
  };
}