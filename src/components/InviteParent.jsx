import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import { api_base_url, school_id } from '@/utils/const';

const InviteParent = () => {
  const { isAuthenticated, signOut } = useAuth();
  const [formData, setFormData] = useState({
    child_fname: '',
    child_lname: '',
    child_classroom_id: '',
    parent_name: '',
    invite_email: ''

  });
   
  const [classrooms, setClassrooms] = useState([]);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClassroomData();
  }, []);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [loading]);

  const loadClassroomData = async () => {
    try {
      const response = await fetch(`${api_base_url}/class_details/${school_id}`);
      const data = await response.json();
      const classroomOptions = data.filter(item => item.class_name && item.class_name !== undefined)
        .map(item => ({
          id: item.class_id,
          name: item.class_name,
          selected: item.class_name === "Unassign"
        }));
      setClassrooms(classroomOptions);
    } catch (error) {
      // console.error('Error loading classrooms:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'invite_email') {
      if (value === '') {
        setEmailError(false);
      } else {
        const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        const isValid = reg.test(value);
        setEmailError(!isValid);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.child_fname || !formData.child_lname || !formData.child_classroom_id || 
        !formData.parent_name || !formData.invite_email) {
      showAlert('error', 'You have to fill all the fields!');
      return;
    }

    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!reg.test(formData.invite_email)) {
      setEmailError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${api_base_url}/parent_invite_with_mail_trigger/${school_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.error === "Already we send an mail. Please try different email" || 
          result.error === "Email Already Registered with another mail. Please try different email") {
        showAlert('error', 'Email already exists!');
      } else if (result.message === "Parent invite created and Email sent successfully!") {
        showAlert('success', 'Email send successfully!');
        setFormData({
          child_fname: '',
          child_lname: '',
          child_classroom_id: '',
          parent_name: '',
          invite_email: ''
        });
      } else {
        showAlert('error', 'Error!');
      }
    } catch (error) {
      // console.error('Error:', error);
      showAlert('error', 'Error!');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };
if(!isAuthenticated) {
  return null;
}
  return (
    <div>
  {/* Navigation Bar */}
  <Header onSignOut={signOut} sidebar={true} />

  {/* Alert Messages */}
  {alert.show && (
    <div
      className={`fixed top-2 left-4 right-4 z-20 p-4 rounded ${
        alert.type === 'success'
          ? 'bg-green-100 border-green-500 text-green-700'
          : 'bg-red-100 border-red-500 text-red-700'
      } border`}
    >
      <div className="flex justify-between items-center">
        <span>
          <strong>{alert.type === 'success' ? 'Success!' : 'Oops!'}</strong>{' '}
          {alert.message}
        </span>
        <button
          onClick={() => setAlert({ show: false, type: '', message: '' })}
          className={`px-3 py-1 rounded font-bold ${
            alert.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  )}

  {/* Main Content */}
  <div className="flex justify-center px-4 py-6">
    <div className="w-full max-w-4xl bg-blue-100 rounded-2xl shadow-lg">
      {/* Header */}
      <div className="bg-[#002e4d] text-blue-100 p-5 flex items-center justify-center rounded-t-2xl">
        <h2 className="text-lg sm:text-xl font-bold">Invite email sent to parent</h2>
      </div>

      {/* Form Container */}
      <div className="p-5">
        <form id="admission_form" onSubmit={handleSubmit}>
          {/* Child Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="child_first_name" className="font-bold text-gray-700">
                Child First Name
              </label>
              <input
                type="text"
                id="child_first_name"
                name="child_fname"
                value={formData.child_fname}
                onChange={handleInputChange}
                required
                className="w-full p-2 mt-1 bg-white border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              />
            </div>

            <div>
              <label htmlFor="child_last_name" className="font-bold text-gray-700">
                Child Last Name
              </label>
              <input
                type="text"
                id="child_last_name"
                name="child_lname"
                value={formData.child_lname}
                onChange={handleInputChange}
                required
                className="w-full p-2 mt-1 bg-white border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              />
            </div>

            <div>
              <label htmlFor="class_name" className="font-bold text-gray-700">
                Classroom
              </label>
              <select
                id="class_name"
                name="child_classroom_id"
                value={formData.child_classroom_id}
                onChange={handleInputChange}
                required
                className="w-full p-2 mt-1 bg-white border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              >
                <option value="">Select Classroom</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parent Details Header */}
          <h5 className="text-center font-bold text-gray-800 mt-6 mb-4">
            Parent Details
          </h5>

          {/* Parent Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="parent_name" className="font-bold text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="parent_name"
                name="parent_name"
                value={formData.parent_name}
                onChange={handleInputChange}
                required
                className="w-full p-2 mt-1 bg-white border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              />
            </div>

            <div>
              <label htmlFor="parent_email" className="font-bold text-gray-700">
                Invite Email
              </label>
              <input
                type="email"
                id="parent_email"
                name="invite_email"
                value={formData.invite_email}
                onChange={handleInputChange}
                required
                className="w-full p-2 mt-1 bg-white border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              />
              {emailError && (
                <span className="text-red-500 text-sm mt-1 block">
                  Enter valid input [should contain @ and .]
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="/parent-details"
              className="bg-blue-100 text-[#0F2D52] border border-[#0F2D52] px-6 py-3 rounded font-semibold hover:opacity-60 transition duration-200 w-full sm:w-auto text-center"
            >
              Cancel
            </a>
            <button
              type="submit"
              className="bg-[#0F2D52] text-white px-6 py-3 rounded font-semibold hover:opacity-70 transition duration-200 w-full sm:w-auto"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  {/* Loading Modal */}
  {loading && (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm px-4 overflow-hidden"
      onClick={(e) => e.preventDefault()}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
      style={{ touchAction: 'none' }}
    >
      <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex flex-col items-center">
        <svg className="animate-spin h-6 w-6 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-gray-700 text-sm font-medium">Sending Invitation...</span>
      </div>
    </div>
  )}
</div>

  );
};

export default InviteParent;