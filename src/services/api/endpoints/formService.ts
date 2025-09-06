/**
 * Form Service API endpoints
 * Handles form submission and management API operations
 */

import { apiService } from '../ApiService';
import { 
  FormSubmission, 
  CreateFormSubmissionRequest, 
  UpdateFormSubmissionRequest,
  PaginatedResponse,
  QueryOptions 
} from '../types';

export class FormService {
  private baseUrl = '/api/forms';

  async getFormSubmissions(options?: QueryOptions): Promise<PaginatedResponse<FormSubmission>> {
    const params = this.buildQueryParams(options);
    return apiService.get<PaginatedResponse<FormSubmission>>(`${this.baseUrl}/submissions`, { params });
  }

  async getFormSubmissionById(id: string): Promise<FormSubmission> {
    return apiService.get<FormSubmission>(`${this.baseUrl}/submissions/${id}`);
  }

  async createFormSubmission(submissionData: CreateFormSubmissionRequest): Promise<FormSubmission> {
    return apiService.post<FormSubmission>(`${this.baseUrl}/submissions`, submissionData);
  }

  async updateFormSubmission(id: string, submissionData: UpdateFormSubmissionRequest): Promise<FormSubmission> {
    return apiService.put<FormSubmission>(`${this.baseUrl}/submissions/${id}`, submissionData);
  }

  async deleteFormSubmission(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/submissions/${id}`);
  }

  async submitForm(id: string): Promise<FormSubmission> {
    return apiService.post<FormSubmission>(`${this.baseUrl}/submissions/${id}/submit`);
  }

  async approveFormSubmission(id: string, comments?: string): Promise<FormSubmission> {
    return apiService.post<FormSubmission>(`${this.baseUrl}/submissions/${id}/approve`, { comments });
  }

  async rejectFormSubmission(id: string, comments: string): Promise<FormSubmission> {
    return apiService.post<FormSubmission>(`${this.baseUrl}/submissions/${id}/reject`, { comments });
  }

  async getFormSubmissionsByUser(userId: string, options?: QueryOptions): Promise<PaginatedResponse<FormSubmission>> {
    const params = this.buildQueryParams(options);
    return apiService.get<PaginatedResponse<FormSubmission>>(`${this.baseUrl}/submissions/by-user/${userId}`, { params });
  }

  async getFormSubmissionsByForm(formId: string, options?: QueryOptions): Promise<PaginatedResponse<FormSubmission>> {
    const params = this.buildQueryParams(options);
    return apiService.get<PaginatedResponse<FormSubmission>>(`${this.baseUrl}/submissions/by-form/${formId}`, { params });
  }

  async getFormSubmissionsByStatus(status: string, options?: QueryOptions): Promise<PaginatedResponse<FormSubmission>> {
    const params = {
      ...this.buildQueryParams(options),
      status
    };
    return apiService.get<PaginatedResponse<FormSubmission>>(`${this.baseUrl}/submissions/by-status`, { params });
  }

  async uploadFormAttachment(submissionId: string, file: File, fieldName: string): Promise<{ url: string; fileId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldName', fieldName);

    return apiService.post<{ url: string; fileId: string }>(
      `${this.baseUrl}/submissions/${submissionId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  }

  async deleteFormAttachment(submissionId: string, fileId: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/submissions/${submissionId}/attachments/${fileId}`);
  }

  async exportFormSubmissions(formId: string, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    return apiService.get<Blob>(`${this.baseUrl}/${formId}/export`, {
      params: { format },
      headers: {
        'Accept': 'application/octet-stream'
      }
    });
  }

  private buildQueryParams(options?: QueryOptions): Record<string, any> {
    if (!options) return {};

    const params: Record<string, any> = {};

    if (options.page) params.page = options.page;
    if (options.pageSize) params.pageSize = options.pageSize;
    if (options.search) params.search = options.search;
    
    if (options.sort && options.sort.length > 0) {
      params.sort = options.sort.map(s => `${s.field}:${s.direction}`).join(',');
    }
    
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params[`filter.${key}`] = value;
        }
      });
    }

    if (options.include) {
      params.include = options.include.join(',');
    }

    if (options.exclude) {
      params.exclude = options.exclude.join(',');
    }

    return params;
  }
}

// Export singleton instance
export const formService = new FormService();