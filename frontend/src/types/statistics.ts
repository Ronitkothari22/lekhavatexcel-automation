import { FormSubmission } from './form';

export interface StatisticsFilters {
  year?: number;
  month?: number;
  departmentId?: string;
  virocMappingId?: string;
}

export interface VirocStatistics {
  virocId: string;
  virocName: string;
  department: string;
  count: number;
  averagePercentage: number;
  submissions: FormSubmission[];
}

export interface MonthlyData {
  month: number;
  year: number;
  virocId: string;
  averagePercentage: number;
  count: number;
} 