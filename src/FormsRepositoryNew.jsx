import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import HeaderNew from './components/HeaderNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Skeleton } from './components/ui/skeleton';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';

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
import { school_id, api_base_url } from './utils/const';
const FormsRepositoryNew = () => {
  const { isAuthenticated, signOut } = useAuth();

  // Get class_id from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const classID = urlParams.get('id') || '';

  // Classroom management state
  const [classrooms, setClassrooms] = useState([]);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [newFormName, setFormName] = useState('');
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [editClassroomName, setEditClassroomName] = useState('');
  const [deletingClassroom, setDeletingClassroom] = useState(null);

  // Loading states
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(true);
  const [isAddingClassroom, setIsAddingClassroom] = useState(false);

    const [isAddingForm, setIsAddingForm] = useState(false);
  const [isEditingClassroom, setIsEditingClassroom] = useState(false);
  const [isDeletingClassroom, setIsDeletingClassroom] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [forms, setForms] = useState([]);



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

  // Classroom forms state
  const [classroomForms, setClassroomForms] = useState({});

  // Statistics
  const [stats, setStats] = useState({
    totalClassrooms: 0,
    totalChildren: 0,
    activeClassrooms: 0
  });

  // Student Forms state
  const [studentForms, setStudentForms] = useState([]);
  const [availableForms, setAvailableForms] = useState([]);
  const [studentDropdownForms, setStudentDropdownForms] = useState([]);

  useEffect(() => {
    loadClassroomData();
    loadFormsFromAPI();
    loadStudentForms();
    loadAvailableForms();
    loadStudentDropdownForms();
  }, []);

  useEffect(() => {
    // Calculate statistics
    const totalClassrooms = classrooms.length;
    const totalChildren = classrooms.reduce((sum, classroom) => sum + (classroom.count || 0), 0);
    const activeClassrooms = classrooms.filter(classroom => classroom.class_name !== 'Unassign').length;

    setStats({
      totalClassrooms,
      totalChildren,
      activeClassrooms
    });
  }, [classrooms]);


  // Load classroom data
  // new api
  const loadClassroomData = async () => {
    setIsLoadingClassrooms(true);
    try {
      const response = await fetch('https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev/child_count_with_class_name/1');
      const data = await response.json();
      setClassrooms(data || []);

      // Process forms data from API response
      const formsMap = {};
      data.forEach(classroom => {
        const formsList = [];
        if (classroom.forms && Object.keys(classroom.forms).length > 0) {
          Object.values(classroom.forms).forEach(formName => {
            formsList.push(formName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()));
          });
        }
        formsMap[classroom.class_id] = formsList;
      });
      setClassroomForms(formsMap);
    } catch (error) {
      toast.error('Failed to load classroom data');
    } finally {
      setIsLoadingClassrooms(false);
    }
  };

  // Load classroom forms
  // new api
  const loadClassroomForms = async () => {
    try {
      const response = await fetch('https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev/child_count_with_class_name/1');
      const data = await response.json();
      const formsMap = {};
      data.forEach(classroom => {
        const formsList = [];
        if (classroom.forms && Object.keys(classroom.forms).length > 0) {
          Object.values(classroom.forms).forEach(formName => {
            formsList.push(formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
          });
        }
        formsMap[classroom.class_id] = formsList;
      });
      setClassroomForms(formsMap);
    } catch (error) {
      console.log('Failed to load classroom forms');
    }
  };

  // Load forms from API
  const loadFormsFromAPI = async () => {
    try {
      const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/get_all_form_details');
      const data = await response.json();
      const formsList = [];
      let idCounter = 1;

      Object.keys(data).forEach(status => {
        const changeType = status.charAt(0).toUpperCase() + status.slice(1);
        
        // Skip forms with changeType 'All'
        if (changeType === 'All') {
          return;
        }
        
        if (typeof data[status] === 'object' && data[status] !== null) {
          Object.keys(data[status]).forEach(formName => {
            formsList.push({
              id: idCounter++,
              formName: formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              changeType: changeType
            });
          });
        }
      });

      setForms(formsList);
    } catch (error) {
      console.log('Failed to load forms from API');
    }
  };

  // Load available forms for dropdown
  const loadAvailableForms = async () => {
    try {
      const response = await fetch('https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev/form/school/1');
      const data = await response.json();

      const formsList = [];
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.form_name && item.form_id) {
            const formattedName = item.form_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            formsList.push({
              id: item.form_id,
              name: formattedName
            });
          }
        });
      }

      console.log('Final forms list:', formsList);
      setAvailableForms(formsList);
    } catch (error) {
      console.log('Failed to load available forms:', error);
    }
  };

  // Load student forms data
  // new api
  const loadStudentForms = async () => {
    try {
      const response = await fetch('https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev/admission_child_personal/all_child_status/1');
      const data = await response.json();

      const studentsList = [];
      if (Array.isArray(data)) {
        data.forEach(item => {
          const formsList = [];
          if (item.forms && Object.keys(item.forms).length > 0) {
            Object.values(item.forms).forEach(formName => {
              formsList.push(formName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()));
            });
          }

          studentsList.push({
            id: item.child_id,
            childName: item.child_first_name || 'No name',
            classroom: item.class_name || 'Unassigned',
            parentEmail: item.primary_email || 'No email provided',
            forms: formsList
          });
        });
      }

      setStudentForms(studentsList);
    } catch (error) {
      console.log('Failed to load student forms data:', error);
    }
  };

  // Load student dropdown forms
  const loadStudentDropdownForms = async () => {
    try {
      const response = await fetch('https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev/admission_child_personal/all_child_status/1');
      const data = await response.json();

      const formsSet = new Set();
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.forms && Object.keys(item.forms).length > 0) {
            Object.values(item.forms).forEach(formName => {
              const formattedName = formName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
              formsSet.add(formattedName);
            });
          }
        });
      }

      setStudentDropdownForms(Array.from(formsSet));
    } catch (error) {
      console.log('Failed to load student dropdown forms:', error);
    }
  };

  // add classroom
  const handleAddClassroom = async (e) => {
    e.preventDefault();

    if (!newClassroomName.trim()) {
      toast.error('Please enter a classroom name');
      return;
    }

    setIsAddingClassroom(true);
    try {
      const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_form_repository', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_name: newClassroomName.trim() })
      });

      const result = await response.json();

      if (result.message?.includes('successfully')) {
        toast.success('Classroom created successfully!');
        setNewClassroomName('');
        await loadClassroomData();
      } else {
        toast.error('Failed to create classroom');
      }
    } catch (error) {
      toast.error('Error creating classroom');
    } finally {
      setIsAddingClassroom(false);
    }
  };


  // edit classroom
  const handleEditClassroom = async () => {
    setIsEditingClassroom(true);
    try {
      console.log('Saving forms:', editingClassroom.forms);
      console.log('Current forms:', classroomForms[editingClassroom.class_id]);

      // Save all forms for this classroom
      const formsToAdd = editingClassroom.forms.filter(form =>
        !classroomForms[editingClassroom.class_id]?.includes(form)
      );

      console.log('Forms to add:', formsToAdd);

      for (const formName of formsToAdd) {
        const selectedForm = availableForms.find(f => f.name === formName);
        console.log('Selected form:', selectedForm);
        if (selectedForm) {
          const response = await fetch('https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev/class_form_repository', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              school_id: 1,
              class_id: editingClassroom.class_id,
              form_id: selectedForm.id,
              created_by: "system",
              created_at: new Date().toISOString(),
              updated_by: "string",
              updated_at: new Date().toISOString(),
              is_active: true
            })
          });
          console.log('API response:', response.status);
        }
      }

      // Update local state immediately
      setClassroomForms(prev => {
        const updated = {
          ...prev,
          [editingClassroom.class_id]: editingClassroom.forms
        };
        console.log('Updated classroomForms:', updated);
        return updated;
      });



      toast.success('Classroom updated successfully!');
      setShowEditDialog(false);
      setEditingClassroom(null);
      setEditClassroomName('');
    } catch (error) {
      console.error('Error updating classroom:', error);
      toast.error('Error updating classroom');
    } finally {
      setIsEditingClassroom(false);
    }
  };

  // delete classroom
  const handleDeleteClassroom = async () => {
    setIsDeletingClassroom(true);
    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_details/delete/${classroomToDelete.class_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classroomToDelete.class_id })
      });

      const result = await response.json();

      if (result.message?.includes('successfully')) {
        toast.success('Classroom deleted successfully!');
        setShowDeleteDialog(false);
        setDeletingClassroom(null);
        await loadClassroomData();
      } else {
        toast.error('Failed to delete classroom');
      }
    } catch (error) {
      toast.error('Error deleting classroom');
    } finally {
      setIsDeletingClassroom(false);
    }
  };



  const openEditDialog = (classroom) => {
    const currentForms = classroomForms[classroom.class_id] || ['Admission Form'];
    setEditingClassroom({ ...classroom, forms: currentForms });
    setEditClassroomName(classroom.class_name);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (classroom) => {
    setDeletingClassroom(classroom);
    setShowDeleteDialog(true);
  };

  const openEditFormDialog = (form) => {
    console.log(form)
    setEditingForm(form);
    setEditFormName(form.formName);
    setEditFormType(form.type);
    setEditFormChangeType(form.changeType);
    setShowEditFormDialog(true);
  };

  const openDeleteFormDialog = (form) => {
    setDeletingForm(form);
    setShowDeleteFormDialog(true);
  };

  const handleEditForm = async () => {
    if (!editFormName.trim()) {
      toast.error('Please enter a form name');
      return;
    }

    // Map status to numeric state values
    const statusToState = {
      'Default': 0,
      'Available': 1,
      'Active': 2,
      'Archive': 3
    };

    try {
      const response = await fetch('https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev/form', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: editingForm.id,
          school_id: 1,
          form_name: editFormName.trim(),
          state: statusToState[editFormChangeType] || 0,
          created_by: "system",
          created_at: new Date().toISOString(),
          updated_by: "Admin",
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        const updatedForms = forms.map(form =>
          form.id === editingForm.id
            ? { ...form, formName: editFormName.trim(), changeType: editFormChangeType }
            : form
        );

        setForms(updatedForms);
        toast.success('Form updated successfully!');
        setShowEditFormDialog(false);
        setEditingForm(null);
        setEditFormName('');
        setEditFormType('');
        setEditFormChangeType('');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update form: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Error updating form');
    }
  };

  const handleDeleteForm = () => {
    const updatedForms = forms.filter(form => form.id !== deletingForm.id);
    setForms(updatedForms);
    toast.success('Form deleted successfully!');
    setShowDeleteFormDialog(false);
    setDeletingForm(null);
  };

  const handleDeleteStudentForm = async (student, form) => {
    try {
      const formId = availableForms.find(f => f.name === form)?.id || 0;
      const response = await fetch(`https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev/student-form-repository/1/${student.id}/${formId}/Admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const updatedForms = [...studentForms];
        const studentIndex = updatedForms.findIndex(s => s.id === student.id);
        updatedForms[studentIndex].forms = updatedForms[studentIndex].forms.filter(f => f !== form);
        setStudentForms(updatedForms);
        toast.success('Form removed successfully!');
      } else {
        toast.error('Failed to remove form');
      }
    } catch (error) {
      toast.error('Error removing form');
    }
  };

  const handleExportClassrooms = () => {
    const exportData = classrooms.map(classroom => ({
      'Classroom Name': classroom.class_name || '',
      'Student Count': classroom.count || 0,
      'Status': classroom.class_name === 'Unassign' ? 'Unassigned' : 'Active'
    }));

    if (window.XLSX) {
      const ws = window.XLSX.utils.json_to_sheet(exportData);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'Classrooms');
      window.XLSX.writeFile(wb, 'Classrooms.xlsx');
    } else {
      // Fallback to CSV
      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Classrooms.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
    toast.success('Export completed successfully!');
  };

  if (!isAuthenticated) {
    return null;
  }

  console.log(forms)

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNew onSignOut={signOut} sidebar={true} component="ClassroomFormManage" />

      <div className="container mx-auto pt-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Forms & Classroom Repository</h1>
            <p className="text-gray-600 mt-1">Manage classrooms, forms, and educational resources</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Classrooms</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalClassrooms}</p>
                </div>
                <School className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalChildren}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Classrooms</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.activeClassrooms}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="classroom" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classroom" className="flex items-center gap-2">
              <School className="w-4 h-4" />
              Classroom Repository
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Forms Repository
            </TabsTrigger>
            <TabsTrigger value="student-forms" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Student Form Repo
            </TabsTrigger>
          </TabsList>

          {/* Classroom Repository Tab */}
          <TabsContent value="classroom" className="space-y-6">
            {/* Add Classroom Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#002e4d]" />
                  Add New Classroom
                </CardTitle>
                <CardDescription>
                  Create a new classroom to organize students and manage educational activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddClassroom} className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="classroom-name">Classroom Name</Label>
                    <Input
                      id="classroom-name"
                      placeholder="Enter classroom name (e.g., Butterfly, Purple, etc.)"
                      value={newClassroomName}
                      onChange={(e) => setNewClassroomName(e.target.value)}
                      className="mt-1"
                      disabled={isAddingClassroom}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isAddingClassroom}
                    className="bg-[#002e4d] hover:bg-[#002e4d]/90 mt-6"
                  >
                    {isAddingClassroom ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Classroom
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Classrooms Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Classroom Management</CardTitle>
                    <CardDescription>View and manage all classroom information</CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportClassrooms}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Classroom Name</TableHead>
                        <TableHead>Student Count</TableHead>
                        <TableHead>Forms</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingClassrooms ? (
                        // Loading skeleton
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-60" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : classrooms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No classrooms found
                          </TableCell>
                        </TableRow>
                      ) : (
                        classrooms.map((classroom) => (
                          <TableRow key={classroom.class_id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#002e4d]" />
                                {classroom.class_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                {classroom.count || 0} students
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {(classroomForms[classroom.class_id] || []).length > 0 ? (
                                  classroomForms[classroom.class_id].map((form, index) => (
                                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                                      {form}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-gray-500 text-sm">No forms assigned</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {classroom.class_name === 'Unassign' ? (
                                <Badge variant="outline" className="text-gray-600 border-gray-600">
                                  Unassigned
                                </Badge>
                              ) : (
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                  Active
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditDialog(classroom)}
                                  disabled={classroom.class_name === 'Unassign'}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDeleteDialog(classroom)}
                                  disabled={classroom.class_name === 'Unassign' || (classroom.count || 0) > 0}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
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

          {/* Forms Repository Tab */}
          {/* Forms Repository Tab */}
          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#002e4d]" />
                  Add New Form
                </CardTitle>
                <CardDescription>
                  Create a new form to organize students and manage educational activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="Form-name">Form Name</Label>
                    <Input
                      id="Form-name"
                      placeholder="Enter form name"
                      value={newFormName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="mt-1"
                      disabled={isAddingForm}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isAddingForm}
                    className="bg-[#002e4d] hover:bg-[#002e4d]/90 mt-6"
                  >
                    {isAddingForm ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Form
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#002e4d]" />
                      Forms Repository
                    </CardTitle>
                    <CardDescription>
                      Manage enrollment forms, parent handbooks, and other educational documents.
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search forms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Archive">Archive</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Form Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forms
                        .filter(form => {
                          const matchesSearch = form.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            form.changeType.toLowerCase().includes(searchTerm.toLowerCase());
                          const displayType = form.changeType === 'All' ? 'Active' : form.changeType;
                          const matchesType = typeFilter === 'All' || displayType === typeFilter;
                          return matchesSearch && matchesType;
                        })
                        .map((form, index) => (
                          <TableRow key={form.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#002e4d]" />
                                {form.formName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700"
                              >
                                {form.changeType}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditFormDialog(form)}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDeleteFormDialog(form)}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  disabled
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      }
                      {forms.filter(form => {
                        const matchesSearch = form.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          form.changeType.toLowerCase().includes(searchTerm.toLowerCase());
                        const displayType = form.changeType === 'All' ? 'Active' : form.changeType;
                        const matchesType = typeFilter === 'All' || displayType === typeFilter;
                        return matchesSearch && matchesType;
                      }).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No forms found
                            </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Form Repository Tab */}
          <TabsContent value="student-forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#002e4d]" />
                  Student Form Repository
                </CardTitle>
                <CardDescription>
                  Manage student forms and track completion status for each child.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Child Name</TableHead>
                        <TableHead>Classroom</TableHead>
                        <TableHead>Parent Email</TableHead>
                        <TableHead>Forms</TableHead>
                        <TableHead>Add Form</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentForms.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.childName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {student.classroom}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">{student.parentEmail}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {student.forms.map((form, index) => (
                                <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 flex items-center gap-1 px-3 py-1">
                                  <span>{form}</span>
                                  <button
                                    onClick={() => handleDeleteStudentForm(student, form)}
                                    className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="w-48">
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002e4d] focus:border-transparent"
                              onChange={async (e) => {
                                if (e.target.value) {
                                  const updatedForms = [...studentForms];
                                  const studentIndex = updatedForms.findIndex(s => s.id === student.id);

                                  if (!updatedForms[studentIndex].forms.includes(e.target.value)) {
                                    try {
                                      const response = await fetch('https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev/student-form-repository', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          school_id: 1,
                                          child_id: student.id,
                                          form_id: availableForms.find(f => f.name === e.target.value)?.id || 0,
                                          form_status: 0,
                                          created_by: "system",
                                          created_at: new Date().toISOString(),
                                          updated_by: "Admin",
                                          updated_at: new Date().toISOString(),
                                          is_active: true
                                        })
                                      });

                                      if (response.ok) {
                                        updatedForms[studentIndex].forms.push(e.target.value);
                                        setStudentForms(updatedForms);
                                        toast.success('Form added successfully!');
                                      } else {
                                        const errorData = await response.json();
                                        toast.error(`Failed to add form: ${errorData.detail || 'Unknown error'}`);
                                      }
                                    } catch (error) {
                                      toast.error('Error adding form');
                                    }
                                  }
                                  e.target.value = '';
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="">Select Form</option>
                              {studentDropdownForms
                                .filter(form => !student.forms.includes(form))
                                .map((form, index) => (
                                  <option key={index} value={form}>{form}</option>
                                ))
                              }
                            </select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Classroom Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Classroom</DialogTitle>
            <DialogDescription>
              Update the classroom name. This will affect all associated students and records.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="edit-classroom-name">Classroom Name</Label>
              <Input
                id="edit-classroom-name"
                value={editClassroomName}
                onChange={(e) => setEditClassroomName(e.target.value)}
                className="mt-1"
                disabled={isEditingClassroom}
              />
            </div>

            <div>
              <Label>Forms</Label>
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {(editingClassroom?.forms || ['Admission Form']).map((form, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 flex items-center gap-1 px-3 py-1">
                      <span>{form}</span>
                      <button
                        onClick={() => {
                          const updatedForms = (editingClassroom?.forms || ['Admission Form']).filter(f => f !== form);
                          setEditingClassroom({ ...editingClassroom, forms: updatedForms });
                        }}
                        className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#002e4d] focus:border-transparent"
                  onChange={(e) => {
                    if (e.target.value) {
                      const currentForms = editingClassroom?.forms || ['Admission Form'];
                      if (!currentForms.includes(e.target.value)) {
                        setEditingClassroom({ ...editingClassroom, forms: [...currentForms, e.target.value] });
                      }
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Add Form</option>
                  {availableForms
                    .filter(form => !(editingClassroom?.forms || ['Admission Form']).includes(form.name))
                    .map((form, index) => (
                      <option key={index} value={form.name}>{form.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditClassroom}
              disabled={isEditingClassroom}
              className="bg-[#002e4d] hover:bg-[#002e4d]/90"
            >
              {isEditingClassroom ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditFormDialog} onOpenChange={setShowEditFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Form</DialogTitle>
            <DialogDescription>
              Update the form details.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="edit-form-name">Form Name</Label>
              <Input
                id="edit-form-name"
                value={editFormName}
                onChange={(e) => setEditFormName(e.target.value)}
                className="mt-1"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="edit-form-status">Status</Label>
              <Select value={editFormChangeType} onValueChange={setEditFormChangeType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Default">Default</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Archive">Archive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFormDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditForm} className="bg-[#002e4d] hover:bg-[#002e4d]/90">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Form Dialog */}
      <Dialog open={showDeleteFormDialog} onOpenChange={setShowDeleteFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingForm?.formName}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteFormDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteForm}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClassroom}
              disabled={isDeletingClassroom}
            >
              {isDeletingClassroom ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormsRepositoryNew;