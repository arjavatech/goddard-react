/**
 * FIXED Forms Repository Component
 * Uses shared API services context instead of creating new instances
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAuth } from '../hooks/useAuth';
import HeaderNew from './HeaderNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Label } from './ui/label';
import {
  BookOpen,
  Users,
  Plus,
  School,
  Edit,
  Trash2
} from 'lucide-react';
import { api_base_url, school_id, updated_by } from '../utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '../utils/auth';

// FIXED: Import hooks from shared services (no provider needed)
import { useClassrooms, useForms, useStudents, useLoadingState } from '../hooks/useApiData';
import { useApiServices } from '../services/api';

const FormsRepositoryClean = () => {
  const { isAuthenticated, signOut } = useAuth();
  const { getAccessTokenSilently } = useAuth0();
  const { apiClient } = useApiServices();

  // FIXED: Use shared API services (single instance across app)
  const {
    classrooms,
    stats,
    formsByClassroom,
    loading: classroomsLoading,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    refetch: refetchClassrooms
  } = useClassrooms();

  const {
    allForms,
    availableForms,
    formSubmissions,
    formDropdownOptions,
    loading: formsLoading,
    createForm,
    filterForms,
    refetch: refetchForms
  } = useForms();

  const {
    students,
    loading: studentsLoading,
    filterStudents
  } = useStudents();

  const { setLoading, isLoading } = useLoadingState();

  // Local UI state
  const [newClassroomName, setNewClassroomName] = useState('');
  const [newFormName, setFormName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [formStatusFilter, setFormStatusFilter] = useState('all'); // Filter for form status
  
  // Edit/Delete dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [editClassroomName, setEditClassroomName] = useState('');
  
  // Form edit dialog states
  const [formEditDialogOpen, setFormEditDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [editFormStatus, setEditFormStatus] = useState('');

  // Status mapping
  const statusToInt = {
    'default': 0,
    'available': 1,
    'active': 2, 
    'archive': 3
  };

  const intToStatus = {
    0: 'default',
    1: 'available',
    2: 'active',
    3: 'archive'
  };

  // Filter and process data
  const filteredForms = React.useMemo(() => {
    if (!availableForms) return [];
    
    if (formStatusFilter === 'all') {
      // When 'all' is selected, show forms from all statuses with their actual status
      const allFormsList = [];
      Object.keys(availableForms).forEach(status => {
        if (status !== 'all' && availableForms[status] && Object.keys(availableForms[status]).length > 0) {
          Object.entries(availableForms[status]).forEach(([formName, formId], index) => {
            allFormsList.push({
              id: `${status}-${index}`,
              form_id: formId,
              form_name: formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              original_name: formName,
              status: status.charAt(0).toUpperCase() + status.slice(1),
              statusKey: status
            });
          });
        }
      });
      return allFormsList;
    } else {
      // For specific status, show only forms from that status
      if (!availableForms[formStatusFilter]) return [];
      const formsData = availableForms[formStatusFilter];
      return Object.entries(formsData).map(([formName, formId], index) => ({
        id: index,
        form_id: formId,
        form_name: formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        original_name: formName,
        status: formStatusFilter.charAt(0).toUpperCase() + formStatusFilter.slice(1),
        statusKey: formStatusFilter
      }));
    }
  }, [availableForms, formStatusFilter]);
  
  const filteredStudents = filterStudents(searchTerm, { classroom: typeFilter });

  // Direct refresh function with cache clearing
  const handleRefresh = useCallback(async () => {
    try {
      // Clear the cache for classroom-related endpoints
      apiClient.clearCache('child_count_with_class_name');
      apiClient.clearCache('class_details');
      
      // Add a small delay to let the backend update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Now refetch the data
      await refetchClassrooms();
    } catch (error) {
      console.error('Error refreshing classrooms:', error);
    }
  }, [refetchClassrooms, apiClient]);

  // Forms refresh function
  const handleFormsRefresh = useCallback(async () => {
    try {
      // Clear the cache for form-related endpoints
      apiClient.clearCache('get_all_form_details');
      
      // Add a small delay to let the backend update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refetch forms data
      await refetchForms();
    } catch (error) {
      console.error('Error refreshing forms:', error);
    }
  }, [apiClient, refetchForms]);

  // Classroom operations
  const handleCreateClassroom = async () => {
    if (!newClassroomName.trim()) return;

    setLoading('createClassroom', true);
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      
      const response = await fetch(`${api_base_url}/class_details`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ class_name: newClassroomName.trim(), school_id: school_id })
      });
      
      if (response.ok) {
        setNewClassroomName('');
        // Refresh the table data
        await handleRefresh();
      }
    } catch (error) {
      console.error('Failed to create classroom:', error);
    } finally {
      setLoading('createClassroom', false);
    }
  };

  // Handle edit classroom
  const handleEditClick = (classroom) => {
    setSelectedClassroom(classroom);
    setEditClassroomName(classroom.class_name);
    setEditDialogOpen(true);
  };

  const handleUpdateClassroom = async () => {
    if (!editClassroomName.trim() || !selectedClassroom) return;

    setLoading('updateClassroom', true);
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      
      const response = await fetch(`${api_base_url}/class_details`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          school_id: school_id,
          class_id: selectedClassroom.class_id,
          class_name: editClassroomName.trim(),
          created_by: selectedClassroom.created_by || 'system',
          created_at: selectedClassroom.created_at || new Date().toISOString(),
          updated_by: 'string',
          updated_at: new Date().toISOString(),
          is_active: true
        })
      });
      
      if (response.ok) {
        setEditDialogOpen(false);
        setSelectedClassroom(null);
        setEditClassroomName('');
        // Refresh the table data
        await handleRefresh();
      }
    } catch (error) {
      console.error('Failed to update classroom:', error);
    } finally {
      setLoading('updateClassroom', false);
    }
  };

  // Handle delete classroom
  const handleDeleteClick = (classroom) => {
    setSelectedClassroom(classroom);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClassroom = async () => {
    if (!selectedClassroom) return;

    setLoading('deleteClassroom', true);
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      
      const response = await fetch(`${api_base_url}/class_details/${school_id}/${selectedClassroom.class_id}/${updated_by}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedClassroom(null);
        // Add small delay before refresh for delete operation
        setTimeout(async () => {
          await handleRefresh();
        }, 300);
      }
    } catch (error) {
      console.error('Failed to delete classroom:', error);
    } finally {
      setLoading('deleteClassroom', false);
    }
  };

  // Form operations  
  const handleCreateForm = async () => {
    if (!newFormName.trim()) return;

    setLoading('createForm', true);
    try {
      await createForm({
        name: newFormName.trim(),
        type: 'default',
        changeType: 'New'
      });
      setFormName('');
    } catch (error) {
      console.error('Failed to create form:', error);
    } finally {
      setLoading('createForm', false);
    }
  };

  // Handle edit form
  const handleFormEditClick = (form) => {
    setSelectedForm(form);
    setEditFormStatus(form.statusKey); // Use the original status key (lowercase)
    setFormEditDialogOpen(true);
  };

  const handleUpdateForm = async () => {
    if (!editFormStatus || !selectedForm) return;

    setLoading('updateForm', true);
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const statusInt = statusToInt[editFormStatus];
      
      const response = await fetch(`${api_base_url}/update_form_repo_state/${school_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          form_ids: [selectedForm.form_id],
          state: statusInt
        })
      });

      if (response.ok) {
        setFormEditDialogOpen(false);
        setSelectedForm(null);
        setEditFormStatus('');
        
        // Refresh forms data
        await handleFormsRefresh();
      } else {
        console.error('Update failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to update form:', error);
    } finally {
      setLoading('updateForm', false);
    }
  };

  // Loading component
  const LoadingSkeleton = ({ rows = 3 }) => (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNew onSignOut={signOut} sidebar={true} component="Forms Repository" />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forms Repository</h1>
          <p className="text-gray-600">Manage classrooms, forms, and student assignments</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classroomsLoading ? <Skeleton className="h-8 w-16" /> : stats.totalClassrooms}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classroomsLoading ? <Skeleton className="h-8 w-16" /> : stats.totalChildren}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classrooms</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classroomsLoading ? <Skeleton className="h-8 w-16" /> : stats.activeClassrooms}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="classrooms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Classrooms Tab */}
          <TabsContent value="classrooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Classroom Management</CardTitle>
                <CardDescription>Create and manage classrooms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter classroom name"
                    value={newClassroomName}
                    onChange={(e) => setNewClassroomName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateClassroom()}
                  />
                  <Button
                    onClick={handleCreateClassroom}
                    disabled={isLoading('createClassroom') || !newClassroomName.trim()}
                  >
                    {isLoading('createClassroom') ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Classroom
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Classroom Name</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Forms</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classroomsLoading ? (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <LoadingSkeleton rows={5} />
                          </TableCell>
                        </TableRow>
                      ) : classrooms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                            No classrooms found. Create your first classroom above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        classrooms.map((classroom) => (
                          <TableRow key={classroom.class_id}>
                            <TableCell className="font-medium">
                              {classroom.class_name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {classroom.count || 0} students
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formsByClassroom[classroom.class_id]?.length || 0} forms
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(classroom)}
                                  className="hover:bg-gray-100"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(classroom)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Management</CardTitle>
                <CardDescription>Manage available forms and assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Status:</label>
                    <select 
                      value={formStatusFilter} 
                      onChange={(e) => setFormStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="archive">Archive</option>
                      <option value="default">Default</option>
                      <option value="available">Available</option>
                    </select>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Form
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This feature is available in next phase</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Form Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formsLoading ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <LoadingSkeleton rows={5} />
                          </TableCell>
                        </TableRow>
                      ) : filteredForms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                            No forms available for "{formStatusFilter}" status.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredForms.map((form) => (
                          <TableRow key={form.id}>
                            <TableCell className="font-medium">
                              {form.form_name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {form.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleFormEditClick(form)}
                                  className="hover:bg-gray-100"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          disabled
                                          className="text-red-600 opacity-50 cursor-not-allowed"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>This feature is available in next phase</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Overview</CardTitle>
                <CardDescription>View student form completion status</CardDescription>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <LoadingSkeleton rows={8} />
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Classroom</TableHead>
                          <TableHead>Parent Email</TableHead>
                          <TableHead>Forms Completed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                              No students found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStudents.slice(0, 10).map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                {student.fullName}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {student.className}
                                </Badge>
                              </TableCell>
                              <TableCell>{student.parentEmail}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {student.formCount} forms
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Classroom Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Classroom</DialogTitle>
              <DialogDescription>
                Make changes to the classroom name. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editClassroomName}
                  onChange={(e) => setEditClassroomName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateClassroom}
                disabled={isLoading('updateClassroom') || !editClassroomName.trim()}
              >
                {isLoading('updateClassroom') ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  'Save changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Classroom Alert Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the classroom
                "{selectedClassroom?.class_name}" and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClassroom}
                disabled={isLoading('deleteClassroom')}
              >
                {isLoading('deleteClassroom') ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Form Edit Dialog */}
        <Dialog open={formEditDialogOpen} onOpenChange={setFormEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Form Status</DialogTitle>
              <DialogDescription>
                Change the status of "{selectedForm?.form_name}". Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <select
                  id="edit-status"
                  value={editFormStatus}
                  onChange={(e) => setEditFormStatus(e.target.value)}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="default">Default</option>
                  <option value="available">Available</option>
                  <option value="archive">Archive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateForm}
                disabled={isLoading('updateForm') || !editFormStatus}
              >
                {isLoading('updateForm') ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  'Save changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default FormsRepositoryClean;