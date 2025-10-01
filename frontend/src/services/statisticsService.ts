import apiClient from '@/lib/axios';
import { FormSubmission, FormSubmissionsListResponse } from '@/types/form';
import { StatisticsFilters, VirocStatistics } from '@/types/statistics';
import * as XLSX from 'xlsx';

export const statisticsService = {
  async getStatisticsData(filters: StatisticsFilters): Promise<FormSubmission[]> {
    // Fetch all submissions by paginating through all pages
    let allData: FormSubmission[] = [];
    let currentPage = 1;
    let totalPages = 1;

    // Keep fetching until we have all pages
    while (currentPage <= totalPages) {
      const response = await apiClient.get<FormSubmissionsListResponse>('/forms/my-submissions', {
        params: {
          page: currentPage,
          limit: 100, // Maximum allowed by API
          sortBy: 'entryDate',
          sortOrder: 'desc',
        },
      });

      allData = [...allData, ...response.data.data];
      totalPages = response.data.pagination.totalPages;
      currentPage++;
    }

    let data = allData;

    // Apply client-side filters
    if (filters.year) {
      data = data.filter((submission: FormSubmission) => {
        const date = new Date(submission.entryDate);
        return date.getFullYear() === filters.year;
      });
    }

    if (filters.month) {
      data = data.filter((submission: FormSubmission) => {
        const date = new Date(submission.entryDate);
        return date.getMonth() + 1 === filters.month;
      });
    }

    if (filters.departmentId) {
      data = data.filter((submission: FormSubmission) => submission.department.id === filters.departmentId);
    }

    if (filters.virocMappingId) {
      data = data.filter((submission: FormSubmission) => submission.virocMapping.virocId === filters.virocMappingId);
    }

    return data;
  },

  groupByVirocId(submissions: FormSubmission[]): VirocStatistics[] {
    const grouped = new Map<string, FormSubmission[]>();

    submissions.forEach((submission) => {
      const virocId = submission.virocMapping.virocId;
      if (!grouped.has(virocId)) {
        grouped.set(virocId, []);
      }
      grouped.get(virocId)!.push(submission);
    });

    const statistics: VirocStatistics[] = [];

    grouped.forEach((subs, virocId) => {
      const averagePercentage = subs.reduce((sum, s) => sum + s.percentage, 0) / subs.length;
      statistics.push({
        virocId,
        virocName: subs[0].virocMapping.name,
        department: subs[0].department.name,
        count: subs.length,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        submissions: subs,
      });
    });

    return statistics.sort((a, b) => a.virocId.localeCompare(b.virocId));
  },

  exportToExcel(
    submissions: FormSubmission[],
    filters: StatisticsFilters,
    isMonthWise: boolean
  ): void {
    let worksheetData: Record<string, string | number>[] = [];
    let filename = 'statistics';

    if (isMonthWise) {
      // Group by VIROC ID and calculate averages
      const statistics = this.groupByVirocId(submissions);
      
      worksheetData = statistics.map((stat) => ({
        'VIROC ID': stat.virocId,
        'Indicator Name': stat.virocName,
        'Department': stat.department,
        'Number of Submissions': stat.count,
        'Average Percentage': stat.averagePercentage + '%',
      }));

      filename = `statistics_monthly_${filters.year || 'all'}_${filters.month || 'all'}`;
    } else {
      // Yearly data - show all submissions
      worksheetData = submissions.map((submission) => ({
        'VIROC ID': submission.virocMapping.virocId,
        'Indicator Name': submission.virocMapping.name,
        'Department': submission.department.name,
        'Entry Date': new Date(submission.entryDate).toLocaleDateString(),
        'Numerator': submission.numerator,
        'Denominator': submission.denominator,
        'Percentage': submission.percentage + '%',
        'Status': submission.status || 'N/A',
        'Remarks': submission.remarks || '',
      }));

      filename = `statistics_yearly_${filters.year || 'all'}`;
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Statistics');

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(worksheetData[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...worksheetData.map((row) => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet['!cols'] = colWidths;

    // Download file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  },
}; 