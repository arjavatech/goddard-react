import React, { useState } from 'react';

function Sidebar({ activeItem }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'Dashboard',
      href : '/admin-dashboard',
      label: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="p-2" viewBox="0 0 16 16">
          <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z" />
        </svg>
      )
    },
    {
      id: 'Application Status',
      href : '/application-status',
      label: 'Application Status',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="p-2" viewBox="0 0 16 16">
          <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1z" />
        </svg>
      )
    },
    {
      id: 'ParentDetails',
      href : '/parent-details',
      label: 'Parent Details',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="p-2" viewBox="0 0 16 16">
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        </svg>
      )
    },
    {
      id: 'ClassroomFormManage',
      href :"/forms-repository",
      label: 'Classroom | Form Manage',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="p-2" viewBox="0 0 16 16">
          <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1h-4z" />
        </svg>
      )
    }
  ];

  const handleMenuClick = (itemId) => {
    // console.log(`${itemId} clicked`);
    setIsOpen(false);
    // Navigate to the corresponding page
    window.location.href = menuItems.find(item => item.id === itemId).href;
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#0F2D52] hover:bg-[#21446f] focus:shadow-none focus:outline-none border-0 text-white p-2 sm:p-3 rounded transition-colors"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
        </svg>
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 p-4" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-white transform transition-transform duration-300 z-50 shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="p-4 sm:p-5 text-[#0F2D52] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex justify-between items-center">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Admin Menu</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-1"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-3 sm:p-4">
          <ul className="flex flex-col space-y-1 sm:space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center text-left px-2 sm:px-3 py-2 sm:py-3 rounded font-bold transition-colors text-sm sm:text-base ${
                    activeItem === item.id
                      ? 'bg-[#0F2D52] text-white'
                      : 'text-[#0F2D52] hover:bg-[#4c6788] hover:text-white'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {React.cloneElement(item.icon, {
                      className: 'w-6 h-6 sm:w-8 sm:h-8 p-1'
                    })}
                  </div>
                  <span className="ml-2 sm:ml-3 truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Sidebar;