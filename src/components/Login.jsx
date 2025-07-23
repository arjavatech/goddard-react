import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import FormLabel from './FormLabel';
import ForgotPasswordModal from './ForgotPasswordModal';
import Alert from './Alert';
import { loginFunction } from '../utils/login';
import Header from './Header';
import { useAlertManager } from './common/AlertManager';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { alert, showAlert, closeAlert } = useAlertManager();
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowProgressModal(true); // Show progress modal

    const result = await loginFunction(formData.email, formData.password);

    if (result.success) {
      showAlert('success', 'You have been signed in successfully!');
      setTimeout(() => {
        setShowProgressModal(false); // Hide modal after redirection
        setIsLoading(false);
        navigate(result.redirect);
      }, 3000);
    } else if (result.error === 'empty') {
      showAlert('error', 'You have to fill all the fields!');
      setShowProgressModal(false);
      setIsLoading(false);
    } else {
      showAlert('error', 'Invalid credentials!');
      setShowProgressModal(false);
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
     <Header></Header>

      <Alert 
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={closeAlert}
      />

      {/* Login Card */}
      <div className="flex justify-center items-center my-6">
        <div className="w-[470px] bg-blue-100 shadow-lg rounded-[20px] p-4">
          <div className="text-center mb-6">
            <img src="image/gs_logo_tab.png" className="w-[100px] h-[100px] mx-auto" alt="logo" />
          </div>
          
          <div className="px-4">
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <FormLabel htmlFor="email_id" required>Email</FormLabel>
                <FormInput
                  id="email_id"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="mb-6">
                <FormLabel htmlFor="login_pswd" required>Password</FormLabel>
                <FormInput
                  id="login_pswd"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  showPasswordToggle={true}
                  showPassword={showPassword}
                  onTogglePassword={togglePassword}
                />
              </div>
              
              <div className="mb-4 ">
               <button 
                  type="submit" 
                  disabled={isLoading || alert.show}
                  className={`w-full rounded-md font-bold py-2 px-4 transition-opacity ${
                    isLoading || alert.show
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#002e4d] text-white hover:opacity-60'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Logging in...
                    </div>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-[#0F2D52] text-xs sm:text-base hover:opacity-60"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm px-4">
          <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex flex-col items-center">
            <svg className="animate-spin h-6 w-6 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-gray-700 text-sm font-medium">Processing login...</span>
          </div>
        </div>
      )}
      
      <ForgotPasswordModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
};

export default Login;