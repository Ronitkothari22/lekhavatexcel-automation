export interface VirocMapping {
  id: string;
  virocId: string;
  name: string;
  formulaType: string;
  numeratorField: string;
  denominatorField: string;
  patientType: string;
  acceptableBenchmark: number;
  nonCompliantBenchmark: number;
  isActive: boolean;
}

export interface VirocResponse {
  success: boolean;
  message: string;
  data: VirocMapping[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 