import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth0ProviderWithHistory from './auth/Auth0Provider';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import AdminDashboard from './AdminDashboard';
import ApplicationStatus from './ApplicationStatus';
import InviteParent from './components/InviteParent';
import ParentDetails from './components/ParentDetails';
import FormsRepository from './components/FormsRepository';
import ClassroomRepo from './components/ClassroomRepo';
import ParentDashboard from './parentComponent/ParentDashboardRefactored';
import { SelectSchool } from './components/SelectSchool';

function App() {
  return (
    <Router>
      <Auth0ProviderWithHistory>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<SelectSchool />} />
          
          {/* Admin-only routes */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/application-status" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <ApplicationStatus />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invite-parent" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <InviteParent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/parent-details" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <ParentDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forms-repository" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <FormsRepository />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/classroom-repository" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <ClassroomRepo />
              </ProtectedRoute>
            } 
          />
          
          {/* Parent routes (admins can also access) */}
          <Route 
            path="/parent-dashboard" 
            element={
              <ProtectedRoute requireParent={true}>
                <ParentDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Auth0ProviderWithHistory>
    </Router>
  );
}

export default App;
