import apiClient from '@/lib/axios';
import { FormSubmissionRequest, FormSubmissionResponse, FormSubmissionsListResponse } from '@/types/form';

export const formService = {
  async submitForm(data: FormSubmissionRequest): Promise<FormSubmissionResponse> {
    const response = await apiClient.post<FormSubmissionResponse>('/forms/simple', data);
    return response.data;
  },

  async getMySubmissions(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
  }): Promise<FormSubmissionsListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/forms/my-submissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<FormSubmissionsListResponse>(url);
    return response.data;
  },

  async updateSubmission(
    id: string,
    data: Partial<FormSubmissionRequest>
  ): Promise<FormSubmissionResponse> {
    const response = await apiClient.put<FormSubmissionResponse>(`/forms/simple/${id}`, data);
    return response.data;
  },

  async deleteSubmission(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/forms/${id}`);
    return response.data;
  },
}; 