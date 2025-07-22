import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import DataTable from './DataTable';
import Header from './Header';
import AddChildModal from './AddChildModal';
import StatusSelect from './common/StatusSelect';
import { useAlertManager } from './common/AlertManager';
import { exportToExcel, exportToCSVFromData } from './common/ExcelExport';
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';



const ParentDetails = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const { alert, showAlert, closeAlert } = useAlertManager();
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [selectedParentEmail, setSelectedParentEmail] = useState('');
  const { isAuthenticated, signOut } = useAuth();

  // Inside your functional component
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (statusFilter = '') => {
    setLoading(true);
    try {
      const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/parent_invite_status/getall');
      const result = await response.json();

      // console.log('API Response:', result);
      
      let responseData = [];

      if (!statusFilter) {
        responseData =  result.Active||[];
      } else if (statusFilter === "Archive") {
        responseData = result.Archive || [];
      } else if (statusFilter === "Active") {
        responseData = result.Active || [];
      } else if(statusFilter === "All"){
        responseData = result.Active && result.Archive ? [...result.Active, ...result.Archive] : [];
      }
      
      setData(responseData);
    } catch (error) {
      // console.error('Error loading data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    loadData(value);
  };

  const handleResendEmail = async (email) => {
    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/parent_invite_mail/resend/${email}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        showAlert('success', 'Email Sent Successfully!');
      } else {
        showAlert('error', 'Email sending failed!');
      }
    } catch (error) {
      showAlert('error', 'Email sending failed!');
    }
  };

  const handleStatusUpdate = async (parentId, newStatus) => {
    const confirmed = window.confirm("Are you sure?");
    if (!confirmed) {
      window.location.reload();
      return;
    }

    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/update_parent_info_status/${parentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      if (result.message?.includes('updated successfully')) {
        showAlert('success', 'Parent Status Updated!');
        loadData(selectedStatus);
      } else {
        showAlert('error', 'Failed to update status!');
      }
    } catch (error) {
      showAlert('error', 'Failed to update status!');
    }
  };



  const handleExportToExcel = () => {
    if (window.XLSX) {
      exportToExcel('parent-table', 'Parent details.xlsx');
    } else {
      exportToCSVFromData(
        data,
        {
          'Parent Name': (row) => row.parent_name || '',
          'Parent Email': (row) => row.primary_email || row.invite_email || '',
          'Date': (row) => row.time_stamp?.split(' ')[0] || '',
          'Status': (row) => row.status || ''
        },
        'Parent_details.csv'
      );
    }
  };

  const columns = [
    {
    key: 'parent_name',
    title: 'Parent Name',
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
          className={`text-blue-600 underline hover:text-blue-800 ${linkDisabled ? 'pe-none text-dark' : ''}`}
          style={{ cursor: linkDisabled ? 'default' : 'pointer' }}
        >
          {row.parent_name}
        </a>
      );
    }
  },
    {
      key: 'primary_email',
      title: 'Parent Email',
      render: (value, row) => row.primary_email || row.invite_email
    },
    {
      key: 'time_stamp',
      title: 'Date',
      render: (value, row) => row.time_stamp?.split(' ')[0]
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, row) => (
        <div className="relative">
          <select
            className="w-full p-2 border border-blue-900 rounded bg-white appearance-none pr-8"
            value={row.status === 'Active' ? '1' : '2'}
            onChange={(e) => handleStatusUpdate(row.parent_id, e.target.value)}
          >
            <option value="1">Active</option>
            <option value="2">Archive</option>
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        </div>
      ),
      sortable: false
    },
    {
      key: 'actions',
      title: 'Resend Invite',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 rounded text-white ${
              row.invite_status === 'Active' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:opacity-80'
            }`}
            onClick={() => handleResendEmail(row.invite_email)}
            disabled={row.invite_status === 'Active'}
          >
            Send
          </button>
          <button
            className={`px-3 py-2 rounded text-white ${
              row.invite_status === 'Inactive' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:opacity-80'
            }`}
            onClick={() => {
              setSelectedParentEmail(row.invite_email);
              setShowAddChildModal(true);
            }}
            disabled={row.invite_status === 'Inactive'}
          >
            Add Child
          </button>
        </div>
      ),
      sortable: false
    }
  ];

  if (!isAuthenticated) {
    return null;
  }
  return (
    <div>
    {/* Header with Sidebar and Sign Out */}
    <Header onSignOut={signOut} sidebar={true} component="ParentDetails" />
  
    {/* Alert Message */}
    <Alert 
      show={alert.show}
      type={alert.type}
      message={alert.message}
      onClose={closeAlert}
    />
  
    {/* Main Content */}
    <div className="container mx-auto pt-4 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Parent Details</h2>
  
        {/* Invite Parent Button */}
        <div className="flex justify-center mb-6 md:justify-start">
          <a
            href="/invite-parent"
            className="bg-[#002e4d] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Invite Parent
          </a>
        </div>
  
        {/* Status Filter */}
        <div className="flex flex-col sm:flex-row sm:justify-end mb-6 gap-4 sm:gap-6">
          <div className="w-full sm:w-60">
            <StatusSelect
              label="Status"
              value={selectedStatus}
              onChange={handleStatusChange}
              options={[
                { value: 'All', label: 'All' },
                { value: 'Archive', label: 'Archive' },
                { value: 'Active', label: 'Active' }
              ]}
              placeholder="Select status"
            />
          </div>
        </div>
  
        {/* Data Table */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <DataTable
              data={data}
              columns={columns}
              loading={loading}
              onExportExcel={handleExportToExcel}
            />
          </div>
        </div>
      </div>
    </div>
  
    {/* Add Child Modal */}
    <AddChildModal 
      isOpen={showAddChildModal} 
      onClose={() => setShowAddChildModal(false)}
      parentEmail={selectedParentEmail}
    />
  
    {/* External CSS and JS (if still needed) */}
    <link href="https://cdn.datatables.net/1.10.19/css/dataTables.bootstrap4.min.css" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.5.1.js"></script>
    <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
    <script src="https://unpkg.com/xlsx@0.15.1/dist/xlsx.full.min.js"></script>
  </div>
  
  );
};

export default ParentDetails;