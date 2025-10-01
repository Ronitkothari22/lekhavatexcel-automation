import apiClient from '@/lib/axios';
import { VirocResponse } from '@/types/viroc';

export const virocService = {
  async getVirocMappings(params?: {
    page?: number;
    limit?: number;
    search?: string;
    onlyActive?: boolean;
  }): Promise<VirocResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.onlyActive !== undefined) {
      queryParams.append('onlyActive', params.onlyActive.toString());
    }

    const url = `/viroc${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<VirocResponse>(url);
    return response.data;
  },
}; 