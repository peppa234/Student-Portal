# 🎓 Student Portal - Complete School Management System


![Student Portal Dashboard](docs/dashboard.png)



A modern, full-stack school management application built with Node.js, Express, MongoDB, React, and TypeScript. This comprehensive system provides administrators with complete tools to manage students, teachers, classes, and subjects through a beautiful, responsive interface.


## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token storage
- **Role-based access control** (Admin role implemented)
- **Password hashing** with bcrypt (12 rounds)
- **Rate limiting** and security headers
- **Input validation** and sanitization
- **CORS protection** with configurable origins

### 👥 Comprehensive User Management
- **Students**: Complete profiles with medical info, guardians, emergency contacts
- **Teachers**: Professional profiles with qualifications, certifications, work schedules
- **Classes**: Management with capacity tracking, enrollment, schedules
- **Subjects**: Curriculum management with learning objectives and assessments

### 📊 Real-time Dashboard & Reporting
- **System statistics** with live updates
- **Student and teacher counts** with trends
- **Class enrollment** overview
- **Academic performance** tracking
- **Attendance monitoring** (future enhancement)

### 🎨 Modern UI/UX
- **Material-UI components** with custom navy blue theme
- **Golden accent colors** for professional appearance
- **Fully responsive** design for all devices
- **Smooth animations** and transitions
- **Intuitive navigation** and form interactions

![Student Management](docs/students.png)

*Management interface with search and filtering*

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  React SPA (TypeScript + Material-UI)                          │
│  • Responsive web interface                                    │
│  • State management via Context API                            │
│  • Form handling with React Hook Form                          │
│  • HTTP communication via Axios                                │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS (JSON API)
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Server (Node.js)                                   │
│  • RESTful API endpoints                                       │
│  • JWT Authentication & authorization                         │
│  • Input validation & sanitization                             │
│  • Rate limiting & security headers                            │
│  • Error handling & logging                                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ MongoDB Queries (Mongoose ODM)
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Persistence Layer                     │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Database                                              │
│  • Students Collection                                         │
│  • Teachers Collection                                         │
│  • Classes Collection                                          │
│  • Subjects Collection                                         │
│  • Counters Collection                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- **Runtime:** Node.js 16+
- **Framework:** Express.js 4.18
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + bcrypt
- **Validation:** Express-validator
- **Security:** Helmet, CORS, Rate limiting
- **Development:** Nodemon, ESLint

**Frontend:**
- **Framework:** React 19 with TypeScript 5.8
- **Build Tool:** Vite 7.1
- **UI Library:** Material-UI 7.3
- **Routing:** React Router DOM 7.8
- **Forms:** React Hook Form + Yup validation
- **HTTP Client:** Axios with interceptors
- **State Management:** React Context API

![Teacher Management](docs/teachers.png)



## 📁 Project Structure

```
student-portal/
├── back-new/                 # Backend application
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── migrations/      # Database setup scripts
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   └── utils/           # Helper functions
│   ├── index.js             # Server entry point
│   └── package.json         # Backend dependencies
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context providers
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API service layer
│   │   └── types/           # TypeScript definitions
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
└── package.json              # Root workspace config
```

## 🔌 API Documentation

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `POST /api/auth/login` | POST | User authentication | No |
| `GET /api/auth/profile` | GET | Get user profile | Yes |
| `GET /api/auth/system-stats` | GET | System statistics | Yes |
| `PUT /api/auth/profile` | PUT | Update user profile | Yes |
| `PUT /api/auth/change-password` | PUT | Change password | Yes |
| `POST /api/auth/logout` | POST | User logout | Yes |
| `GET /api/auth/verify` | GET | Verify token validity | Yes |

### Student Management Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/students` | GET | List students with pagination |
| `POST /api/students` | POST | Create new student |
| `GET /api/students/:id` | GET | Get student details |
| `PUT /api/students/:id` | PUT | Update student information |
| `DELETE /api/students/:id` | DELETE | Delete student |
| `GET /api/students/class/:classId` | GET | Get students by class |
| `PUT /api/students/:id/transfer-class` | PUT | Transfer student to different class |
| `GET /api/students/:id/performance` | GET | Get student performance data |

### Complete API Reference
For full API documentation with request/response examples, see [API Documentation](docs/api.md).


## 👥 User Workflows

### Administrator Daily Workflow

