/**
 * API Hooks Index
 * Exports all React hooks for API integration
 */

// Core API hooks
export {
  useApiRequest,
  useGet,
  usePost,
  usePut,
  useDelete,
  usePaginatedApi,
  type UseApiRequestOptions,
  type UseApiRequestResult,
  type UsePaginatedApiOptions,
  type UsePaginatedApiResult
} from './useApiRequest';

export {
  useApiCache,
  type UseApiCacheResult
} from './useApiCache';

export {
  useApiMetrics,
  type UseApiMetricsResult
} from './useApiMetrics';

// Service-specific hooks
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type UseUsersResult,
  type UseUserResult
} from './useUsers';

export {
  useFormSubmissions,
  useFormSubmission,
  useCreateFormSubmission,
  useUpdateFormSubmission,
  useSubmitForm,
  type UseFormSubmissionsResult,
  type UseFormSubmissionResult
} from './useFormSubmissions';