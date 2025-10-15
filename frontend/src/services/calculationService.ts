import apiClient from '@/lib/axios';

export interface CalculationRequest {
  virocMappingId: string;
  numerator: number;
  denominator: number;
}

export interface CalculationResponse {
  success: boolean;
  message: string;
  data: {
    virocId: string;
    indicatorName: string;
    formulaType: string;
    numeratorField: string;
    denominatorField: string;
    numerator: number;
    denominator: number;
    calculatedPercentage: number | null;
    acceptableBenchmark: number | null;
    nonCompliantBenchmark: number | null;
    patientType: string | null;
    department: string;
    benchmarkStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'NO_BENCHMARK';
    message: string;
  };
}

export const calculationService = {
  async calculateForm(data: CalculationRequest): Promise<CalculationResponse> {
    const response = await apiClient.post<CalculationResponse>('/forms/calculation', data);
    return response.data;
  },
};
