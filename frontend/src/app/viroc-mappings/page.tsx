'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { virocService } from '@/services/virocService';
import { VirocMapping } from '@/types/viroc';
import {
  ArrowLeft,
  Search,
  Loader2,
  Database,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function VirocMappingsContent() {
  const router = useRouter();
  const [mappings, setMappings] = useState<VirocMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Function to display formula based on formula type
  const getFormulaDisplay = (mapping: VirocMapping): string => {
    if (mapping.formulaType === 'CUSTOM' && mapping.customFormula) {
      return mapping.customFormula;
    }
    
    switch (mapping.formulaType) {
      case 'A_OVER_B':
        return '(A/B) × 100';
      case 'B_OVER_A':
        return '(B/A) × 100';
      case 'DIRECT':
        return 'Direct Value';
      default:
        return mapping.formulaType;
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [page, searchTerm]);

  const fetchMappings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await virocService.getVirocMappings({
        page,
        limit,
        search: searchTerm || undefined,
        onlyActive: true,
      });
      setMappings(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch Viroc mappings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                <Database className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Viroc Mapping Reference
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              Total: <span className="font-semibold">{total}</span> mappings
            </p>
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Viroc ID or name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : mappings.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No mappings found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search term'
                : 'No Viroc mappings available'}
            </p>
          </div>
        ) : (
          /* Mappings Table */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Viroc ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Patient Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Formula
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Benchmark
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mappings.map((mapping) => (
                    <tr key={mapping.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {mapping.virocId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="text-sm font-medium text-gray-900">
                            {mapping.name}
                          </p>
                          <div className="mt-2 space-y-1">
                            {mapping.formulaType === 'CUSTOM' && mapping.variableDescriptions ? (
                              /* Show custom variable descriptions */
                              Object.entries(mapping.variableDescriptions).map(([key, desc]) => (
                                <p key={key} className="text-xs text-gray-600">
                                  <span className="font-semibold">{key}:</span> {desc}
                                </p>
                              ))
                            ) : (
                              /* Show standard numerator/denominator */
                              <>
                                <p className="text-xs text-gray-600">
                                  <span className="font-semibold">Numerator:</span>{' '}
                                  {mapping.numeratorField}
                                </p>
                                <p className="text-xs text-gray-600">
                                  <span className="font-semibold">Denominator:</span>{' '}
                                  {mapping.denominatorField}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                          {mapping.patientType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-mono font-semibold text-blue-700">
                            {getFormulaDisplay(mapping)}
                          </p>
                          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            {mapping.formulaType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {mapping.acceptableBenchmark !== null ? (
                            <>
                              <p className="text-green-700 font-semibold">
                                ≥ {mapping.acceptableBenchmark}%
                              </p>
                              {mapping.nonCompliantBenchmark !== null && (
                                <p className="text-red-700 text-xs">
                                  &lt; {mapping.nonCompliantBenchmark}%
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-500 text-xs italic">No benchmark set</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function VirocMappingsPage() {
  return (
    <ProtectedRoute>
      <VirocMappingsContent />
    </ProtectedRoute>
  );
} 