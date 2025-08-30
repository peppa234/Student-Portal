import api from './api';
import type { Teacher, ApiResponse, SingleApiResponse } from '../types';

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

export const teacherService = {
  // Get all teachers with pagination and filters
  getAllTeachers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
  }): Promise<ApiResponse<Teacher>> => {
    const response = await api.get('/teachers', { params });
    return extractData(response.data);
  },

  // Get teacher by ID
  getTeacherById: async (id: string): Promise<SingleApiResponse<Teacher>> => {
    const response = await api.get(`/teachers/${id}`);
    return extractData(response.data);
  },

  // Create new teacher
  createTeacher: async (teacherData: Partial<Teacher>): Promise<SingleApiResponse<Teacher>> => {
    const response = await api.post('/teachers', teacherData);
    return extractData(response.data);
  },

  // Update teacher
  updateTeacher: async (id: string, teacherData: Partial<Teacher>): Promise<SingleApiResponse<Teacher>> => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return extractData(response.data);
  },

  // Delete teacher
  deleteTeacher: async (id: string): Promise<void> => {
    const response = await api.delete(`/teachers/${id}`);
    return extractData(response.data);
  },

  // Get teachers by department
  getTeachersByDepartment: async (department: string): Promise<ApiResponse<Teacher>> => {
    const response = await api.get(`/teachers/department/${department}`);
    return extractData(response.data);
  },

  // Get teacher schedule
  getTeacherSchedule: async (id: string) => {
    const response = await api.get(`/teachers/${id}/schedule`);
    return extractData(response.data);
  },

  // Assign teacher to class
  assignTeacherToClass: async (teacherId: string, classId: string) => {
    const response = await api.put(`/teachers/${teacherId}/assign-class`, { classId });
    return extractData(response.data);
  },
};
