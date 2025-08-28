import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '../utils/auth';

const FormRepo = ({ onAlert }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [formType, setFormType] = useState([]);
  const [formNames, setFormNames] = useState([]);
  const [allocateTo, setAllocateTo] = useState('0');
  const [activeForms, setActiveForms] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [childNames, setChildNames] = useState([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);

  useEffect(() => {
    loadActiveForms();
    loadClassroomNames();
  }, []);

  const loadActiveForms = async () => {
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/get_all_form_details/${school_id}`, {
        headers
      });
      const data = await response.json();
      
      if (data.active) {
        const activeFormsArray = Object.entries(data.active).map(([key, value]) => ({
          id: value,
          name: key,
          selected: false
        }));
        setActiveForms(activeFormsArray);
      }
    } catch (error) {
    }
  };

  const loadClassroomNames = async () => {
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/child_count_with_class_name/${school_id}`, {
        headers
      });
      const data = await response.json();
      setClassrooms(data);
    } catch (error) {
    }
  };

  const handleFormTypeChange = async (selectedTypes) => {
    setFormType(selectedTypes);
    
    if (selectedTypes.includes('all') && selectedTypes.length > 1) {
      const filtered = selectedTypes.filter(value => value !== 'all');
      setFormType(filtered);
      return;
    }

    if (selectedTypes.length === 0) {
      setFormNames([]);
      return;
    }

    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/get_all_form_details/${school_id}`, {
        headers
      });
      const data = await response.json();
      
      let filteredForms = [];
      selectedTypes.forEach(type => {
        if (data[type]) {
          Object.entries(data[type]).forEach(([key, value]) => {
            filteredForms.push({ id: value, name: key, selected: false });
          });
        }
      });
      
      setFormNames(filteredForms);
    } catch (error) {
    }
  };

  const handleClassroomChange = async (selectedClassrooms) => {
    setSelectedClassrooms(selectedClassrooms);
    
    if (selectedClassrooms.length === 0) {
      setChildNames([]);
      return;
    }

    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/class_wise_child_details/${school_id}`, {
        headers
      });
      const data = await response.json();
      
      let filteredChildren = [];
      selectedClassrooms.forEach(classId => {
        if (data[classId]) {
          Object.entries(data[classId]).forEach(([key, value]) => {
            filteredChildren.push({
              id: value.child_id,
              name: value.child_first_name
            });
          });
        }
      });
      
      setChildNames(filteredChildren);
    } catch (error) {
    }
  };

  const handleFormAllocate = async (e) => {
    e.preventDefault();
    
    const selectedForms = formNames.filter(f => f.selected);
    if (selectedForms.length === 0 || !allocateTo) {
      onAlert('error', 'You have to fill all the fields!');
      return;
    }

    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/update_form_repo_state/${school_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          form_ids: selectedForms.map(f => f.id),
          state: allocateTo
        })
      });

      const result = await response.json();
      if (result.message === "Forms updated successfully") {
        onAlert('success', 'Form updated!');
          // Reset state to default
  setFormType([]);
  setFormNames([]);
  setAllocateTo('0');
      }
    } catch (error) {
      onAlert('error', 'Failed to update forms!');
    }
  };

  const handleFormClassChild = async (e) => {
    e.preventDefault();
    
    const selectedActiveForms = activeForms.filter(f => f.selected);
    if (selectedActiveForms.length === 0 || selectedClassrooms.length === 0) {
      onAlert('error', 'You have to fill all the fields!');
      return;
    }

    try {
      let url, body;
      
      if (selectedChildren.length === 0) {
        url = `${api_base_url}/class_repo_update/${school_id}`;
        body = JSON.stringify({
          form_ids: selectedActiveForms.map(f => f.id),
          class_ids: selectedClassrooms
        });
      } else {
        url = `${api_base_url}/student_repo_update/${school_id}`;
        body = JSON.stringify({
          form_ids: selectedActiveForms.map(f => f.id),
          child_ids: selectedChildren
        });
      }

      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body
      });

      const result = await response.json();
      if (result.message === "Data processed successfully") {
        onAlert('success', 'Form updated!');
          // Reset state to default
  setActiveForms(prev => prev.map(f => ({ ...f, selected: false })));
  setSelectedClassrooms([]);
  setChildNames([]);
  setSelectedChildren([]);
      }
    } catch (error) {
      onAlert('error', 'Failed to update forms!');
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="bg-[#D8E9FF] shadow-gray-500 shadow-xl rounded-lg p-4 sm:p-6">
        {/* Form 1 */}
        <form id="formAllocate" onSubmit={handleFormAllocate}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block font-bold text-gray-700 mb-2">Form type</label>
              <SearchableSelect
                id="multi_form_type"
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'default', label: 'Default' },
                  { value: 'available', label: 'Available' },
                  { value: 'active', label: 'Active' },
                  { value: 'archive', label: 'Archive' }
                ]}
                value={formType}
                onChange={handleFormTypeChange}
                multiple={true}
                placeholder="Select form types..."
              />
            </div>
  
            <div>
              <label className="block font-bold text-gray-700 mb-2">Forms</label>
              <SearchableSelect
                id="multi_form_name"
                options={formNames.map(form => ({ value: form.id, label: form.name }))}
                value={formNames.filter(f => f.selected).map(f => f.id)}
                onChange={(selectedIds) => {
                  setFormNames(formNames.map(f => ({
                    ...f,
                    selected: selectedIds.includes(f.id)
                  })));
                }}
                multiple={true}
                placeholder="Select forms..."
              />
            </div>
  
            <div>
              <label className="block font-bold text-gray-700 mb-2">Allocate to</label>
              <SearchableSelect
                id="allocate_to"
                options={[
                  { value: '0', label: 'Default' },
                  { value: '1', label: 'Available' },
                  { value: '2', label: 'Active' },
                  { value: '3', label: 'Archive' }
                ]}
                value={[allocateTo]}
                onChange={(selected) => setAllocateTo(selected[0] || '0')}
                multiple={false}
                placeholder="Select allocation..."
              />
            </div>
          </div>
  
          <div className="text-center mb-6">
            <button
              id="sendFormAllocate"
              type="submit"
              className="bg-[#0F2D52] text-white px-6 py-2 rounded hover:opacity-80 w-full sm:w-auto"
            >
              Send
            </button>
          </div>
        </form>
  
        {/* Form 2 */}
        <form onSubmit={handleFormClassChild}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block font-bold text-gray-700 mb-2">Active Forms</label>
              <SearchableSelect
                id="multi_active_forms"
                options={activeForms.map(form => ({ value: form.id, label: form.name }))}
                value={activeForms.filter(f => f.selected).map(f => f.id)}
                onChange={(selectedIds) => {
                  setActiveForms(activeForms.map(f => ({
                    ...f,
                    selected: selectedIds.includes(f.id)
                  })));
                }}
                multiple={true}
                placeholder="Select active forms..."
              />
            </div>
  
            <div>
              <label className="block font-bold text-gray-700 mb-2">Classroom</label>
              <SearchableSelect
                id="multi_cls_room"
                options={classrooms.map(classroom => ({ value: classroom.class_id, label: classroom.class_name }))}
                value={selectedClassrooms}
                onChange={handleClassroomChange}
                multiple={true}
                placeholder="Select classrooms..."
              />
            </div>
  
            <div>
              <label className="block font-bold text-gray-700 mb-2">Child Name</label>
              <SearchableSelect
                id="multi_child_name"
                options={childNames.map(child => ({ value: child.id, label: child.name }))}
                value={selectedChildren}
                onChange={setSelectedChildren}
                multiple={true}
                placeholder="Select children..."
              />
            </div>
          </div>
  
          <div className="text-center mb-6">
            <button
              id="sendFormClsChild"
              type="submit"
              className="bg-[#0F2D52] text-white px-6 py-2 rounded hover:opacity-80 w-full sm:w-auto"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  );
};

export default FormRepo;