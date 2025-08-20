import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminDashboardNew from './AdminDashboardNew.jsx'
import ApplicationStatus from './ApplicationStatus.jsx'
import './index.css'
import LoginNew from './components/LoginNew.jsx'
import { Toaster } from '@/components/ui/sonner'
// import ParentDashboard from './parent/Components/ParentDashboard.jsx'
import ParentDashboard from './parentComponent/ParentDashboard.jsx'
import InviteParent from './components/InviteParent.jsx'
import ParentDetails from './components/ParentDetails.jsx'
import FormsRepository from './components/FormsRepository.jsx'



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LoginNew />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboardNew />} />
        <Route path="/application-status" element={<ApplicationStatus />} />
        <Route path="/parent-details" element={<ParentDetails></ParentDetails>} />
        <Route path="/invite-parent" element={<InviteParent></InviteParent>} />
        <Route path="/forms-repository" element={<FormsRepository />} />

        <Route path="/login" element={<LoginNew></LoginNew>} />
      </Routes>
      <Toaster />
    </Router>
  </React.StrictMode>,
)