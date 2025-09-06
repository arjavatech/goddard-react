import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminDashboardNew from './AdminDashboardNew.jsx'
import ApplicationStatusNew from './ApplicationStatusNew.jsx'
import './index.css'
import Login from './components/Login.jsx'
import { Toaster } from '@/components/ui/sonner'
import ParentDashboard from './components/ParentDashboardSimple.jsx'
import InviteParentNew from './InviteParentNew.jsx'
import ParentDetailsNew from './ParentDetailsNew.jsx'
import FormsRepositoryClean from './components/FormsRepositoryClean.jsx'
import Auth0ProviderWithHistory from './auth/Auth0Provider.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import SignUp from './components/SignUp.jsx'
import SelectSchool from './SelectSchool.jsx'

// CRITICAL FIX: Import API services provider
import { ApiServicesProvider } from './services/api/index.jsx'
import { useAuth0 } from '@auth0/auth0-react'
import { useAuth } from './hooks/useAuth'


// FIXED: Single API Services wrapper that uses Auth0 context
const AppWithApiServices = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { signOut } = useAuth();

  return (
    <ApiServicesProvider 
      getAccessTokenSilently={getAccessTokenSilently} 
      logout={signOut}
    >
      <Routes>
        <Route path="/" element={<SelectSchool />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected Parent Routes */}
        <Route path="/parent-dashboard" element={
          <PrivateRoute requireParent={true}>
            <ParentDashboard />
          </PrivateRoute>
        } />
        
        {/* Protected Admin Routes */}
        <Route path="/admin-dashboard" element={
          <PrivateRoute requireAdmin={true}>
            <AdminDashboardNew />
          </PrivateRoute>
        } />
        <Route path="/application-status" element={
          <PrivateRoute requireAdmin={true}>
            <ApplicationStatusNew />
          </PrivateRoute>
        } />
        <Route path="/parent-details" element={
          <PrivateRoute requireAdmin={true}>
            <ParentDetailsNew />
          </PrivateRoute>
        } />
        <Route path="/invite-parent" element={
          <PrivateRoute requireAdmin={true}>
            <InviteParentNew />
          </PrivateRoute>
        } />
        <Route path="/forms-repository" element={
          <PrivateRoute requireAdmin={true}>
            <FormsRepositoryClean />
          </PrivateRoute>
        } />
      </Routes>
      <Toaster />
    </ApiServicesProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Auth0ProviderWithHistory>
        {/* FIXED: Single API services provider for entire app */}
        <AppWithApiServices />
      </Auth0ProviderWithHistory>
    </Router>
  </React.StrictMode>,
)