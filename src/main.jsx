import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminDashboardNew from './AdminDashboardNew.jsx'
import ApplicationStatusNew from './ApplicationStatusNew.jsx'
import './index.css'
import LoginNew from './components/LoginNew.jsx'
import { Toaster } from '@/components/ui/sonner'
// import ParentDashboard from './parent/Components/ParentDashboard.jsx'
import ParentDashboard from './parentComponent/ParentDashboardNew.jsx'
import InviteParentNew from './InviteParentNew.jsx'
import ParentDetailsNew from './ParentDetailsNew.jsx'
import FormsRepositoryNew from './FormsRepositoryNew.jsx'

import SignUp from './components/SignUp.jsx'



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LoginNew />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboardNew />} />
        <Route path="/application-status" element={<ApplicationStatusNew />} />
        <Route path="/parent-details" element={<ParentDetailsNew></ParentDetailsNew>} />
        <Route path="/invite-parent" element={<InviteParentNew></InviteParentNew>} />
        <Route path="/forms-repository" element={<FormsRepositoryNew />} />

        <Route path="/login" element={<LoginNew></LoginNew>} />

        <Route path="/signup" element={<SignUp></SignUp>} />
      </Routes>
      <Toaster />
    </Router>
  </React.StrictMode>,
)