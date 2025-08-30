import api from './api';
import type { Class, ApiResponse, SingleApiResponse } from '../types';

// Helper function to extract data from response format
// Handles both old format: { success: true, data: [...], count, total, etc. }
// and new format: { success: true, message: "...", data: { data: [...], count, total, etc. } }
const extractData = (response: any) => {
  if (response.success && response.data !== undefined) {
    // Check if this is the new format (nested data)
    if (response.data.data !== undefined && Array.isArray(response.data.data)) {
      // New format: response.data.data contains the actual array
      return response.data;
    } else if (Array.isArray(response.data)) {
      // Old format: response.data is the array directly
      return response;
    }
  }
  // Fallback: return as-is
  return response;
};

export const classService = {
  // Get all classes with pagination and filters
  getAllClasses: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    academicYear?: string;
    grade?: string;
    section?: string;
    status?: string;
  }): Promise<ApiResponse<Class>> => {
    const response = await api.get('/classes', { params });
    return extractData(response.data);
  },

  // Get class by ID
  getClassById: async (id: string): Promise<SingleApiResponse<Class>> => {
    const response = await api.get(`/classes/${id}`);
    return extractData(response.data);
  },

  // Create new class
  createClass: async (classData: Partial<Class>): Promise<SingleApiResponse<Class>> => {
    const response = await api.post('/classes', classData);
    return extractData(response.data);
  },

  // Update class
  updateClass: async (id: string, classData: Partial<Class>): Promise<SingleApiResponse<Class>> => {
    const response = await api.put(`/classes/${id}`, classData);
    return extractData(response.data);
  },

  // Delete class
  deleteClass: async (id: string): Promise<void> => {
    await api.delete(`/classes/${id}`);
  },

  // Get classes by academic year
  getClassesByAcademicYear: async (academicYear: string): Promise<ApiResponse<Class>> => {
    const response = await api.get(`/classes/academic-year/${academicYear}`);
    return extractData(response.data);
  },

  // Get classes by grade
  getClassesByGrade: async (grade: string): Promise<ApiResponse<Class>> => {
    const response = await api.get(`/classes/grade/${grade}`);
    return extractData(response.data);
  },

  // Get class schedule
  getClassSchedule: async (id: string) => {
    const response = await api.get(`/classes/${id}/schedule`);
    return extractData(response.data);
  },

  // Get class subjects
  getClassSubjects: async (id: string) => {
    const response = await api.get(`/classes/${id}/subjects`);
    return extractData(response.data);
  },

  // Get class students
  getClassStudents: async (id: string) => {
    const response = await api.get(`/classes/${id}/students`);
    return extractData(response.data);
  },

  // Add subject to class
  addSubjectToClass: async (id: string, subjectId: string) => {
    const response = await api.post(`/classes/${id}/add-subject`, { subjectId });
    return extractData(response.data);
  },

  // Remove subject from class
  removeSubjectFromClass: async (id: string, topicId: string) => {
    await api.delete(`/classes/${id}/remove-subject/${topicId}`);
  },

  // Enroll student in class
  enrollStudentInClass: async (id: string, studentId: string) => {
    const response = await api.post(`/classes/${id}/enroll-student`, { studentId });
    return extractData(response.data);
  },

  // Remove student from class
  removeStudentFromClass: async (id: string, studentId: string) => {
    await api.delete(`/classes/${id}/remove-student/${studentId}`);
  },
};
