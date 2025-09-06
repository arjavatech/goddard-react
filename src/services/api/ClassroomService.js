/**
 * Classroom API Service
 * Handles all classroom-related API operations
 */

import { toast } from 'sonner';

class ClassroomService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * Get all classrooms with child counts and form data
   */
  async getClassrooms() {
    try {
      const data = await this.api.get('/child_count_with_class_name/{school_id}', {
        context: 'Loading classroom data',
        cache: true,
        cacheTTL: 2 * 60 * 1000 // 2 minutes cache
      });

      return {
        classrooms: data || [],
        stats: this.calculateStats(data),
        formsByClassroom: this.processClassroomForms(data)
      };
    } catch (error) {
      toast.error('Failed to load classroom data');
      throw error;
    }
  }

  /**
   * Create a new classroom
   */
  async createClassroom(classroomData) {
    try {
      const result = await this.api.post('/class_form_repository', {
        class_name: classroomData.name,
        school_id: this.api.schoolId
      }, {
        context: 'Creating classroom'
      });

      // Clear classroom cache after creation
      this.api.clearCache('child_count_with_class_name');
      toast.success('Classroom created successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to create classroom');
      throw error;
    }
  }

  /**
   * Update classroom details
   */
  async updateClassroom(classroomId, updates) {
    try {
      const result = await this.api.put(`/class_form_repository/${classroomId}`, {
        ...updates,
        school_id: this.api.schoolId
      }, {
        context: 'Updating classroom'
      });

      // Clear related caches
      this.api.clearCache('child_count_with_class_name');
      this.api.clearCache('class_form_repository');
      toast.success('Classroom updated successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to update classroom');
      throw error;
    }
  }

  /**
   * Delete a classroom
   */
  async deleteClassroom(classroomId) {
    try {
      const result = await this.api.delete(`/class_details/{school_id}/${classroomId}`, {
        context: 'Deleting classroom'
      });

      // Clear all classroom-related caches
      this.api.clearCache('child_count_with_class_name');
      this.api.clearCache('class_form_repository');
      toast.success('Classroom deleted successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to delete classroom');
      throw error;
    }
  }

  /**
   * Get classroom forms mapping
   */
  async getClassroomForms() {
    try {
      const data = await this.api.get('/child_count_with_class_name/{school_id}', {
        context: 'Loading classroom forms',
        cache: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutes cache
      });

      return this.processClassroomForms(data);
    } catch (error) {
      console.log('Failed to load classroom forms');
      return {};
    }
  }

  /**
   * Assign form to classroom
   */
  async assignFormToClassroom(classroomId, formId, formData) {
    try {
      const result = await this.api.post('/class_form_repository', {
        class_id: classroomId,
        form_id: formId,
        school_id: this.api.schoolId,
        ...formData
      }, {
        context: 'Assigning form to classroom'
      });

      // Clear classroom caches
      this.api.clearCache('child_count_with_class_name');
      toast.success('Form assigned to classroom successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to assign form to classroom');
      throw error;
    }
  }

  /**
   * Get classroom statistics from data
   */
  calculateStats(classrooms) {
    if (!Array.isArray(classrooms)) return { totalClassrooms: 0, totalChildren: 0, activeClassrooms: 0 };

    const totalClassrooms = classrooms.length;
    const totalChildren = classrooms.reduce((sum, classroom) => sum + (classroom.count || 0), 0);
    const activeClassrooms = classrooms.filter(classroom => classroom.class_name !== 'Unassign').length;

    return {
      totalClassrooms,
      totalChildren,
      activeClassrooms
    };
  }

  /**
   * Process classroom forms data into a more usable format
   */
  processClassroomForms(classrooms) {
    if (!Array.isArray(classrooms)) return {};

    const formsMap = {};
    classrooms.forEach(classroom => {
      const formsList = [];
      if (classroom.forms && Object.keys(classroom.forms).length > 0) {
        Object.values(classroom.forms).forEach(formName => {
          formsList.push(this.formatFormName(formName));
        });
      }
      formsMap[classroom.class_id] = formsList;
    });
    return formsMap;
  }

  /**
   * Format form names consistently
   */
  formatFormName(formName) {
    return formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Search and filter classrooms
   */
  filterClassrooms(classrooms, searchTerm = '', filters = {}) {
    let filtered = [...classrooms];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(classroom =>
        classroom.class_name?.toLowerCase().includes(term) ||
        classroom.count?.toString().includes(term)
      );
    }

    // Additional filters can be added here
    if (filters.minCount) {
      filtered = filtered.filter(classroom => (classroom.count || 0) >= filters.minCount);
    }

    return filtered;
  }
}

export default ClassroomService;