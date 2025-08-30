# 📚 Student Portal - API Documentation

## Overview

The Student Portal API is a RESTful service built with Express.js that provides comprehensive school management functionality. All endpoints return standardized JSON responses and require JWT authentication for protected routes.

## 🔐 Authentication

### JWT Token Format
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token
1. Send a POST request to `/api/auth/login` with admin credentials
2. Extract the token from the response
3. Include the token in subsequent requests

## 📋 Response Format

All API responses follow this standardized format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint",
  "method": "GET"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "message": "User-friendly error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint",
  "method": "POST"
}
```

## 🚀 API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "username": "admin",
      "role": "admin"
    }
  },
  "message": "Login successful",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/login",
  "method": "POST"
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Invalid credentials
- `429` - Rate limit exceeded

---

#### GET /api/auth/profile
Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "username": "admin",
      "role": "admin"
    }
  },
  "message": "Profile retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/profile",
  "method": "GET"
}
```

**Status Codes:**
- `200` - Profile retrieved
- `401` - Unauthorized (invalid/missing token)

---

#### GET /api/auth/system-stats
Get system-wide statistics and counts.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "students": 150,
      "teachers": 25,
      "classes": 12,
      "subjects": 18,
      "totalEnrollment": 1200
    }
  },
  "message": "System statistics retrieved",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/system-stats",
  "method": "GET"
}
```

---

#### PUT /api/auth/profile
Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "newadmin",
  "email": "admin@school.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "username": "newadmin",
      "role": "admin"
    }
  },
  "message": "Profile updated successfully"
}
```

---

#### PUT /api/auth/change-password
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

#### POST /api/auth/logout
Logout user (token invalidation handled client-side).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET /api/auth/verify
Verify JWT token validity.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Token is valid"
}
```

---

### Student Management Endpoints

#### GET /api/students
Get all students with pagination and search.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `search` (string, optional) - Search term for name, email, or ID
- `status` (string, optional) - Filter by status (active, inactive, graduated, etc.)
- `class` (string, optional) - Filter by class ID

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "studentId": "STU001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@school.com",
        "status": "active",
        "currentClass": "507f1f77bcf86cd799439012",
        "enrollmentDate": "2024-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 150,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Students retrieved successfully"
}
```

---

#### POST /api/students
Create a new student.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "2008-05-15",
  "gender": "Female",
  "email": "jane.smith@school.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "USA"
  },
  "guardians": [
    {
      "guardianName": "John Smith",
      "guardianPhone": "+1234567891",
      "guardianEmail": "john.smith@email.com",
      "relationship": "Father"
    }
  ],
  "emergencyContact": {
    "name": "Mary Smith",
    "phone": "+1234567892",
    "relationship": "Mother"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "507f1f77bcf86cd799439013",
      "studentId": "STU002",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@school.com",
      "status": "active",
      "enrollmentDate": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Student created successfully"
}
```

---

#### GET /api/students/:id
Get student by ID.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Student ID

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "507f1f77bcf86cd799439011",
      "studentId": "STU001",
      "firstName": "John",
      "lastName": "Doe",
      "middleName": "Michael",
      "dateOfBirth": "2007-03-20T00:00:00.000Z",
      "gender": "Male",
      "email": "john.doe@school.com",
      "phone": "+1234567890",
      "address": {
        "street": "456 Oak Ave",
        "city": "Somewhere",
        "state": "NY",
        "zipCode": "54321",
        "country": "USA"
      },
      "currentClass": "507f1f77bcf86cd799439012",
      "status": "active",
      "guardians": [
        {
          "guardianName": "Robert Doe",
          "guardianPhone": "+1234567891",
          "guardianEmail": "robert.doe@email.com",
          "relationship": "Father"
        }
      ],
      "medicalConditions": ["Asthma"],
      "allergies": ["Peanuts"],
      "emergencyContact": {
        "name": "Sarah Doe",
        "phone": "+1234567892",
        "relationship": "Mother"
      },
      "notes": "Excellent student with strong academic performance",
      "enrollmentDate": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Student retrieved successfully"
}
```

---

#### PUT /api/students/:id
Update student information.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Student ID

