import apiClient from '@/lib/axios';

export interface Department {
  id: string;
  name: string;
  _count?: {
    formSubmissions: number;
  };
}

export interface DepartmentResponse {
  success: boolean;
  message: string;
  data: Department[];
}

export const departmentService = {
  async getDepartments(): Promise<DepartmentResponse> {
    const response = await apiClient.get<DepartmentResponse>('/departments');
    return response.data;
  },
}; 