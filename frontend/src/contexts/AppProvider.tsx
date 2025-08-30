import React from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { DataProvider } from './DataContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </AuthProvider>
  );
};
