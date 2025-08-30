import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (authService.isAuthenticated()) {
          const profile = await authService.getProfile();
          
          // ✅ Fix: Handle both shapes { user: {...} } or { ... }
          setUser(profile.user || profile);
        }
      } catch (err) {
        // Token might be expired, clear it
        authService.setToken('');
      } finally {
        setIsLoading(false);
      }
    };
  
    checkAuthStatus();
  }, []);
  

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Starting login...');
      setIsLoading(true);
      setError(null);
      
      const response: any = await authService.login(username, password);
      console.log('✅ AuthContext: Login API response received:', response);
      
      // 🔧 Fix: Handle the new response format from backend
      // Backend now returns: { success: true, message: "...", data: { token: "...", user: {...} } }
      let token: string;
      let userData: User;
      
      if (response.success && response.data) {
        // New format: response.data contains token and user
        token = response.data.token;
        userData = response.data.user;
        console.log('🔑 AuthContext: Using new response format');
      } else if (response.token) {
        // Old format: direct access (fallback)
        token = response.token;
        userData = response.user || response;
        console.log('🔑 AuthContext: Using fallback response format');
      } else {
        throw new Error('Invalid response format: missing token');
      }
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store token
      authService.setToken(token);
      console.log('🔑 AuthContext: Token stored in localStorage');
      
      // Set user
      setUser(userData);
      console.log('👤 AuthContext: User state updated:', userData);
      
      console.log('🎉 AuthContext: Login completed successfully');
    } catch (err: any) {
      console.error('❌ AuthContext: Login error:', err);
      
      // Handle specific error cases
      let errorMessage = 'Login failed';
      
      if (err.response?.status === 429) {
        // Rate limiting error
        errorMessage = err.response?.data?.message || 'Too many login attempts. Please wait a moment and try again.';
      } else if (err.response?.data?.message) {
        // Backend error message
        errorMessage = err.response.data.message;
      } else if (err.message) {
        // General error message
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
      console.log('🏁 AuthContext: Login process finished');
    }
  };
  

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Even if logout API fails, clear local state
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
