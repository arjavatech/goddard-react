import React, { useState, useEffect } from 'react';
import Alert from './Alert';
import { api_base_url, school_id } from '../utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '../utils/auth';

const AddChildModal = ({ isOpen, onClose, parentEmail, onAddChild ,  Parent_id}) => {
  const { getAccessTokenSilently } = useAuth0();

  const [formData, setFormData] = useState({
    child_first_name: '',
    child_last_name: '',
    class_id: '',
    parent_id: Parent_id || '',
    school_id : ""
  });
  const [classrooms, setClassrooms] = useState([]);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && parentEmail) {
      loadClassrooms();
      loadParentInfo();
    }
  }, [isOpen, parentEmail]);

  useEffect(() => {
    if (Parent_id) {
      setFormData(prev => ({ ...prev, parent_id: Parent_id }));
    }
  }, [Parent_id]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Clear form data when modal closes
      setFormData({ child_first_name: '', child_last_name: '', class_id: '', parent_id: Parent_id || '', school_id:school_id  });
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadClassrooms = async () => {
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/class_details/${school_id}`, {
        headers
      });
      const data = await response.json();
      const classroomOptions = data.filter(item => item.class_name)
        .map(item => ({
          id: item.class_id,
          name: item.class_name
        }));
      setClassrooms(classroomOptions);
    } catch (error) {
      // console.error('Error loading classrooms:', error);
    }
  };

  const loadParentInfo = async () => {
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/parent_info/${school_id}`, {
        headers
      });
      const data = await response.json();
      const parent = data.find(p => p.parent_email === parentEmail);
      if (parent) {
        setFormData(prevData => ({
          ...prevData,
          parent_id: Parent_id || parent.parent_id
        }));

      }
    } catch (error) {
      // console.error('Error loading parent info:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitForm = async () => {
    const obj = { ...formData };
    

    // Validate each field individually
    if (!obj.child_first_name || obj.child_first_name.trim() === '') {
      showAlert('error', 'First Name is required!');
      return;
    }

    if (!obj.child_last_name || obj.child_last_name.trim() === '') {
      showAlert('error', 'Last Name is required!');
      return;
    }

    if (!obj.class_id || obj.class_id === '') {
      showAlert('error', 'Class Room selection is required!');
      return;
    }

    if (!obj.parent_id || obj.parent_id === '') {
      showAlert('error', 'Parent information is required!');
      return;
    }

    // Close modal and let parent handle the API call with loading indicator
    onClose();
    obj.class_id = parseInt(obj.class_id);
    onAddChild(obj);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitForm();
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
      if (type === 'success') onClose();
    }, 3000);
  };

  const closeAlert = () => {
    setAlert({ show: false, type: '', message: '' });
    setFormData({ child_first_name: '', child_last_name: '', class_id: '', parent_id: '' });
  };

  if (!isOpen) return null;

  return (
    <>
      <Alert show={alert.show} type={alert.type} message={alert.message} onClose={closeAlert} />

      <div
        className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h5 className="text-lg font-semibold text-gray-900">Child Basic Information</h5>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              &times;
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="child_first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    name="child_first_name"
                    type="text"
                    maxLength="20"
                    value={formData.child_first_name}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="w-full border border-gray-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>

                <div>
                  <label htmlFor="child_last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    name="child_last_name"
                    type="text"
                    maxLength="20"
                    value={formData.child_last_name}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="w-full border border-gray-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Class Room
                  </label>
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="w-full border border-gray-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="parent_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Email
                  </label>
                  <input
                    type="text"
                    name='parent_email'
                    value={parentEmail}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="w-full border border-gray-400 rounded-md p-2 bg-gray-100 cursor-not-allowed"
                  />
                  <input type="hidden" name="parent_id" value={formData.parent_id} />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-blue-100 text-blue-900 border border-blue-900 px-6 py-2 rounded-md font-semibold hover:opacity-75"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-900 text-white px-6 py-2 rounded-md font-semibold hover:opacity-75"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddChildModal;
