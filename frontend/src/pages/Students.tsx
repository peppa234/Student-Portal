import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Tooltip,
  Fab,
  CircularProgress,
  Skeleton,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useData } from '../contexts';
import { studentService, classService } from '../services';
import FormField from '../components/ui/FormField';
import type { Student } from '../types';

// Interface for backend student data (different from frontend Student type)
interface BackendStudentData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone?: string;
  currentClass: string;
  academicStatus: string;
  guardians: Array<{
    guardianName: string;
    guardianPhone: string;
    guardianEmail: string;
    relationship: string;
  }>;
  medicalConditions: string[];
  allergies: string[];
  notes?: string;
}

const Students: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    students, 
    classes, 
    studentsError, 
    studentsLoading,
    classesLoading,
    classesError,
    setStudents, 
    setClasses, 
    setStudentsLoading, 
    setStudentsError,
    setClassesLoading,
    setClassesError
  } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await studentService.getAllStudents();
      setStudents(response.data);
    } catch (error: any) {
      setStudentsError(error.message || 'Failed to load students');
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      setClassesLoading(true);
      setClassesError(null);
      const response = await classService.getAllClasses();
      setClasses(response.data);
    } catch (error: any) {
      console.error('Failed to load classes:', error);
      setClassesError('Failed to load classes. Please try again.');
    } finally {
      setClassesLoading(false);
    }
  };

  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', student?: Student) => {
    setDialogMode(mode);
    setStudentsError(null); // Clear any previous errors
    if (mode === 'add') {
      setSelectedStudent({
        _id: '',
        firstName: '',
        lastName: '',
        middleName: '',
        dateOfBirth: new Date().toISOString(),
        gender: 'Male',
        email: '',
        phone: '',
        currentClass: '',
        enrollmentDate: new Date().toISOString(),
        status: 'active',
        guardians: [],
        medicalConditions: [],
        allergies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      setSelectedStudent(student || null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setStudentsError(null); // Clear errors when closing
  };

  const handleDeactivateStudent = async (studentId: string) => {
    if (window.confirm('Are you sure you want to deactivate this student? They will no longer appear in active student lists but their records will be preserved.')) {
      try {
        // Find the student and update their status to inactive
        const student = students.find(s => s._id === studentId);
        if (student) {
          const updatedStudent = { ...student, status: 'inactive' as const };
          await studentService.updateStudent(studentId, updatedStudent);
          await loadStudents();
          // Show success message
        }
      } catch (error: any) {
        console.error('Deactivate student error:', error);
        setStudentsError(`Deactivate Failed: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    const confirmMessage = `Are you sure you want to delete this student?

⚠️  WARNING: This action cannot be undone!
⚠️  The student will be permanently removed from the system.
      ⚠️  Student deletion will fail if they have existing records.

Do you want to continue?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await studentService.deleteStudent(studentId);
        await loadStudents();
        // Show success message (you can add a snackbar here if you want)
      } catch (error: any) {
        console.error('Delete student error:', error);
        
        // Handle different types of errors
        if (error.response?.data?.message) {
          // Backend error message
          setStudentsError(`Delete Failed: ${error.response.data.message}`);
        } else if (error.response?.status === 500) {
          // Server error - likely backend method issue
          setStudentsError('Delete Failed: Server error. The student may have academic records that prevent deletion. Try deactivating instead.');
        } else if (error.response?.status === 400) {
          // Bad request - student has records
          setStudentsError(`Delete Failed: ${error.response.data.message}`);
        } else if (error.message) {
          // General error message
          setStudentsError(`Delete Failed: ${error.message}`);
        } else {
          setStudentsError('Delete Failed: Unknown error occurred');
        }
      }
    }
  };

  const handleSubmitStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      setIsSubmitting(true);
      setStudentsError(null);
      
      if (dialogMode === 'add') {
        await studentService.createStudent(selectedStudent);
      } else {
        await studentService.updateStudent(selectedStudent._id, selectedStudent);
      }
      
      await loadStudents();
      handleCloseDialog();
      // Show success message
    } catch (error: any) {
      console.error('Submit student error:', error);
      setStudentsError(`Failed to ${dialogMode === 'add' ? 'create' : 'update'} student: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setClassFilter('all');
    setPage(1);
  };

  // Filter students based on search term and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch = !searchTerm || 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesClass = classFilter === 'all' || student.class?.className === classFilter;
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + rowsPerPage);

  // Mobile card view for students
  const renderMobileStudentCard = (student: Student) => (
    <Card
      key={student._id}
      sx={{
        mb: 2,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {student.firstName} {student.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {student.email}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={student.status}
            size="small"
            sx={{
              background: student.status === 'active' ? 'rgba(16, 185, 129, 0.1)' :
                         student.status === 'inactive' ? 'rgba(239, 68, 68, 0.1)' :
                         'rgba(245, 158, 11, 0.1)',
              color: student.status === 'active' ? '#059669' :
                     student.status === 'inactive' ? '#dc2626' :
                     '#d97706',
              fontWeight: 600
            }}
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
            <strong>ID:</strong> {student.studentId || 'Pending'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
            <strong>Class:</strong> {typeof student.currentClass === 'string' 
              ? student.currentClass 
              : student.currentClass?.className || 'Not Assigned'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            <strong>Phone:</strong> {student.phone || 'N/A'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog('view', student)}
            sx={{ color: '#3b82f6' }}
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog('edit', student)}
            sx={{ color: '#f59e0b' }}
          >
            <EditIcon />
          </IconButton>
          {student.status === 'active' && (
            <IconButton
              size="small"
              onClick={() => handleDeactivateStudent(student._id)}
              sx={{ color: '#f59e0b' }}
            >
              <PersonOffIcon />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => handleDeleteStudent(student._id)}
            sx={{ color: '#ef4444' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      px: { xs: 2, sm: 3, md: 4 },
      py: { xs: 2, sm: 3 }
    }}>
      {/* Page Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography 
          variant={isMobile ? 'h4' : 'h3'} 
          sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            mb: 1,
            fontSize: { xs: '2rem', sm: '3rem' }
          }}
        >
          Student Management
        </Typography>
        <Typography 
          variant={isMobile ? 'body1' : 'h6'} 
          sx={{ 
            color: '#64748b',
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          Manage student records, enrollment, and academic information
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: { xs: '16px', sm: '20px' },
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        mb: 3
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, sm: 3 },
            alignItems: 'center'
          }}>
            <Box>
              <TextField
                fullWidth
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '12px' }
                }}
              />
            </Box>
            
            <Box>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="graduated">Graduated</MenuItem>
                  <MenuItem value="transferred">Transferred</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  label="Class"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  {classesLoading ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2">Loading classes...</Typography>
                      </Box>
                    </MenuItem>
                  ) : classesError ? (
                    <MenuItem disabled>
                      <Typography variant="body2" color="error">
                        Error loading classes
                      </Typography>
                    </MenuItem>
                  ) : Array.isArray(classes) && classes.length > 0 ? (
                    classes.map((classItem) => (
                      <MenuItem key={classItem._id} value={classItem.className}>
                        {classItem.className} - {classItem.grade} {classItem.section}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        No classes available
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              {classesError && (
                <Button
                  size="small"
                  onClick={loadClasses}
                  sx={{ mt: 1, fontSize: '0.75rem' }}
                >
                  Retry
                </Button>
              )}
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 3, 
            justifyContent: 'center',
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{
                borderColor: '#64748b',
                color: '#64748b',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Clear Filters
            </Button>
            
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Search Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Showing {filteredStudents.length} of {students.length} students
          {searchTerm && ` matching "${searchTerm}"`}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Page {page} of {totalPages}
        </Typography>
      </Box>

      {/* Students Table/Cards */}
      {isMobile ? (
        // Mobile card view
        <Box>
          {studentsLoading ? (
            // Loading state with skeleton cards
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={`loading-${index}`} sx={{ mb: 2, borderRadius: '16px' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="70%" height={20} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : studentsError ? (
            // Error state
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                  Failed to load students
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {studentsError}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={loadStudents}
                  startIcon={<RefreshIcon />}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : paginatedStudents.length === 0 ? (
            // Empty state
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No students found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || statusFilter !== 'all' || classFilter !== 'all' 
                    ? 'Try adjusting your search criteria' 
                    : 'No students have been added yet'}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            // Student cards
            paginatedStudents.map((student) => renderMobileStudentCard(student))
          )}
        </Box>
      ) : (
        // Desktop table view
        <Card
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: { xs: '16px', sm: '20px' },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(30, 58, 138, 0.05)' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentsLoading ? (
                    // Loading state with skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`loading-${index}`}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                            <Box>
                              <Skeleton variant="text" width={120} height={20} />
                              <Skeleton variant="text" width={80} height={16} />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="rectangular" width={60} height={24} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width={100} height={20} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="rectangular" width={80} height={24} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width={120} height={20} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton variant="circular" width={32} height={32} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : studentsError ? (
                    // Error state
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" color="error">
                            Failed to load students
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {studentsError}
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={loadStudents}
                            startIcon={<RefreshIcon />}
                          >
                            Retry
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : paginatedStudents.length === 0 ? (
                    // Empty state
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" color="text.secondary">
                            No students found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || statusFilter !== 'all' || classFilter !== 'all' 
                              ? 'Try adjusting your search criteria' 
                              : 'No students have been added yet'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                                mr: 2,
                                width: 40,
                                height: 40
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {student.firstName} {student.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {student.gender} • {new Date(student.dateOfBirth).getFullYear()}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={student.studentId || 'Pending'}
                            size="small"
                            sx={{
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: '#1d4ed8',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 16, mr: 1, color: '#64748b' }} />
                            <Typography variant="body2" sx={{ color: '#1e293b' }}>
                              {typeof student.currentClass === 'string' 
                                ? student.currentClass 
                                : student.currentClass?.className || 'Not Assigned'}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={student.status}
                            size="small"
                            sx={{
                              background: student.status === 'active' ? 'rgba(16, 185, 129, 0.1)' :
                                             student.status === 'inactive' ? 'rgba(239, 68, 68, 0.1)' :
                                             'rgba(245, 158, 11, 0.1)',
                              color: student.status === 'active' ? '#059669' :
                                     student.status === 'inactive' ? '#dc2626' :
                                     '#d97706',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#1e293b', mb: 0.5 }}>
                            {student.email}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {student.phone}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog('view', student)}
                                sx={{ color: '#3b82f6' }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Edit Student">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog('edit', student)}
                                sx={{ color: '#f59e0b' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {student.status === 'active' && (
                              <Tooltip title="Deactivate Student">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeactivateStudent(student._id)}
                                  sx={{ color: '#f59e0b' }}
                                >
                                  <PersonOffIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Delete Student">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteStudent(student._id)}
                                sx={{ color: '#ef4444' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size={isMobile ? 'small' : 'large'}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenDialog('add')}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          background: 'linear-gradient(135deg, #10b981, #059669)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669, #047857)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <AddIcon />
      </Fab>

      {/* Student Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          color: 'white',
          borderRadius: isMobile ? 0 : '20px 20px 0 0'
        }}>
          {dialogMode === 'add' ? 'Add New Student' :
           dialogMode === 'edit' ? 'Edit Student' : 'Student Details'}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
            {dialogMode === 'add' ? 'Fill in the student information below:' :
             dialogMode === 'edit' ? 'Update the student information:' :
             'View student information:'}
          </Typography>
          {dialogMode !== 'view' && (
            <Typography variant="body2" sx={{ color: '#ef4444', mb: 2, fontStyle: 'italic' }}>
              * Required fields
            </Typography>
          )}
          {studentsError && (
            <Box sx={{ mb: 2, p: 2, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ color: '#ef4444', mb: 1 }}>
                {studentsError}
              </Typography>
              {studentsError.includes('Server Error') && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSubmitStudent}
                  sx={{ 
                    mt: 1, 
                    color: '#ef4444', 
                    borderColor: '#ef4444',
                    '&:hover': { borderColor: '#dc2626', backgroundColor: 'rgba(239, 68, 68, 0.05)' }
                  }}
                >
                  Retry
                </Button>
              )}
            </Box>
          )}
          
          {selectedStudent && (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
              gap: { xs: 2, sm: 2 } 
            }}>
              <Box>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={selectedStudent.firstName}
                  onChange={(e) => setSelectedStudent(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  required
                  disabled={dialogMode === 'view'}
                />
                
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={selectedStudent.lastName}
                  onChange={(e) => setSelectedStudent(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  required
                  disabled={dialogMode === 'view'}
                />
                
                <TextField
                  fullWidth
                  label="Middle Name"
                  value={selectedStudent.middleName || ''}
                  onChange={(e) => setSelectedStudent(prev => prev ? { ...prev, middleName: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  disabled={dialogMode === 'view'}
                />
                
                <TextField
                  fullWidth
                  label="Date of Birth *"
                  type="date"
                  value={selectedStudent.dateOfBirth.split('T')[0]}
                  onChange={(e) => setSelectedStudent(prev => prev ? { ...prev, dateOfBirth: new Date(e.target.value).toISOString() } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  required
                  disabled={dialogMode === 'view'}
                />
              </Box>
              
              <Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={selectedStudent.gender}
                    onChange={(e) => setSelectedStudent(prev => prev ? { ...prev, gender: e.target.value as 'Male' | 'Female' | 'Other' } : null)}
                    label="Gender"
                    sx={{ borderRadius: '12px' }}
                    disabled={dialogMode === 'view'}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={selectedStudent.email}
                  onChange={(e) => setSelectedStudent(prev => prev ? { ...prev, email: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  required
                  disabled={dialogMode === 'view'}
                />
                
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedStudent.phone || ''}
                  onChange={(e) => setSelectedStudent(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  disabled={dialogMode === 'view'}
                />
              </Box>
              
              <Box sx={{ gridColumn: '1 / -1' }}>
                {/* 🔧 Fix: Replace class dropdown with FormField component for better UX */}
                <FormField
                  type="select"
                  label="Class *"
                  value={typeof selectedStudent.currentClass === 'string' ? selectedStudent.currentClass : selectedStudent.currentClass?._id || ''}
                  onChange={(value) => setSelectedStudent(prev => prev ? { ...prev, currentClass: value } : null)}
                  required
                  options={[
                    { value: '', label: 'Select a class' },
                    ...(Array.isArray(classes) ? classes.map((classItem) => ({
                      value: classItem._id,
                      label: `${classItem.className} - ${classItem.grade} ${classItem.section}`,
                    })) : [])
                  ]}
                  loading={classesLoading}
                  emptyText="No classes available"
                  error={classesError || undefined}
                  sx={{ mb: 2 }}
                />
                
                {/* 🔧 Fix: Replace status dropdown with FormField component */}
                <FormField
                  type="select"
                  label="Status"
                  value={selectedStudent.status}
                  onChange={(value) => setSelectedStudent(prev => prev ? { ...prev, status: value as 'active' | 'inactive' | 'suspended' | 'graduated' | 'transferred' } : null)}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'graduated', label: 'Graduated' },
                    { value: 'transferred', label: 'Transferred' },
                  ]}
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: '12px' }}>
            Cancel
          </Button>
          {dialogMode !== 'view' && (
            <Button
              variant="contained"
              onClick={handleSubmitStudent}
              disabled={isSubmitting}
              sx={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {isSubmitting ? 'Saving...' : (dialogMode === 'add' ? 'Add Student' : 'Update Student')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;
