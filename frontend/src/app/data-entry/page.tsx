'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { virocService } from '@/services/virocService';
import { formService } from '@/services/formService';
import { calculationService, CalculationResponse } from '@/services/calculationService';
import { VirocMapping } from '@/types/viroc';
import {
  ArrowLeft,
  Edit3,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Calendar,
  FileText,
  Calculator,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Info,
} from 'lucide-react';

function DataEntryContent() {
  const router = useRouter();
  const [virocMappings, setVirocMappings] = useState<VirocMapping[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<VirocMapping | null>(null);
  const [numerator, setNumerator] = useState('');
  const [denominator, setDenominator] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, string>>({}); // For custom formulas
  const [entryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Calculation state
  const [calculationResult, setCalculationResult] = useState<CalculationResponse['data'] | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);

  // Help section state
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);

  // Check if selected mapping uses custom formula
  const isCustomFormula = selectedMapping?.formulaType === 'CUSTOM';

  useEffect(() => {
    fetchVirocMappings();
  }, []);

  const fetchVirocMappings = async () => {
    try {
      setLoading(true);
      const response = await virocService.getVirocMappings({
        limit: 1000,
        onlyActive: true,
      });
      setVirocMappings(response.data);
    } catch (err) {
      console.error('Failed to fetch Viroc mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMappings = virocMappings.filter(
    (m) =>
      m.virocId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset calculation when values change
  const resetCalculation = () => {
    setCalculationResult(null);
    setCalculationError('');
    setIsCalculated(false);
  };

  const handleCalculate = async () => {
    if (!selectedMapping) {
      setCalculationError('Please select a Viroc mapping');
      return;
    }

    // Validate inputs based on formula type
    if (isCustomFormula) {
      // For custom formulas, check if all variables are filled
      const requiredVariables = selectedMapping.variableDescriptions ? Object.keys(selectedMapping.variableDescriptions) : [];
      const missingVariables = requiredVariables.filter(v => !customValues[v] || customValues[v].trim() === '');
      
      if (missingVariables.length > 0) {
        setCalculationError(`Please fill in all custom formula variables: ${missingVariables.join(', ')}`);
        return;
      }

      // Validate all values are numbers
      const invalidVariables = requiredVariables.filter(v => isNaN(parseFloat(customValues[v])));
      if (invalidVariables.length > 0) {
        setCalculationError(`Please enter valid numbers for: ${invalidVariables.join(', ')}`);
        return;
      }
    } else {
      // For standard formulas, check numerator and denominator
      if (!numerator || !denominator) {
        setCalculationError('Please fill in all required fields before calculating');
        return;
      }

      const num = parseFloat(numerator);
      const den = parseFloat(denominator);

      if (isNaN(num) || isNaN(den)) {
        setCalculationError('Please enter valid numbers.');
        return;
      }

      if (den === 0) {
        setCalculationError('Denominator cannot be zero.');
        return;
      }
    }

    try {
      setCalculating(true);
      setCalculationError('');
      setError('');

      const requestData: {
        virocMappingId: string;
        numerator: number;
        denominator: number;
        customValues?: Record<string, number>;
      } = {
        virocMappingId: selectedMapping.virocId,
        numerator: isCustomFormula ? 0 : parseFloat(numerator),
        denominator: isCustomFormula ? 0 : parseFloat(denominator),
      };

      if (isCustomFormula) {
        requestData.customValues = Object.entries(customValues).reduce((acc, [key, value]) => {
          acc[key] = parseFloat(value);
          return acc;
        }, {} as Record<string, number>);
      }

      const response = await calculationService.calculateForm(requestData);

      setCalculationResult(response.data);
      setIsCalculated(true);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setCalculationError(error.response?.data?.message || 'Failed to calculate result');
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMapping) {
      setError('Please select a Viroc mapping');
      return;
    }

    // Validate based on formula type
    if (isCustomFormula) {
      if (!selectedMapping.variableDescriptions) {
        setError('Custom formula configuration is missing. Please contact support.');
        return;
      }
      
      const requiredVariables = Object.keys(selectedMapping.variableDescriptions);
      const missingVariables = requiredVariables.filter(v => !customValues[v] || customValues[v].trim() === '');
      
      if (missingVariables.length > 0) {
        setError(`Please fill in all custom formula variables: ${missingVariables.join(', ')}`);
        return;
      }
    } else {
      if (!numerator || !denominator) {
        setError('Please fill in all required fields');
        return;
      }
    }

    if (!isCalculated) {
      setError('Please calculate the result before submitting');
      return;
    }

    // Check if result is below non-compliant benchmark and remarks are required
    if (calculationResult && 
        calculationResult.calculatedPercentage !== null && 
        calculationResult.nonCompliantBenchmark !== null &&
        calculationResult.calculatedPercentage < calculationResult.nonCompliantBenchmark && 
        !remarks.trim()) {
      setError('Remarks are required when result is below the non-compliant benchmark. Please add remarks explaining the deviation.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess(false);

      const submissionData: {
        virocMappingId: string;
        numerator: number;
        denominator: number;
        entryDate: string;
        remarks?: string;
        customValues?: Record<string, number>;
      } = {
        virocMappingId: selectedMapping.virocId,
        numerator: isCustomFormula ? 0 : parseFloat(numerator),
        denominator: isCustomFormula ? 0 : parseFloat(denominator),
        entryDate,
        remarks: remarks || undefined,
      };

      if (isCustomFormula) {
        submissionData.customValues = Object.entries(customValues).reduce((acc, [key, value]) => {
          acc[key] = parseFloat(value);
          return acc;
        }, {} as Record<string, number>);
      }

      await formService.submitForm(submissionData);

      setSuccess(true);
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Reset form after 4 seconds
      setTimeout(() => {
        handleReset();
        setSuccess(false);
      }, 4000);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedMapping(null);
    setNumerator('');
    setDenominator('');
    setCustomValues({});
    setRemarks('');
    setError('');
    setSuccess(false);
    setCalculationResult(null);
    setCalculationError('');
    setIsCalculated(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-500">
          <div className="bg-white border-2 border-green-500 rounded-xl shadow-2xl p-4 min-w-[400px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-green-900">Success!</p>
                <p className="text-sm text-green-700">Form submitted successfully</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <Edit3 className="w-6 h-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Data Entry Form
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quality Indicator Submission
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              {success && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-top-5 duration-500">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                    </div>
                                         <div className="flex-1">
                       <h3 className="text-xl font-bold text-green-900 mb-1">
                         🎉 Form Submitted Successfully!
                       </h3>
                       <p className="text-green-800 mb-2">
                         Your quality indicator data has been saved successfully.
                       </p>
                       <p className="text-sm text-green-700">
                         You can view and edit your submission anytime from your submissions list.
                       </p>
                     </div>
                  </div>
                                     <div className="mt-4 pt-4 border-t border-green-200 flex items-center justify-between">
                    <p className="text-sm text-green-700">
                      Form will reset automatically in a moment...
                    </p>
                    <button
                      onClick={() => router.push('/my-submissions')}
                      className="text-sm font-semibold text-green-700 hover:text-green-900 underline"
                    >
                      View My Submissions →
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Viroc Mapping Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Viroc Mapping *
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Viroc ID or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-400 transition"
                  />
                </div>
                <select
                  value={selectedMapping?.id || ''}
                  onChange={(e) => {
                    const mapping = virocMappings.find((m) => m.id === e.target.value);
                    setSelectedMapping(mapping || null);
                    setCustomValues({}); // Reset custom values
                    resetCalculation();
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 bg-white hover:border-gray-400 transition cursor-pointer"
                >
                  <option value="" className="text-gray-500">-- Select a Viroc Mapping --</option>
                  {filteredMappings.map((mapping) => (
                    <option key={mapping.id} value={mapping.id} className="text-gray-900 bg-white py-2">
                      {mapping.virocId} - {mapping.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Mapping Details */}
              {selectedMapping && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    Selected Mapping Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Viroc ID:</p>
                      <p className="text-blue-900 font-mono">{selectedMapping.virocId}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Patient Type:</p>
                      <p className="text-blue-900">{selectedMapping.patientType}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Formula Type:</p>
                      <p className="text-blue-900">{selectedMapping.formulaType}</p>
                    </div>
                    {selectedMapping.nonCompliantBenchmark !== null && (
                      <div>
                        <p className="text-blue-700 font-medium">Non-Compliant Benchmark:</p>
                        <p className="text-blue-900">≥ {selectedMapping.nonCompliantBenchmark}%</p>
                      </div>
                    )}
                    {isCustomFormula && selectedMapping.customFormula ? (
                      <>
                        <div className="col-span-2">
                          <p className="text-blue-700 font-medium">Custom Formula:</p>
                          <p className="text-blue-900 font-mono text-xs bg-white px-2 py-1 rounded">
                            {selectedMapping.customFormula}
                          </p>
                        </div>
                        {selectedMapping.variableDescriptions && (
                          <div className="col-span-2">
                            <p className="text-blue-700 font-medium mb-2">Variable Descriptions:</p>
                            <div className="space-y-1">
                              {Object.entries(selectedMapping.variableDescriptions).map(([key, desc]) => (
                                <p key={key} className="text-blue-900 text-xs">
                                  <span className="font-bold">{key}:</span> {desc}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="col-span-2">
                          <p className="text-blue-700 font-medium">Numerator Field:</p>
                          <p className="text-blue-900 text-xs">{selectedMapping.numeratorField}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-blue-700 font-medium">Denominator Field:</p>
                          <p className="text-blue-900 text-xs">{selectedMapping.denominatorField}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Data Input */}
              {isCustomFormula && selectedMapping?.variableDescriptions ? (
                /* Custom Formula Inputs */
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Custom Formula Values *
                  </h3>
                  {selectedMapping.customFormula && (
                    <p className="text-sm text-gray-600 mb-3">
                      Formula: <span className="font-mono text-blue-700">{selectedMapping.customFormula}</span>
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(selectedMapping.variableDescriptions).map(([variable, description]) => (
                      <div key={variable}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Variable {variable} *
                        </label>
                        <input
                          type="number"
                          value={customValues[variable] || ''}
                          onChange={(e) => {
                            setCustomValues((prev) => ({ ...prev, [variable]: e.target.value }));
                            resetCalculation();
                          }}
                          placeholder={description}
                          disabled={!selectedMapping}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-600">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Standard Formula Inputs */
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Numerator (A Value) *
                    </label>
                    <input
                      type="number"
                      value={numerator}
                      onChange={(e) => {
                        setNumerator(e.target.value);
                        resetCalculation();
                      }}
                      placeholder="Enter numerator value"
                      disabled={!selectedMapping}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Denominator (B Value) *
                    </label>
                    <input
                      type="number"
                      value={denominator}
                      onChange={(e) => {
                        setDenominator(e.target.value);
                        resetCalculation();
                      }}
                      placeholder="Enter denominator value"
                      disabled={!selectedMapping}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                    />
                  </div>
                </div>
              )}

              {/* Entry Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Entry Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={entryDate}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Date is automatically set to today
                </p>
              </div>

              {/* Remarks - Only show after calculation */}
              {calculationResult && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Remarks {(() => {
                      const isBelowNonCompliant = calculationResult.calculatedPercentage !== null && 
                        calculationResult.nonCompliantBenchmark !== null &&
                        calculationResult.calculatedPercentage < calculationResult.nonCompliantBenchmark;
                      return isBelowNonCompliant ? '*' : '(Optional)';
                    })()}
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder={(() => {
                        const isBelowNonCompliant = calculationResult.calculatedPercentage !== null && 
                          calculationResult.nonCompliantBenchmark !== null &&
                          calculationResult.calculatedPercentage < calculationResult.nonCompliantBenchmark;
                        return isBelowNonCompliant
                          ? "Remarks are required when result is below the non-compliant benchmark. Please explain the deviation..."
                          : "Add any additional remarks or notes...";
                      })()}
                      disabled={!selectedMapping}
                      rows={4}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 resize-none ${
                        (() => {
                          const isBelowNonCompliant = calculationResult.calculatedPercentage !== null && 
                            calculationResult.nonCompliantBenchmark !== null &&
                            calculationResult.calculatedPercentage < calculationResult.nonCompliantBenchmark;
                          return isBelowNonCompliant && !remarks.trim()
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300';
                        })()
                      }`}
                    />
                  </div>
                  {(() => {
                    const isBelowNonCompliant = calculationResult.calculatedPercentage !== null && 
                      calculationResult.nonCompliantBenchmark !== null &&
                      calculationResult.calculatedPercentage < calculationResult.nonCompliantBenchmark;
                    return isBelowNonCompliant && (
                      <p className="mt-1 text-sm text-red-600 font-medium">
                        * Remarks are required when result is below the non-compliant benchmark
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* Calculation Result Display */}
              {calculationResult && (
                <div className={`rounded-lg p-6 border-2 ${
                  calculationResult.benchmarkStatus === 'COMPLIANT'
                    ? 'bg-green-50 border-green-200'
                    : calculationResult.benchmarkStatus === 'NON_COMPLIANT'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      calculationResult.benchmarkStatus === 'COMPLIANT'
                        ? 'bg-green-500'
                        : calculationResult.benchmarkStatus === 'NON_COMPLIANT'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}>
                      {calculationResult.benchmarkStatus === 'COMPLIANT' ? (
                        <CheckCircle className="w-7 h-7 text-white" />
                      ) : calculationResult.benchmarkStatus === 'NON_COMPLIANT' ? (
                        <XCircle className="w-7 h-7 text-white" />
                      ) : (
                        <AlertCircle className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Calculation Result
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700">Percentage:</span>
                          <span className={`font-bold ${
                            calculationResult.benchmarkStatus === 'COMPLIANT'
                              ? 'text-green-700'
                              : calculationResult.benchmarkStatus === 'NON_COMPLIANT'
                              ? 'text-red-700'
                              : 'text-yellow-700'
                          }`}>
                            {calculationResult.calculatedPercentage?.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700">Non-Compliant Benchmark:</span>
                          <span className="text-gray-700">
                            ≥ {calculationResult.nonCompliantBenchmark}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700">Status:</span>
                          <span className={`font-semibold ${
                            calculationResult.benchmarkStatus === 'COMPLIANT'
                              ? 'text-green-700'
                              : calculationResult.benchmarkStatus === 'NON_COMPLIANT'
                              ? 'text-red-700'
                              : 'text-yellow-700'
                          }`}>
                            {calculationResult.benchmarkStatus === 'COMPLIANT' ? 'COMPLIANT' : 
                             calculationResult.benchmarkStatus === 'NON_COMPLIANT' ? 'NON-COMPLIANT' : 
                             'NO BENCHMARK'}
                          </span>
                        </div>
                        <div className="mt-3 p-3 bg-white rounded-lg border">
                          <p className="text-sm font-medium text-gray-900">
                            {calculationResult.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculation Error */}
              {calculationError && (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="text-red-700">{calculationError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Calculate Button */}
                <div className="flex gap-4">
                  <button
                    onClick={handleCalculate}
                    disabled={
                      !selectedMapping || 
                      calculating ||
                      (isCustomFormula 
                        ? !selectedMapping?.variableDescriptions || Object.keys(selectedMapping.variableDescriptions).some(v => !customValues[v])
                        : !numerator || !denominator
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    {calculating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5" />
                        Calculate Result
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={calculating || submitting}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={
                    !selectedMapping || 
                    !isCalculated || 
                    submitting ||
                    (isCustomFormula 
                      ? !selectedMapping?.variableDescriptions || Object.keys(selectedMapping.variableDescriptions).some(v => !customValues[v])
                      : !numerator || !denominator
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Form
                    </>
                  )}
                </button>
                
                {!isCalculated && (
                  <p className="text-sm text-gray-600 text-center">
                    Please calculate the result before submitting
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help & Guide Section */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl overflow-hidden shadow-sm">
          {/* Header - Always Visible */}
          <button
            onClick={() => setIsHelpExpanded(!isHelpExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-blue-900">User Guide & Help</h3>
                <p className="text-sm text-blue-700">Learn how to use the Data Entry Form</p>
              </div>
            </div>
            {isHelpExpanded ? (
              <ChevronUp className="w-6 h-6 text-blue-600" />
            ) : (
              <ChevronDown className="w-6 h-6 text-blue-600" />
            )}
          </button>

          {/* Expandable Content */}
          {isHelpExpanded && (
            <div className="px-6 pb-6 space-y-6 animate-in slide-in-from-top-5 fade-in duration-300">
              {/* Quick Start */}
              <div className="bg-white rounded-lg p-5 border border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <h4 className="font-bold text-gray-900">Quick Start Guide</h4>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-8">
                  <li className="pl-2">
                    <strong>Select Quality Indicator:</strong> Choose a Viroc Mapping from the dropdown
                    <span className="block text-xs text-gray-600 mt-1 ml-5">Use the search box to find specific indicators by ID or name</span>
                  </li>
                  <li className="pl-2">
                    <strong>Review Mapping Details:</strong> Check the formula type and requirements
                    <span className="block text-xs text-gray-600 mt-1 ml-5">The system will show either standard or custom formula inputs</span>
                  </li>
                  <li className="pl-2">
                    <strong>Enter Values:</strong> Fill in the required data fields
                    <span className="block text-xs text-gray-600 mt-1 ml-5">For standard formulas: numerator &amp; denominator | For custom: variable values</span>
                  </li>
                  <li className="pl-2">
                    <strong>Calculate Result:</strong> Click &quot;Calculate Result&quot; button to preview
                    <span className="block text-xs text-gray-600 mt-1 ml-5">Review the calculated percentage and compliance status before submitting</span>
                  </li>
                  <li className="pl-2">
                    <strong>Add Remarks (if needed):</strong> Required for non-compliant results
                    <span className="block text-xs text-gray-600 mt-1 ml-5">Explain any deviations or special circumstances</span>
                  </li>
                  <li className="pl-2">
                    <strong>Submit Form:</strong> Click &quot;Submit Form&quot; to save your data
                    <span className="block text-xs text-gray-600 mt-1 ml-5">Your submission will be saved and can be viewed in &quot;My Submissions&quot;</span>
                  </li>
                </ol>
              </div>

              {/* Formula Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Standard Formula */}
                <div className="bg-white rounded-lg p-5 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900">Standard Formula</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-semibold text-green-700">Type: A_OVER_B</p>
                    <p className="font-mono text-xs bg-green-50 px-2 py-1 rounded border border-green-200">
                      Percentage = (Numerator / Denominator) × 100
                    </p>
                    <div className="mt-3 space-y-1">
                      <p><strong>Example:</strong></p>
                      <p className="text-xs">If Numerator = 95 and Denominator = 100</p>
                      <p className="text-xs">Result = (95 / 100) × 100 = <span className="font-bold text-green-700">95%</span></p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-gray-600">
                        <strong>Fields Required:</strong> Numerator (A) and Denominator (B)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custom Formula */}
                <div className="bg-white rounded-lg p-5 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900">Custom Formula</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-semibold text-purple-700">Type: CUSTOM</p>
                    <p className="font-mono text-xs bg-purple-50 px-2 py-1 rounded border border-purple-200">
                      Formula varies by indicator
                    </p>
                    <div className="mt-3 space-y-1">
                      <p><strong>Example:</strong></p>
                      <p className="text-xs font-mono">(A × C) / B × 100</p>
                      <p className="text-xs">If A=50, B=10, C=2</p>
                      <p className="text-xs">Result = (50 × 2) / 10 × 100 = <span className="font-bold text-purple-700">1000%</span></p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs text-gray-600">
                        <strong>Fields Required:</strong> Variable inputs (A, B, C, etc.) with descriptions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-white rounded-lg p-5 border border-orange-200">
                <div className="flex items-start gap-3 mb-3">
                  <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <h4 className="font-bold text-gray-900">Important Notes</h4>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Calculation Required:</strong> You must calculate the result before submitting the form</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Remarks Mandatory:</strong> If your result is below the non-compliant benchmark, you must add remarks explaining the deviation</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Entry Date:</strong> Automatically set to today&apos;s date (cannot be changed)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p><strong>View Submissions:</strong> After submitting, view your data in &quot;My Submissions&quot; from the dashboard</p>
                  </div>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Understanding Compliance Status</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-green-700">COMPLIANT</p>
                      <p className="text-gray-600">Your result meets or exceeds the non-compliant benchmark threshold</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-red-700">NON-COMPLIANT</p>
                      <p className="text-gray-600">Your result is below the benchmark. Remarks are required to explain the deviation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-yellow-700">NO BENCHMARK</p>
                      <p className="text-gray-600">This indicator doesn&apos;t have a defined benchmark. Your result is recorded as-is</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips & Best Practices */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-5 border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Tips &amp; Best Practices
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>Use the <strong>search box</strong> to quickly find specific quality indicators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>Check the <strong>Viroc Mapping Reference</strong> page to browse all available indicators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>Always <strong>calculate first</strong> to verify your result before submitting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>For <strong>custom formulas</strong>, read the variable descriptions carefully to enter correct values</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>Add <strong>detailed remarks</strong> for non-compliant results to help with review process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>Use the <strong>Reset button</strong> to clear the form and start over if needed</span>
                  </li>
                </ul>
              </div>

              {/* Need More Help */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Need more help? Contact your system administrator or quality management team.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DataEntryPage() {
  return (
    <ProtectedRoute>
      <DataEntryContent />
    </ProtectedRoute>
  );
} 