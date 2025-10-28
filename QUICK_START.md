# Quick Start - Custom Formula Support

## ✅ What Was Updated

The frontend now fully supports your new backend API with **custom formulas** alongside standard formulas.

## 🎯 Key Changes

### 1. **Types & Interfaces** 
- Added support for `customValues`, `customPercentage`, `customFormula`, `variableDescriptions`
- Updated all TypeScript interfaces to match your new API structure

### 2. **Data Entry Form** (`/data-entry`)
- **Detects formula type automatically** (A_OVER_B vs CUSTOM)
- **Standard Formula**: Shows numerator/denominator inputs
- **Custom Formula**: Shows dynamic inputs for variables (A, B, C, etc.)
- Validates based on formula type
- Sends correct payload to backend

### 3. **My Submissions** (`/my-submissions`)
- Displays custom values when present
- Shows standard N/D values for regular formulas

### 4. **Viroc Mappings** (`/viroc-mappings`)
- Shows custom formula in the table
- Displays variable descriptions for custom formulas
- Handles null benchmarks gracefully

## 🚀 How to Test

### Start the Application

```bash
# Backend (should already be running on port 3000)
# Make sure it's running first!

# Frontend
cd /home/ronit/Documents/lekhavatexcel-automation/frontend
npm run dev
```

The app will open at `http://localhost:3001`

### Test Standard Formula (A_OVER_B)

1. Login to the app
2. Go to **Data Entry** from dashboard
3. Select a mapping like **IPD/01/001** (standard A_OVER_B type)
4. You'll see:
   - Numerator (A Value) input
   - Denominator (B Value) input
5. Enter values (e.g., 95 and 100)
6. Click **Calculate Result**
7. See percentage and compliance status
8. Click **Submit Form**

### Test Custom Formula

1. Go to **Data Entry**
2. Select a mapping like **IPD/25/013** (CUSTOM formula type)
3. You'll see:
   - Custom formula displayed (e.g., `(A * C) / B * 100`)
   - Dynamic inputs for each variable (A, B, C)
   - Description for each variable
4. Enter values (e.g., A=50, B=10, C=2)
5. Click **Calculate Result**
6. Backend calculates using the custom formula
7. See calculated percentage
8. Click **Submit Form**

### View Submissions

1. Go to **My Submissions** from dashboard
2. You'll see all your submissions
3. Custom formula submissions show variables (A: 50, B: 10, C: 2)
4. Standard submissions show (N: 95, D: 100)

### Browse Viroc Mappings

1. Go to **Viroc Mapping Reference** from dashboard
2. Search or browse all quality indicators
3. Custom formula mappings show:
   - The custom formula in the Formula column
   - Variable descriptions in the Name column
   - "No benchmark set" if benchmarks are null

## 📋 API Endpoints Supported

All the endpoints from your API documentation are now fully supported:

- ✅ `POST /api/v1/forms/simple` - Create submission (standard & custom)
- ✅ `POST /api/v1/forms/calculation` - Calculate preview (standard & custom)
- ✅ `PUT /api/v1/forms/simple/:id` - Update submission (available in service, not in UI as requested)
- ✅ `GET /api/v1/forms/my-submissions` - Get user submissions with pagination
- ✅ `GET /api/v1/forms/:id` - Get single submission
- ✅ `DELETE /api/v1/forms/:id` - Delete submission
- ✅ `GET /api/v1/viroc` - Get Viroc mappings with pagination

## 🔍 What to Look For

### Standard Formula Example (IPD/01/001)
- Shows: "TIME FOR INITIAL ASSESSMENT OF INDOOR PATIENTS"
- Formula Type: A_OVER_B
- Inputs: Numerator & Denominator fields
- Calculation: Simple (A/B) × 100

### Custom Formula Example (IPD/25/013)
- Shows: "PERCENTAGE OF BLOOD COMPONENT USAGE"
- Formula Type: CUSTOM
- Custom Formula: `(A * C) / B * 100`
- Inputs: Variable A, Variable B, Variable C (with descriptions)
- Calculation: Backend evaluates the formula

## ⚠️ Important Notes

1. **No Edit Functionality**: As you requested, users cannot edit submissions (the service methods exist but no UI is built for editing)

2. **Custom Values**: For custom formulas, we send:
   ```json
   {
     "numerator": 0,
     "denominator": 0,
     "customValues": { "A": 50, "B": 10, "C": 2 }
   }
   ```

3. **Backward Compatible**: All existing standard formula submissions continue to work without any changes

4. **Null Benchmarks**: The system gracefully handles custom formulas that don't have benchmarks set

## 🎨 UI Behavior

### Selected Mapping Details Card
- Standard formulas show: Numerator Field & Denominator Field
- Custom formulas show: Custom Formula & Variable Descriptions

### Input Section
- Standard formulas: 2 inputs (Numerator, Denominator)
- Custom formulas: N inputs based on number of variables (A, B, C, etc.)

### Calculation Result
- Same display for both types
- Shows percentage, benchmark status, compliance message

## 📁 Documentation Files

- **CUSTOM_FORMULA_UPDATE.md** - Detailed technical changes
- **QUICK_START.md** - This file (quick reference)
- **IMPLEMENTATION_SUMMARY.md** - Original authentication setup
- **STATISTICS_FEATURE.md** - Statistics feature documentation

## ✅ All Set!

Your frontend is now fully updated and ready to work with your new backend API. The system seamlessly handles both standard and custom formulas with automatic detection and appropriate UI rendering.

Test it out and let me know if you need any adjustments! 🚀

