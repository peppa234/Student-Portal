// Export all services
export { default as api } from './api';
export { authService } from './authService';
export { studentService } from './studentService';
export { teacherService } from './teacherService';
export { classService } from './classService';
export { subjectService } from './subjectService';



// Re-export types for convenience
export type { 
  User, 
  AuthResponse, 
  Student, 
  Teacher, 
  Class, 
  Subject, 
  ApiResponse, 
  SingleApiResponse 
} from '../types';