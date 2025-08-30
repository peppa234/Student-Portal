import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import { AppProvider, useAuth } from './contexts';
import { Layout } from './components/layout';
import { Login, Dashboard, Students, Teachers, Classes, Subjects, Reports, Settings } from './pages';

// Create a custom theme 
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Navy blue
      light: '#3b82f6',
      dark: '#1e40af',
    },
    secondary: {
      main: '#fbbf24', // Golden accent
      light: '#fcd34d',
      dark: '#f59e0b',
    },
    background: {
      default: '#f8fafc',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '12px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Loading component
const LoadingFallback: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
    }}
  >
    <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
      Loading Student Portal...
    </Typography>
  </Box>
);

// Error fallback component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
      p: 3,
    }}
  >
    <Typography variant="h4" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
      Something went wrong
    </Typography>
    <Typography variant="body1" sx={{ color: 'white', mb: 3, textAlign: 'center', maxWidth: 600 }}>
      An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
    </Typography>
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
      <button
        onClick={resetErrorBoundary}
        style={{
          background: 'white',
          color: '#1e3a8a',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: '1px solid white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Refresh Page
      </button>
    </Box>
    {process.env.NODE_ENV === 'development' && (
      <Box sx={{ mt: 3, p: 2, background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', maxWidth: 600 }}>
        <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
          Error: {error.message}
        </Typography>
      </Box>
    )}
  </Box>
);

// App Routes Component - This will be inside the AuthProvider
const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Protected Route Component
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (isLoading) {
      return <LoadingFallback />;
    }
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

  // Public Route Component (redirects to dashboard if already logged in)
  const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (isLoading) {
      return <LoadingFallback />;
    }
    
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        window.location.reload();
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            
            {/* Additional routes for future pages */}
            <Route path="classes" element={<Classes />} />
            <Route path="subjects" element={<Subjects />} />

            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
