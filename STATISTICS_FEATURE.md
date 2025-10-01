# Statistics Feature Documentation

## Overview
A new **Statistics** section has been added to the application that allows users to:
- Filter form submissions by year, month, department, and VIROC mapping
- View data in two modes: yearly (detailed) and monthly (aggregated with averages)
- Export filtered data to Excel format (.xlsx)

## Features

### 1. Advanced Filtering
Users can filter data using multiple criteria:
- **Year**: Select from last 10 years or view all years
- **Month**: Select specific month (January-December) or view all months
- **Department**: Filter by department (IPD, OPD, etc.)
- **VIROC ID**: Filter by specific VIROC mapping

### 2. Month-wise Average Calculation
When the "Month-wise" toggle is enabled:
- Data is grouped by VIROC ID
- Calculates average percentage for submissions with the same VIROC ID
- Shows count of submissions per VIROC ID
- Perfect for analyzing trends and performance over time

### 3. Excel Export
The export functionality creates well-formatted Excel files with:
- **Month-wise export**: Shows VIROC ID, Indicator Name, Department, Count, and Average Percentage
- **Yearly export**: Shows all submission details including dates, numerator, denominator, percentage, status, and remarks
- Auto-sized columns for better readability
- Descriptive filenames (e.g., `statistics_monthly_2024_3.xlsx` or `statistics_yearly_2024.xlsx`)

## File Structure

### New Files Created:
1. **`frontend/src/services/departmentService.ts`** - Service for fetching departments
2. **`frontend/src/services/statisticsService.ts`** - Core statistics logic and Excel export
3. **`frontend/src/types/statistics.ts`** - TypeScript interfaces for statistics
4. **`frontend/src/app/statistics/page.tsx`** - Statistics page UI

### Modified Files:
1. **`frontend/src/app/dashboard/page.tsx`** - Added Statistics card to dashboard
2. **`frontend/src/types/form.ts`** - Added optional `status` field
3. **`frontend/package.json`** - Added xlsx dependencies

## How to Use

### Accessing Statistics
1. Login to the application
2. From the Dashboard, click on the **Statistics** card (orange icon)
3. The Statistics page will open with filter options

### Filtering Data
1. Select desired filters (year, month, department, VIROC ID)
2. Check "Month-wise" if you want averaged data grouped by VIROC ID
3. Click **"Apply Filters"** button
4. View the results in the table below

### Exporting to Excel
1. After applying filters and viewing data
2. Click the **"Export to Excel"** button (green button)
3. The Excel file will automatically download to your default downloads folder

### Example Use Cases

#### Use Case 1: Monthly Report for IPD Department
```
Filters:
- Year: 2024
- Month: March
- Department: IPD
- Month-wise: Checked

Result: Shows average performance for each VIROC ID in IPD for March 2024
```

#### Use Case 2: Yearly Data Export
```
Filters:
- Year: 2024
- Month: All Months
- Month-wise: Unchecked

Result: Shows all individual submissions for 2024 with complete details
```

#### Use Case 3: Specific VIROC Analysis
```
Filters:
- VIROC ID: IPD/01/001
- Year: 2024
- Month-wise: Checked

Result: Shows average percentage for IPD/01/001 across all months in 2024
```

## Excel File Structure

### Month-wise Export Columns:
- VIROC ID
- Indicator Name
- Department
- Number of Submissions
- Average Percentage

### Yearly Export Columns:
- VIROC ID
- Indicator Name
- Department
- Entry Date
- Numerator
- Denominator
- Percentage
- Status
- Remarks

## Technical Details

### Dependencies Added:
```json
{
  "xlsx": "Latest version",
  "@types/xlsx": "Latest version"
}
```

### API Endpoints Used:
- `GET /departments` - Fetch all departments
- `GET /viroc` - Fetch all VIROC mappings
- `GET /forms/my-submissions` - Fetch user's form submissions (with large limit for statistics)

### Client-Side Processing:
The statistics feature performs filtering and aggregation on the client side to:
- Reduce server load
- Enable dynamic filtering without API calls
- Calculate averages for month-wise data efficiently

### Average Calculation Logic:
For month-wise data with the same VIROC ID:
```typescript
averagePercentage = sum(all percentages for same VIROC ID) / count(submissions)
```
Result is rounded to 2 decimal places.

## Performance Considerations

- Fetches up to 10,000 submissions at once (should be sufficient for most use cases)
- Uses client-side filtering for instant results
- Excel export uses efficient streaming for large datasets
- Tables show maximum 50 rows on screen; full data available in Excel

## Future Enhancements (Potential)

1. **Date Range Selection**: Allow custom date ranges instead of just year/month
2. **Charts and Graphs**: Visual representation of statistics
3. **Scheduled Reports**: Auto-generate and email reports
4. **Comparison Mode**: Compare data across different time periods
5. **PDF Export**: Alternative export format
6. **Custom Columns**: Let users choose which columns to export

## Notes

- Only user's own submissions are included in statistics (based on API endpoint `/forms/my-submissions`)
- All dates are displayed in local format
- Status field shows "N/A" if not available
- Empty remarks are shown as empty strings in Excel

## Support

For issues or questions about the Statistics feature, please contact the development team. 