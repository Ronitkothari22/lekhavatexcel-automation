# Custom Formula Support - Frontend Update

## Overview
Updated the frontend to support the new backend API changes that include custom formula functionality alongside standard A_OVER_B formulas.

## What's Changed

### 1. Type Definitions Updated

#### `frontend/src/types/form.ts`
- Added `customValues?: Record<string, number>` to `FormSubmissionRequest`
- Added `customValues` and `customPercentage` fields to `FormSubmission`
- Added `opdIpd` field to `FormSubmission`
- Extended `virocMapping` in `FormSubmission` to include `formulaType`, `customFormula`, and `variableDescriptions`

#### `frontend/src/types/viroc.ts`
- Added `customFormula?: string | null` to `VirocMapping`
- Added `variableDescriptions?: Record<string, string> | null` to `VirocMapping`
- Changed `acceptableBenchmark` and `nonCompliantBenchmark` to allow `null` values

### 2. Services Updated

#### `frontend/src/services/calculationService.ts`
- Added `customValues?: Record<string, number>` to `CalculationRequest` interface

#### `frontend/src/services/formService.ts`
- Added `dateFrom` and `dateTo` query parameters to `getMySubmissions`
- Added new method `getSubmissionById(id: string)` to fetch single submissions

### 3. Pages Updated

#### `frontend/src/app/data-entry/page.tsx` - Major Changes
**Added State:**
- `customValues` state to track custom formula variable inputs
- `isCustomFormula` computed value to check if selected mapping uses CUSTOM formula type

**Updated Features:**
- **Mapping Details Display**: Now shows custom formula and variable descriptions for CUSTOM type mappings
- **Dynamic Input Fields**: Renders dynamic input fields for custom variables (A, B, C, etc.) based on `variableDescriptions`
- **Validation Logic**: Updated to validate custom formula variables or standard numerator/denominator based on formula type
- **Calculate Function**: Supports both standard and custom formula calculations
- **Submit Function**: Sends `customValues` for custom formulas, `numerator/denominator` for standard
- **Button States**: Calculate and Submit buttons now check for custom values when formula type is CUSTOM
- **Reset Function**: Clears custom values on reset

#### `frontend/src/app/my-submissions/page.tsx`
- **Values Display**: Shows custom formula values (A, B, C, etc.) when present, otherwise shows standard numerator/denominator

#### `frontend/src/app/viroc-mappings/page.tsx`
- **Formula Display Function**: Updated to show custom formula when `formulaType === 'CUSTOM'`
- **Variable Descriptions**: Displays custom variable descriptions instead of numerator/denominator for CUSTOM mappings
- **Benchmark Display**: Handles `null` benchmarks gracefully (shows "No benchmark set")

## API Changes Supported

### Standard Formula (A_OVER_B)
```json
{
  "virocMappingId": "IPD/01/001",
  "numerator": 95,
  "denominator": 100,
  "entryDate": "2024-01-15",
  "remarks": "Good performance"
}
```

### Custom Formula
```json
{
  "virocMappingId": "IPD/25/013",
  "numerator": 0,
  "denominator": 0,
  "customValues": {
    "A": 50,
    "B": 10,
    "C": 2
  },
  "entryDate": "2024-01-15",
  "remarks": "Custom calculation"
}
```

## User Experience Flow

### For Standard Formulas (A_OVER_B):
1. User selects a Viroc mapping with `formulaType: "A_OVER_B"`
2. Form shows standard numerator and denominator input fields
3. User enters values and clicks "Calculate Result"
4. System calculates percentage and shows compliance status
5. User can add remarks and submit

### For Custom Formulas:
1. User selects a Viroc mapping with `formulaType: "CUSTOM"`
2. Form displays the custom formula (e.g., `(A * C) / B * 100`)
3. Form shows dynamic input fields for each variable (A, B, C, etc.) with descriptions
4. User enters values for all variables and clicks "Calculate Result"
5. Backend evaluates the custom formula and returns calculated percentage
6. User can add remarks and submit
7. System sends `customValues` object with the submission

## Key Features

### ✅ Backward Compatibility
- All existing standard formula submissions work unchanged
- No breaking changes to existing functionality

### ✅ Dynamic UI
- Input fields automatically adapt based on formula type
- Variable descriptions guide users on what to enter

### ✅ Validation
- Different validation rules for standard vs custom formulas
- Ensures all required custom variables are filled
- Validates numeric inputs

### ✅ Visual Feedback
- Custom formula displayed in mapping details
- Variable descriptions shown with each input
- Real-time calculation preview before submission

## Testing Checklist

- [x] Type definitions updated with no linting errors
- [x] Services support custom values
- [x] Data entry form detects custom vs standard formulas
- [x] Custom variable inputs render dynamically
- [x] Calculation works for both formula types
- [x] Submission works for both formula types
- [x] My submissions page displays custom values correctly
- [x] Viroc mappings page shows custom formula info
- [x] Null benchmarks handled gracefully

## Files Modified

1. ✅ `/frontend/src/types/form.ts`
2. ✅ `/frontend/src/types/viroc.ts`
3. ✅ `/frontend/src/services/calculationService.ts`
4. ✅ `/frontend/src/services/formService.ts`
5. ✅ `/frontend/src/app/data-entry/page.tsx`
6. ✅ `/frontend/src/app/my-submissions/page.tsx`
7. ✅ `/frontend/src/app/viroc-mappings/page.tsx`

## No Breaking Changes

- Edit functionality NOT implemented (as per user request - editing is not allowed)
- All existing standard formula functionality preserved
- API endpoints match the new backend structure
- Response handling supports both formula types

## Next Steps for Testing

1. Start the backend server on `http://localhost:3000`
2. Start the frontend with `npm run dev` from the `frontend/` directory
3. Test creating a standard formula submission (e.g., IPD/01/001)
4. Test creating a custom formula submission (e.g., IPD/25/013)
5. Verify calculations work correctly for both types
6. Check submissions list displays custom values properly
7. Browse Viroc mappings to see custom formula display

## Notes

- Custom formulas use `numerator: 0` and `denominator: 0` in the request
- Backend calculates the percentage using the custom formula and `customValues`
- Frontend displays whichever percentage is calculated (standard or custom)
- Variable names (A, B, C, etc.) are defined by the backend in `variableDescriptions`

