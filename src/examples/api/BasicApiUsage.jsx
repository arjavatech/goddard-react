/**
 * Basic API Usage Examples
 * Demonstrates how to use the API service layer in React components
 */

import React, { useState, useEffect } from 'react';
import { 
  useGet, 
  usePost, 
  useUsers, 
  useFormSubmissions, 
  useApiCache, 
  useApiMetrics,
  apiService 
} from '../../services/api';

// Example 1: Basic GET request with loading states
export function UserProfile({ userId }) {
  const { data: user, loading, error, retry } = useGet(`/api/users/${userId}`, {
    immediate: true,
    onSuccess: (userData) => {
      console.log('User loaded:', userData.name);
    },
    onError: (error) => {
      console.error('Failed to load user:', error.message);
    }
  });

  if (loading) return <div>Loading user...</div>;
  if (error) return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  );

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}

// Example 2: POST request for form submission
export function CreateUserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });

  const { execute: createUser, loading, error } = usePost('/api/users');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newUser = await createUser({ data: formData });
      console.log('User created:', newUser);
      setFormData({ name: '', email: '', role: 'user' }); // Reset form
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Role:</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="parent">Parent</option>
        </select>
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      
      {error && <p style={{color: 'red'}}>Error: {error.message}</p>}
    </form>
  );
}

