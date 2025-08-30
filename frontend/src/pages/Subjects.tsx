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
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Book as BookIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useData } from '../contexts';
import { subjectService } from '../services';
import type { Subject } from '../types';

const Subjects: React.FC = () => {
  const { subjects, setSubjects, setSubjectsLoading, setSubjectsError } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const response = await subjectService.getAllSubjects();
      setSubjects(response.data);
    } catch (error: any) {
      setSubjectsError(error.message || 'Failed to load subjects');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', subject?: Subject) => {
    setDialogMode(mode);
    if (mode === 'add') {
      setSelectedSubject({
        _id: '',
        subjectName: '',
        shortName: '',
        grade: '',
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        semester: 'First',
        description: '',
        objectives: [],
        learningOutcomes: [],
        prerequisites: [],
        curriculum: '',
        assessment: '',
        teachers: [],
        classes: [],
        textbooks: [],
        materials: [],
        onlineResources: [],
        department: '',
        category: 'Core' as const,
        difficulty: 'Intermediate' as const,
        credits: 3,
        hoursPerWeek: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      setSelectedSubject(subject || null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectService.deleteSubject(subjectId);
        await loadSubjects();
      } catch (error: any) {
        setSubjectsError(error.message || 'Failed to delete subject');
      }
    }
  };

  const handleSubmitSubject = async () => {
    if (!selectedSubject) return;
    
    try {
      if (dialogMode === 'add') {
        console.log('🚀 Creating new subject:', selectedSubject);
        const response = await subjectService.createSubject(selectedSubject);
        console.log('✅ Create response:', response);
        
        // Add the new subject to the local state
        if (response.success && response.data) {
          const updatedSubjects = [response.data, ...subjects];
          setSubjects(updatedSubjects);
        }
      } else if (dialogMode === 'edit') {
        console.log('🔄 Updating subject:', selectedSubject._id, 'with data:', selectedSubject);
        const response = await subjectService.updateSubject(selectedSubject._id, selectedSubject);
        console.log('✅ Update response:', response);
        
        // Update the subject in the local state
        if (response.success && response.data) {
          const updatedSubjects = subjects.map((s: Subject) => s._id === selectedSubject._id ? response.data : s);
          setSubjects(updatedSubjects);
          console.log('🔄 Updated local state with:', response.data);
        }
      }
      
      handleCloseDialog();
      // Refresh the subjects list to ensure we have the latest data
      await loadSubjects();
    } catch (error: any) {
      console.error('❌ Error in handleSubmitSubject:', error);
      setSubjectsError(error.message || `Failed to ${dialogMode} subject`);
    }
  };

  // Filter and search subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subject.subjectCode && subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         subject.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subject.isActive === (statusFilter === 'Active');
    const matchesDepartment = departmentFilter === 'all' || subject.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Pagination
  const paginatedSubjects = filteredSubjects.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredSubjects.length / rowsPerPage);

  const handleSearch = () => {
    // Implement search logic here
    console.log('Searching...');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
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
          Subjects
        </Typography>
        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400 }}>
          Manage all subject information, curriculum, and assessment details.
        </Typography>
      </Box>

      {/* Filters and Search */}
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
          <Grid container spacing={3} alignItems="center">
            <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
              <TextField
                fullWidth
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#64748b' }} />
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
            
            <Box sx={{ width: { xs: '100%', md: '25%' } }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '25%' } }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Department"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                  <MenuItem value="Science">Science</MenuItem>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="History">History</MenuItem>
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
          </Grid>
          
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

      {/* Subjects Table */}
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
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Credits</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSubjects.map((subject) => (
                  <TableRow key={subject._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                            mr: 2,
                            width: 40,
                            height: 40
                          }}
                        >
                          <BookIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {subject.subjectName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {subject.difficulty} • {subject.credits} credits
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={subject.subjectCode || 'Pending'}
                        size="small"
                        sx={{
                          background: 'rgba(139, 92, 246, 0.1)',
                          color: '#7c3aed',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ fontSize: 16, mr: 1, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ color: '#1e293b' }}>
                          {subject.department || 'Not Assigned'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ fontSize: 16, mr: 1, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ color: '#1e293b' }}>
                          {subject.credits}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                                         <TableCell>
                       <Box sx={{ display: 'flex', gap: 1 }}>
                         {subject.category === 'Core' && (
                           <Chip
                             label="Core"
                             size="small"
                             sx={{
                               background: 'rgba(59, 130, 246, 0.1)',
                               color: '#1d4ed8',
                               fontWeight: 600
                             }}
                           />
                         )}
                         {subject.category === 'Elective' && (
                           <Chip
                             label="Elective"
                             size="small"
                             sx={{
                               background: 'rgba(245, 158, 11, 0.1)',
                               color: '#d97706',
                               fontWeight: 600
                             }}
                           />
                         )}
                         {subject.category === 'Advanced' && (
                           <Chip
                             label="Advanced"
                             size="small"
                             sx={{
                               background: 'rgba(139, 92, 246, 0.1)',
                               color: '#7c3aed',
                               fontWeight: 600
                             }}
                           />
                         )}
                         {subject.category === 'Remedial' && (
                           <Chip
                             label="Remedial"
                             size="small"
                             sx={{
                               background: 'rgba(239, 68, 68, 0.1)',
                               color: '#dc2626',
                               fontWeight: 600
                             }}
                           />
                         )}
                       </Box>
                     </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={subject.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          background: subject.isActive? 'rgba(16, 185, 129, 0.1)' :
                                     !subject.isActive? 'rgba(239, 68, 68, 0.1)' :
                                     'rgba(245, 158, 11, 0.1)',
                          color: subject.isActive? '#059669' :
                                 !subject.isActive? '#dc2626' :
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
                            onClick={() => handleOpenDialog('view', subject)}
                            sx={{ color: '#3b82f6' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Subject">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('edit', subject)}
                            sx={{ color: '#f59e0b' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Subject">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSubject(subject._id)}
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

      {/* Subject Dialog */}
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
          {dialogMode === 'add' ? 'Add New Subject' :
           dialogMode === 'edit' ? 'Edit Subject' : 'Subject Details'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {dialogMode === 'view' ? (
            // View Mode - Display subject information
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Subject Name</Typography>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.subjectName}</Typography>
                
                                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Subject Code</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.subjectCode}</Typography>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Short Name</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.shortName || 'Not Set'}</Typography>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Grade</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.grade}</Typography>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Academic Year</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.academicYear}</Typography>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Semester</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.semester}</Typography>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Description</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.description || 'No description'}</Typography>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Department</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.department || 'Not Assigned'}</Typography>
              </Box>
              
                             <Box>
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Credits</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.credits}</Typography>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Hours Per Week</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.hoursPerWeek}</Typography>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Difficulty</Typography>
                 <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>{selectedSubject?.difficulty}</Typography>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Type</Typography>
                 <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                   {selectedSubject?.category === 'Core' && (
                     <Chip label="Core" size="small" sx={{ background: 'rgba(59, 130, 246, 0.1)', color: '#1d4ed8' }} />
                   )}
                   {selectedSubject?.category === 'Elective' && (
                     <Chip label="Elective" size="small" sx={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }} />
                   )}
                   {selectedSubject?.category === 'Advanced' && (
                     <Chip label="Advanced" size="small" sx={{ background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed' }} />
                   )}
                   {selectedSubject?.category === 'Remedial' && (
                     <Chip label="Remedial" size="small" sx={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }} />
                   )}
                 </Box>
                 
                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Status</Typography>
                 <Chip
                   label={selectedSubject?.isActive ? 'Active' : 'Inactive'}
                   size="small"
                   sx={{
                     background: selectedSubject?.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                     color: selectedSubject?.isActive ? '#059669' : '#dc2626',
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
                  label="Subject Name"
                  value={selectedSubject?.subjectName || ''}
                  onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, subjectName: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
                
                                 <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                   Subject Code will be auto-generated
                 </Typography>
                 
                 <TextField
                   fullWidth
                   label="Short Name"
                   value={selectedSubject?.shortName || ''}
                   onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, shortName: e.target.value } : null)}
                   sx={{ mb: 2 }}
                   InputProps={{ sx: { borderRadius: '12px' } }}
                   helperText="Optional abbreviation (e.g., MATH, ENG)"
                 />
                 
                 <TextField
                   fullWidth
                   label="Grade *"
                   value={selectedSubject?.grade || ''}
                   onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, grade: e.target.value } : null)}
                   sx={{ mb: 2 }}
                   InputProps={{ sx: { borderRadius: '12px' } }}
                   error={!selectedSubject?.grade?.trim()}
                   helperText={!selectedSubject?.grade?.trim() ? 'Grade is required' : ''}
                 />
                 
                 <TextField
                   fullWidth
                   label="Academic Year *"
                   value={selectedSubject?.academicYear || ''}
                   onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, academicYear: e.target.value } : null)}
                   sx={{ mb: 2 }}
                   InputProps={{ sx: { borderRadius: '12px' } }}
                   error={!selectedSubject?.academicYear?.trim()}
                   helperText={!selectedSubject?.academicYear?.trim() ? 'Academic Year is required (e.g., 2025-2026)' : ''}
                 />
                 
                 <FormControl fullWidth sx={{ mb: 2 }}>
                   <InputLabel>Semester *</InputLabel>
                   <Select
                     value={selectedSubject?.semester || 'First'}
                     onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, semester: e.target.value } : null)}
                     label="Semester *"
                     sx={{ borderRadius: '12px' }}
                   >
                     <MenuItem value="First">First</MenuItem>
                     <MenuItem value="Second">Second</MenuItem>
                     <MenuItem value="Summer">Summer</MenuItem>
                   </Select>
                 </FormControl>
                
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={selectedSubject?.description || ''}
                  onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, description: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
                
                <TextField
                  fullWidth
                  label="Department"
                  value={selectedSubject?.department || ''}
                  onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, department: e.target.value } : null)}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
              </Box>
              
              <Box>
                                 <TextField
                   fullWidth
                   label="Credits"
                   type="number"
                   value={selectedSubject?.credits ?? ''}
                   onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, credits: parseInt(e.target.value) || 0 } : null)}
                   sx={{ mb: 2 }}
                   InputProps={{ sx: { borderRadius: '12px' } }}
                   placeholder="Enter credits"
                 />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={selectedSubject?.difficulty || 'Intermediate'}
                    onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, difficulty: e.target.value } : null)}
                    label="Difficulty"
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
                
                                 <TextField
                   fullWidth
                   label="Hours Per Week"
                   type="number"
                   value={selectedSubject?.hoursPerWeek ?? ''}
                   onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, hoursPerWeek: parseInt(e.target.value) || 0 } : null)}
                   sx={{ mb: 2 }}
                   InputProps={{ sx: { borderRadius: '12px' } }}
                   placeholder="Enter hours per week"
                 />
                 
                 <FormControl fullWidth sx={{ mb: 2 }}>
                   <InputLabel>Status</InputLabel>
                   <Select
                     value={selectedSubject?.isActive ? 'Active' : 'Inactive'}
                     onChange={(e) => setSelectedSubject(prev => prev ? { ...prev, isActive: e.target.value === 'Active' } : null)}
                     label="Status"
                     sx={{ borderRadius: '12px' }}
                   >
                     <MenuItem value="Active">Active</MenuItem>
                     <MenuItem value="Inactive">Inactive</MenuItem>
                   </Select>
                 </FormControl>
                
                                 <FormControl fullWidth sx={{ mb: 2 }}>
                   <InputLabel>Type</InputLabel>
                   <Select
                     value={selectedSubject?.category || 'Core'}
                     onChange={(e) => setSelectedSubject(prev => prev ? { 
                       ...prev, 
                       category: e.target.value as 'Core' | 'Elective' | 'Advanced' | 'Remedial'
                     } : null)}
                     label="Type"
                     sx={{ borderRadius: '12px' }}
                   >
                     <MenuItem value="Core">Core</MenuItem>
                     <MenuItem value="Elective">Elective</MenuItem>
                     <MenuItem value="Advanced">Advanced</MenuItem>
                     <MenuItem value="Remedial">Remedial</MenuItem>
                   </Select>
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
              onClick={handleSubmitSubject}
              sx={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {dialogMode === 'add' ? 'Add Subject' : 'Update Subject'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Subjects;
