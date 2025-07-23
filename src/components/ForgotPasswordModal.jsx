import React, { useState } from 'react';
import Alert from './Alert';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return reg.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value === '') {
      setEmailError(false);
    } else {
      setEmailError(!validateEmail(value));
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setEmailError(!validateEmail(e.target.value));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/forget_password_mail_trigger/${email}`, {
        method: 'GET'
      });

      const result = await response.json();
      
      if (result.message === "Password reset email sent successfully!") {
        showAlert('success', 'Email send successfully!');
        setEmail('');
      } else if (result.error === `SignUpInfo with email_id ${email} not found`) {
        showAlert('error', 'User not found!');
      } else if (result.error === "We have already sent the password reset page URL to your email. Please check your inbox.") {
        showAlert('error', 'We have already sent the password reset page URL to your email. Please check your inbox.');
      } else {
        showAlert('error', 'User not found!');
      }
    } catch (error) {
      showAlert('error', 'User not found!');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
      if (type === 'success') {
        onClose();
      }
    }, 3000);
  };

  const closeAlert = () => {
    setAlert({ show: false, type: '', message: '' });
  };

  if (!isOpen) return null;

  return (
    <>
      <Alert 
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={closeAlert}
      />

      {/* Modal Backdrop */}
      <div className="fixed inset-0  flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md">
                    <div className="flex justify-between items-center p-4 border-b border-b-gray-200">
                     <h5 className="text-lg font-semibold text-gray-900">Reset Email</h5>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            >
              ×
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="p-4">
            <form onSubmit={handleSendEmail}>
              <div className="mb-4">
                <label htmlFor="email_id" className="block font-bold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  id="email_id"
                  name="email_id"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={loading}
                />
                {emailError && (
                  <span className="text-red-500 text-sm block mt-1">
                    Enter valid input [should be in @ and .].
                  </span>
                )}
              </div>
              
              <div className="w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#002e4d] text-white py-3 rounded-xl font-bold hover:opacity-80 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Email'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordModal;