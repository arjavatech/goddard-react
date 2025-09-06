/**
 * Student API Service  
 * Handles all student-related API operations
 */

import { toast } from 'sonner';

class StudentService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * Get all students with their form completion status
   */
  async getStudents(filters = {}) {
    try {
      const data = await this.api.get('/admission_child_personal/all_child_status/{school_id}', {
        context: 'Loading student data',
        params: filters,
        cache: true,
        cacheTTL: 2 * 60 * 1000 // 2 minutes cache
      });

      return this.processStudentData(data);
    } catch (error) {
      toast.error('Failed to load student data');
      throw error;
    }
  }

  /**
   * Get a specific student's details
   */
  async getStudent(studentId) {
    try {
      const data = await this.api.get(`/admission_child_personal/child/{school_id}/${studentId}`, {
        context: 'Loading student details',
        cache: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutes cache
      });

      return this.processStudentDetails(data);
    } catch (error) {
      toast.error('Failed to load student details');
      throw error;
    }
  }

  /**
   * Get students by classroom
   */
  async getStudentsByClassroom(classroomId) {
    try {
      const data = await this.api.get('/admission_child_personal/all_child_status/{school_id}', {
        context: 'Loading classroom students',
        params: { class_id: classroomId },
        cache: true,
        cacheTTL: 2 * 60 * 1000
      });

      const students = this.processStudentData(data);
      return students.filter(student => student.classId === classroomId);
    } catch (error) {
      toast.error('Failed to load classroom students');
      throw error;
    }
  }

  /**
   * Get students by parent email
   */
  async getStudentsByParent(parentEmail) {
    try {
      const data = await this.api.get(`/admission_child_personal/parent_email/{school_id}/${parentEmail}`, {
        context: 'Loading parent students',
        cache: true,
        cacheTTL: 5 * 60 * 1000
      });

      return this.processStudentData(data);
    } catch (error) {
      toast.error('Failed to load parent students');
      throw error;
    }
  }

  /**
   * Create a new student record
   */
  async createStudent(studentData) {
    try {
      const result = await this.api.post('/admission_child_personal', {
        ...studentData,
        school_id: this.api.schoolId
      }, {
        context: 'Creating student'
      });

      // Clear student caches
      this.api.clearCache('admission_child_personal');
      toast.success('Student created successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to create student');
      throw error;
    }
  }

  /**
   * Update student information
   */
  async updateStudent(studentId, updates) {
    try {
      const result = await this.api.put(`/admission_child_personal/${studentId}`, {
        ...updates,
        school_id: this.api.schoolId
      }, {
        context: 'Updating student'
      });

      // Clear student caches
      this.api.clearCache('admission_child_personal');
      toast.success('Student updated successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to update student');
      throw error;
    }
  }

  /**
   * Delete a student record
   */
  async deleteStudent(studentId) {
    try {
      const result = await this.api.delete(`/admission_child_personal/${studentId}`, {
        context: 'Deleting student'
      });

      // Clear student caches
      this.api.clearCache('admission_child_personal');
      toast.success('Student deleted successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to delete student');
      throw error;
    }
  }

  /**
   * Get student form completion status
   */
  async getStudentFormStatus(studentId) {
    try {
      const data = await this.api.get(`/child_all_form_details/{school_id}/${studentId}`, {
        context: 'Loading student form status',
        cache: true,
        cacheTTL: 2 * 60 * 1000
      });

      return this.processFormStatus(data);
    } catch (error) {
      console.log('Failed to load student form status:', error);
      return { completed: [], pending: [], total: 0 };
    }
  }

  /**
   * Update student form completion
   */
  async updateFormCompletion(studentId, formId, completionData) {
    try {
      const result = await this.api.post('/form/completion', {
        child_id: studentId,
        form_id: formId,
        school_id: this.api.schoolId,
        ...completionData
      }, {
        context: 'Updating form completion'
      });

      // Clear form status caches
      this.api.clearCache('child_all_form_details');
      this.api.clearCache('admission_child_personal/all_child_status');
      toast.success('Form completion updated');
      
      return result;
    } catch (error) {
      toast.error('Failed to update form completion');
      throw error;
    }
  }

  /**
   * Assign student to classroom
   */
  async assignToClassroom(studentId, classroomId) {
    try {
      const result = await this.api.put(`/admission_child_personal/${studentId}`, {
        class_id: classroomId,
        school_id: this.api.schoolId
      }, {
        context: 'Assigning student to classroom'
      });

      // Clear related caches
      this.api.clearCache('admission_child_personal');
      this.api.clearCache('child_count_with_class_name');
      toast.success('Student assigned to classroom');
      
      return result;
    } catch (error) {
      toast.error('Failed to assign student to classroom');
      throw error;
    }
  }

  /**
   * Process student data from API response
   */
  processStudentData(data) {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      id: item.child_id,
      childId: item.child_id,
      firstName: item.child_first_name || 'No name',
      lastName: item.child_last_name || '',
      fullName: `${item.child_first_name || 'No'} ${item.child_last_name || 'Name'}`.trim(),
      className: item.class_name || 'Unassigned',
      classId: item.class_id,
      parentEmail: item.primary_email || 'No email provided',
      parentPhone: item.parent_phone || '',
      parentName: item.parent_name || '',
      dateOfBirth: item.date_of_birth,
      enrollmentDate: item.enrollment_date,
      status: item.status || 'active',
      forms: this.processStudentForms(item.forms),
      formCount: this.getFormCount(item.forms),
      completedForms: this.getCompletedForms(item.forms),
      pendingForms: this.getPendingForms(item.forms),
      rawData: item
    }));
  }

  /**
   * Process individual student details
   */
  processStudentDetails(data) {
    if (!data) return null;

    return {
      id: data.child_id,
      childId: data.child_id,
      firstName: data.child_first_name,
      lastName: data.child_last_name,
      fullName: `${data.child_first_name || ''} ${data.child_last_name || ''}`.trim(),
      className: data.class_name || 'Unassigned',
      classId: data.class_id,
      parentEmail: data.primary_email,
      parentPhone: data.parent_phone,
      parentName: data.parent_name,
      dateOfBirth: data.date_of_birth,
      enrollmentDate: data.enrollment_date,
      status: data.status || 'active',
      forms: this.processStudentForms(data.forms),
      formProgress: this.calculateFormProgress(data.forms),
      rawData: data
    };
  }

  /**
   * Process student forms data
   */
  processStudentForms(forms) {
    if (!forms || typeof forms !== 'object') return [];

    return Object.entries(forms).map(([key, value]) => ({
      id: key,
      name: this.formatFormName(value),
      originalName: value,
      status: 'completed' // Assuming forms in the object are completed
    }));
  }

  /**
   * Process form status data
   */
  processFormStatus(data) {
    if (!data) return { completed: [], pending: [], total: 0 };

    const completed = [];
    const pending = [];

    if (data.completed_forms) {
      data.completed_forms.forEach(form => {
        completed.push({
          id: form.form_id,
          name: this.formatFormName(form.form_name),
          completedDate: form.completed_date,
          status: 'completed'
        });
      });
    }

    if (data.pending_forms) {
      data.pending_forms.forEach(form => {
        pending.push({
          id: form.form_id,
          name: this.formatFormName(form.form_name),
          dueDate: form.due_date,
          status: 'pending'
        });
      });
    }

    return {
      completed,
      pending,
      total: completed.length + pending.length,
      completionRate: completed.length / (completed.length + pending.length) * 100
    };
  }

  /**
   * Helper methods
   */
  formatFormName(formName) {
    return formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getFormCount(forms) {
    return forms && typeof forms === 'object' ? Object.keys(forms).length : 0;
  }

  getCompletedForms(forms) {
    return forms && typeof forms === 'object' ? Object.keys(forms).length : 0;
  }

  getPendingForms(forms) {
    // This would need additional logic to determine pending forms
    return 0; // Placeholder
  }

  calculateFormProgress(forms) {
    const completed = this.getCompletedForms(forms);
    const total = completed + this.getPendingForms(forms);
    return total > 0 ? (completed / total * 100) : 0;
  }

  /**
   * Search and filter students
   */
  filterStudents(students, searchTerm = '', filters = {}) {
    let filtered = [...students];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.fullName?.toLowerCase().includes(term) ||
        student.parentEmail?.toLowerCase().includes(term) ||
        student.className?.toLowerCase().includes(term)
      );
    }

    // Classroom filter
    if (filters.classroom && filters.classroom !== 'All') {
      filtered = filtered.filter(student => student.className === filters.classroom);
    }

    // Status filter
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(student => student.status === filters.status);
    }

    // Form completion filter
    if (filters.formCompletion) {
      if (filters.formCompletion === 'completed') {
        filtered = filtered.filter(student => student.formCount > 0);
      } else if (filters.formCompletion === 'incomplete') {
        filtered = filtered.filter(student => student.formCount === 0);
      }
    }

    return filtered;
  }

  /**
   * Get student statistics
   */
  getStudentStats(students) {
    if (!Array.isArray(students)) return {};

    const totalStudents = students.length;
    const classroomCounts = {};
    const formStats = { completed: 0, total: 0 };

    students.forEach(student => {
      // Classroom counts
      const classroom = student.className || 'Unassigned';
      classroomCounts[classroom] = (classroomCounts[classroom] || 0) + 1;

      // Form stats
      formStats.completed += student.formCount;
      formStats.total += student.formCount; // This would need better logic for total available forms
    });

    return {
      totalStudents,
      classroomCounts,
      formStats,
      avgFormsPerStudent: totalStudents > 0 ? (formStats.completed / totalStudents).toFixed(1) : 0
    };
  }
}

export default StudentService;