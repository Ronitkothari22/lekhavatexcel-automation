'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { statisticsService } from '@/services/statisticsService';
import { departmentService, Department } from '@/services/departmentService';
import { virocService } from '@/services/virocService';
import { FormSubmission } from '@/types/form';
import { VirocMapping } from '@/types/viroc';
import { StatisticsFilters, VirocStatistics } from '@/types/statistics';
import {
  ArrowLeft,
  Download,
  Filter,
  Loader2,
  FileSpreadsheet,
  Calendar,
  Building2,
  FileText,
  BarChart3,
} from 'lucide-react';

function StatisticsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState<StatisticsFilters>({});
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [virocMappingId, setVirocMappingId] = useState<string>('');
  const [isMonthWise, setIsMonthWise] = useState(false);
  
  // Data states
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [virocMappings, setVirocMappings] = useState<VirocMapping[]>([]);
  const [statistics, setStatistics] = useState<VirocStatistics[]>([]);

  useEffect(() => {
    fetchDepartments();
    fetchVirocMappings();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchVirocMappings = async () => {
    try {
      const response = await virocService.getVirocMappings({ limit: 1000 });
      setVirocMappings(response.data);
    } catch (err) {
      console.error('Failed to fetch VIROC mappings:', err);
    }
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      setError('');

      const appliedFilters: StatisticsFilters = {
        year: year ? parseInt(year) : undefined,
        month: month ? parseInt(month) : undefined,
        departmentId: departmentId || undefined,
        virocMappingId: virocMappingId || undefined,
      };

      setFilters(appliedFilters);

      const data = await statisticsService.getStatisticsData(appliedFilters);
      setSubmissions(data);

      // If month-wise, calculate averages
      if (isMonthWise) {
        const stats = statisticsService.groupByVirocId(data);
        setStatistics(stats);
      } else {
        setStatistics([]);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      setExporting(true);
      statisticsService.exportToExcel(submissions, filters, isMonthWise);
    } catch {
      setError('Failed to export to Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setYear('');
    setMonth('');
    setDepartmentId('');
    setVirocMappingId('');
    setIsMonthWise(false);
    setSubmissions([]);
    setStatistics([]);
    setFilters({});
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
                  <p className="text-sm text-gray-600">Download and analyze your data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="" className="text-gray-900">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y} className="text-gray-900">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="" className="text-gray-900">All Months</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value} className="text-gray-900">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="" className="text-gray-900">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="text-gray-900">
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* VIROC Mapping Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                VIROC ID
              </label>
              <select
                value={virocMappingId}
                onChange={(e) => setVirocMappingId(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="" className="text-gray-900">All VIROC IDs</option>
                {virocMappings.map((mapping) => (
                  <option key={mapping.id} value={mapping.virocId} className="text-gray-900">
                    {mapping.virocId} - {mapping.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Month-wise toggle */}
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isMonthWise}
                onChange={(e) => setIsMonthWise(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Month-wise (Calculate average percentage for same VIROC ID)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Filter className="w-4 h-4" />
              )}
              <span>{loading ? 'Loading...' : 'Apply Filters'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Reset
            </button>

            {submissions.length > 0 && (
              <button
                onClick={handleExportToExcel}
                disabled={exporting}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Export to Excel</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {submissions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-6 h-6 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {isMonthWise ? 'Statistics Summary' : 'Submissions Data'}
                </h2>
              </div>
              <div className="text-sm text-gray-600">
                Total Records: <span className="font-semibold">{submissions.length}</span>
              </div>
            </div>

            {/* Month-wise Statistics Table */}
            {isMonthWise && statistics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VIROC ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Indicator Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statistics.map((stat, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stat.virocId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {stat.virocName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {stat.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {stat.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {stat.averagePercentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Regular Submissions Table */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VIROC ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Indicator Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.slice(0, 50).map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {submission.virocMapping.virocId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {submission.virocMapping.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {submission.department.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(submission.entryDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {submission.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {submissions.length > 50 && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Showing 50 of {submissions.length} records. Export to Excel to view all.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* No Data Message */}
        {!loading && submissions.length === 0 && Object.keys(filters).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-600">
              No submissions match your filter criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <ProtectedRoute>
      <StatisticsContent />
    </ProtectedRoute>
  );
} 