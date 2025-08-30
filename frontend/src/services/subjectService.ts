import api from './api';
import type { Subject, ApiResponse, SingleApiResponse } from '../types';

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

export const subjectService = {
  // Get all subjects with pagination and filters
  getAllSubjects: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    category?: string;
    difficulty?: string;
  }): Promise<ApiResponse<Subject>> => {
    const response = await api.get('/subjects', { params });
    return extractData(response.data);
  },

  // Get subject by ID
  getSubjectById: async (id: string): Promise<SingleApiResponse<Subject>> => {
    const response = await api.get(`/subjects/${id}`);
    return extractData(response.data);
  },

  // Create new subject
  createSubject: async (subjectData: Partial<Subject>): Promise<SingleApiResponse<Subject>> => {
    const response = await api.post('/subjects', subjectData);
    return extractData(response.data);
  },

  // Update subject
  updateSubject: async (id: string, subjectData: Partial<Subject>): Promise<SingleApiResponse<Subject>> => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return extractData(response.data);
  },

  // Delete subject
  deleteSubject: async (id: string): Promise<void> => {
    const response = await api.delete(`/subjects/${id}`);
    return extractData(response.data);
  },

  // Get subjects by department
  getSubjectsByDepartment: async (department: string): Promise<ApiResponse<Subject>> => {
    const response = await api.get(`/subjects/department/${department}`);
    return extractData(response.data);
  },

  // Get subjects by category
  getSubjectsByCategory: async (category: string): Promise<ApiResponse<Subject>> => {
    const response = await api.get(`/subjects/category/${category}`);
    return extractData(response.data);
  },

  // Get subjects by difficulty
  getSubjectsByDifficulty: async (difficulty: string): Promise<ApiResponse<Subject>> => {
    const response = await api.get(`/subjects/difficulty/${difficulty}`);
    return extractData(response.data);
  },

  // Assign subject to teacher
  assignSubjectToTeacher: async (subjectId: string, teacherId: string) => {
    const response = await api.put(`/subjects/${subjectId}/assign-teacher`, { teacherId });
    return extractData(response.data);
  },

  // Remove subject from teacher
  removeSubjectFromTeacher: async (subjectId: string, teacherId: string) => {
    const response = await api.put(`/subjects/${subjectId}/remove-teacher`, { teacherId });
    return extractData(response.data);
  },

  // Add subject to class
  addSubjectToClass: async (subjectId: string, classId: string) => {
    const response = await api.put(`/subjects/${subjectId}/add-class`, { classId });
    return extractData(response.data);
  },

  // Remove subject from class
  removeSubjectFromClass: async (subjectId: string, classId: string) => {
    const response = await api.put(`/subjects/${subjectId}/remove-class`, { classId });
    return extractData(response.data);
  },
};
