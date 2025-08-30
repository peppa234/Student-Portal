# 🏗️ Student Portal - Architecture Documentation

## System Overview

The Student Portal is a full-stack web application built with a modern, scalable architecture that separates concerns between frontend, backend, and database layers. The system follows RESTful API principles and implements security best practices.

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  React SPA (TypeScript + Material-UI)                         │
│  • Responsive web interface                                   │
│  • State management via Context API                           │
│  • Form handling with React Hook Form                         │
│  • HTTP communication via Axios                               │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    │ JSON API
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Server (Node.js)                                   │
│  • RESTful API endpoints                                       │
│  • Authentication & authorization                              │
│  • Input validation & sanitization                             │
│  • Rate limiting & security                                    │
│  • Error handling & logging                                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Database queries
                                    │ via Mongoose ODM
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Persistence Layer                     │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Database                                              │
│  • Document-based storage                                      │
│  • Auto-incrementing counters                                 │
│  • Indexed collections for performance                        │
│  • Data validation & constraints                              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### Frontend Stack
- **Framework:** React 19 with TypeScript 5.8
- **Build Tool:** Vite 7.1 (ESBuild-based, fast HMR)
- **UI Library:** Material-UI 7.3 with custom theme
- **State Management:** React Context API + hooks
- **Routing:** React Router DOM 7.8
- **Forms:** React Hook Form + Yup validation
- **HTTP Client:** Axios with interceptors
- **Styling:** CSS-in-JS with Material-UI system

### Backend Stack
- **Runtime:** Node.js 16+ (LTS)
- **Framework:** Express.js 4.18
- **Database:** MongoDB 5+ with Mongoose 8.18
- **Authentication:** JWT + bcrypt password hashing
- **Validation:** Express-validator with custom rules
- **Security:** Helmet, CORS, Rate limiting, MongoDB sanitization
- **Development:** Nodemon, ESLint

### Database Design
- **Type:** NoSQL document database (MongoDB)
- **ODM:** Mongoose for schema validation and middleware
- **Pattern:** Auto-incrementing counters for human-readable IDs
- **Indexing:** Strategic indexes for query performance
- **Relationships:** Referenced documents with population

## 🏗️ Backend Architecture

### Server Structure
```
back-new/
├── index.js                 # Application entry point
├── src/
│   ├── config/             # Configuration management
│   │   └── database.js     # MongoDB connection setup
│   ├── controllers/        # Business logic layer
│   │   ├── AuthController.js
│   │   ├── StudentController.js
│   │   ├── TeacherController.js
│   │   ├── ClassesController.js
│   │   └── SubjectController.js
│   ├── middleware/         # Request processing pipeline
│   │   ├── auth.js         # JWT authentication
│   │   ├── validators.js   # Input validation
│   │   ├── errorHandler.js # Error processing
│   │   └── responseFormatter.js # Response standardization
│   ├── models/             # Data models & schemas
│   │   ├── Student.js      # Student entity
│   │   ├── Teacher.js      # Teacher entity
│   │   ├── Classes.js      # Class entity
│   │   ├── Subject.js      # Subject entity
│   │   └── Counter.js      # Auto-increment counters
│   ├── routes/             # API endpoint definitions
│   │   ├── auth.js         # Authentication routes
│   │   ├── students.js     # Student management
│   │   ├── teachers.js     # Teacher management
│   │   ├── classes.js      # Class management
│   │   └── subjects.js     # Subject management
│   ├── migrations/         # Database setup scripts
│   │   ├── generate-jwt-secret.js
│   │   ├── hash-admin-password.js
│   │   └── populateCounters.js
│   └── utils/              # Helper functions
│       └── getNextSequence.js # ID generation utility
```

### Request Processing Pipeline
```
HTTP Request
    │
    ▼
┌─────────────────┐
│   CORS Check    │ ← Allow specific origins
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Security Headers│ ← Helmet middleware
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Rate Limiting   │ ← Request throttling
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Body Parsing    │ ← JSON/URL-encoded parsing
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Data Sanitization│ ← MongoDB injection protection
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Response Format │ ← Standardize response structure
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Route Matching  │ ← Find matching endpoint
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Authentication  │ ← JWT token validation
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Authorization   │ ← Role-based access control
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Input Validation│ ← Request data validation
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Controller      │ ← Business logic execution
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Database Query  │ ← MongoDB operations
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Response Format │ ← Standardized response
└─────────────────┘
    │
    ▼
HTTP Response
```

