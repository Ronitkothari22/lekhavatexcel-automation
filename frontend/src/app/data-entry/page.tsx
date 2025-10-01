'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { virocService } from '@/services/virocService';
import { formService } from '@/services/formService';
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
} from 'lucide-react';

function DataEntryContent() {
  const router = useRouter();
  const [virocMappings, setVirocMappings] = useState<VirocMapping[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<VirocMapping | null>(null);
  const [numerator, setNumerator] = useState('');
  const [denominator, setDenominator] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVirocMappings();
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setEntryDate(today);
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

  const handleSubmit = async () => {
    if (!selectedMapping || !numerator || !denominator || !entryDate) {
      setError('Please fill in all required fields');
      return;
    }

    const num = parseFloat(numerator);
    const den = parseFloat(denominator);

    if (isNaN(num) || isNaN(den) || den === 0) {
      setError('Please enter valid numbers. Denominator cannot be zero.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess(false);

      await formService.submitForm({
        virocMappingId: selectedMapping.virocId,
        numerator: num,
        denominator: den,
        entryDate,
        remarks: remarks || undefined,
      });

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
    setRemarks('');
    const today = new Date().toISOString().split('T')[0];
    setEntryDate(today);
    setError('');
    setSuccess(false);
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
                    <div>
                      <p className="text-blue-700 font-medium">Acceptable Benchmark:</p>
                      <p className="text-blue-900">≥ {selectedMapping.acceptableBenchmark}%</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-blue-700 font-medium">Numerator Field:</p>
                      <p className="text-blue-900 text-xs">{selectedMapping.numeratorField}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-blue-700 font-medium">Denominator Field:</p>
                      <p className="text-blue-900 text-xs">{selectedMapping.denominatorField}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Input */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Numerator (A Value) *
                  </label>
                  <input
                    type="number"
                    value={numerator}
                    onChange={(e) => setNumerator(e.target.value)}
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
                    onChange={(e) => setDenominator(e.target.value)}
                    placeholder="Enter denominator value"
                    disabled={!selectedMapping}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                  />
                </div>
              </div>

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
                    onChange={(e) => setEntryDate(e.target.value)}
                    disabled={!selectedMapping}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 bg-white hover:border-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Remarks (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any additional remarks or notes..."
                    disabled={!selectedMapping}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 bg-white placeholder:text-gray-400 hover:border-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedMapping || !numerator || !denominator || !entryDate || submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
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
                <button
                  onClick={handleReset}
                  disabled={submitting}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">How to use:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Select a Viroc Mapping from the dropdown</li>
                <li>Enter the numerator (A value) and denominator (B value)</li>
                <li>Select the entry date (defaults to today)</li>
                <li>Optionally add remarks</li>
                <li>Click Submit Form to save your data</li>
              </ol>
            </div>
          </div>
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