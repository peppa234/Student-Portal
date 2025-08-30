import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
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
  Alert,
  Snackbar,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Class as ClassIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useData } from '../contexts';
import { classService } from '../services';
import type { Class } from '../types';

const Classes: React.FC = () => {
  const { classes, setClasses, setClassesLoading, setClassesError } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setClassesLoading(true);
      const response = await classService.getAllClasses();
      setClasses(response.data);
    } catch (error: any) {
      setClassesError(error.message || 'Failed to load classes');
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load classes',
        severity: 'error'
      });
    } finally {
      setClassesLoading(false);
    }
  };

  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', classItem?: Class) => {
    setDialogMode(mode);
    if (mode === 'add') {
              setSelectedClass({
          _id: '',
          className: '',
          academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          semester: 'First',
          grade: '',
          section: '',
          capacity: 30,
          currentEnrollment: 0,
          subjects: [],
          classTeacher: undefined,
          students: [],
          averageGrade: 0,
      
          status: 'Active',
          isActive: true,
          room: '',
          building: '',
          floor: '',
          classSchedule: {
            room: '',
            building: '',
            floor: '',
            classTeacher: undefined
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
         } else {
       // When editing/viewing, sync top-level fields with classSchedule for form display
       if (classItem) {
         const syncedClass = {
           ...classItem,
           room: classItem.classSchedule?.room || '',
           building: classItem.classSchedule?.building || '',
           floor: classItem.classSchedule?.floor || ''
         };
         setSelectedClass(syncedClass);
       } else {
         setSelectedClass(null);
       }
     }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
  };

  const handleDeleteClass = async (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        setLoading(true);
        await classService.deleteClass(classId);
        await loadClasses();
        setSnackbar({
          open: true,
          message: 'Class deleted successfully',
          severity: 'success'
        });
      } catch (error: any) {
        setClassesError(error.message || 'Failed to delete class');
        setSnackbar({
          open: true,
          message: error.message || 'Failed to delete class',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const validateClass = (classItem: Class): string[] => {
    const errors: string[] = [];
    
    if (!classItem.className?.trim()) errors.push('Class name is required');
    if (!classItem.grade?.trim()) errors.push('Grade is required');
    if (!classItem.section?.trim()) errors.push('Section is required');
    if (!classItem.academicYear?.trim()) errors.push('Academic year is required');
    if (!classItem.semester?.trim()) errors.push('Semester is required');
    if (!classItem.capacity || classItem.capacity <= 0) errors.push('Capacity must be greater than 0');
    
    // Academic year format validation (YYYY-YYYY)
    const yearRegex = /^\d{4}-\d{4}$/;
    if (classItem.academicYear && !yearRegex.test(classItem.academicYear)) {
      errors.push('Academic year must be in YYYY-YYYY format');
    }
    
    return errors;
  };

  const handleSubmitClass = async () => {
    if (!selectedClass) return;
    
    const validationErrors = validateClass(selectedClass);
    if (validationErrors.length > 0) {
      setSnackbar({
        open: true,
        message: `Validation errors: ${validationErrors.join(', ')}`,
        severity: 'error'
      });
      return;
    }
    
    // Prepare data in the format backend expects
    const classDataToSend = {
      ...selectedClass,
      // Remove top-level room/building/floor since backend expects them in classSchedule
      room: undefined,
      building: undefined,
      floor: undefined,
      classSchedule: {
        room: selectedClass.room || '',
        building: selectedClass.building || '',
        floor: selectedClass.floor || '',
        classTeacher: selectedClass.classTeacher || undefined
      }
    };
    
    // Remove empty classTeacher to avoid MongoDB ObjectId validation errors
    if (!classDataToSend.classTeacher || classDataToSend.classTeacher === '') {
      classDataToSend.classTeacher = undefined;
    }
    
    console.log('🚀 Sending class data to backend:', classDataToSend);
    
    try {
      setLoading(true);
      if (dialogMode === 'add') {
        const response = await classService.createClass(classDataToSend);
        setSnackbar({
          open: true,
          message: 'Class created successfully',
          severity: 'success'
        });
        
        // Add the new class to the local state
        if (response.success && response.data) {
          const updatedClasses = [response.data, ...classes];
          setClasses(updatedClasses);
        }
      } else if (dialogMode === 'edit') {
        const response = await classService.updateClass(selectedClass._id, classDataToSend);
        setSnackbar({
          open: true,
          message: 'Class updated successfully',
          severity: 'success'
        });
        
        // Update the class in the local state
        if (response.success && response.data) {
          const updatedClasses = classes.map((c: Class) => c._id === selectedClass._id ? response.data : c);
          setClasses(updatedClasses);
        }
      }
      
      await loadClasses();
      handleCloseDialog();
    } catch (error: any) {
      setClassesError(error.message || `Failed to ${dialogMode} class`);
      setSnackbar({
        open: true,
        message: error.message || `Failed to ${dialogMode} class`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setGradeFilter('all');
    setSemesterFilter('all');
    setAcademicYearFilter('all');
    setPage(1);
  };

  // Filter and search classes
  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = searchTerm === '' || 
                         classItem.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (classItem.classCode && classItem.classCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         classItem.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.section?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || classItem.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || classItem.grade === gradeFilter;
    const matchesSemester = semesterFilter === 'all' || classItem.semester === semesterFilter;
    const matchesAcademicYear = academicYearFilter === 'all' || classItem.academicYear === academicYearFilter;
    
    return matchesSearch && matchesStatus && matchesGrade && matchesSemester && matchesAcademicYear;
  });

  // Pagination
  const paginatedClasses = filteredClasses.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredClasses.length / rowsPerPage);

  // Get unique values for filters
  const uniqueStatuses = [...new Set(classes.map(c => c.status))];
  const uniqueGrades = [...new Set(classes.map(c => c.grade).filter(Boolean))];
  const uniqueSemesters = [...new Set(classes.map(c => c.semester).filter(Boolean))];
  const uniqueAcademicYears = [...new Set(classes.map(c => c.academicYear).filter(Boolean))];

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
          Classes
        </Typography>
        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400 }}>
          Manage all class information, schedules, and student enrollments.
        </Typography>
      </Box>

      {/* Enhanced Filters and Search */}
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
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(6, 1fr)' },
            gap: 3, 
            alignItems: 'center' 
          }}>
            {/* Search Field */}
            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
              <TextField
                fullWidth
                placeholder="Search classes by name, code, grade, or section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                        sx={{ color: '#64748b' }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }
                }}
              />
            </Box>
            
            {/* Status Filter */}
            <Box>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {uniqueStatuses.map(status => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Grade Filter */}
            <Box>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  label="Grade"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Grades</MenuItem>
                  {uniqueGrades.map(grade => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Semester Filter */}
            <Box>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  label="Semester"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Semesters</MenuItem>
                  {uniqueSemesters.map(semester => (
                    <MenuItem key={semester} value={semester}>
                      {semester}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Academic Year Filter */}
            <Box>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={academicYearFilter}
                  onChange={(e) => setAcademicYearFilter(e.target.value)}
                  label="Academic Year"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Years</MenuItem>
                  {uniqueAcademicYears.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
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
          Showing {filteredClasses.length} of {classes.length} classes
          {searchTerm && ` matching "${searchTerm}"`}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Page {page} of {totalPages}
        </Typography>
      </Box>

      {/* Classes Table */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(30, 58, 138, 0.05)' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Grade & Section</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Enrollment</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Schedule</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClasses.map((classItem) => (
                  <TableRow key={classItem._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                            mr: 2,
                            width: 40,
                            height: 40
                          }}
                        >
                          <ClassIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {classItem.className}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {classItem.academicYear} • {classItem.semester}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={classItem.classCode || 'Pending'}
                        size="small"
                        sx={{
                          background: 'rgba(245, 158, 11, 0.1)',
                          color: '#d97706',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ fontSize: 16, mr: 1, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ color: '#1e293b' }}>
                          {classItem.grade} {classItem.section}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon sx={{ fontSize: 16, mr: 1, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ color: '#1e293b' }}>
                          {classItem.currentEnrollment}/{classItem.capacity}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                                         <TableCell>
                       <Typography variant="body2" sx={{ color: '#1e293b', mb: 0.5 }}>
                         {classItem.classSchedule?.room || 'N/A'}
                       </Typography>
                       <Typography variant="caption" sx={{ color: '#64748b' }}>
                         {classItem.classSchedule?.building || 'N/A'} - Floor {classItem.classSchedule?.floor || 'N/A'}
                       </Typography>
                     </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={classItem.status}
                        size="small"
                        sx={{
                          background: classItem.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' :
                                     classItem.status === 'Inactive' ? 'rgba(239, 68, 68, 0.1)' :
                                     'rgba(245, 158, 11, 0.1)',
                          color: classItem.status === 'Active' ? '#059669' :
                                 classItem.status === 'Inactive' ? '#dc2626' :
                                 '#d97706',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('view', classItem)}
                            sx={{ color: '#3b82f6' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Class">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('edit', classItem)}
                            sx={{ color: '#f59e0b' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Class">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClass(classItem._id)}
                            disabled={loading}
                            sx={{ color: '#ef4444' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
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
                size="large"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenDialog('add')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
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

      {/* Class Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          color: 'white',
          borderRadius: '20px 20px 0 0'
        }}>
          {dialogMode === 'add' ? 'Add New Class' :
           dialogMode === 'edit' ? 'Edit Class' : 'Class Details'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
            {dialogMode === 'add' ? 'Fill in the class information below:' :
             dialogMode === 'edit' ? 'Update the class information:' :
             'View class information:'}
          </Typography>
          {dialogMode === 'view' ? (
            // View Mode - Display class information
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Class Name</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedClass?.className}</Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Class Code</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedClass?.classCode || 'Pending'}</Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Grade & Section</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>
                  {selectedClass?.grade} {selectedClass?.section}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Academic Year</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedClass?.academicYear}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Enrollment</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>
                  {selectedClass?.currentEnrollment}/{selectedClass?.capacity}
                </Typography>
                
                                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Room</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>
                   {selectedClass?.classSchedule?.building || 'N/A'} - Floor {selectedClass?.classSchedule?.floor || 'N/A'} - Room {selectedClass?.classSchedule?.room || 'N/A'}
                 </Typography>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Class Teacher</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>
                   {typeof selectedClass?.classTeacher === 'string' ? selectedClass.classTeacher : 'No Teacher Assigned'}
                 </Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Status</Typography>
                <Chip
                  label={selectedClass?.status}
                  size="small"
                  sx={{
                    background: selectedClass?.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' :
                               selectedClass?.status === 'Inactive' ? 'rgba(239, 68, 68, 0.1)' :
                               'rgba(245, 158, 11, 0.1)',
                    color: selectedClass?.status === 'Active' ? '#059669' :
                           selectedClass?.status === 'Inactive' ? '#dc2626' :
                           '#d97706',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>
          ) : (
            // Add/Edit Mode - Form fields
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Class Name *"
                  value={selectedClass?.className || ''}
                  onChange={(e) => setSelectedClass(prev => prev ? { ...prev, className: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  error={!selectedClass?.className?.trim()}
                  helperText={!selectedClass?.className?.trim() ? 'Class name is required' : ''}
                />
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                  Class Code will be auto-generated
                </Typography>
                
                <TextField
                  fullWidth
                  label="Grade *"
                  value={selectedClass?.grade || ''}
                  onChange={(e) => setSelectedClass(prev => prev ? { ...prev, grade: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  error={!selectedClass?.grade?.trim()}
                  helperText={!selectedClass?.grade?.trim() ? 'Grade is required' : ''}
                />
                
                <TextField
                  fullWidth
                  label="Section *"
                  value={selectedClass?.section || ''}
                  onChange={(e) => setSelectedClass(prev => prev ? { ...prev, section: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  error={!selectedClass?.section?.trim()}
                  helperText={!selectedClass?.section?.trim() ? 'Section is required' : ''}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Academic Year *"
                  placeholder="YYYY-YYYY"
                  value={selectedClass?.academicYear || ''}
                  onChange={(e) => setSelectedClass(prev => prev ? { ...prev, academicYear: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  error={!selectedClass?.academicYear?.trim()}
                  helperText={!selectedClass?.academicYear?.trim() ? 'Academic year is required' : ''}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Semester *</InputLabel>
                  <Select
                    value={selectedClass?.semester || ''}
                    onChange={(e) => setSelectedClass(prev => prev ? { ...prev, semester: e.target.value } : null)}
                    label="Semester *"
                    sx={{ borderRadius: '12px' }}
                    error={!selectedClass?.semester?.trim()}
                  >
                    <MenuItem value="First">First</MenuItem>
                    <MenuItem value="Second">Second</MenuItem>
                    <MenuItem value="Summer">Summer</MenuItem>
                  </Select>
                  {!selectedClass?.semester && (
                    <FormHelperText error>Semester is required</FormHelperText>
                  )}
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Capacity *"
                  type="number"
                  value={selectedClass?.capacity || 30}
                  onChange={(e) => setSelectedClass(prev => prev ? { ...prev, capacity: parseInt(e.target.value) || 30 } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  error={!selectedClass?.capacity || selectedClass?.capacity <= 0}
                  helperText={(!selectedClass?.capacity || selectedClass?.capacity <= 0) ? 'Capacity must be greater than 0' : ''}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status *</InputLabel>
                  <Select
                    value={selectedClass?.status || 'Active'}
                    onChange={(e) => setSelectedClass(prev => prev ? { ...prev, status: e.target.value } : null)}
                    label="Status *"
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                
                                 <TextField
                   fullWidth
                   label="Room"
                   value={selectedClass?.room || ''}
                   onChange={(e) => setSelectedClass(prev => prev ? { ...prev, room: e.target.value } : null)}
                   sx={{ mb: 2 }}
                   InputProps={{ sx: { borderRadius: '12px' } }}
                 />
                 
                 <TextField
                   fullWidth
                   label="Building"
                   value={selectedClass?.building || ''}
                   onChange={(e) => setSelectedClass(prev => prev ? { ...prev, building: e.target.value } : null)}
                   sx={{ mb: 2 }}
                   InputProps={{ sx: { borderRadius: '12px' } }}
                 />
                 
                 <TextField
                   fullWidth
                   label="Floor"
                   value={selectedClass?.floor || ''}
                   onChange={(e) => setSelectedClass(prev => prev ? { ...prev, floor: e.target.value } : null)}
                   sx={{ mb: 2 }}
                   InputProps={{ sx: { borderRadius: '12px' } }}
                 />
                 
                 <FormControl fullWidth sx={{ mb: 2 }}>
                   <InputLabel>Class Teacher (Optional)</InputLabel>
                   <Select
                     value={selectedClass?.classTeacher || ''}
                     onChange={(e) => setSelectedClass(prev => prev ? { ...prev, classTeacher: e.target.value } : null)}
                     label="Class Teacher (Optional)"
                     sx={{ borderRadius: '12px' }}
                   >
                     <MenuItem value="">No Teacher Assigned</MenuItem>
                     <MenuItem value="placeholder">Select Teacher (Coming Soon)</MenuItem>
                   </Select>
                   <FormHelperText>Teacher can be assigned later</FormHelperText>
                 </FormControl>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: '12px' }}>
            Cancel
          </Button>
          {dialogMode !== 'view' && (
            <Button
              variant="contained"
              onClick={handleSubmitClass}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {loading ? 'Saving...' : (dialogMode === 'add' ? 'Add Class' : 'Update Class')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

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

export default Classes;
