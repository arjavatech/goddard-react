import React from 'react';
import { useNavigate } from 'react-router-dom';

import Header from './components/Header';

// vaishu changed for select school - start
const SelectSchool = () => {
  const navigate = useNavigate();

  const handleSchoolSelect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex justify-center items-center my-6">
        <div 
          onClick={handleSchoolSelect}
          className="w-[470px] bg-blue-50 shadow-lg rounded-[20px] p-8 cursor-pointer hover:bg-blue-100 transition-all duration-200"
        >
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-[#002e4d] mb-2">Goddard</h3>
            <p className="text-gray-600 text-base">Lynwood</p>
          </div>
        </div>
      </div>
    </div>
  );
};
// vaishu changed for select school - end

export default SelectSchool;