/**
 * FIXED Forms Repository Component
 * Uses shared API services context instead of creating new instances
 */

import React, { useState } from 'react';
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
  BookOpen,
  Users,
  Plus,
  School
} from 'lucide-react';
import { api_base_url, school_id } from '../utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '../utils/auth';

// FIXED: Import hooks from shared services (no provider needed)
import { useClassrooms, useForms, useStudents, useLoadingState } from '../hooks/useApiData';

const FormsRepositoryClean = () => {
  const { isAuthenticated, signOut } = useAuth();
  const { getAccessTokenSilently } = useAuth0();

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
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Filter and process data
  const filteredForms = filterForms(searchTerm, typeFilter);
  const filteredStudents = filterStudents(searchTerm, { classroom: typeFilter });

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
        // Refresh the classrooms list after successful creation
        await refetchClassrooms();
      }
    } catch (error) {
      console.error('Failed to create classroom:', error);
    } finally {
      setLoading('createClassroom', false);
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classroomsLoading ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <LoadingSkeleton rows={5} />
                          </TableCell>
                        </TableRow>
                      ) : classrooms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-gray-500 py-8">
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

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Form Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
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
                            No forms available.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredForms.slice(0, 10).map((form) => (
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
      </main>
    </div>
  );
};

export default FormsRepositoryClean;