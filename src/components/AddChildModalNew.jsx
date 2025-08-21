import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, School, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AddChildModalNew = ({ isOpen, onClose, parentEmail, onAddChild }) => {
  const [formData, setFormData] = useState({
    child_first_name: '',
    child_last_name: '',
    class_id: '',
    parent_id: ''
  });
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);

  useEffect(() => {
    if (isOpen && parentEmail) {
      loadClassrooms();
      loadParentInfo();
    }
  }, [isOpen, parentEmail]);

  useEffect(() => {
    if (!isOpen) {
      // Clear form data when modal closes
      setFormData({ child_first_name: '', child_last_name: '', class_id: '', parent_id: '' });
    }
  }, [isOpen]);

  const loadClassrooms = async () => {
    setLoadingClassrooms(true);
    try {
      const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_details/getall');
      const data = await response.json();
      const classroomOptions = data.filter(item => item.class_name)
        .map(item => ({
          id: item.class_id,
          name: item.class_name
        }));
      setClassrooms(classroomOptions);
    } catch (error) {
      toast.error('Failed to load classrooms. Please try again.');
      console.error('Error loading classrooms:', error);
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const loadParentInfo = async () => {
    try {
      const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/parent_info/getall');
      const data = await response.json();
      const parent = data.find(p => p.parent_email === parentEmail);
      if (parent) {
        setFormData(prev => ({ ...prev, parent_id: parent.parent_id }));
      }
    } catch (error) {
      console.error('Error loading parent info:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.child_first_name?.trim()) {
      errors.push('First Name is required');
    }
    
    if (!formData.child_last_name?.trim()) {
      errors.push('Last Name is required');
    }
    
    if (!formData.class_id) {
      errors.push('Classroom selection is required');
    }
    
    if (!formData.parent_id) {
      errors.push('Parent information is required');
    }

    return errors;
  };

  const submitForm = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      const obj = { 
        ...formData,
        class_id: parseInt(formData.class_id)
      };
      
      await onAddChild(obj);
      toast.success('Child added successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to add child. Please try again.');
      console.error('Error adding child:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitForm();
  };

  const selectedClassroom = classrooms.find(c => c.id.toString() === formData.class_id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0F2D52]">
            <User className="h-5 w-5" />
            Add Child Information
          </DialogTitle>
          <DialogDescription>
            Please provide the child's basic information to complete enrollment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child Information Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="child_first_name">
                    First Name *
                  </Label>
                  <Input
                    id="child_first_name"
                    name="child_first_name"
                    type="text"
                    maxLength={20}
                    placeholder="Enter child's first name"
                    value={formData.child_first_name}
                    onChange={(e) => handleInputChange('child_first_name', e.target.value)}
                    disabled={loading}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child_last_name">
                    Last Name *
                  </Label>
                  <Input
                    id="child_last_name"
                    name="child_last_name"
                    type="text"
                    maxLength={20}
                    placeholder="Enter child's last name"
                    value={formData.child_last_name}
                    onChange={(e) => handleInputChange('child_last_name', e.target.value)}
                    disabled={loading}
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Information Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class_id">
                    Classroom *
                  </Label>
                  {loadingClassrooms ? (
                    <div className="flex items-center space-x-2 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading classrooms...</span>
                    </div>
                  ) : (
                    <Select 
                      value={formData.class_id} 
                      onValueChange={(value) => handleInputChange('class_id', value)}
                      disabled={loading}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select classroom">
                          {selectedClassroom && (
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4" />
                              {selectedClassroom.name}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms.map((classroom) => (
                          <SelectItem key={classroom.id} value={classroom.id.toString()}>
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4" />
                              {classroom.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {classrooms.length === 0 && !loadingClassrooms && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      No classrooms available
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_email">
                    Parent Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="parent_email"
                      type="text"
                      value={parentEmail || ''}
                      disabled
                      className="bg-gray-50 pl-10"
                    />
                    <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      Linked Parent Account
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Summary */}
          {(formData.child_first_name || formData.child_last_name || formData.class_id) && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-medium text-[#0F2D52] mb-3">Summary</h4>
                <div className="space-y-2 text-sm">
                  {formData.child_first_name && formData.child_last_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Child: {formData.child_first_name} {formData.child_last_name}</span>
                    </div>
                  )}
                  {selectedClassroom && (
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 text-blue-600" />
                      <span>Classroom: {selectedClassroom.name}</span>
                    </div>
                  )}
                  {parentEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>Parent: {parentEmail}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingClassrooms || classrooms.length === 0}
              className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Adding Child...' : 'Add Child'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildModalNew;