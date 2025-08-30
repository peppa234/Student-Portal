import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  TrendingUp as TrendingUpIcon,
  FileDownload as FileDownloadIcon,
  Description as DescriptionIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useData } from '../contexts';
import { classService, subjectService } from '../services';
import type { Student, Teacher, Class, Subject } from '../types';

interface ReportData {
  title: string;
  generatedAt: string;
  summary: string;
  details: any[];
  statistics: Record<string, any>;
}

const Reports: React.FC = () => {
  const { students, teachers, classes, subjects, classesLoading, subjectsLoading, setClasses, setSubjects, setClassesLoading, setSubjectsLoading, setClassesError, setSubjectsError } = useData();
  const [selectedReportType, setSelectedReportType] = useState<string>('student-summary');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Set default dates to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // Load classes data if not already loaded
  useEffect(() => {
    const loadClasses = async () => {
      if (classes.length === 0) {
        try {
          setClassesLoading(true);
          const response = await classService.getAllClasses();
          setClasses(response.data);
        } catch (error: any) {
          console.error('Failed to load classes:', error);
          setClassesError(error.message || 'Failed to load classes');
        } finally {
          setClassesLoading(false);
        }
      }
    };

    loadClasses();
  }, [classes.length, setClasses, setClassesLoading, setClassesError]);

  // Load subjects data if not already loaded
  useEffect(() => {
    const loadSubjects = async () => {
      if (subjects.length === 0) {
        try {
          setSubjectsLoading(true);
          const response = await subjectService.getAllSubjects();
          setSubjects(response.data);
        } catch (error: any) {
          console.error('Failed to load subjects:', error);
          setSubjectsError(error.message || 'Failed to load subjects');
        } finally {
          setSubjectsLoading(false);
        }
      }
    };

    loadSubjects();
  }, [subjects.length, setSubjects, setSubjectsLoading, setSubjectsError]);

  const generateReport = async () => {
    try {
      setLoading(true);
      
      let report: ReportData;
      
      switch (selectedReportType) {
        case 'student-summary':
          report = generateStudentSummaryReport();
          break;
        case 'teacher-performance':
          report = generateTeacherPerformanceReport();
          break;
        case 'class-analysis':
          report = generateClassAnalysisReport();
          break;
        case 'academic-progress':
          report = generateAcademicProgressReport();
          break;
        case 'enrollment-statistics':
          report = generateEnrollmentStatisticsReport();
          break;
        default:
          report = generateStudentSummaryReport();
      }
      
      setReportData(report);
      setSnackbar({
        open: true,
        message: 'Report generated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate report',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStudentSummaryReport = (): ReportData => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const maleStudents = students.filter(s => s.gender === 'Male').length;
    const femaleStudents = students.filter(s => s.gender === 'Female').length;
    
    const classDistribution = classes.reduce((acc, classItem) => {
      const count = students.filter(s => s.currentClass === classItem._id).length;
      acc[classItem.className] = count;
      return acc;
    }, {} as Record<string, number>);
    
    const ageDistribution = students.reduce((acc, student) => {
      const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();
      if (age < 18) acc['Under 18'] = (acc['Under 18'] || 0) + 1;
      else if (age < 25) acc['18-24'] = (acc['18-24'] || 0) + 1;
      else if (age < 35) acc['25-34'] = (acc['25-34'] || 0) + 1;
      else acc['35+'] = (acc['35+'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      title: 'Student Summary Report',
      generatedAt: new Date().toLocaleString(),
      summary: `Comprehensive overview of ${totalStudents} students with detailed demographics and class distribution.`,
      details: [
        { label: 'Total Students', value: totalStudents, icon: <PersonIcon /> },
        { label: 'Active Students', value: activeStudents, icon: <TrendingUpIcon /> },
        { label: 'Male Students', value: maleStudents, icon: <PersonIcon /> },
        { label: 'Female Students', value: femaleStudents, icon: <PersonIcon /> }
      ],
      statistics: {
        classDistribution,
        ageDistribution,
        statusBreakdown: {
          active: activeStudents,
          inactive: totalStudents - activeStudents
        }
      }
    };
  };

  const generateTeacherPerformanceReport = (): ReportData => {
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'Active').length;
    const departmentBreakdown = teachers.reduce((acc, teacher) => {
      acc[teacher.department] = (acc[teacher.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const experienceBreakdown = teachers.reduce((acc, teacher) => {
      const exp = teacher.yearsOfExperience || 0;
      if (exp < 2) acc['0-2 years'] = (acc['0-2 years'] || 0) + 1;
      else if (exp < 5) acc['2-5 years'] = (acc['2-5 years'] || 0) + 1;
      else if (exp < 10) acc['5-10 years'] = (acc['5-10 years'] || 0) + 1;
      else acc['10+ years'] = (acc['10+ years'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      title: 'Teacher Performance Report',
      generatedAt: new Date().toLocaleString(),
      summary: `Performance analysis of ${totalTeachers} teachers across departments and experience levels.`,
      details: [
        { label: 'Total Teachers', value: totalTeachers, icon: <PersonIcon /> },
        { label: 'Active Teachers', value: activeTeachers, icon: <TrendingUpIcon /> },
        { label: 'Departments', value: Object.keys(departmentBreakdown).length, icon: <SchoolIcon /> },
        { label: 'Average Experience', value: `${(teachers.reduce((sum, t) => sum + (t.yearsOfExperience || 0), 0) / totalTeachers).toFixed(1)} years`, icon: <TrendingUpIcon /> }
      ],
      statistics: {
        departmentBreakdown,
        experienceBreakdown,
        statusBreakdown: {
          active: activeTeachers,
          inactive: totalTeachers - activeTeachers
        }
      }
    };
  };

  const generateClassAnalysisReport = (): ReportData => {
    const totalClasses = classes.length;
    const activeClasses = classes.filter(c => c.isActive === true).length;
    const gradeBreakdown = classes.reduce((acc, classItem) => {
      acc[classItem.grade] = (acc[classItem.grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const semesterBreakdown = classes.reduce((acc, classItem) => {
      acc[classItem.semester] = (acc[classItem.semester] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      title: 'Class Analysis Report',
      generatedAt: new Date().toLocaleString(),
      summary: `Analysis of ${totalClasses} classes with grade and semester distribution.`,
      details: [
        { label: 'Total Classes', value: totalClasses, icon: <ClassIcon /> },
        { label: 'Active Classes', value: activeClasses, icon: <TrendingUpIcon /> },

        { label: 'Semesters', value: Object.keys(semesterBreakdown).length, icon: <SchoolIcon /> }
      ],
      statistics: {
        gradeBreakdown,
        semesterBreakdown,
        statusBreakdown: {
          active: activeClasses,
          inactive: totalClasses - activeClasses
        }
      }
    };
  };

  const generateAcademicProgressReport = (): ReportData => {
    const totalSubjects = subjects.length;
    const activeSubjects = subjects.length; // Just use total subjects
    const departmentBreakdown = subjects.reduce((acc, subject) => {
      const dept = subject.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const difficultyBreakdown = subjects.reduce((acc, subject) => {
      const difficulty = subject.difficulty || 'Unknown';
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      title: 'Academic Progress Report',
      generatedAt: new Date().toLocaleString(),
      summary: `Academic progress analysis covering ${totalSubjects} subjects across departments.`,
      details: [
        { label: 'Total Subjects', value: totalSubjects, icon: <SchoolIcon /> },
        { label: 'Active Subjects', value: activeSubjects, icon: <TrendingUpIcon /> },
        { label: 'Departments', value: Object.keys(departmentBreakdown).length, icon: <SchoolIcon /> },
        { label: 'Average Credits', value: `${(subjects.reduce((sum, s) => sum + (s.credits || 0), 0) / totalSubjects).toFixed(1)}`, icon: <TrendingUpIcon /> }
      ],
      statistics: {
        departmentBreakdown,
        difficultyBreakdown,
        statusBreakdown: {
          active: activeSubjects,
          inactive: totalSubjects - activeSubjects
        }
      }
    };
  };

  const generateEnrollmentStatisticsReport = (): ReportData => {
    const totalEnrollments = students.length;
    const newEnrollments = students.filter(s => {
      const enrollmentDate = new Date(s.enrollmentDate);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      return enrollmentDate >= startDateObj && enrollmentDate <= endDateObj;
    }).length;
    
    const classEnrollment = classes.map(classItem => ({
      className: classItem.className,
      enrollment: students.filter(s => s.currentClass === classItem._id).length,
      capacity: 30 // Assuming standard class capacity
    }));

    return {
      title: 'Enrollment Statistics Report',
      generatedAt: new Date().toLocaleString(),
      summary: `Enrollment statistics from ${startDate} to ${endDate} with class capacity analysis.`,
      details: [
        { label: 'Total Enrollments', value: totalEnrollments, icon: <PersonIcon /> },
        { label: 'New Enrollments', value: newEnrollments, icon: <TrendingUpIcon /> },
        { label: 'Period', value: `${startDate} to ${endDate}`, icon: <DescriptionIcon /> },
        { label: 'Classes', value: classes.length, icon: <ClassIcon /> }
      ],
      statistics: {
        classEnrollment,
        periodEnrollment: newEnrollments,
        totalEnrollments
      }
    };
  };

  const downloadReportAsMarkdown = () => {
    if (!reportData) return;
    
    let markdown = `# ${reportData.title}\n\n`;
    markdown += `**Generated:** ${reportData.generatedAt}\n\n`;
    markdown += `## Summary\n\n${reportData.summary}\n\n`;
    
    markdown += `## Key Metrics\n\n`;
    reportData.details.forEach(detail => {
      markdown += `- **${detail.label}:** ${detail.value}\n`;
    });
    
    markdown += `\n## Detailed Statistics\n\n`;
    
    Object.entries(reportData.statistics).forEach(([key, value]) => {
      markdown += `### ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n\n`;
      
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'object') {
              markdown += `- ${Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
            } else {
              markdown += `- ${item}\n`;
            }
          });
        } else {
          Object.entries(value).forEach(([k, v]) => {
            markdown += `- **${k}:** ${v}\n`;
          });
        }
      } else {
        markdown += `${value}\n`;
      }
      markdown += '\n';
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: 'Report downloaded as Markdown!',
      severity: 'success'
    });
  };

  const downloadReportAsJSON = () => {
    if (!reportData) return;
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: 'Report downloaded as JSON!',
      severity: 'success'
    });
  };

  const clearReport = () => {
    setReportData(null);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Reports & Analytics
        </Typography>
        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400 }}>
          Generate comprehensive reports and analyze institutional data.
        </Typography>
      </Box>

      {/* Report Configuration */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          mb: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
            Report Configuration
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  label="Report Type"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="student-summary">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon />
                      Student Summary Report
                    </Box>
                  </MenuItem>
                  <MenuItem value="teacher-performance">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon />
                      Teacher Performance Report
                    </Box>
                  </MenuItem>
                  <MenuItem value="class-analysis">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ClassIcon />
                      Class Analysis Report
                    </Box>
                  </MenuItem>
                  <MenuItem value="academic-progress">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon />
                      Academic Progress Report
                    </Box>
                  </MenuItem>
                  <MenuItem value="enrollment-statistics">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BarChartIcon />
                      Enrollment Statistics Report
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box>
              <FormControl fullWidth>
                <InputLabel>Class (Optional)</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Class (Optional)"
                  sx={{ borderRadius: '12px' }}
                  disabled={classesLoading}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Loading classes...
                    </MenuItem>
                  ) : (
                    classes.map((classItem) => (
                      <MenuItem key={classItem._id} value={classItem._id}>
                        {classItem.className}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
            
            <Box>
              <FormControl fullWidth>
                <InputLabel>Subject (Optional)</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  label="Subject (Optional)"
                  sx={{ borderRadius: '12px' }}
                  disabled={subjectsLoading}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {subjectsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Loading subjects...
                    </MenuItem>
                  ) : (
                    subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.subjectName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
            
            <Box>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ borderRadius: '12px' }}
              />
            </Box>
            
            <Box>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{ borderRadius: '12px' }}
              />
            </Box>
            
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <AssessmentIcon />}
                  onClick={generateReport}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={clearReport}
                  disabled={!reportData}
                  sx={{
                    borderColor: '#64748b',
                    color: '#64748b',
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Clear Report
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Generated Report */}
      {reportData && (
        <Card
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            mb: 3
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {reportData.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={downloadReportAsMarkdown}
                  sx={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Download MD
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={downloadReportAsJSON}
                  sx={{
                    borderColor: '#8b5cf6',
                    color: '#8b5cf6',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Download JSON
                </Button>
              </Box>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              Generated on {reportData.generatedAt}
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
              Summary
            </Typography>
            <Typography variant="body1" sx={{ color: '#374151', mb: 3 }}>
              {reportData.summary}
            </Typography>
            
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
              Key Metrics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              {reportData.details.map((detail, index) => (
                <Box key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      background: 'rgba(59, 130, 246, 0.05)',
                      border: '1px solid rgba(59, 130, 246, 0.1)',
                      borderRadius: '12px'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      {detail.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {detail.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {detail.label}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
            
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
              Detailed Statistics
            </Typography>
            
            {Object.entries(reportData.statistics).map(([key, value], index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Typography>
                
                {typeof value === 'object' && value !== null ? (
                  Array.isArray(value) ? (
                    <List dense>
                      {value.map((item, itemIndex) => (
                        <ListItem key={itemIndex} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Chip
                              label={typeof item === 'object' ? Object.values(item)[0] : item}
                              size="small"
                              sx={{ background: 'rgba(59, 130, 246, 0.1)', color: '#1d4ed8' }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              typeof item === 'object' 
                                ? Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ')
                                : item
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Object.entries(value).map(([k, v]) => (
                        <Chip
                          key={k}
                          label={`${k}: ${v}`}
                          sx={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#059669',
                            fontWeight: 600
                          }}
                        />
                      ))}
                    </Box>
                  )
                ) : (
                  <Typography variant="body1" sx={{ color: '#374151' }}>
                    {value}
                  </Typography>
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
