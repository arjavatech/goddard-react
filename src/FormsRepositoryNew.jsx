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
  BookOpen, 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Download,
  School,
  FileText,
  Settings,
  Save
} from 'lucide-react';

const FormsRepositoryNew = () => {
  const { isAuthenticated, signOut } = useAuth();
  
  // Classroom management state
  const [classrooms, setClassrooms] = useState([]);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [editClassroomName, setEditClassroomName] = useState('');
  const [deletingClassroom, setDeletingClassroom] = useState(null);
  
  // Loading states
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(true);
  const [isAddingClassroom, setIsAddingClassroom] = useState(false);
  const [isEditingClassroom, setIsEditingClassroom] = useState(false);
  const [isDeletingClassroom, setIsDeletingClassroom] = useState(false);
  
  // Modal states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    totalClassrooms: 0,
    totalChildren: 0,
    activeClassrooms: 0
  });

  useEffect(() => {
    loadClassroomData();
  }, []);

  useEffect(() => {
    // Calculate statistics
    const totalClassrooms = classrooms.length;
    const totalChildren = classrooms.reduce((sum, classroom) => sum + (classroom.child_count || 0), 0);
    const activeClassrooms = classrooms.filter(classroom => classroom.class_name !== 'Unassign').length;
    
    setStats({
      totalClassrooms,
      totalChildren,
      activeClassrooms
    });
  }, [classrooms]);

  const loadClassroomData = async () => {
    setIsLoadingClassrooms(true);
    try {
      const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/child_count_with_class_name');
      const data = await response.json();
      setClassrooms(data || []);
    } catch (error) {
      toast.error('Failed to load classroom data');
    } finally {
      setIsLoadingClassrooms(false);
    }
  };

  const handleAddClassroom = async (e) => {
    e.preventDefault();
    
    if (!newClassroomName.trim()) {
      toast.error('Please enter a classroom name');
      return;
    }

    setIsAddingClassroom(true);
    try {
      const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_details/create', {
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

  const handleEditClassroom = async () => {
    if (!editClassroomName.trim()) {
      toast.error('Please enter a classroom name');
      return;
    }

    setIsEditingClassroom(true);
    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_details/update/${editingClassroom.class_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_name: editClassroomName.trim() })
      });

      const result = await response.json();
      
      if (result.message?.includes('successfully')) {
        toast.success('Classroom updated successfully!');
        setShowEditDialog(false);
        setEditingClassroom(null);
        setEditClassroomName('');
        await loadClassroomData();
      } else {
        toast.error('Failed to update classroom');
      }
    } catch (error) {
      toast.error('Error updating classroom');
    } finally {
      setIsEditingClassroom(false);
    }
  };

  const handleDeleteClassroom = async () => {
    setIsDeletingClassroom(true);
    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_details/delete/${deletingClassroom.class_id}`, {
        method: 'DELETE'
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
    setEditingClassroom(classroom);
    setEditClassroomName(classroom.class_name);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (classroom) => {
    setDeletingClassroom(classroom);
    setShowDeleteDialog(true);
  };

  const handleExportClassrooms = () => {
    const exportData = classrooms.map(classroom => ({
      'Classroom Name': classroom.class_name || '',
      'Student Count': classroom.child_count || 0,
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="classroom" className="flex items-center gap-2">
              <School className="w-4 h-4" />
              Classroom Repository
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Forms Repository
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
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : classrooms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
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
                                {classroom.child_count || 0} students
                              </Badge>
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
                                  disabled={classroom.class_name === 'Unassign' || (classroom.child_count || 0) > 0}
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
          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#002e4d]" />
                  Forms Repository
                </CardTitle>
                <CardDescription>
                  Manage enrollment forms, parent handbooks, and other educational documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Forms Management</h3>
                  <p className="text-gray-600 mb-4">
                    Forms repository functionality is currently under development.
                  </p>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Coming Soon
                  </Badge>
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
          <div className="py-4">
            <Label htmlFor="edit-classroom-name">Classroom Name</Label>
            <Input
              id="edit-classroom-name"
              value={editClassroomName}
              onChange={(e) => setEditClassroomName(e.target.value)}
              className="mt-1"
              disabled={isEditingClassroom}
            />
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