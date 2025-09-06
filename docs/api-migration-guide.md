# API Migration Guide - Goddard React Application

## 🚀 Quick Start Migration

### Step 1: Install & Setup API Services

1. **Add API Services Provider to your app root:**

```javascript
// App.js or main component
import { ApiServicesProvider } from './services/api';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from './hooks/useAuth';

function App() {
  const { getAccessTokenSilently } = useAuth0();
  const { signOut } = useAuth();

  return (
    <ApiServicesProvider 
      getAccessTokenSilently={getAccessTokenSilently} 
      logout={signOut}
    >
      {/* Your app components */}
    </ApiServicesProvider>
  );
}
```

### Step 2: Replace Inline API Calls with Hooks

**Before (Inline API calls):**
```javascript
const [classrooms, setClassrooms] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const loadClassroomData = async () => {
  setLoading(true);
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    const response = await fetch(`${api_base_url}/child_count_with_class_name/${school_id}`, {
      headers
    });
    const data = await response.json();
    setClassrooms(data || []);
    // Process data...
  } catch (error) {
    setError(error);
    toast.error('Failed to load classroom data');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadClassroomData();
}, []);
```

**After (Using Hooks):**
```javascript
import { useClassrooms } from '../hooks/useApiData';

const {
  classrooms,
  stats,
  loading,
  error,
  createClassroom,
  updateClassroom,
  deleteClassroom
} = useClassrooms();
```

## 🔄 Component-by-Component Migration

### FormsRepositoryNew.jsx → FormsRepositoryRefactored.jsx

**Key Changes:**
- **Reduced from 1,299 lines to ~800 lines** (clean separation)
- **Removed 10+ inline fetch calls**
- **Added proper loading states and error handling**
- **Implemented search and filtering through services**

**Migration Steps:**

1. **Replace State Management:**
```javascript
// OLD - Manual state management
const [classrooms, setClassrooms] = useState([]);
const [forms, setForms] = useState([]);
const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(true);

// NEW - Hook-based state
const { classrooms, stats, loading: classroomsLoading } = useClassrooms();
const { allForms, availableForms, loading: formsLoading } = useForms();
const { students, loading: studentsLoading } = useStudents();
```

2. **Replace API Calls:**
```javascript
// OLD - Manual CRUD operations
const handleCreateClassroom = async () => {
  setIsAddingClassroom(true);
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    const response = await fetch(`${api_base_url}/class_form_repository`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_name: newClassroomName, school_id })
    });
    // Handle response...
  } catch (error) {
    // Error handling...
  }
};

// NEW - Service-based operations
const { createClassroom } = useClassrooms();
const handleCreateClassroom = async () => {
  await createClassroom({ name: newClassroomName });
};
```

### Login.jsx Migration

**Migration Pattern:**
```javascript
// OLD - Direct permission checking
const checkUserPermissions = async (email) => {
  const headers = await getAuthHeaders(getAccessTokenSilently);
  const response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, school_id })
  });
  // Handle response...
};

// NEW - Service-based authentication
import { useApiClient } from '../services/api';
const apiClient = useApiClient();

const checkUserPermissions = async (email) => {
  const response = await apiClient.post('/sign_in/check/{school_id}', {
    email,
    school_id: apiClient.schoolId
  }, {
    context: 'Checking user permissions'
  });
  // Response automatically handled with retries, caching, error handling
};
```

## 🛠️ Service Integration Patterns

### Classroom Operations
```javascript
import { useClassrooms } from '../hooks/useApiData';

function ClassroomComponent() {
  const {
    classrooms,
    stats,
    formsByClassroom,
    loading,
    error,
    createClassroom,
    updateClassroom,
    deleteClassroom
  } = useClassrooms();

  const handleCreate = async (classroomData) => {
    try {
      await createClassroom(classroomData);
      // Success feedback handled automatically
    } catch (error) {
      // Error already handled by service
      console.log('Creation failed:', error.message);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorBoundary error={error} />;

  return (
    <div>
      {/* Render classrooms with stats */}
      <Stats data={stats} />
      <ClassroomList data={classrooms} />
    </div>
  );
}
```

### Form Management
```javascript
import { useForms } from '../hooks/useApiData';

function FormComponent() {
  const {
    allForms,
    availableForms,
    formSubmissions,
    loading,
    createForm,
    filterForms
  } = useForms();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Client-side filtering through service
  const filteredForms = filterForms(searchTerm, typeFilter);

  return (
    <div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} />
      <TypeFilter value={typeFilter} onChange={setTypeFilter} />
      <FormList forms={filteredForms} loading={loading} />
    </div>
  );
}
```

### Student Management
```javascript
import { useStudents } from '../hooks/useApiData';

function StudentComponent() {
  const filters = { classroom: 'Grade 1' }; // Optional filters
  
  const {
    students,
    stats,
    loading,
    createStudent,
    assignToClassroom,
    filterStudents
  } = useStudents(filters);

  const handleAssignClassroom = async (studentId, classroomId) => {
    await assignToClassroom(studentId, classroomId);
    // Data automatically refreshed
  };

  return (
    <div>
      <StudentStats data={stats} />
      <StudentList 
        students={students} 
        loading={loading}
        onAssignClassroom={handleAssignClassroom}
      />
    </div>
  );
}
```

## 🔧 Advanced Usage Patterns

### Direct API Client Usage
```javascript
import { useApiClient } from '../services/api';

function AdvancedComponent() {
  const apiClient = useApiClient();

  const fetchCustomData = async () => {
    const response = await apiClient.get('/custom/endpoint', {
      cache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
      retries: 3,
      context: 'Custom data fetch'
    });
    return response;
  };

  const submitForm = async (formData) => {
    const response = await apiClient.post('/forms/submit', formData, {
      timeout: 30000, // 30 seconds for long operations
      context: 'Form submission'
    });
    return response;
  };

  return <div>{/* Component JSX */}</div>;
}
```

