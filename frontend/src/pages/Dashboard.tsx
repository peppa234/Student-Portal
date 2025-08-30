import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Book as BookIcon,
  TrendingUp as TrendingUpIcon,
  EventNote as EventNoteIcon,
  BarChart as BarChartIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  Subject as SubjectIcon
} from '@mui/icons-material';
import { useData } from '../contexts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, trendValue }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: { xs: '16px', sm: '20px' },
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-8px)' },
          boxShadow: { xs: '0 8px 32px rgba(0, 0, 0, 0.1)', sm: '0 16px 48px rgba(0, 0, 0, 0.15)' }
        }
      }}
    >
      <CardContent sx={{ 
        p: { xs: 2, sm: 3 },
        '&:last-child': { pb: { xs: 2, sm: 3 } }
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: { xs: 1.5, sm: 2 } 
        }}>
          <Avatar
            sx={{
              background: color,
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              boxShadow: `0 8px 16px ${color}40`
            }}
          >
            {icon}
          </Avatar>
          <IconButton 
            size={isMobile ? 'small' : 'medium'} 
            sx={{ color: '#64748b' }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            mb: { xs: 0.5, sm: 1 }, 
            color: '#1e293b',
            fontSize: { xs: '1.5rem', sm: '2.125rem' }
          }}
        >
          {value}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#64748b', 
            mb: { xs: 1.5, sm: 2 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {title}
        </Typography>
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ 
              fontSize: { xs: 14, sm: 16 }, 
              color: '#10b981', 
              mr: 0.5 
            }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#10b981', 
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.75rem' }
              }}
            >
              {trendValue} {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { students, teachers, classes, subjects } = useData();
  const [recentActivity] = useState([
    { id: 1, action: 'New student enrolled', user: 'John Doe', time: '2 hours ago', type: 'student' },
    { id: 2, action: 'Grade updated', user: 'Math Class 10A', time: '4 hours ago', type: 'grade' },
    { id: 4, action: 'New teacher assigned', user: 'Sarah Johnson', time: '1 day ago', type: 'teacher' }
  ]);

  const stats = [
    {
      title: 'Total Students',
      value: students.length,
      icon: <PeopleIcon />,
      color: '#3b82f6',
      trend: 'this month',
      trendValue: '+12%'
    },
    {
      title: 'Total Teachers',
      value: teachers.length,
      icon: <SchoolIcon />,
      color: '#10b981',
      trend: 'this month',
      trendValue: '+5%'
    },
    {
      title: 'Active Classes',
      value: classes.length,
      icon: <BookIcon />,
      color: '#f59e0b',
      trend: 'this month',
      trendValue: '+8%'
    },
    {
      title: 'Subjects Offered',
      value: subjects.length,
      icon: <SubjectIcon />,
      color: '#8b5cf6',
      trend: 'this month',
      trendValue: '+3%'
    }
  ];

  return (
    <Box sx={{ 
      px: { xs: 2, sm: 3, md: 4 },
      py: { xs: 2, sm: 3 }
    }}>
      {/* Page Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: { xs: 1, sm: 1 },
            fontSize: { xs: '2rem', sm: '3rem' }
          }}
        >
          Dashboard
        </Typography>
        <Typography 
          variant={isMobile ? 'body1' : 'h6'} 
          sx={{ 
            color: '#64748b', 
            fontWeight: 400,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          Welcome back! Here's what's happening with your school today.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: { xs: 2, sm: 3 },
        mb: { xs: 3, sm: 4 }
      }}>
        {stats.map((stat, index) => (
          <Box key={index}>
            <StatCard {...stat} />
          </Box>
        ))}
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: { xs: 2, sm: 3 }
      }}>
        {/* Recent Activity */}
        <Box>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: { xs: '16px', sm: '20px' },
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              height: '100%',
              minHeight: { xs: 'auto', md: '400px' }
            }}
          >
            <CardContent sx={{ 
              p: { xs: 2, sm: 3 },
              '&:last-child': { pb: { xs: 2, sm: 3 } }
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: { xs: 2, sm: 3 },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
              }}>
                <Typography 
                  variant={isMobile ? 'h6' : 'h6'} 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#1e293b',
                    fontSize: { xs: '1.125rem', sm: '1.25rem' }
                  }}
                >
                  Recent Activity
                </Typography>
                <Chip
                  label="Live"
                  size="small"
                  sx={{
                    background: 'linear-gradient(45deg, #10b981, #059669)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
              
              <List sx={{ p: 0 }}>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem 
                      sx={{ 
                        px: 0, 
                        py: { xs: 1, sm: 1.5 },
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(59, 130, 246, 0.05)',
                          borderRadius: '8px'
                        }
                      }}
                      onClick={() => {
                        if (activity.type === 'student') navigate('/students');
                        else if (activity.type === 'teacher') navigate('/teachers');
                        else if (activity.type === 'grade') navigate('/classes');
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            background: activity.type === 'student' ? '#3b82f6' :
                                       activity.type === 'teacher' ? '#10b981' :
                                       activity.type === 'grade' ? '#f59e0b' : '#8b5cf6',
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 }
                          }}
                        >
                          {activity.type === 'student' ? <PersonIcon /> :
                           activity.type === 'teacher' ? <SchoolIcon /> :
                           activity.type === 'grade' ? <ClassIcon /> : <SubjectIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#1e293b',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {activity.action}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#64748b',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              {activity.user}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#94a3b8',
                                fontSize: { xs: '0.625rem', sm: '0.75rem' }
                              }}
                            >
                              {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && (
                      <Divider sx={{ mx: 2, opacity: 0.3 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Box>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: { xs: '16px', sm: '20px' },
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              height: '100%',
              minHeight: { xs: 'auto', md: '400px' }
            }}
          >
            <CardContent sx={{ 
              p: { xs: 2, sm: 3 },
              '&:last-child': { pb: { xs: 2, sm: 3 } }
            }}>
              <Typography 
                variant={isMobile ? 'h6' : 'h6'} 
                sx={{ 
                  fontWeight: 600, 
                  color: '#1e293b', 
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '1.125rem', sm: '1.25rem' }
                }}
              >
                Quick Actions
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: { xs: 1.5, sm: 2 }
              }}>
                <Box>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: { xs: 'none', sm: 'translateY(-4px)' },
                        boxShadow: '0 12px 24px rgba(59, 130, 246, 0.3)'
                      },
                      borderRadius: { xs: '12px', sm: '16px' }
                    }}
                    onClick={() => navigate('/students')}
                  >
                    <CardContent sx={{ 
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      '&:last-child': { pb: { xs: 1.5, sm: 2 } }
                    }}>
                      <PeopleIcon sx={{ 
                        fontSize: { xs: 32, sm: 40 }, 
                        mb: 1 
                      }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Add Student
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                
                <Box>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: { xs: 'none', sm: 'translateY(-4px)' },
                        boxShadow: '0 12px 24px rgba(16, 185, 129, 0.3)'
                      },
                      borderRadius: { xs: '12px', sm: '16px' }
                    }}
                    onClick={() => navigate('/teachers')}
                  >
                    <CardContent sx={{ 
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      '&:last-child': { pb: { xs: 1.5, sm: 2 } }
                    }}>
                      <SchoolIcon sx={{ 
                        fontSize: { xs: 32, sm: 40 }, 
                        mb: 1 
                      }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Add Teacher
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                
                <Box>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: { xs: 'none', sm: 'translateY(-4px)' },
                        boxShadow: '0 12px 24px rgba(245, 158, 11, 0.3)'
                      },
                      borderRadius: { xs: '12px', sm: '16px' }
                    }}
                    onClick={() => navigate('/classes')}
                  >
                    <CardContent sx={{ 
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      '&:last-child': { pb: { xs: 1.5, sm: 2 } }
                    }}>
                      <BookIcon sx={{ 
                        fontSize: { xs: 32, sm: 40 }, 
                        mb: 1 
                      }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Manage Classes
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                
                <Box>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: { xs: 'none', sm: 'translateY(-4px)' },
                        boxShadow: '0 12px 24px rgba(139, 92, 246, 0.3)'
                      },
                      borderRadius: { xs: '12px', sm: '16px' }
                    }}
                    onClick={() => navigate('/reports')}
                  >
                    <CardContent sx={{ 
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      '&:last-child': { pb: { xs: 1.5, sm: 2 } }
                    }}>
                      <BarChartIcon sx={{ 
                        fontSize: { xs: 32, sm: 40 }, 
                        mb: 1 
                      }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        View Reports
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;