### Security Architecture
- **Authentication:** JWT tokens with configurable expiration
- **Authorization:** Role-based access control (Admin role)
- **Input Validation:** Comprehensive server-side validation
- **Data Sanitization:** MongoDB injection protection
- **Rate Limiting:** Configurable limits per route type
- **Security Headers:** Helmet middleware for protection
- **CORS:** Strict origin validation
- **Password Security:** bcrypt hashing with salt rounds

## 🎨 Frontend Architecture

### Application Structure
```
frontend/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx   # Top navigation
│   │   │   ├── Sidebar.tsx  # Left navigation
│   │   │   └── Layout.tsx   # Main layout wrapper
│   │   ├── ui/              # Base UI components
│   │   │   ├── Button.tsx   # Custom button component
│   │   │   ├── FormField.tsx # Form field wrapper
│   │   │   └── ResponsiveContainer.tsx # Responsive wrapper
│   │   └── attendance/      # Feature-specific components
│   ├── contexts/            # React context providers
│   │   ├── AuthContext.tsx  # Authentication state
│   │   ├── DataContext.tsx  # Global data management
│   │   └── AppProvider.tsx  # Main app context
│   ├── pages/               # Application pages
│   │   ├── Login.tsx        # Authentication page
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Students.tsx     # Student management
│   │   ├── Teachers.tsx     # Teacher management
│   │   ├── Classes.tsx      # Class management
│   │   ├── Subjects.tsx     # Subject management
│   │   ├── Reports.tsx      # Reporting system
│   │   └── Settings.tsx     # User settings
│   ├── services/            # API service layer
│   │   ├── api.ts           # Axios configuration
│   │   ├── authService.ts   # Authentication API
│   │   ├── studentService.ts # Student API
│   │   ├── teacherService.ts # Teacher API
│   │   ├── classService.ts  # Class API
│   │   └── subjectService.ts # Subject API
│   └── types/               # TypeScript definitions
│       └── index.ts         # All application types
```

### State Management Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                        │
├─────────────────────────────────────────────────────────────┤
│  App Component (Root)                                      │
│  ├── AppProvider (Context Provider)                        │
│  │   ├── AuthContext (Authentication State)                │
│  │   │   ├── user: User | null                            │
│  │   │   ├── isLoading: boolean                           │
│  │   │   ├── login(username, password)                    │
│  │   │   └── logout()                                     │
│  │   └── DataContext (Global Data State)                  │
│  │       ├── students: Student[]                           │
│  │       ├── teachers: Teacher[]                           │
│  │       ├── classes: Class[]                              │
│  │       └── subjects: Subject[]                           │
│  └── Router (Navigation)                                   │
│      ├── Public Routes (Login)                             │
│      └── Protected Routes (Dashboard, Management)          │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    │ API calls via services
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Service Layer                        │
├─────────────────────────────────────────────────────────────┤
│  HTTP Client (Axios)                                        │
│  ├── Request Interceptors (Auth token injection)           │
│  ├── Response Interceptors (Error handling)                 │
│  └── Service Modules                                        │
│      ├── authService (Authentication)                       │
│      ├── studentService (Student CRUD)                      │
│      ├── teacherService (Teacher CRUD)                      │
│      ├── classService (Class CRUD)                          │
│      └── subjectService (Subject CRUD)                      │
└─────────────────────────────────────────────────────────────┘
```

### Component Design Patterns
- **Container Components:** Pages that manage state and API calls
- **Presentational Components:** Reusable UI components with props
- **Custom Hooks:** Business logic extraction (useAuth, useData)
- **Context Providers:** Global state management
- **Error Boundaries:** Graceful error handling
- **Loading States:** User feedback during async operations

## 🗄️ Database Architecture

### Data Model Relationships
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Student   │    │   Teacher   │    │   Classes   │
│             │    │             │    │             │
│ • studentId │    │ • teacherId │    │ • classCode │
│ • firstName │    │ • firstName │    │ • className │
│ • lastName  │    │ • lastName  │    │ • grade     │
│ • email     │    │ • email     │    │ • section   │
│ • currentClass│  │ • department│    │ • capacity  │
│ • status    │    │ • subjects  │    │ • subjects  │
│ • guardians │    │ • classes   │    │ • students  │
│ • medical   │    │ • status    │    │ • teacher   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌─────────────┐
                    │   Subject   │
                    │             │
                    │ • subjectCode│
                    │ • subjectName│
                    │ • grade     │
                    │ • teachers  │
                    │ • classes   │
                    │ • curriculum│
                    └─────────────┘
```

### Database Design Principles
- **Document Structure:** Nested objects for related data
- **Referential Integrity:** ObjectId references between collections
- **Indexing Strategy:** Compound indexes for common query patterns
- **Data Validation:** Mongoose schema validation rules
- **Auto-incrementing IDs:** Human-readable identifiers
- **Timestamps:** Automatic created/updated tracking

