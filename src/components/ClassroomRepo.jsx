import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import { exportToExcel, exportToCSVFromData } from './common/ExcelExport';

const ClassroomRepo = ({ onAlert }) => {
  const [classroomName, setClassroomName] = useState('');
  const [classroomData, setClassroomData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClassroomData();
    
    // Check for edit ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const editID = urlParams.get('id');
    if (editID) {
      loadClassroomForEdit(editID);
    }
  }, []);

  const loadClassroomData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/child_count_with_class_name');
      const data = await response.json();
      setClassroomData(data);
    } catch (error) {
      // console.error('Error loading classroom data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassroomForEdit = async (id) => {
    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_details/get/${id}`);
      const data = await response.json();
      if (data.class_name) {
        setClassroomName(data.class_name);
      }
    } catch (error) {
      // console.error('Error loading classroom for edit:', error);
    }
  };

  const handleClassroomSubmit = async (e) => {
    e.preventDefault();
    
    if (!classroomName.trim()) {
      onAlert('error', 'You have to fill all the fields!');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const editID = urlParams.get('id');

    try {
      let url, method, body;
      
      if (editID) {
        const confirmed = window.confirm("Are you sure?");
        if (!confirmed) return;
        
        url = `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_details/update/${editID}`;
        method = 'PUT';
        body = JSON.stringify({ class_name: classroomName, class_id: editID });
      } else {
        url = 'https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_details/create';
        method = 'POST';
        body = JSON.stringify({ class_name: classroomName });
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (response.ok) {
        onAlert('success', editID ? 'Class room name updated!' : 'Classroom was successfully added!');
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

  const deleteClassroom = async (id) => {
    const confirmed = window.confirm("Are you sure?");
    if (!confirmed) return;

    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_details/delete/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: id })
      });

      if (response.ok) {
        onAlert('success', 'Class room name deleted!');
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
          <a href={`/forms-repository?id=${row.class_id}`}>
            <i className="fas fa-pencil-alt text-blue-600 hover:text-blue-800 cursor-pointer"></i>
          </a>
          {row.count === 0 ? (
            <i 
              className="fas fa-trash-alt text-red-600 hover:text-red-800 cursor-pointer ml-2"
              onClick={() => deleteClassroom(row.class_id)}
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
    <div className="p-4 sm:p-6 bg-white">
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
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
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