export interface VirocMapping {
  id: string;
  virocId: string;
  name: string;
  formulaType: string;
  numeratorField: string;
  denominatorField: string;
  customFormula?: string | null; // For CUSTOM formula type
  variableDescriptions?: Record<string, string> | null; // e.g., { "A": "Blood components used", "B": "Total products" }
  patientType: string;
  acceptableBenchmark: number | null;
  nonCompliantBenchmark: number | null;
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