### Performance Monitoring
```javascript
import { useApiMetrics } from '../hooks/useApiData';

function PerformanceMonitor() {
  const { metrics, clearCache, healthCheck } = useApiMetrics();

  return (
    <div className="bg-gray-100 p-4 rounded">
      <h3>API Performance</h3>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="text-2xl font-bold">{metrics.total}</div>
          <div className="text-sm">Total Requests</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{metrics.successRate}</div>
          <div className="text-sm">Success Rate</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600">{metrics.cached}</div>
          <div className="text-sm">Cached Requests</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">{metrics.cacheSize}</div>
          <div className="text-sm">Cache Size</div>
        </div>
      </div>
      <button onClick={() => clearCache()}>Clear Cache</button>
    </div>
  );
}
```

## 🧪 Testing Migration

### Mock Service Integration
```javascript
// test-utils.js
import { ApiServicesProvider } from '../services/api';
import { render } from '@testing-library/react';

const createMockServices = () => ({
  getAccessTokenSilently: jest.fn(() => Promise.resolve('mock-token')),
  logout: jest.fn()
});

export const renderWithApiServices = (component, options = {}) => {
  const mockServices = createMockServices();
  
  return render(
    <ApiServicesProvider {...mockServices}>
      {component}
    </ApiServicesProvider>,
    options
  );
};
```

### Component Testing
```javascript
import { renderWithApiServices } from '../test-utils';
import { screen } from '@testing-library/react';
import FormsRepositoryRefactored from '../components/FormsRepositoryRefactored';

test('loads and displays classrooms', async () => {
  renderWithApiServices(<FormsRepositoryRefactored />);
  
  // Loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Grade 1')).toBeInTheDocument();
    expect(screen.getByText('Grade 2')).toBeInTheDocument();
  });
});
```

## 📊 Performance Considerations

### Caching Strategy
```javascript
// Different cache TTLs for different data types
const classroomsConfig = {
  cache: true,
  cacheTTL: 5 * 60 * 1000 // 5 minutes - relatively stable data
};

const studentsConfig = {
  cache: true,
  cacheTTL: 2 * 60 * 1000 // 2 minutes - more dynamic data
};

const formsConfig = {
  cache: true,
  cacheTTL: 10 * 60 * 1000 // 10 minutes - very stable data
};
```

### Request Optimization
```javascript
// Batch related requests
const loadAllData = async () => {
  const [classrooms, forms, students] = await Promise.all([
    classroomService.getClassrooms(),
    formService.getAllForms(),
    studentService.getStudents()
  ]);
  
  return { classrooms, forms, students };
};
```

## 🚨 Common Pitfalls & Solutions

### 1. **Provider Not Wrapped**
```javascript
// ❌ Error: useApiServices must be used within ApiServicesProvider
// Solution: Wrap your app with ApiServicesProvider

// ✅ Correct Setup
<ApiServicesProvider getAccessTokenSilently={getAccessTokenSilently} logout={logout}>
  <App />
</ApiServicesProvider>
```

### 2. **Cache Not Clearing After Mutations**
```javascript
// ❌ Old data showing after create/update/delete
// Services automatically handle this, but for custom operations:

const { clearCache } = useApiMetrics();

const customUpdate = async () => {
  await apiClient.post('/custom/update', data);
  clearCache('related-data'); // Clear specific cache pattern
};
```

### 3. **Missing Error Boundaries**
```javascript
// ✅ Add error boundaries for better UX
function App() {
  return (
    <ErrorBoundary>
      <ApiServicesProvider>
        <YourApp />
      </ApiServicesProvider>
    </ErrorBoundary>
  );
}
```

## 🔄 Rollback Strategy

If issues arise during migration:

1. **Feature Flag Rollback:**
```javascript
const USE_NEW_API = process.env.REACT_APP_USE_NEW_API === 'true';

return USE_NEW_API ? <NewComponent /> : <LegacyComponent />;
```

2. **Gradual Migration:**
```javascript
// Migrate one component at a time
const MIGRATED_COMPONENTS = ['FormsRepository', 'StudentDashboard'];

const shouldUseLegacy = (componentName) => {
  return !MIGRATED_COMPONENTS.includes(componentName);
};
```

## 📞 Support & Troubleshooting

### Debug Mode
```javascript
// Enable detailed logging in development
const apiClient = new ApiClient(getAccessTokenSilently, logout);
apiClient.debug = process.env.NODE_ENV === 'development';
```

### Health Monitoring
```javascript
// Check API health
const { healthCheck } = useApiMetrics();

const checkSystemHealth = async () => {
  const health = await healthCheck();
  console.log('System health:', health);
};
```

---

## 🎯 Migration Checklist

### Pre-Migration:
- [ ] API Services Provider added to app root
- [ ] Legacy API patterns identified and documented
- [ ] Test coverage for existing functionality
- [ ] Feature flags implemented for gradual rollout

### During Migration:
- [ ] Replace inline API calls with service hooks
- [ ] Update loading states and error handling  
- [ ] Remove duplicate API logic
- [ ] Add proper TypeScript types
- [ ] Update tests to use new patterns

### Post-Migration:
- [ ] Remove legacy API client code
- [ ] Update documentation
- [ ] Monitor performance metrics
- [ ] Train team on new patterns

This migration guide provides a systematic approach to modernizing your API architecture while maintaining system stability and developer productivity.