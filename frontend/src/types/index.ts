// User/Auth Types
export interface User {
  username: string;
  role: 'admin';
}

// 🔧 Updated: New backend response format
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
  timestamp: string;
  path: string;
  method: string;
}

// Legacy format (for backward compatibility)
export interface LegacyAuthResponse {
  message: string;
  token: string;
  user: User;
}

// Basic Types (defined first to avoid circular dependencies)
export interface Guardian {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Qualification {
  degree: string;
  institution: string;
  yearCompleted: number;
  fieldOfStudy: string;
  gpa?: number;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface WorkSchedule {
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  breaks: Break[];
}

export interface Break {
  startTime: string;
  endTime: string;
  description: string;
}

export interface ClassSchedule {
  room?: string;
  building?: string;
  floor?: string;
  classTeacher?: string | Teacher | undefined;
}

export interface Curriculum {
  topics: Topic[];
  totalHours: number;
  theoryHours: number;
  practicalHours: number;
}

export interface Topic {
  title: string;
  description: string;
  duration: number;
  order: number;
}

export interface Assessment {
  totalMarks: number;
  passingMarks: number;
  gradingSystem: 'Percentage' | 'Letter Grade' | 'GPA';
  components: AssessmentComponent[];
}

export interface AssessmentComponent {
  name: string;
  weightage: number;
  type: 'Assignment' | 'Quiz' | 'Midterm' | 'Final' | 'Project' | 'Participation';
}

export interface Textbook {
  title: string;
  author: string;
  publisher: string;
  isbn?: string;
  isRequired: boolean;
}

export interface OnlineResource {
  title: string;
  url: string;
  description: string;
}

// Class Types (defined before Student/Teacher to avoid circular dependencies)
export interface Class {
  _id: string;
  className: string;
  classCode?: string; // Optional since it's auto-generated
  academicYear: string;
  semester: string;
  grade: string;
  section: string;
  capacity: number;
  currentEnrollment: number;
  subjects: string[] | Subject[];
  classTeacher?: string | Teacher;
  students: string[] | Student[];
  averageGrade: number;
  status: string;
  isActive: boolean;
  description?: string;
  requirements?: string[];
  room?: string;
  building?: string;
  floor?: string;
  classSchedule: ClassSchedule;
  createdAt: string;
  updatedAt: string;
}

// Subject Types (defined before Student/Teacher to avoid circular dependencies)
export interface Subject {
  _id: string;
  subjectCode?: string; // Optional since it's auto-generated
  subjectName: string;
  shortName?: string;
  grade: string;
  academicYear: string;
  semester: string;
  description?: string;
  objectives: string[];
  learningOutcomes: string[];
  prerequisites: string[] | Subject[];
  curriculum: string;
  assessment: string;
  teachers: string[] | Teacher[];
  classes: string[] | Class[];
  textbooks: string[];
  materials: string[];
  onlineResources: string[];
  department?: string;
  category?: 'Core' | 'Elective' | 'Advanced' | 'Remedial';
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  credits?: number;
  hoursPerWeek?: number;
  isActive?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Student Types
export interface Student {
  _id: string;
  studentId?: string; // Optional since it's auto-generated
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  currentClass: string | Class;
  class?: Class; // Populated class data
  enrollmentDate: string;
  graduationYear?: number;
  status: 'active' | 'inactive' | 'suspended' | 'graduated' | 'transferred';
  guardians: Guardian[];
  medicalConditions: string[];
  allergies: string[];
  emergencyContact?: EmergencyContact;
  profilePicture?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Teacher Types
export interface Teacher {
  _id: string;
  teacherId?: string; // Optional since it's auto-generated
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  employeeNumber?: string; // Optional, will be auto-generated
  hireDate: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Retired';
  department: string;
  position: string;
  qualifications: string[];
  certifications: string[];
  subjects: string[] | Subject[];
  classes: string[] | Class[];
  yearsOfExperience: number;
  workSchedule?: WorkSchedule;
  emergencyContact?: EmergencyContact;
  profilePicture?: string;
  bio?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: T[];
}

export interface SingleApiResponse<T> {
  success: boolean;
  data: T;
}