**Request Body:** (Partial update - only include fields to change)
```json
{
  "phone": "+1234567899",
  "address": {
    "street": "789 Pine St",
    "city": "Newtown",
    "state": "CA",
    "zipCode": "98765"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "507f1f77bcf86cd799439011",
      "studentId": "STU001",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567899",
      "address": {
        "street": "789 Pine St",
        "city": "Newtown",
        "state": "CA",
        "zipCode": "98765",
        "country": "USA"
      },
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  },
  "message": "Student updated successfully"
}
```

---

#### DELETE /api/students/:id
Delete a student.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Student ID

**Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

#### GET /api/students/class/:classId
Get all students in a specific class.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `classId` (string) - Class ID

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "studentId": "STU001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@school.com"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 25,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "message": "Students retrieved successfully"
}
```

---

#### PUT /api/students/:id/transfer-class
Transfer student to a different class.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Student ID

**Request Body:**
```json
{
  "newClassId": "507f1f77bcf86cd799439013"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "507f1f77bcf86cd799439011",
      "currentClass": "507f1f77bcf86cd799439013"
    }
  },
  "message": "Student transferred successfully"
}
```

---

#### GET /api/students/:id/performance
Get student academic performance.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Student ID

**Response:**
```json
{
  "success": true,
  "data": {
    "performance": {
      "studentId": "STU001",
      "currentClass": "Class 10A",
      "averageGrade": 85.5,
      "attendanceRate": 92.3,
      "subjects": [
        {
          "subject": "Mathematics",
          "grade": 88,
          "attendance": 95
        }
      ]
    }
  },
  "message": "Performance data retrieved"
}
```

---

### Teacher Management Endpoints

#### GET /api/teachers
Get all teachers with pagination and search.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `search` (string, optional) - Search by name, email, or department
- `department` (string, optional) - Filter by department
- `status` (string, optional) - Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "teachers": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "teacherId": "TCH001",
        "firstName": "Dr. Sarah",
        "lastName": "Johnson",
        "email": "sarah.johnson@school.com",
        "department": "Mathematics",
        "status": "Active"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Teachers retrieved successfully"
}
```

---

#### POST /api/teachers
Create a new teacher.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Michael",
  "lastName": "Brown",
  "dateOfBirth": "1985-08-12",
  "gender": "Male",
  "email": "michael.brown@school.com",
  "phone": "+1234567890",
  "department": "Science",
  "qualifications": ["PhD Physics", "MSc Education"],
  "certifications": ["Teaching License", "Science Education"],
  "yearsOfExperience": 8,
  "workSchedule": {
    "days": ["Monday", "Wednesday", "Friday"],
    "startTime": "08:00",
    "endTime": "16:00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher": {
      "_id": "507f1f77bcf86cd799439022",
      "teacherId": "TCH002",
      "firstName": "Michael",
      "lastName": "Brown",
      "email": "michael.brown@school.com",
      "department": "Science",
      "status": "Active"
    }
  },
  "message": "Teacher created successfully"
}
```

---

#### GET /api/teachers/:id
Get teacher by ID.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Teacher ID

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher": {
      "_id": "507f1f77bcf86cd799439021",
      "teacherId": "TCH001",
      "firstName": "Dr. Sarah",
      "lastName": "Johnson",
      "dateOfBirth": "1980-03-15T00:00:00.000Z",
      "gender": "Female",
      "email": "sarah.johnson@school.com",
      "phone": "+1234567890",
      "department": "Mathematics",
      "qualifications": ["PhD Mathematics", "MSc Education"],
      "certifications": ["Teaching License", "Mathematics Education"],
      "subjects": ["507f1f77bcf86cd799439031"],
      "classes": ["507f1f77bcf86cd799439041"],
      "status": "Active",
      "employeeNumber": "EMP001",
      "position": "Senior Teacher",
      "yearsOfExperience": 12,
      "workSchedule": {
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "startTime": "08:00",
        "endTime": "16:00"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Teacher retrieved successfully"
}
```

---

#### PUT /api/teachers/:id
Update teacher information.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Teacher ID

**Request Body:** (Partial update)
```json
{
  "phone": "+1234567899",
  "position": "Head of Department",
  "yearsOfExperience": 13
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher": {
      "_id": "507f1f77bcf86cd799439021",
      "position": "Head of Department",
      "yearsOfExperience": 13,
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  },
  "message": "Teacher updated successfully"
}
```

