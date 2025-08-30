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
  Person as PersonIcon,
  Work as WorkIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useData } from '../contexts';
import { teacherService } from '../services';
import type { Teacher } from '../types';

const Teachers: React.FC = () => {
  const { teachers, setTeachers, setTeachersLoading, setTeachersError } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setTeachersLoading(true);
      const response = await teacherService.getAllTeachers();
      setTeachers(response.data);
    } catch (error: any) {
      setTeachersError(error.message || 'Failed to load teachers');
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load teachers',
        severity: 'error'
      });
    } finally {
      setTeachersLoading(false);
    }
  };

  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', teacher?: Teacher) => {
    setDialogMode(mode);
    if (mode === 'add') {
              setSelectedTeacher({
          _id: '',
          teacherId: '', // Will be auto-generated
          firstName: '',
          lastName: '',
          middleName: '',
          dateOfBirth: new Date().toISOString(),
          gender: 'Male',
          email: '',
          phone: '',
          employeeNumber: '', // Will be auto-generated
          hireDate: new Date().toISOString(),
          status: 'Active',
          department: '',
          position: '',
          qualifications: [],
          certifications: [],
          subjects: [],
          classes: [],
          yearsOfExperience: 0,
          workSchedule: {
            daysOfWeek: [],
            startTime: '',
            endTime: '',
            breaks: [{
              startTime: '',
              endTime: '',
              description: ''
            }]
          },
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
    } else {
      setSelectedTeacher(teacher || null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeacher(null);
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        setLoading(true);
        await teacherService.deleteTeacher(teacherId);
        await loadTeachers();
        setSnackbar({
          open: true,
          message: 'Teacher deleted successfully',
          severity: 'success'
        });
      } catch (error: any) {
        setTeachersError(error.message || 'Failed to delete teacher');
        setSnackbar({
          open: true,
          message: error.message || 'Failed to delete teacher',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const validateTeacher = (teacher: Teacher): string[] => {
    const errors: string[] = [];
    
    if (!teacher.firstName?.trim()) errors.push('First name is required');
    if (!teacher.lastName?.trim()) errors.push('Last name is required');
    if (!teacher.email?.trim()) errors.push('Email is required');
    if (!teacher.dateOfBirth) errors.push('Date of birth is required');
    if (!teacher.gender) errors.push('Gender is required');
    if (!teacher.department?.trim()) errors.push('Department is required');
    if (!teacher.position?.trim()) errors.push('Position is required');
    // Note: employeeNumber is optional, will be auto-generated

    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (teacher.email && !emailRegex.test(teacher.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (teacher.phone && teacher.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(teacher.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.push('Please enter a valid phone number');
      }
    }
    
    return errors;
  };

  const handleSubmitTeacher = async () => {
    if (!selectedTeacher) return;
    
    console.log('🔍 Submitting teacher data:', selectedTeacher);
    
    const validationErrors = validateTeacher(selectedTeacher);
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      setSnackbar({
        open: true,
        message: `Validation errors: ${validationErrors.join(', ')}`,
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log('🚀 Sending request to backend...');
      
      if (dialogMode === 'add') {
        const response = await teacherService.createTeacher(selectedTeacher);
        console.log('✅ Backend response:', response);
        
        setSnackbar({
          open: true,
          message: 'Teacher created successfully',
          severity: 'success'
        });
        
        // Add the new teacher to the local state
        if (response.success && response.data) {
          const updatedTeachers = [response.data, ...teachers];
          setTeachers(updatedTeachers);
        }
      } else if (dialogMode === 'edit') {
        const response = await teacherService.updateTeacher(selectedTeacher._id, selectedTeacher);
        console.log('✅ Backend response:', response);
        
        setSnackbar({
          open: true,
          message: 'Teacher updated successfully',
          severity: 'success'
        });
        
        // Update the teacher in the local state
        if (response.success && response.data) {
          const updatedTeachers = teachers.map((t: Teacher) => t._id === selectedTeacher._id ? response.data : t);
          setTeachers(updatedTeachers);
        }
      }
      
      await loadTeachers();
      handleCloseDialog();
    } catch (error: any) {
      console.error('❌ Error submitting teacher:', error);
      setTeachersError(error.message || `Failed to ${dialogMode} teacher`);
      setSnackbar({
        open: true,
        message: error.message || `Failed to ${dialogMode} teacher`,
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
    setDepartmentFilter('all');
    setPositionFilter('all');
    setExperienceFilter('all');
    setPage(1);
  };

  // Filter and search teachers
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = searchTerm === '' || 
                         teacher.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (teacher.teacherId && teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || teacher.department === departmentFilter;
    const matchesPosition = positionFilter === 'all' || teacher.position === positionFilter;
    
    // Experience filter
    let matchesExperience = true;
    if (experienceFilter !== 'all') {
      const experience = teacher.yearsOfExperience || 0;
      switch (experienceFilter) {
        case '0-2':
          matchesExperience = experience >= 0 && experience <= 2;
          break;
        case '3-5':
          matchesExperience = experience >= 3 && experience <= 5;
          break;
        case '6-10':
          matchesExperience = experience >= 6 && experience <= 10;
          break;
        case '10+':
          matchesExperience = experience > 10;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesPosition && matchesExperience;
  });

  // Pagination
  const paginatedTeachers = filteredTeachers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredTeachers.length / rowsPerPage);

  // Get unique values for filters
  const uniqueStatuses = [...new Set(teachers.map(t => t.status))];
  const uniqueDepartments = [...new Set(teachers.map(t => t.department).filter(Boolean))];
  const uniquePositions = [...new Set(teachers.map(t => t.position).filter(Boolean))];

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
          Teachers
        </Typography>
        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400 }}>
          Manage all teacher information, assignments, and professional records.
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
                placeholder="Search teachers by name, ID, email, or employee number..."
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
            
            {/* Department Filter */}
            <Box>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Department"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {uniqueDepartments.map(dept => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Position Filter */}
            <Box>
              <FormControl fullWidth>
                <InputLabel>Position</InputLabel>
                <Select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  label="Position"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Positions</MenuItem>
                  {uniquePositions.map(pos => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Experience Filter */}
            <Box>
              <FormControl fullWidth>
                <InputLabel>Experience</InputLabel>
                <Select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  label="Experience"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Experience</MenuItem>
                  <MenuItem value="0-2">0-2 years</MenuItem>
                  <MenuItem value="3-5">3-5 years</MenuItem>
                  <MenuItem value="6-10">6-10 years</MenuItem>
                  <MenuItem value="10+">10+ years</MenuItem>
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
          Showing {filteredTeachers.length} of {teachers.length} teachers
          {searchTerm && ` matching "${searchTerm}"`}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Page {page} of {totalPages}
        </Typography>
      </Box>

      {/* Teachers Table */}
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
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Teacher</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Position</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Experience</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTeachers.map((teacher) => (
                  <TableRow key={teacher._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(45deg, #10b981, #059669)',
                            mr: 2,
                            width: 40,
                            height: 40
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {teacher.firstName} {teacher.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {teacher.gender} • {new Date(teacher.dateOfBirth).getFullYear()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={teacher.teacherId || 'Pending'}
                        size="small"
                        sx={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#059669',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={teacher.department}
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
                        <WorkIcon sx={{ fontSize: 16, mr: 1, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ color: '#1e293b' }}>
                          {teacher.position}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={`${teacher.yearsOfExperience || 0} years`}
                        size="small"
                        sx={{
                          background: 'rgba(245, 158, 11, 0.1)',
                          color: '#d97706',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={teacher.status}
                        size="small"
                        sx={{
                                                     background: teacher.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' :
                                      teacher.status === 'Inactive' ? 'rgba(239, 68, 68, 0.1)' :
                                      'rgba(245, 158, 11, 0.1)',
                           color: teacher.status === 'Active' ? '#059669' :
                                  teacher.status === 'Inactive' ? '#dc2626' :
                                  '#d97706',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#1e293b', mb: 0.5 }}>
                        {teacher.email}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {teacher.phone || 'No phone'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('view', teacher)}
                            sx={{ color: '#3b82f6' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Teacher">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('edit', teacher)}
                            sx={{ color: '#f59e0b' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Teacher">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTeacher(teacher._id)}
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

      {/* Teacher Dialog */}
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
          {dialogMode === 'add' ? 'Add New Teacher' :
           dialogMode === 'edit' ? 'Edit Teacher' : 'Teacher Details'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
            {dialogMode === 'add' ? 'Fill in the teacher information below:' :
             dialogMode === 'edit' ? 'Update the teacher information:' :
             'View teacher information:'}
          </Typography>
          {dialogMode === 'view' ? (
            // View Mode - Display teacher information
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Teacher ID</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedTeacher?.teacherId || 'Pending'}</Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Full Name</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>
                  {selectedTeacher?.firstName} {selectedTeacher?.middleName} {selectedTeacher?.lastName}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Date of Birth</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>
                  {selectedTeacher?.dateOfBirth ? new Date(selectedTeacher.dateOfBirth).toLocaleDateString() : 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Gender</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedTeacher?.gender}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Email</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedTeacher?.email}</Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Phone</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedTeacher?.phone || 'N/A'}</Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Employee Number</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedTeacher?.employeeNumber || 'Auto-generated'}</Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Department</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedTeacher?.department}</Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Position</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedTeacher?.position}</Typography>
                
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Status</Typography>
                <Chip
                  label={selectedTeacher?.status}
                  size="small"
                  sx={{
                                         background: selectedTeacher?.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' :
                                selectedTeacher?.status === 'Inactive' ? 'rgba(239, 68, 68, 0.1)' :
                                'rgba(245, 158, 11, 0.1)',
                     color: selectedTeacher?.status === 'Active' ? '#059669' :
                            selectedTeacher?.status === 'Inactive' ? '#dc2626' :
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
                  label="First Name *"
                  value={selectedTeacher?.firstName || ''}
                  onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  error={!selectedTeacher?.firstName?.trim()}
                  helperText={!selectedTeacher?.firstName?.trim() ? 'First name is required' : ''}
                />
                
                <TextField
                  fullWidth
                  label="Middle Name"
                  value={selectedTeacher?.middleName || ''}
                  onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, middleName: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
                
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={selectedTeacher?.lastName || ''}
                  onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  error={!selectedTeacher?.lastName?.trim()}
                  helperText={!selectedTeacher?.lastName?.trim() ? 'Last name is required' : ''}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Date of Birth *"
                  type="date"
                  value={selectedTeacher?.dateOfBirth ? new Date(selectedTeacher.dateOfBirth).toISOString().split('T')[0] : ''}
                  onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, dateOfBirth: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  InputLabelProps={{ shrink: true }}
                  error={!selectedTeacher?.dateOfBirth}
                  helperText={!selectedTeacher?.dateOfBirth ? 'Date of birth is required' : ''}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Gender *</InputLabel>
                  <Select
                    value={selectedTeacher?.gender || ''}
                    onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, gender: e.target.value } : null)}
                    label="Gender *"
                    sx={{ borderRadius: '12px' }}
                    error={!selectedTeacher?.gender}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {!selectedTeacher?.gender && (
                    <FormHelperText error>Gender is required</FormHelperText>
                  )}
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={selectedTeacher?.email || ''}
                  onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, email: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  error={!selectedTeacher?.email?.trim()}
                  helperText={!selectedTeacher?.email?.trim() ? 'Email is required' : ''}
                />
                
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedTeacher?.phone || ''}
                  onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
              </Box>
              
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  label="Employee Number (Optional)"
                  placeholder="Will be auto-generated if left empty"
                  value={selectedTeacher?.employeeNumber || ''}
                  onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, employeeNumber: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  helperText="Leave empty for auto-generation"
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Department *</InputLabel>
                  <Select
                    value={selectedTeacher?.department || ''}
                    onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, department: e.target.value } : null)}
                    label="Department *"
                    sx={{ borderRadius: '12px' }}
                    error={!selectedTeacher?.department?.trim()}
                  >
                    <MenuItem value="">Select Department</MenuItem>
                    <MenuItem value="Mathematics">Mathematics</MenuItem>
                    <MenuItem value="Science">Science</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Social Studies">Social Studies</MenuItem>
                    <MenuItem value="Computer Science">Computer Science</MenuItem>
                    <MenuItem value="Art & Design">Art & Design</MenuItem>
                    <MenuItem value="Physical Education">Physical Education</MenuItem>
                    <MenuItem value="Music">Music</MenuItem>
                    <MenuItem value="Languages">Languages</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                  </Select>
                  {!selectedTeacher?.department?.trim() && (
                    <FormHelperText error>Department is required</FormHelperText>
                  )}
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Position *</InputLabel>
                  <Select
                    value={selectedTeacher?.position || ''}
                    onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, position: e.target.value } : null)}
                    label="Position *"
                    sx={{ borderRadius: '12px' }}
                    error={!selectedTeacher?.position?.trim()}
                  >
                    <MenuItem value="">Select Position</MenuItem>
                    <MenuItem value="Teacher">Teacher</MenuItem>
                    <MenuItem value="Senior Teacher">Senior Teacher</MenuItem>
                    <MenuItem value="Lead Teacher">Lead Teacher</MenuItem>
                    <MenuItem value="Department Head">Department Head</MenuItem>
                    <MenuItem value="Assistant Principal">Assistant Principal</MenuItem>
                    <MenuItem value="Principal">Principal</MenuItem>
                    <MenuItem value="Specialist">Specialist</MenuItem>
                    <MenuItem value="Coordinator">Coordinator</MenuItem>
                  </Select>
                  {!selectedTeacher?.position?.trim() && (
                    <FormHelperText error>Position is required</FormHelperText>
                  )}
                </FormControl>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                    Years of Experience
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      onClick={() => setSelectedTeacher(prev => prev ? { ...prev, yearsOfExperience: Math.max(0, (prev.yearsOfExperience || 0) - 1) } : null)}
                      sx={{ 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        '&:hover': { background: 'rgba(59, 130, 246, 0.1)' }
                      }}
                    >
                      -
                    </IconButton>
                    <TextField
                      value={selectedTeacher?.yearsOfExperience || 0}
                      onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, yearsOfExperience: parseInt(e.target.value) || 0 } : null)}
                      type="number"
                      InputProps={{ 
                        sx: { 
                          borderRadius: '8px',
                          textAlign: 'center',
                          minWidth: '80px'
                        },
                        inputProps: { min: 0, max: 50 }
                      }}
                    />
                    <IconButton
                      onClick={() => setSelectedTeacher(prev => prev ? { ...prev, yearsOfExperience: (prev.yearsOfExperience || 0) + 1 } : null)}
                      sx={{ 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        '&:hover': { background: 'rgba(59, 130, 246, 0.1)' }
                      }}
                    >
                      +
                    </IconButton>
                  </Box>
                </Box>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status *</InputLabel>
                  <Select
                                         value={selectedTeacher?.status || 'Active'}
                    onChange={(e) => setSelectedTeacher(prev => prev ? { ...prev, status: e.target.value } : null)}
                    label="Status *"
                    sx={{ borderRadius: '12px' }}
                  >
                                         <MenuItem value="Active">Active</MenuItem>
                     <MenuItem value="Inactive">Inactive</MenuItem>
                     <MenuItem value="On Leave">On Leave</MenuItem>
                     <MenuItem value="Retired">Retired</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Qualifications (comma-separated)"
                  placeholder="e.g., Master's in Education, Bachelor's in Science"
                  value={selectedTeacher?.qualifications?.join(', ') || ''}
                  onChange={(e) => setSelectedTeacher(prev => prev ? { 
                    ...prev, 
                    qualifications: e.target.value.split(',').map(q => q.trim()).filter(Boolean)
                  } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
                
                <TextField
                  fullWidth
                  label="Certifications (comma-separated)"
                  placeholder="e.g., Teaching License, Professional Certification"
                  value={selectedTeacher?.certifications?.join(', ') || ''}
                  onChange={(e) => setSelectedTeacher(prev => prev ? { 
                    ...prev, 
                    certifications: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                  } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
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
              onClick={handleSubmitTeacher}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {loading ? 'Saving...' : (dialogMode === 'add' ? 'Add Teacher' : 'Update Teacher')}
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

export default Teachers;
