const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
require("dotenv").config();

// Import database configuration
const { connectDB } = require('./src/config/database');

// Import counter initialization
const { initializeDefaultCounters } = require('./src/utils/getNextSequence');

// Import middleware  
const { handleError, handleNotFound } = require('./src/middleware/errorHandler');
const { responseFormatter } = require('./src/middleware/responseFormatter');

// Import routes
const authRoutes = require('./src/routes/auth');
const studentRoutes = require('./src/routes/students');
const teacherRoutes = require('./src/routes/teachers');
const classRoutes = require('./src/routes/classes');
const subjectRoutes = require('./src/routes/subjects');

const app = express();

// CORS configuration with debugging (MUST come before helmet)
// Allow multiple frontend ports for development
const allowedOrigins = [
  'http://localhost:5173',  // Default Vite port
  'http://localhost:5174',  // Alternative Vite port
  'http://localhost:3000',  // Backend port (for testing)
  'http://localhost:3001',  // Alternative backend port
  process.env.CORS_ORIGIN   // Custom origin from environment
].filter(Boolean); // Remove undefined values

console.log('🔧 CORS Configuration:');
console.log(`   Allowed Origins: ${allowedOrigins.join(', ')}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Security middleware (after CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Body parsing middleware with limits
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization
app.use(mongoSanitize());

// Response formatter middleware
app.use(responseFormatter);

// Rate limiting for general routes
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: { 
    success: false, 
    message: 'Too many requests from this IP, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all routes
app.use(authLimiter);

// Stricter rate limiting for auth routes
const strictAuthLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || (process.env.NODE_ENV === 'development' ? 50 : 5), // Configurable limit
  message: { 
    success: false, 
    message: process.env.NODE_ENV === 'development' 
      ? `Rate limit reached (${process.env.AUTH_RATE_LIMIT_MAX || 50} requests per ${Math.round((parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 60000)} min). This is normal during development. Wait a moment and try again.` 
      : 'Too many login attempts, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Add debugging for development
  skip: (req) => {
    if (process.env.NODE_ENV === 'development' && req.path === '/login') {
      console.log(`🔍 Rate limit check for ${req.ip} on ${req.path}`);
    }
    return false;
  }
});

// Connect to MongoDB and initialize counters
const initializeApp = async () => {
  try {
    // Validate required environment variables
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET environment variable is required');
      console.error('💡 Run: node src/migrations/generate-jwt-secret.js');
      process.exit(1);
    }
    
    if (process.env.JWT_SECRET.length < 32) {
      console.error('❌ JWT_SECRET must be at least 32 characters long');
      console.error('💡 Run: node src/migrations/generate-jwt-secret.js');
      process.exit(1);
    }
    
    if (!process.env.ADMIN_PASSWORD_HASH) {
      console.error('❌ ADMIN_PASSWORD_HASH environment variable is required');
      console.error('💡 Run: node src/migrations/hash-admin-password.js');
      process.exit(1);
    }
    
    // Connect to database
    await connectDB();
    
    // Initialize default counters for ID generation
    await initializeDefaultCounters();
    console.log('✅ Default counters initialized successfully');
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 Student Portal API is ready!`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔧 CORS Origins: ${allowedOrigins.join(', ')}`);
      
      // Debug: Show environment variables status (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🔍 Environment Variables Check:');
        console.log(`ADMIN_USERNAME loaded: ${!!process.env.ADMIN_USERNAME ? '✅ YES' : '❌ NO'}`);
        console.log(`ADMIN_PASSWORD_HASH loaded: ${!!process.env.ADMIN_PASSWORD_HASH ? '✅ YES' : '❌ NO'}`);
        console.log(`JWT_SECRET loaded: ${!!process.env.JWT_SECRET ? '✅ YES' : '❌ NO'}`);
        console.log(`MONGODB_URI loaded: ${!!process.env.MONGODB_URI ? '✅ YES' : '❌ NO'}`);
        console.log(`JWT_SECRET length: ${process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0} chars`);
        console.log('\n🛡️ Rate Limiting Configuration:');
        console.log(`General routes: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${Math.round((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 60000)} minutes`);
        console.log(`Auth routes: ${process.env.AUTH_RATE_LIMIT_MAX || (process.env.NODE_ENV === 'development' ? 50 : 5)} requests per ${Math.round((parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 60000)} minutes`);
        console.log('');
      }
    });
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', strictAuthLimiter, authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);

// Simple route
app.get("/", (req, res) => {
  res.formatSuccess({
    message: "Student Portal API is running 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      students: "/api/students",
      teachers: "/api/teachers",
      classes: "/api/classes",
      subjects: "/api/subjects"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.formatSuccess({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoint to check environment variables (development only)
if (process.env.NODE_ENV === 'development') {
  app.get("/debug/env", (req, res) => {
    res.formatSuccess({
      message: "Environment variables check",
      envLoaded: {
        ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
        ADMIN_PASSWORD_HASH: !!process.env.ADMIN_PASSWORD_HASH,
        JWT_SECRET: !!process.env.JWT_SECRET,
        MONGODB_URI: !!process.env.MONGODB_URI,
        PORT: !!process.env.PORT
      },
      adminUsernameLength: process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME.length : 0,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      timestamp: new Date().toISOString()
    });
  });
  
  // Debug endpoint to check CORS configuration
  app.get("/debug/cors", (req, res) => {
    res.formatSuccess({
      message: "CORS configuration check",
      allowedOrigins,
      requestOrigin: req.get('Origin'),
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  });
}

// 404 handler
app.use(handleNotFound);

// Global error handler
app.use(handleError);

// Initialize the application
initializeApp();
