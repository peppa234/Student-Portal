import api from './api';
import type { AuthResponse } from '../types';

export const authService = {
  // Admin login
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    // 🔧 Fix: Handle new response format where data is nested
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Store token
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },
};