### Performance Considerations
- **Indexing:** Strategic indexes on frequently queried fields
- **Population:** Lazy loading of referenced documents
- **Pagination:** Limit result sets for large collections
- **Search Optimization:** Text indexes for search functionality
- **Connection Pooling:** Efficient database connection management

## 🔄 Data Flow Architecture

### Authentication Flow
```
1. User submits login form
   ↓
2. Frontend calls authService.login()
   ↓
3. Axios sends POST to /api/auth/login
   ↓
4. Backend validates credentials
   ↓
5. Backend generates JWT token
   ↓
6. Frontend stores token in localStorage
   ↓
7. Frontend updates AuthContext state
   ↓
8. Router redirects to protected route
```

### CRUD Operation Flow
```
1. User interacts with form/table
   ↓
2. Component calls service method
   ↓
3. Service makes HTTP request via Axios
   ↓
4. Axios interceptor adds auth token
   ↓
5. Backend validates request
   ↓
6. Backend processes business logic
   ↓
7. Backend updates database
   ↓
8. Backend returns standardized response
   ↓
9. Frontend updates local state
   ↓
10. UI reflects changes
```

### Error Handling Flow
```
1. Error occurs (validation, auth, server, network)
   ↓
2. Backend catches error in asyncHandler
   ↓
3. ErrorHandler middleware processes error
   ↓
4. Standardized error response sent
   ↓
5. Axios interceptor catches error
   ↓
6. Frontend service returns rejected promise
   ↓
7. Component catches error
   ↓
8. User sees appropriate error message
```

## 🚀 Deployment Architecture

### Development Environment
- **Frontend:** Vite dev server on port 5173
- **Backend:** Nodemon on port 3000
- **Database:** Local MongoDB instance
- **Hot Reload:** Automatic restart on file changes

### Production Environment
- **Frontend:** Static build deployed to CDN
- **Backend:** Node.js process with PM2/forever
- **Database:** MongoDB Atlas or self-hosted cluster
- **Load Balancing:** Multiple backend instances
- **Caching:** Redis for session management
- **Monitoring:** Health checks and logging

### Scalability Considerations
- **Horizontal Scaling:** Multiple backend instances
- **Database Sharding:** Partition data across clusters
- **CDN:** Static asset distribution
- **Caching:** Redis for frequently accessed data
- **Load Balancing:** Distribute traffic across servers

## 🔒 Security Architecture

### Authentication Security
- **JWT Tokens:** Stateless authentication with expiration
- **Password Hashing:** bcrypt with configurable salt rounds
- **Token Storage:** Secure localStorage with automatic cleanup
- **Session Management:** Automatic logout on token expiration

### API Security
- **Rate Limiting:** Configurable limits per route type
- **Input Validation:** Comprehensive server-side validation
- **Data Sanitization:** MongoDB injection protection
- **CORS Policy:** Strict origin validation
- **Security Headers:** Helmet middleware protection

### Data Security
- **Encryption:** HTTPS for all communications
- **Access Control:** Role-based permissions
- **Audit Logging:** Track administrative actions
- **Data Backup:** Regular database backups
- **Privacy Compliance:** GDPR-ready data handling

## 📊 Monitoring and Observability

### Logging Strategy
- **Request Logging:** All API requests and responses
- **Error Logging:** Detailed error information
- **Performance Logging:** Response time tracking
- **Security Logging:** Authentication and authorization events

### Health Checks
- **Database Connectivity:** MongoDB connection status
- **API Endpoints:** Endpoint availability testing
- **System Resources:** Memory and CPU usage
- **External Dependencies:** Third-party service status

### Performance Monitoring
- **Response Times:** API endpoint performance
- **Database Queries:** Query execution time
- **Memory Usage:** Application memory consumption
- **Error Rates:** Success/failure ratios

## 🔮 Future Architecture Enhancements

### Planned Improvements
- **Microservices:** Split into domain-specific services
- **Message Queues:** Async processing for heavy operations
- **GraphQL:** Alternative to REST API
- **Real-time Updates:** WebSocket integration
- **Mobile App:** React Native application
- **Offline Support:** Service worker implementation

### Scalability Enhancements
- **Containerization:** Docker deployment
- **Orchestration:** Kubernetes management
- **Service Mesh:** Istio for service communication
- **Event Sourcing:** CQRS pattern implementation
- **Multi-tenancy:** Support for multiple schools

---

This architecture provides a solid foundation for the Student Portal application, ensuring maintainability, scalability, and security while following modern development best practices.
