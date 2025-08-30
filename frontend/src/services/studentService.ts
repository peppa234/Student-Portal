import api from './api';
import type { Student, ApiResponse, SingleApiResponse } from '../types';

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

export const studentService = {
  // Get all students with pagination and filters
  getAllStudents: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    class?: string;
  }): Promise<ApiResponse<Student>> => {
    const response = await api.get('/students', { params });
    return extractData(response.data);
  },

  // Get student by ID
  getStudentById: async (id: string): Promise<SingleApiResponse<Student>> => {
    const response = await api.get(`/students/${id}`);
    return extractData(response.data);
  },

  // Create new student
  createStudent: async (studentData: Partial<Student>): Promise<SingleApiResponse<Student>> => {
    const response = await api.post('/students', studentData);
    return extractData(response.data);
  },

  // Update student
  updateStudent: async (id: string, studentData: Partial<Student>): Promise<SingleApiResponse<Student>> => {
    const response = await api.put(`/students/${id}`, studentData);
    return extractData(response.data);
  },

  // Delete student
  deleteStudent: async (id: string): Promise<void> => {
    const response = await api.delete(`/students/${id}`);
    return extractData(response.data);
  },

  // Get students by class
  getStudentsByClass: async (classId: string): Promise<ApiResponse<Student>> => {
    const response = await api.get(`/students/class/${classId}`);
    return extractData(response.data);
  },

  // Get student academic performance
  getStudentAcademicPerformance: async (id: string) => {
    const response = await api.get(`/students/${id}/academic-performance`);
    return extractData(response.data);
  },

  // Transfer student to different class
  transferStudentToClass: async (id: string, classId: string) => {
    const response = await api.put(`/students/${id}/transfer-class`, { classId });
    return extractData(response.data);
  },
};
