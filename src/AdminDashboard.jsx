import React from 'react';
import { useAuth } from './hooks/useAuth';

import DashboardCard from './components/DashboardCard';
import Header from './components/Header';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Application Status',
      href: '/application-status',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="text-goddard-blue text-[#002e4d]" viewBox="0 0 16 16">
          <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1z" />
        </svg>
      )
    },
    {
      title: 'Parent Details',
      href: '/parent-details',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="text-goddard-blue" viewBox="0 0 16 16">
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
        </svg>
      )
    },
    {
      title: 'Classroom | Form Manage',
      href: '/forms-repository',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="text-goddard-blue" viewBox="0 0 16 16">
          <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1h-4z"/>
        </svg>
      )
    }
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div >
<Header onSignOut={signOut}></Header>      
      {/* Admin Dashboard */}
      <div className="container mx-auto px-4">
        <h2 className="text-[#0F2D52] text-xl lg:text-3xl font-medium pt-6 text-center">Admin Dashboard</h2>
        
        <div className="grid grid-cols-1 min-[450px]:grid-cols-2  lg:grid-cols-3 gap-4 min-[470px]:gap-6 md:ms-5 mb-12 mt-8 lg:m-12">
          {dashboardCards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              href={card.href}
              icon={card.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;