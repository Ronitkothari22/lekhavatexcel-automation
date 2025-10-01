# User Frontend Development Guide - Excel Automation System

## 📋 Project Overview

This guide provides complete specifications for building the **User Frontend** of the Excel Automation System. The user side allows healthcare professionals to submit quality indicator data with minimal input requirements.

### 🎯 Project Purpose
Healthcare quality management system where users submit quality indicator forms with just:
- **Viroc ID selection** (from dropdown)
- **Numerator (A value)** 
- **Denominator (B value)**
- **Entry date**
- **Optional remarks**

All other fields are auto-populated from the Viroc mapping database.

## 🏗️ Frontend Architecture Requirements

### Technology Stack Recommendations
- **Framework**: Next.js 
- **Styling**: Tailwind CSS / Material-UI / Ant Design
- **State Management**: Redux / Zustand / Context API
- **HTTP Client**: Axios / Fetch API
- **Form Handling**: React Hook Form / Formik
- **Date Picker**: React DatePicker / Ant Design DatePicker

### 📱 Required Pages

1. **Login Page** (`/login`)
2. **Registration Page** (`/register`) 
3. **Dashboard** (`/dashboard`)
4. **Viroc Mappings Reference** (`/viroc-mappings`)
5. **Form Submission** (`/submit-form`)
6. **My Submissions** (`/my-submissions`)
7. **Edit Submission** (`/edit-submission/:id`)

## 🔐 Authentication Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### 1. User Registration
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 2. User Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 3. Get User Profile
**Endpoint:** `GET /auth/profile`
**Headers:** `Authorization: Bearer {accessToken}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true
    }
  }
}
```

## 🎯 Viroc Mappings (Reference Data)

### 1. Get All Viroc Mappings
**Endpoint:** `GET /viroc?page=1&limit=50`
**Headers:** `Authorization: Bearer {accessToken}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Viroc mappings retrieved successfully",
  "data": {
    "mappings": [
      {
        "id": "cmg3uchc8000810flf9dhk74x",
        "virocId": "IPD/01/001",
        "name": "TIME FOR INITIAL ASSESSMENT OF INDOOR PATIENTS",
        "formulaType": "A_OVER_B",
        "numeratorField": "SUM OF TIME TAKEN FOR ASSESSMENT OF PATIENT OF PARTICULAR MONTH",
        "denominatorField": "TOTAL NO OF PATIENT ADMITTED",
        "patientType": "IPD",
        "acceptableBenchmark": 95,
        "nonCompliantBenchmark": 5,
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 102,
      "totalPages": 3
    }
  }
}
```

### 2. Search Viroc Mappings
**Endpoint:** `GET /viroc?search=assessment&onlyActive=true`
**Headers:** `Authorization: Bearer {accessToken}`

## 📝 Form Submission (Core Feature)