---

#### DELETE /api/teachers/:id
Delete a teacher.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Teacher ID

**Response:**
```json
{
  "success": true,
  "message": "Teacher deleted successfully"
}
```

---

### Class Management Endpoints

#### GET /api/classes
Get all classes with pagination and search.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `search` (string, optional) - Search by class name or code
- `grade` (string, optional) - Filter by grade
- `semester` (string, optional) - Filter by semester
- `academicYear` (string, optional) - Filter by academic year

**Response:**
```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "_id": "507f1f77bcf86cd799439041",
        "classCode": "CLS001",
        "className": "Class 10A",
        "grade": "10",
        "section": "A",
        "academicYear": "2024-2025",
        "semester": "First",
        "capacity": 30,
        "currentEnrollment": 28,
        "status": "Active"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Classes retrieved successfully"
}
```

---

#### POST /api/classes
Create a new class.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "className": "Class 11B",
  "grade": "11",
  "section": "B",
  "academicYear": "2024-2025",
  "semester": "First",
  "capacity": 25,
  "classTeacher": "507f1f77bcf86cd799439021",
  "subjects": ["507f1f77bcf86cd799439031"],
  "classSchedule": {
    "room": "Room 201",
    "building": "Main Building",
    "floor": "2nd Floor"
  },
  "description": "Advanced Science Class"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "_id": "507f1f77bcf86cd799439042",
      "classCode": "CLS002",
      "className": "Class 11B",
      "grade": "11",
      "section": "B",
      "academicYear": "2024-2025",
      "semester": "First",
      "capacity": 25,
      "currentEnrollment": 0,
      "status": "Active"
    }
  },
  "message": "Class created successfully"
}
```

---

#### GET /api/classes/:id
Get class by ID.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Class ID

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "_id": "507f1f77bcf86cd799439041",
      "classCode": "CLS001",
      "className": "Class 10A",
      "grade": "10",
      "section": "A",
      "academicYear": "2024-2025",
      "semester": "First",
      "capacity": 30,
      "currentEnrollment": 28,
      "classTeacher": "507f1f77bcf86cd799439021",
      "subjects": ["507f1f77bcf86cd799439031"],
      "classSchedule": {
        "room": "Room 101",
        "building": "Main Building",
        "floor": "1st Floor"
      },
      "students": ["507f1f77bcf86cd799439011"],
      "averageGrade": 82.5,
      "attendanceRate": 89.2,
      "status": "Active",
      "isActive": true,
      "description": "Standard Class 10A",
      "requirements": ["Completed Class 9", "Basic Mathematics"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Class retrieved successfully"
}
```

---

#### PUT /api/classes/:id
Update class information.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Class ID

**Request Body:** (Partial update)
```json
{
  "capacity": 35,
  "description": "Updated class description",
  "classSchedule": {
    "room": "Room 205",
    "building": "Science Building"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "_id": "507f1f77bcf86cd799439041",
      "capacity": 35,
      "description": "Updated class description",
      "classSchedule": {
        "room": "Room 205",
        "building": "Science Building",
        "floor": "2nd Floor"
      },
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  },
  "message": "Class updated successfully"
}
```

---

#### DELETE /api/classes/:id
Delete a class.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Class ID

**Response:**
```json
{
  "success": true,
  "message": "Class deleted successfully"
}
```

---

### Subject Management Endpoints

