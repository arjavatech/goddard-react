import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';

import Alert from './components/Alert';
import DataTable from './components/DataTable';
import Header from './components/Header';
import StatusSelect from './components/common/StatusSelect';
import { useAlertManager } from './components/common/AlertManager';
import { exportToCSVFromData } from './components/common/ExcelExport';
import { useNavigate } from 'react-router-dom';

const ApplicationStatus = () => {
  const { isAuthenticated, signOut } = useAuth();
 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedForm, setSelectedForm] = useState('');
  const { alert, showAlert, closeAlert } = useAlertManager();

  

// Inside your functional React component
const navigate = useNavigate();

  // Get class ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const classID = urlParams.get('id') || '';

  useEffect(() => {
    if (isAuthenticated) {
      loadClassrooms();
      loadForms();
      loadData();
    }
  }, [isAuthenticated]);

  const loadClassrooms = async () => {
    try {
      const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_details/getall');
      const data = await response.json();
   
      const classroomOptions = [
        { value: '', label: 'All', dataValue: '' },
        ...data.filter(item => item.class_name && item.class_name !== undefined)
          .map(item => ({
            value: item.class_id,
            label: item.class_name,
            dataValue: item.class_name,
            selected: item.class_id === classID
          }))
      ];
      setClassrooms(classroomOptions);
      
      // Set selected classroom if classID exists
      if (classID) {
        setSelectedClassroom(classID);
      }
    } catch (error) {
    }
  };

  const loadForms = async () => {
    try {
      const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/all_form_info/getall');
      const data = await response.json();
      const formOptions = [
        { value: '', label: 'All' },
        ...data.filter(item => item.main_topic && item.main_topic !== undefined)
          .map(item => ({
            value: item.form_id,
            label: item.main_topic
          }))
      ];
      setForms(formOptions);
    } catch (error) {
    }
  };

  const loadData = async (url = null, classroomFilter = null) => {
    setLoading(true);
    try {
      let apiUrl = url;
     
      if (!apiUrl) {
        apiUrl = classID 
       
          ? `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_based_all_child_details/${classID}`
          : 'https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/all_child_status';
      }
      const response = await fetch(apiUrl);
      let responseData = await response.json();

      // Apply filters
      if (!apiUrl.includes('class_based_all_child_details')) {
        if (classroomFilter) {
          responseData = responseData.filter(row => row.class_name === classroomFilter);
        } else {
          responseData = responseData.filter(row => 
            row.class_name !== 'Archive' && row.class_name !== 'Unassigned'
          );
        }
      }

      setData(responseData);
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassroomChange = (value) => {
    setSelectedClassroom(value);
    const selectedOption = classrooms.find(c => c.value === value);
    const classroomDataValue = selectedOption?.dataValue || '';
    
    if (!selectedForm) {
      if (!value) {
        loadData('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/all_child_status');
      } else {
        loadData(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/class_based_all_child_details/${value}`);
      }
    } else if (selectedForm && !classroomDataValue) {
      loadData(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/form_based_all_child_details/${selectedForm}`);
    } else {
      loadData(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/form_based_all_child_details/${selectedForm}`, classroomDataValue);
    }
  };

  const handleFormChange = (value) => {
    setSelectedForm(value);
    setSelectedClassroom('');
    
    if (!value) {
      loadData('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/all_child_status');
    } else {
      loadData(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/form_based_all_child_details/${value}`);
    }
  };

  const getClassroomValue = (className) => {
    return className || 'Unassigned';
  };

  const exportToExcel = () => {
    exportToCSVFromData(
      data,
      {
        'Child Name': (row) => `${row.child_first_name || ''} ${row.child_last_name || ''}`.trim(),
        'Child Class Name': (row) => getClassroomValue(row.class_name),
        'Parent Email': (row) => row.primary_email || '',
        'Parent Two Email': (row) => row.additional_parent_email || '',
        'Form Status': (row) => row.form_status || ''
      },
      'Application_status.csv'
    );
  };

  const columns = [
    {
    key: 'child_name',
    title: 'Child Name',
    render: (value, row) => {
      const linkDisabled = !row.primary_email;
      const handleClick = (e) => {
        e.preventDefault();
        if (!linkDisabled) {
          navigate(`/parent-dashboard?id=${row.primary_email}`);
        }
      };

      return (
        <a
          href="#"
          onClick={handleClick}
          className={`
            ${linkDisabled ? 'pe-none text-dark' : 'pe-auto'} 
            text-blue-600 underline hover:text-blue-800 
            text-sm sm:text-base break-words
          `}
          style={{ cursor: linkDisabled ? 'default' : 'pointer' }}
        >
          {`${row.child_first_name || ''} ${row.child_last_name || ''}`}
        </a>
      );
    }
  },
    {
      key: 'class_name',
      title: 'Class',
      render: (value, row) => (
        <span className="text-sm sm:text-base">{getClassroomValue(row.class_name)}</span>
      )
    },
    {
      key: 'primary_email',
      title: 'Parent Email',
      render: (value, row) => (
        <span className="text-sm sm:text-base break-all">{row.primary_email}</span>
      )
    },
    {
      key: 'additional_parent_email',
      title: 'Parent Two Email',
      render: (value, row) => (
        <span className="text-sm sm:text-base break-all">{row.additional_parent_email}</span>
      )
    },
    {
      key: 'form_status',
      title: 'Status',
      render: (value, row) => (
        <span className="text-sm sm:text-base">{row.form_status}</span>
      )
    },
    {
      key: 'action',
      title: 'Action',
      render: (value, row) => (
        <a
          className="bg-[#002e4d] text-white px-2 py-1 sm:px-3 sm:py-2 rounded text-decoration-none hover:opacity-80 text-xs sm:text-sm whitespace-nowrap"
          href={`mailto:${row.primary_email}?cc=${row.additional_parent_email}`}
        >
          Send Email
        </a>
      )
    }
  ];

  

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onSignOut={signOut} sidebar={true} component={"Application Status"}></Header>
     

      <Alert 
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={closeAlert}
      />

      {/* Main Content */}
      <div className="pt-4">
       

        {/* Content */}
        <div className="container-fluid px-2 sm:px-4 lg:px-6">
          <div className="bg-white rounded-lg shadow-2xl m-2 sm:m-4 p-3 sm:p-6">
            {/* Filters */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-full max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <StatusSelect
                    label="FormList"
                    value={selectedForm}
                    onChange={handleFormChange}
                    options={forms}
                    placeholder="Select form"
                    className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3"
                  />
                  
                  <StatusSelect
                    label="Classroom"
                    value={selectedClassroom}
                    onChange={handleClassroomChange}
                    options={classrooms}
                    placeholder="Select classroom"
                    className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3"
                  />
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="mt-4 sm:mt-8">
              <DataTable
                data={data}
                columns={columns}
                loading={loading}
                onExportExcel={exportToExcel}
                className="application-status-table"
                key={`${selectedClassroom}-${selectedForm}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;