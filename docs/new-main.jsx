import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'

// Auth Components
import Auth0ProviderWithHistory from './auth/Auth0Provider.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import SecureRoute from './components/SecureRoute.jsx'

// Page Components
import AdminDashboardNew from './AdminDashboardNew.jsx'
import ApplicationStatusNew from './ApplicationStatusNew.jsx'
import ParentDashboard from './components/ParentDashboardSimple.jsx'
import InviteParentNew from './InviteParentNew.jsx'
import ParentDetailsNew from './ParentDetailsNew.jsx'
import FormsRepositoryNew from './FormsRepositoryNew.jsx'
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import SelectSchool from './SelectSchool.jsx'

// UI Components
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <Auth0ProviderWithHistory>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<SelectSchool />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Unauthorized page */}
              <Route path="/unauthorized" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Unauthorized</h1>
                    <p className="text-gray-600 mb-6">You don't have permission to access this application.</p>
                    <button 
                      onClick={() => window.location.href = '/login'}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Return to Login
                    </button>
                  </div>
                </div>
              } />
              
              {/* Protected Parent Routes */}
              <Route path="/parent-dashboard" element={
                <SecureRoute requireParent={true}>
                  <ParentDashboard />
                </SecureRoute>
              } />
              
              {/* Protected Admin Routes */}
              <Route path="/admin-dashboard" element={
                <SecureRoute requireAdmin={true}>
                  <AdminDashboardNew />
                </SecureRoute>
              } />
              
              <Route path="/application-status" element={
                <SecureRoute requireAdmin={true}>
                  <ApplicationStatusNew />
                </SecureRoute>
              } />
              
              <Route path="/parent-details" element={
                <SecureRoute requireAdmin={true}>
                  <ParentDetailsNew />
                </SecureRoute>
              } />
              
              <Route path="/invite-parent" element={
                <SecureRoute requireAdmin={true}>
                  <InviteParentNew />
                </SecureRoute>
              } />
              
              <Route path="/forms-repository" element={
                <SecureRoute requireAdmin={true}>
                  <FormsRepositoryNew />
                </SecureRoute>
              } />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Auth0ProviderWithHistory>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>,
)