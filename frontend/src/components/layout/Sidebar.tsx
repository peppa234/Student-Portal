import React from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Box, Typography, Divider, Toolbar, useTheme, useMediaQuery,
  Backdrop
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People as PeopleIcon, School as SchoolIcon,
  Book as BookIcon, Assessment as AssessmentIcon, EventNote as EventNoteIcon,
  BarChart as BarChartIcon, Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Students', icon: <PeopleIcon />, path: '/students' },
  { text: 'Teachers', icon: <SchoolIcon />, path: '/teachers' },
  { text: 'Classes', icon: <BookIcon />, path: '/classes' },
  { text: 'Subjects', icon: <AssessmentIcon />, path: '/subjects' },
  { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close mobile sidebar after navigation
    if (isMobile) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
            }}
          >
            <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 700,
              background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', md: 'block' }
            }}
          >
            Student Portal
          </Typography>
        </Box>
      </Toolbar>
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '12px',
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1))'
                    : 'transparent',
                  border: isActive 
                    ? '1px solid rgba(251, 191, 36, 0.3)'
                    : '1px solid transparent',
                  color: isActive ? '#fbbf24' : 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.15))'
                      : 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.95rem',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && (
        <Backdrop
          open={mobileOpen}
          onClick={onMobileClose}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer - 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
            border: 'none',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
            zIndex: (theme) => theme.zIndex.drawer,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
            border: 'none',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
