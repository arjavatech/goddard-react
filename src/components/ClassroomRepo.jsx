import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import { api_base_url, school_id } from '@/utils/const';
import { exportToExcel, exportToCSVFromData } from './common/ExcelExport';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '../utils/auth';

const ClassroomRepo = ({ onAlert }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [classroomName, setClassroomName] = useState('');
  const [classroomData, setClassroomData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [editClassroomName, setEditClassroomName] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingClassroom, setDeletingClassroom] = useState(null);

  useEffect(() => {
    loadClassroomData();
  }, []);

  const loadClassroomData = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/child_count_with_class_name/${school_id}`, {
        headers
      });
      const data = await response.json();
      setClassroomData(data);
    } catch (error) {
      // console.error('Error loading classroom data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleClassroomSubmit = async (e) => {
    e.preventDefault();
    
    if (!classroomName.trim()) {
      onAlert('error', 'You have to fill all the fields!');
      return;
    }

    try {
      const url = `${api_base_url}/class_details/${school_id}`;
      const method = 'POST';
      const body = JSON.stringify({ class_name: classroomName });
      const headers = await getAuthHeaders(getAccessTokenSilently);

      const response = await fetch(url, {
        method,
        headers,
        body
      });

      if (response.ok) {
        onAlert('success', 'Classroom was successfully added!');
        setClassroomName('');
        loadClassroomData();
      } else {
        onAlert('error', 'Failed to save classroom!');
      }
    } catch (error) {
      // console.error('Error saving classroom:', error);
      onAlert('error', 'Failed to save classroom!');
    }
  };

  const openEditModal = (classroom) => {
    setEditingClassroom(classroom);
    setEditClassroomName(classroom.class_name);
    setIsEditModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingClassroom(null);
    setEditClassroomName('');
    setIsConfirmModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editClassroomName.trim()) {
      onAlert('error', 'You have to fill all the fields!');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async () => {
    const classroomToUpdate = editingClassroom;
    const nameToUpdate = editClassroomName;
    
    setIsConfirmModalOpen(false);
    setIsEditModalOpen(false);
    setEditingClassroom(null);
    setEditClassroomName('');
    document.body.style.overflow = 'unset';
    
    try {
      const url = `${api_base_url}/class_details/${school_id}/${classroomToUpdate.class_id}`;
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ class_name: nameToUpdate, class_id: classroomToUpdate.class_id })
      });

      if (response.ok) {
        onAlert('success', 'Class room name updated!');
        loadClassroomData();
      } else {
        onAlert('error', 'Failed to update classroom!');
      }
    } catch (error) {
      // console.error('Error updating classroom:', error);
      onAlert('error', 'Failed to update classroom!');
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const deleteClassroom = (classroom) => {
    setDeletingClassroom(classroom);
    setIsDeleteModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const confirmDelete = async () => {
    const classroomToDelete = deletingClassroom;
    
    setIsDeleteModalOpen(false);
    setDeletingClassroom(null);
    document.body.style.overflow = 'unset';

    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/class_details/${school_id}/${classroomToDelete.class_id}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ class_id: classroomToDelete.class_id })
      });

      if (response.ok) {
        onAlert('success', `Classroom "${classroomToDelete.class_name}" deleted!`);
        loadClassroomData();
      } else {
        onAlert('error', 'Failed to delete classroom!');
      }
    } catch (error) {
      // console.error('Error deleting classroom:', error);
      onAlert('error', 'Failed to delete classroom!');
    }
  };

  const handleExportToExcel = () => {
    if (window.XLSX) {
      exportToExcel('classroom-table', 'Classroom details.xlsx');
    } else {
      exportToCSVFromData(
        classroomData,
        {
          'Classroom': (row) => row.class_name || '',
          'Children Count': (row) => row.count || 0
        },
        'Classroom_details.csv'
      );
    }
  };

  const classroomColumns = [
    {
      key: 'class_name',
      title: 'Classroom',
      render: (value, row) => (
        <a 
          href={`/application-status?id=${row.class_id}`}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {row.class_name}
        </a>
      )
    },
    {
      key: 'count',
      title: 'Children Count'
    },
    {
      key: 'actions',
      title: 'Action',
      render: (value, row) => (
        <div className="flex gap-2">
          <i 
            className="fas fa-pencil-alt text-blue-600 hover:text-blue-800 cursor-pointer"
            onClick={() => openEditModal(row)}
            title="Edit classroom"
          ></i>
          {row.count === 0 ? (
            <i 
              className="fas fa-trash-alt text-red-600 hover:text-red-800 cursor-pointer ml-2"
              onClick={() => deleteClassroom(row)}
              title="Delete classroom"
            ></i>
          ) : (
            <i 
              className="fas fa-trash-alt text-gray-400 ml-2"
              title="Move children to another classroom before delete"
            ></i>
          )}
        </div>
      ),
      sortable: false
    }
  ];

  return (
    <div className="p-1 sm:p-6 bg-white">
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[60] overflow-hidden">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <i className="fas fa-trash-alt text-red-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Classroom</h3>
                <p className="text-gray-600">Are you sure you want to delete <strong>"{deletingClassroom?.class_name}"</strong>?</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[60] overflow-hidden">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                  <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Update</h3>
                <p className="text-gray-600">Are you sure you want to update this classroom name?</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmUpdate}
                  className="px-4 py-2 bg-[#0F2D52] text-white rounded-md hover:bg-blue-700 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
             <div className='px-6'>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Classroom</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            </div>
            <hr></hr>
            <div className='px-6 py-2'>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label htmlFor="edit_class_name" className="block font-semibold mb-2 text-gray-700">
                  Class Room Name
                </label>
                <input
                  id="edit_class_name"
                  type="text"
                  maxLength="20"
                  value={editClassroomName}
                  onChange={(e) => setEditClassroomName(e.target.value)}
                  className="form-control"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px'
                  }}
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F2D52] text-white rounded-md  transition"
                >
                  Update
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
      
  {/* Form Section */}
  <form id="classRoomForm" className="w-full max-w-4xl mx-auto" onSubmit={handleClassroomSubmit}>
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 ">
      {/* Classroom Input */}
      <div className="flex  flex-grow w-full sm:w-auto gap-2">
       
        <div className="flex flex-col gap-2 w-full sm:w-auto bg-white  ">
        <label htmlFor="class_name" className="font-semibold mb-1 text-gray-700">
          Classroom Name
        </label>
        <input
          name="class_name"
          type="text"
          maxLength="20"
          id="class_name"
          value={classroomName}
          onChange={(e) => setClassroomName(e.target.value)}
          className="border border-gray-300 rounded-md px-1 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        />
        </div>
       {/* Submit Button */}
       <div className="w-full sm:w-auto self-end">
        <button
          type="submit"
          id="classroombtn"
          className="bg-[#0F2D52] text-white font-semibold px-6 py-2 rounded-md w-full sm:w-auto hover:bg-blue-700 transition"
        >
          Add
        </button>
      </div>
      </div>

     
    </div>
  </form>

  {/* Table Section */}
  <div className="mt-8 w-full max-w-6xl mx-auto">
    <div className="bg-white shadow-md rounded-lg overflow-x-auto p-3">
      <DataTable
        data={classroomData}
        columns={classroomColumns}
        loading={loading}
        onExportExcel={handleExportToExcel}
      />
    </div>
  </div>
</div>

  );
};

export default ClassroomRepo;