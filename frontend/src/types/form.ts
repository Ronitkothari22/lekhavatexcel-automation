export interface FormSubmissionRequest {
  virocMappingId: string;
  numerator: number;
  denominator: number;
  entryDate: string;
  remarks?: string;
  customValues?: Record<string, number>; // For custom formulas
}

export interface FormSubmission {
  id: string;
  qiNo: string;
  indicatorName: string;
  numerator: number;
  denominator: number;
  percentage: number;
  customValues?: Record<string, number> | null; // For custom formulas
  customPercentage?: number | null; // Calculated from custom formula
  responsibility: string;
  monthlyReportingBy: string;
  acceptableBenchmark: string;
  criteria: string;
  sampleSize: string;
  relatedDefinition: string;
  relatedCommittee: string;
  remarks: string | null;
  entryDate: string;
  entryMonth: number;
  opdIpd?: string; // IPD or OPD
  status?: string;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  department: {
    id: string;
    name: string;
  };
  virocMapping: {
    virocId: string;
    name: string;
    formulaType?: string;
    customFormula?: string | null;
    variableDescriptions?: Record<string, string> | null;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface FormSubmissionResponse {
  success: boolean;
  message: string;
  data: FormSubmission;
}

export interface FormSubmissionsListResponse {
  success: boolean;
  data: FormSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 