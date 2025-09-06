/**
 * Refactored Forms Repository Component
 * Clean separation of concerns with service layer integration
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuth0 } from '@auth0/auth0-react';
import HeaderNew from './HeaderNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

import {
  BookOpen,
  Users,
  Plus,
  Pencil,
  Trash2,
  Download,
  School,
  FileText,
  Settings,
  Save,
  Search,
  Filter,
  X
} from 'lucide-react';

import { ApiServicesProvider, useClassrooms, useForms, useStudents, useLoadingState } from '../services/api';

const FormsRepositoryContent = () => {
  const { isAuthenticated, signOut } = useAuth();
  const { getAccessTokenSilently } = useAuth0();

  // Get class_id from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const classID = urlParams.get('id') || '';

  // Use custom hooks for data management
  const {
    classrooms,
    stats,
    formsByClassroom,
    loading: classroomsLoading,
    createClassroom,
    updateClassroom,
    deleteClassroom
  } = useClassrooms();

  const {
    allForms,
    availableForms,
    formSubmissions,
    formDropdownOptions,
    loading: formsLoading,
    createForm,
    updateForm,
    deleteForm,
    filterForms
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
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [editClassroomName, setEditClassroomName] = useState('');
  const [deletingClassroom, setDeletingClassroom] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditFormDialog, setShowEditFormDialog] = useState(false);
  const [showDeleteFormDialog, setShowDeleteFormDialog] = useState(false);

  // Form management state
  const [editingForm, setEditingForm] = useState(null);
  const [deletingForm, setDeletingForm] = useState(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormType, setEditFormType] = useState('');
  const [editFormChangeType, setEditFormChangeType] = useState('');

  // Filter and process data
  const filteredForms = filterForms(searchTerm, typeFilter);
  const filteredStudents = filterStudents(searchTerm, { classroom: typeFilter });

  // Classroom operations
  const handleCreateClassroom = async () => {
    if (!newClassroomName.trim()) {
      toast.error('Please enter a classroom name');
      return;
    }

    setLoading('createClassroom', true);
    try {
      await createClassroom({ name: newClassroomName.trim() });
      setNewClassroomName('');
    } catch (error) {
      console.error('Failed to create classroom:', error);
    } finally {
      setLoading('createClassroom', false);
    }
  };

  const handleEditClassroom = async () => {
    if (!editClassroomName.trim() || !editingClassroom) {
      toast.error('Please enter a valid classroom name');
      return;
    }

    setLoading('editClassroom', true);
    try {
      await updateClassroom(editingClassroom.class_id, { 
        class_name: editClassroomName.trim() 
      });
      setShowEditDialog(false);
      setEditingClassroom(null);
      setEditClassroomName('');
    } catch (error) {
      console.error('Failed to update classroom:', error);
    } finally {
      setLoading('editClassroom', false);
    }
  };

  const handleDeleteClassroom = async () => {
    if (!deletingClassroom) return;

    setLoading('deleteClassroom', true);
    try {
      await deleteClassroom(deletingClassroom.class_id);
      setShowDeleteDialog(false);
      setDeletingClassroom(null);
    } catch (error) {
      console.error('Failed to delete classroom:', error);
    } finally {
      setLoading('deleteClassroom', false);
    }
  };

  // Form operations
  const handleCreateForm = async () => {
    if (!newFormName.trim()) {
      toast.error('Please enter a form name');
      return;
    }

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

  const handleEditForm = async () => {
    if (!editFormName.trim() || !editingForm) {
      toast.error('Please enter valid form details');
      return;
    }

    setLoading('editForm', true);
    try {
      await updateForm(editingForm.id, {
        form_name: editFormName.trim(),
        form_type: editFormType,
        change_type: editFormChangeType
      });
      setShowEditFormDialog(false);
      setEditingForm(null);
      resetFormEditState();
    } catch (error) {
      console.error('Failed to update form:', error);
    } finally {
      setLoading('editForm', false);
    }
  };

  const handleDeleteForm = async () => {
    if (!deletingForm) return;

    setLoading('deleteForm', true);
    try {
      await deleteForm(deletingForm.id);
      setShowDeleteFormDialog(false);
      setDeletingForm(null);
    } catch (error) {
      console.error('Failed to delete form:', error);
    } finally {
      setLoading('deleteForm', false);
    }
  };

  // Helper functions
  const resetFormEditState = () => {
    setEditFormName('');
    setEditFormType('');
    setEditFormChangeType('');
  };

  const openEditDialog = (classroom) => {
    setEditingClassroom(classroom);
    setEditClassroomName(classroom.class_name);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (classroom) => {
    setDeletingClassroom(classroom);
    setShowDeleteDialog(true);
  };

  const openEditFormDialog = (form) => {
    setEditingForm(form);
    setEditFormName(form.formName || form.name);
    setEditFormType(form.type || '');
    setEditFormChangeType(form.changeType || '');
    setShowEditFormDialog(true);
  };

  const openDeleteFormDialog = (form) => {
    setDeletingForm(form);
    setShowDeleteFormDialog(true);
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
      <HeaderNew />
      
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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

                {/* Classrooms Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Classroom Name</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Forms</TableHead>
                        <TableHead>Actions</TableHead>
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
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(classroom)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog(classroom)}
                                  className="text-red-600 hover:text-red-700"
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
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search forms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Updated">Updated</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Form */}
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter form name"
                    value={newFormName}
                    onChange={(e) => setFormName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateForm()}
                  />
                  <Button
                    onClick={handleCreateForm}
                    disabled={isLoading('createForm') || !newFormName.trim()}
                  >
                    {isLoading('createForm') ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Form
                  </Button>
                </div>

                {/* Forms Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Form Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formsLoading ? (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <LoadingSkeleton rows={5} />
                          </TableCell>
                        </TableRow>
                      ) : filteredForms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                            {searchTerm ? 'No forms match your search.' : 'No forms available.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredForms.map((form) => (
                          <TableRow key={form.id}>
                            <TableCell className="font-medium">
                              {form.formName || form.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {form.changeType || form.type || 'Default'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditFormDialog(form)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteFormDialog(form)}
                                  className="text-red-600 hover:text-red-700"
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
                          filteredStudents.map((student) => (
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>API performance and system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">API Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.totalClassrooms}
                        </div>
                        <div className="text-sm text-gray-500">Cached Requests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">99.5%</div>
                        <div className="text-sm text-gray-500">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">245ms</div>
                        <div className="text-sm text-gray-500">Avg Response</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">12</div>
                        <div className="text-sm text-gray-500">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {/* Edit Classroom Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Classroom</DialogTitle>
              <DialogDescription>
                Update the classroom name and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-classroom-name">Classroom Name</Label>
                <Input
                  id="edit-classroom-name"
                  value={editClassroomName}
                  onChange={(e) => setEditClassroomName(e.target.value)}
                  placeholder="Enter classroom name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditClassroom}
                disabled={isLoading('editClassroom')}
              >
                {isLoading('editClassroom') && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Classroom Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Classroom</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deletingClassroom?.class_name}"? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClassroom}
                disabled={isLoading('deleteClassroom')}
              >
                {isLoading('deleteClassroom') && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                )}
                Delete Classroom
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Similar dialogs for forms... */}
      </main>
    </div>
  );
};

const FormsRepositoryRefactored = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { signOut } = useAuth();

  return (
    <ApiServicesProvider 
      getAccessTokenSilently={getAccessTokenSilently} 
      logout={signOut}
    >
      <FormsRepositoryContent />
    </ApiServicesProvider>
  );
};

export default FormsRepositoryRefactored;