import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { 
  ProtectedRoute, 
  AdminRoute, 
  ParentRoute,
  ResourceProtectedRoute 
} from './components/ProtectedRoute';
import Login from './components/Login';
import AdminDashboard from './AdminDashboard';
import ApplicationStatus from './ApplicationStatus';
import InviteParent from './components/InviteParent';
import ParentDetails from './components/ParentDetails';
import FormsRepository from './components/FormsRepository';
import ClassroomRepo from './components/ClassroomRepo';
import ParentDashboard from './parentComponent/ParentDashboardRefactored';
import { SelectSchool } from './components/SelectSchool';

// Error Boundary Component for auth errors
class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Auth Error:', error, errorInfo);
    // You can log to error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
          <div className=\"text-center\">
            <h2 className=\"text-2xl font-bold text-red-600 mb-4\">Authentication Error</h2>
            <p className=\"text-gray-600 mb-4\">Something went wrong with authentication.</p>
            <button 
              onClick={() => window.location.reload()}
              className=\"bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded\"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <AuthErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path=\"/login\" element={<Login />} />
            <Route path=\"/\" element={<SelectSchool />} />
            
            {/* Admin-only routes with specific permissions */}
            <Route 
              path=\"/admin-dashboard\" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            <Route 
              path=\"/application-status\" 
              element={
                <ResourceProtectedRoute resource=\"applications\" action=\"read\">
                  <ApplicationStatus />
                </ResourceProtectedRoute>
              } 
            />
            
            <Route 
              path=\"/invite-parent\" 
              element={
                <ResourceProtectedRoute resource=\"parents\" action=\"invite\">
                  <InviteParent />
                </ResourceProtectedRoute>
              } 
            />
            
            <Route 
              path=\"/parent-details\" 
              element={
                <ResourceProtectedRoute resource=\"parents\" action=\"read\">
                  <ParentDetails />
                </ResourceProtectedRoute>
              } 
            />
            
            <Route 
              path=\"/forms-repository\" 
              element={
                <ResourceProtectedRoute resource=\"forms\" action=\"manage\">
                  <FormsRepository />
                </ResourceProtectedRoute>
              } 
            />
            
            <Route 
              path=\"/classroom-repository\" 
              element={
                <ResourceProtectedRoute resource=\"classrooms\" action=\"manage\">
                  <ClassroomRepo />
                </ResourceProtectedRoute>
              } 
            />
            
            {/* Parent routes (admins can also access with proper permissions) */}
            <Route 
              path=\"/parent-dashboard\" 
              element={
                <ParentRoute>
                  <ParentDashboard />
                </ParentRoute>
              } 
            />
            
            {/* Advanced protected routes with multiple requirements */}
            <Route 
              path=\"/super-admin\" 
              element={
                <ProtectedRoute 
                  requiredPermissions=\"super_admin\"
                  requireEmailVerification={true}
                  onForbidden={() => console.log('Super admin access denied')}
                >
                  <div>Super Admin Panel</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Multi-tenant aware route example */}
            <Route 
              path=\"/tenant/:tenantId/admin\" 
              element={
                <ProtectedRoute 
                  requiredRoles={['admin', 'tenant_admin']}
                  requireAll={false}
                  onForbidden={() => alert('Access denied to tenant administration')}
                >
                  <div>Tenant Admin Panel</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route for 404 */}
            <Route 
              path=\"*\" 
              element={
                <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
                  <div className=\"text-center\">
                    <h1 className=\"text-4xl font-bold text-gray-800 mb-4\">404</h1>
                    <p className=\"text-gray-600 mb-4\">Page not found</p>
                    <button 
                      onClick={() => window.history.back()}
                      className=\"bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded\"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </AuthProvider>
      </Router>
    </AuthErrorBoundary>
  );
}

export default App;