1. **Login & Dashboard Review**
   - Authenticate with secure credentials
   - Review system statistics and alerts
   - Check overnight changes and notifications

2. **Student Management**
   - Add new students with comprehensive profiles
   - Update student information and class assignments
   - Manage guardian and emergency contact details
   - Track student status and enrollment

3. **Teacher Management** 
   - Create teacher profiles with qualifications
   - Assign departments and subjects
   - Manage work schedules and availability
   - Track professional development

4. **Class & Subject Organization**
   - Create classes with capacity limits
   - Assign teachers and students to classes
   - Define subjects with curriculum details
   - Set academic objectives and assessments

5. **Reporting & Analytics**
   - Generate system overview reports
   - Analyze student performance trends
   - Monitor attendance patterns (future)
   - Export data for external analysis

### Complete User Flow Documentation
For detailed user personas and workflow diagrams, see [User Flow Documentation](docs/user-flow.md).

## 🗄️ Database Schema

### Students Collection
```javascript
{
  studentId: String,           // Auto-generated (STU001, STU002, ...)
  firstName: String,           // Required, max 50 chars
  lastName: String,            // Required, max 50 chars
  dateOfBirth: Date,           // Required
  gender: String,              // Enum: Male/Female/Other
  email: String,               // Required, unique, validated
  phone: String,               // Optional
  address: {                   // Nested object
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  currentClass: ObjectId,      // Reference to Classes
  status: String,              // Enum: active/inactive/graduated/...
  guardians: [{                // Array of guardian objects
    guardianName: String,
    guardianPhone: String,
    guardianEmail: String,
    relationship: String
  }],
  emergencyContact: {          // Nested object
    name: String,
    phone: String,
    relationship: String
  },
  enrollmentDate: Date,        // Default: now
  // ... plus timestamps
}
```

### Full Schema Documentation
For complete database schema details, see [Architecture Documentation](docs/architecture.md).

## 🔒 Security Implementation

### Authentication Flow
```
┌───────────┐       ┌───────────┐       ┌───────────┐       ┌───────────┐
│   User    │       │ Frontend  │       │  Backend  │       │ Database  │
└─────┬─────┘       └─────┬─────┘       └─────┬─────┘       └─────┬─────┘
      │ Enter credentials │                │                   │
      │──────────────────>│                │                   │
      │                   │ POST /login    │                   │
      │                   │────────────────>│                   │
      │                   │                │ Query admin user   │
      │                   │                │───────────────────>│
      │                   │                │                   │ Return hashed password
      │                   │                │<───────────────────│
      │                   │                │ Verify password + generate JWT
      │                   │                │───────────────────>│
      │                   │  Return JWT + user data             │
      │                   │<────────────────│                   │
      │ Redirect to       │                │                   │
      │ dashboard         │                │                   │
```

### Security Features
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Password Hashing**: bcrypt with 12 salt rounds
- **Rate Limiting**: 100 requests/15min (general), 50 requests/15min (auth)
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Configurable allowed origins
- **Helmet.js**: Security headers protection
- **MongoDB Sanitization**: Injection attack prevention


### Development Scripts
```bash
# Install all dependencies
npm run install:all

# Start both backend and frontend
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend  
npm run dev:frontend

# Build both applications
npm run build

# Lint both applications
npm run lint
```


## 🆘 Support

For support and questions:

- 📚 [Complete Documentation](docs/)
- 🔌 [API Reference](docs/api.md)
- 👥 [User Guides](docs/user-flow.md)
- 🏗️ [Technical Architecture](docs/architecture.md)

## 🔮 Roadmap

### Short-term Features
- [ ] Student and teacher user roles
- [ ] Grade management system
- [ ] Attendance tracking module
- [ ] Parent portal access
- [ ] Bulk import/export functionality

### Medium-term Features  
- [ ] Mobile application (React Native)
- [ ] Advanced reporting and analytics
- [ ] Integration with external systems
- [ ] Multi-language support
- [ ] Calendar and scheduling system

### Long-term Vision
- [ ] AI-powered analytics and predictions
- [ ] Voice interface for accessibility
- [ ] Blockchain credential verification
- [ ] Virtual classroom integration
- [ ] Community and parental engagement tools

---

*For implementation details, code examples, and technical deep dives, please refer to the [complete documentation](docs/).*