#### GET /api/subjects
Get all subjects with pagination and search.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `search` (string, optional) - Search by subject name or code
- `grade` (string, optional) - Filter by grade
- `department` (string, optional) - Filter by department
- `category` (string, optional) - Filter by category (Core, Elective, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "_id": "507f1f77bcf86cd799439031",
        "subjectCode": "SUB001",
        "subjectName": "Advanced Mathematics",
        "shortName": "Math",
        "grade": "10",
        "department": "Mathematics",
        "category": "Core",
        "credits": 4
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 18,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Subjects retrieved successfully"
}
```

---

#### POST /api/subjects
Create a new subject.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "subjectName": "Physics",
  "shortName": "Phy",
  "grade": "11",
  "academicYear": "2024-2025",
  "semester": "First",
  "description": "Fundamental principles of physics",
  "objectives": [
    "Understand basic physics concepts",
    "Apply mathematical principles to physics problems"
  ],
  "learningOutcomes": [
    "Solve physics problems using equations",
    "Conduct basic physics experiments"
  ],
  "curriculum": "Mechanics, Thermodynamics, Waves, Electricity",
  "assessment": "Theory exams (70%), Practical (30%)",
  "department": "Science",
  "category": "Core",
  "difficulty": "Intermediate",
  "credits": 5,
  "hoursPerWeek": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": {
      "_id": "507f1f77bcf86cd799439032",
      "subjectCode": "SUB002",
      "subjectName": "Physics",
      "shortName": "Phy",
      "grade": "11",
      "academicYear": "2024-2025",
      "semester": "First",
      "department": "Science",
      "category": "Core",
      "credits": 5,
      "hoursPerWeek": 4,
      "isActive": true
    }
  },
  "message": "Subject created successfully"
}
```

---

#### GET /api/subjects/:id
Get subject by ID.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Subject ID

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": {
      "_id": "507f1f77bcf86cd799439031",
      "subjectCode": "SUB001",
      "subjectName": "Advanced Mathematics",
      "shortName": "Math",
      "grade": "10",
      "academicYear": "2024-2025",
      "semester": "First",
      "description": "Advanced mathematical concepts and applications",
      "objectives": [
        "Master advanced algebra",
        "Understand calculus fundamentals"
      ],
      "learningOutcomes": [
        "Solve complex equations",
        "Apply calculus to real-world problems"
      ],
      "prerequisites": [],
      "curriculum": "Algebra, Calculus, Trigonometry, Statistics",
      "assessment": "Continuous assessment with final examination",
      "teachers": ["507f1f77bcf86cd799439021"],
      "classes": ["507f1f77bcf86cd799439041"],
      "textbooks": ["Advanced Mathematics Vol 1", "Calculus Made Easy"],
      "materials": ["Scientific Calculator", "Graph Paper"],
      "onlineResources": ["Khan Academy", "MIT OpenCourseWare"],
      "department": "Mathematics",
      "category": "Core",
      "difficulty": "Advanced",
      "credits": 4,
      "hoursPerWeek": 5,
      "isActive": true,
      "notes": "Prerequisite for advanced physics and engineering",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Subject retrieved successfully"
}
```

---

#### PUT /api/subjects/:id
Update subject information.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Subject ID

**Request Body:** (Partial update)
```json
{
  "description": "Updated subject description",
  "credits": 5,
  "hoursPerWeek": 6,
  "notes": "Updated notes about the subject"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": {
      "_id": "507f1f77bcf86cd799439031",
      "description": "Updated subject description",
      "credits": 5,
      "hoursPerWeek": 6,
      "notes": "Updated notes about the subject",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  },
  "message": "Subject updated successfully"
}
```

---

#### DELETE /api/subjects/:id
Delete a subject.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string) - Subject ID

**Response:**
```json
{
  "success": true,
  "message": "Subject deleted successfully"
}
```

---

## 🔒 Error Handling

### Common Error Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| `400` | Bad Request | Invalid input data, validation errors |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate data, constraint violation |
| `422` | Unprocessable Entity | Business logic validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error |

### Validation Errors
When input validation fails, the API returns detailed error information:

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Please check your input data",
  "details": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    },
    {
      "field": "dateOfBirth",
      "message": "Date of birth is required"
    }
  ]
}
```

## 📊 Rate Limiting

The API implements rate limiting to prevent abuse:

- **General Routes:** 100 requests per 15 minutes
- **Authentication Routes:** 50 requests per 15 minutes (dev) / 5 requests per 15 minutes (prod)

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642233600
```

## 🔧 Development and Testing

### Base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://your-domain.com`

### Testing Endpoints
- **Health Check:** `GET /health`
- **API Info:** `GET /`

### Postman Collection
Import this collection into Postman for easy API testing:

```json
{
  "info": {
    "name": "Student Portal API",
    "description": "Complete API collection for Student Portal"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"admin\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

---

This API documentation provides comprehensive coverage of all available endpoints, request/response formats, and usage examples for the Student Portal system.