// Example 3: Paginated data with search and filtering
export function UsersTable() {
  const {
    data: users,
    pagination,
    loading,
    error,
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
    searchUsers,
    filterByRole
  } = useUsers({
    initialPage: 1,
    initialPageSize: 10
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchUsers(searchQuery);
    }
  };

  const handleRoleFilter = async (role) => {
    setSelectedRole(role);
    if (role) {
      await filterByRole(role);
    }
  };

  return (
    <div>
      {/* Search and Filter Controls */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
        
        <select 
          value={selectedRole} 
          onChange={(e) => handleRoleFilter(e.target.value)}
          style={{ marginLeft: '10px' }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="parent">Parent</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && <div>Loading users...</div>}

      {/* Error State */}
      {error && <div style={{color: 'red'}}>Error: {error.message}</div>}

      {/* Users Table */}
      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {pagination && (
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={prevPage} 
                disabled={!pagination.hasPrev}
              >
                Previous
              </button>
              
              <span style={{ margin: '0 20px' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button 
                onClick={nextPage} 
                disabled={!pagination.hasNext}
              >
                Next
              </button>

              <select
                value={pagination.pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{ marginLeft: '20px' }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Example 4: Form submissions with status management
export function FormSubmissionsManager() {
  const {
    data: submissions,
    loading,
    error,
    filterByStatus,
    filterByForm
  } = useFormSubmissions({
    immediate: true
  });

  const [statusFilter, setStatusFilter] = useState('');

  const handleStatusChange = async (status) => {
    setStatusFilter(status);
    if (status) {
      await filterByStatus(status);
    }
  };

  return (
    <div>
      <h2>Form Submissions</h2>
      
      {/* Status Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label>Filter by Status:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading && <div>Loading submissions...</div>}
      {error && <div style={{color: 'red'}}>Error: {error.message}</div>}

      {!loading && !error && (
        <div>
          {submissions.map((submission) => (
            <div key={submission.id} style={{ 
              border: '1px solid #ccc', 
              padding: '10px', 
              margin: '10px 0' 
            }}>
              <h4>Form ID: {submission.formId}</h4>
              <p>Status: <strong>{submission.status}</strong></p>
              <p>Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(submission.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Example 5: Cache management
export function CacheManager() {
  const { cacheStats, clearCache, invalidateCache, preloadCache } = useApiCache();

  const handleClearAll = () => {
    clearCache();
    alert('Cache cleared!');
  };

  const handleClearPattern = () => {
    clearCache('users'); // Clear all user-related cache entries
    alert('User cache entries cleared!');
  };

  const handlePreload = async () => {
    await preloadCache([
      { url: '/api/users', params: { page: 1 } },
      { url: '/api/forms/submissions', params: { status: 'submitted' } }
    ]);
    alert('Data preloaded into cache!');
  };

  return (
    <div>
      <h2>Cache Management</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Cache Statistics</h3>
        <p>Total Entries: {cacheStats.size}</p>
        <p>Memory Entries: {cacheStats.memorySize}</p>
        <p>Storage Entries: {cacheStats.storageSize}</p>
        <p>Hit Rate: {cacheStats.hitRate.toFixed(2)}%</p>
      </div>

      <div>
        <button onClick={handleClearAll} style={{ marginRight: '10px' }}>
          Clear All Cache
        </button>
        <button onClick={handleClearPattern} style={{ marginRight: '10px' }}>
          Clear User Cache
        </button>
        <button onClick={handlePreload}>
          Preload Common Data
        </button>
      </div>
    </div>
  );
}

// Example 6: API metrics monitoring
export function ApiMetricsMonitor() {
  const { metrics, isLoading, refreshMetrics, resetMetrics, exportMetrics } = useApiMetrics(
    true, // auto-refresh
    5000  // every 5 seconds
  );

  const handleExport = () => {
    const metricsData = exportMetrics();
    const blob = new Blob([metricsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-metrics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div>Loading metrics...</div>;

  return (
    <div>
      <h2>API Performance Metrics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h3>Requests</h3>
          <p>Total: {metrics.totalRequests}</p>
          <p>Success: {metrics.successfulRequests}</p>
          <p>Failed: {metrics.failedRequests}</p>
          <p>Success Rate: {metrics.successRate.toFixed(2)}%</p>
        </div>
        
        <div>
          <h3>Performance</h3>
          <p>Avg Response Time: {metrics.averageResponseTime.toFixed(2)}ms</p>
          <p>Cache Hit Rate: {metrics.cacheHitRate.toFixed(2)}%</p>
          <p>Requests/Min: {metrics.averageRequestsPerMinute.toFixed(2)}</p>
          <p>Uptime: {Math.round(metrics.uptime / 1000)}s</p>
        </div>
        
        <div>
          <h3>Reliability</h3>
          <p>Retry Count: {metrics.retryCount}</p>
          <p>Circuit Breaker Trips: {metrics.circuitBreakerTrips}</p>
          <p>Rate Limit Hits: {metrics.rateLimitHits}</p>
        </div>
      </div>

      <div>
        <button onClick={refreshMetrics} style={{ marginRight: '10px' }}>
          Refresh Metrics
        </button>
        <button onClick={resetMetrics} style={{ marginRight: '10px' }}>
          Reset Metrics
        </button>
        <button onClick={handleExport}>
          Export Metrics
        </button>
      </div>

      {/* Error Breakdown */}
      {Object.keys(metrics.errorsByStatus).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Error Breakdown</h3>
          {Object.entries(metrics.errorsByStatus).map(([status, count]) => (
            <p key={status}>HTTP {status}: {count} errors</p>
          ))}
        </div>
      )}
    </div>
  );
}

// Example 7: Direct API service usage (without hooks)
export function DirectApiExample() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const makeDirectCall = async () => {
    setLoading(true);
    try {
      // Direct API call with custom configuration
      const response = await apiService.request({
        url: '/api/users',
        method: 'GET',
        params: { limit: 5 },
        cache: true,
        cacheTTL: 60000, // 1 minute
        retries: 2
      });
      
      setResult(response.data);
    } catch (error) {
      console.error('Direct API call failed:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Direct API Service Usage</h2>
      <button onClick={makeDirectCall} disabled={loading}>
        {loading ? 'Loading...' : 'Make Direct API Call'}
      </button>
      
      {result && (
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          marginTop: '10px',
          overflow: 'auto'
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default {
  UserProfile,
  CreateUserForm,
  UsersTable,
  FormSubmissionsManager,
  CacheManager,
  ApiMetricsMonitor,
  DirectApiExample
};