### 1. Create Simple Form Submission (Recommended)
**Endpoint:** `POST /forms/simple`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "virocMappingId": "IPD/01/001",
  "numerator": 85,
  "denominator": 100,
  "entryDate": "2024-01-15",
  "remarks": "Optional remarks"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Form submission created successfully",
  "data": {
    "id": "clxxxxx",
    "qiNo": "01",
    "indicatorName": "TIME FOR INITIAL ASSESSMENT OF INDOOR PATIENTS",
    "numerator": 85,
    "denominator": 100,
    "percentage": 85,
    "responsibility": "Quality Team",
    "monthlyReportingBy": "End of Month",
    "acceptableBenchmark": "95%",
    "criteria": "SUM OF TIME TAKEN FOR ASSESSMENT OF PATIENT OF PARTICULAR MONTH",
    "sampleSize": "100 cases",
    "relatedDefinition": "TOTAL NO OF PATIENT ADMITTED",
    "relatedCommittee": "Quality Committee",
    "remarks": "Optional remarks",
    "status": "DRAFT",
    "entryDate": "2024-01-15T00:00:00.000Z",
    "entryMonth": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "user": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "department": {
      "id": "clxxxxx",
      "name": "IPD"
    },
    "virocMapping": {
      "virocId": "IPD/01/001",
      "name": "TIME FOR INITIAL ASSESSMENT OF INDOOR PATIENTS"
    }
  }
}
```

## 📊 User Submissions Management

### 1. Get User's Form Submissions
**Endpoint:** `GET /forms/my-submissions?page=1&limit=10`
**Headers:** `Authorization: Bearer {accessToken}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "User form submissions retrieved successfully",
  "data": [
    {
      "id": "clxxxxx",
      "qiNo": "01",
      "indicatorName": "TIME FOR INITIAL ASSESSMENT OF INDOOR PATIENTS",
      "numerator": 85,
      "denominator": 100,
      "percentage": 85,
      "status": "DRAFT",
      "entryDate": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "department": {
        "name": "IPD"
      },
      "virocMapping": {
        "virocId": "IPD/01/001",
        "name": "TIME FOR INITIAL ASSESSMENT OF INDOOR PATIENTS"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 2. Get Form Submission by ID
**Endpoint:** `GET /forms/{id}`
**Headers:** `Authorization: Bearer {accessToken}`

### 3. Update Simple Form Submission (Recommended)
**Endpoint:** `PUT /forms/simple/{id}`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "virocMappingId": "IPD/01/001",
  "numerator": 90,
  "denominator": 100,
  "entryDate": "2024-01-15",
  "remarks": "Updated submission - only required fields"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Form submission updated successfully",
  "data": {
    "id": "clxxxxx",
    "qiNo": "01",
    "indicatorName": "TIME FOR INITIAL ASSESSMENT OF INDOOR PATIENTS",
    "numerator": 90,
    "denominator": 100,
    "percentage": 90,
    "status": "DRAFT",
    "entryDate": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

**Important Notes:**
- ✅ **Only DRAFT submissions can be edited by users**
- ❌ **SUBMITTED, APPROVED, or REJECTED submissions cannot be edited**
- 🔄 **All auto-populated fields update automatically when Viroc ID changes**

### 4. Update Form Submission (Full Fields)
**Endpoint:** `PUT /forms/{id}`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "qiNo": "01",
  "virocMappingId": "IPD/01/001",
  "indicatorName": "TIME FOR INITIAL ASSESSMENT OF INDOOR PATIENTS",
  "departmentId": "clxxxxx",
  "numerator": 90,
  "denominator": 100,
  "responsibility": "Quality Team",
  "monthlyReportingBy": "End of Month",
  "acceptableBenchmark": "95%",
  "criteria": "Assessment within 30 minutes",
  "sampleSize": "100 patients",
  "relatedDefinition": "Initial assessment timeline",
  "relatedCommittee": "Quality Committee",
  "remarks": "Updated submission",
  "entryDate": "2024-01-15",
  "entryMonth": 1
}
```

### 4. Delete Form Submission
**Endpoint:** `DELETE /forms/{id}`
**Headers:** `Authorization: Bearer {accessToken}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Form submission deleted successfully"
}
```

## 🏢 Departments Reference

### Get All Departments
**Endpoint:** `GET /departments`
**Headers:** `Authorization: Bearer {accessToken}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": [
    {
      "id": "clxxxxx",
      "name": "IPD",
      "_count": {
        "formSubmissions": 15
      }
    },
    {
      "id": "clxxxxx",
      "name": "OPD",
      "_count": {
        "formSubmissions": 8
      }
    }
  ]
}
```

## 🎨 UI/UX Requirements

### 1. Login Page
- Clean, professional design
- Email and password fields
- "Remember me" checkbox
- "Forgot password" link
- Registration link
- Form validation with error messages

### 2. Dashboard
- Welcome message with user name
- Quick stats (total submissions, pending, approved)
- Recent submissions table
- Quick action buttons (New Submission, View All)

### 3. Viroc Mappings Reference Page
- Searchable table/list of all quality indicators
- Filter by department (IPD, OPD, etc.)
- Show: Viroc ID, Name, Department, Benchmarks
- Click to view full details
- "Use for Submission" button

### 4. Form Submission Page
- **Viroc ID Dropdown**: Searchable dropdown with all active mappings
- **Numerator Input**: Number input with validation
- **Denominator Input**: Number input with validation (> 0)
- **Entry Date**: Date picker (default to today)
- **Remarks**: Optional textarea
- **Preview Section**: Show auto-populated fields
- **Submit Button**: Create submission
- Real-time percentage calculation display

### 5. My Submissions Page
- Table with: Viroc ID, Indicator Name, Date, Status, Percentage
- Filter by status (DRAFT, SUBMITTED, APPROVED, REJECTED)
- Search by indicator name
- Actions: View, Edit, Delete (for DRAFT only)
- Pagination

### 6. Edit Submission Page
- **Status Check**: Only show edit option for DRAFT submissions
- **Pre-populated form** with existing data
- **Same simplified fields** as create form (virocId, numerator, denominator, date, remarks)
- **Real-time updates**: Auto-populate fields when Viroc ID changes
- **Save changes button** (only enabled for valid data)
- **Cancel button** (navigate back)
- **Delete submission option** (only for DRAFT status)
- **Status indicator**: Clear visual indication of submission status
- **Disabled state**: Show read-only view for non-DRAFT submissions

## 🔄 Form Status Flow

```
DRAFT → SUBMITTED → APPROVED/REJECTED
```

- **DRAFT**: User can edit/delete
- **SUBMITTED**: Read-only, awaiting admin review
- **APPROVED**: Read-only, completed
- **REJECTED**: Read-only, with admin remarks

## 🎯 Key Features to Implement

### 1. Auto-Population Magic
When user selects Viroc ID, automatically show:
- Indicator name
- Department
- Numerator description
- Denominator description
- Expected benchmark
- Formula type

### 2. Real-time Calculation
- Show percentage as user types numerator/denominator
- Color coding: Green (meets benchmark), Red (below benchmark)

### 3. Smart Validation
- Prevent submission if denominator is 0
- Validate date is not in future
- Show helpful error messages

### 4. Responsive Design
- Mobile-friendly forms
- Touch-friendly dropdowns
- Accessible design

## 🚀 Development Phases

### Phase 1: Authentication & Setup
1. Setup project structure
2. Implement login/registration
3. Setup routing and protected routes
4. Implement token management

### Phase 2: Core Features
1. Dashboard with basic stats
2. Viroc mappings reference page
3. Simple form submission
4. My submissions list

### Phase 3: Advanced Features
1. Edit submissions
2. Advanced filtering/search
3. Form validation improvements
4. UI/UX polish

### Phase 4: Enhancements
1. Offline support
2. Export functionality
3. Notifications
4. Performance optimization

## 🔧 Technical Implementation Notes

### Authentication Flow
```javascript
// Store tokens in localStorage/sessionStorage
localStorage.setItem('accessToken', token);

// Add to all API requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
}

// Handle token expiration
if (response.status === 401) {
  // Redirect to login
  window.location.href = '/login';
}
```

### Form Submission Component Example
```jsx
const FormSubmission = () => {
  const [virocMappings, setVirocMappings] = useState([]);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [formData, setFormData] = useState({
    virocMappingId: '',
    numerator: '',
    denominator: '',
    entryDate: new Date(),
    remarks: ''
  });

  // Auto-calculate percentage
  const percentage = formData.denominator > 0 
    ? (formData.numerator / formData.denominator) * 100 
    : 0;

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/forms/simple', formData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
};
```

## 📱 Mobile Considerations
- Touch-friendly form inputs
- Responsive tables (consider cards on mobile)
- Swipe actions for submissions
- Optimized loading states

## 🎨 Design System Suggestions
- Primary color: Healthcare blue (#2563eb)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Error: Red (#ef4444)
- Clean, minimal design with good whitespace
- Clear typography hierarchy

This guide provides everything needed to build a professional, user-friendly frontend for the Excel Automation System. Focus on simplicity and ease of use - users should be able to submit forms quickly with minimal training. 