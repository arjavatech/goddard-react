import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './AdminDashboard';
import ApplicationStatus from './ApplicationStatus';
import InviteParent from './components/InviteParent';
import ParentDetails from './components/ParentDetails';
import FormsRepository from './components/FormsRepository';
import ClassroomRepo from './components/ClassroomRepo';
import ParentDashboard from './parent/Components/ParentDashboard';
import { api_base_url, school_id } from './utils/const';
import {SelectSchool } from './components/SelectSchool';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/application-status" element={<ApplicationStatus />} />
        <Route path="/invite-parent" element={<InviteParent />} />
        <Route path="/parent-details" element={<ParentDetails />} />
        <Route path="/forms-repository" element={<FormsRepository />} />
        <Route path="/classroom-repository" element={<ClassroomRepo />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/" element={<SelectSchool />} />
      </Routes>
    </Router>
  );
}

export default App;
