import React, { useState } from 'react';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header onMobileMenuToggle={handleDrawerToggle} />
      
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 2, md: 2 }, // Reduced padding on desktop
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh',
          overflow: 'auto',
          // The flexbox layout will handle the spacing automatically
        }}
      >
        <Toolbar /> {/* Spacer for fixed header */}
        
        {/* Content Container */}
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: { xs: '16px', sm: '20px' },
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            p: { xs: 2, sm: 3, md: 3 }, // Reduced padding on desktop to minimize space
            minHeight: 'calc(100vh - 140px)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: { xs: 100, sm: 200 },
              height: { xs: 100, sm: 200 },
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 0
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: { xs: 75, sm: 150 },
              height: { xs: 75, sm: 150 },
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 0
            }}
          />
          
          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
