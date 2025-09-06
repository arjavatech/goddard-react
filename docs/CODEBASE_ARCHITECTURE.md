# Goddard React Application - Codebase Architecture

## Overview

The Goddard React application is a multi-tenant educational management system built with React 19, featuring Auth0 authentication, role-based access control, and comprehensive form management for parent enrollment and school administration.

## Technology Stack

### Core Technologies
- **Frontend**: React 19.1.0 with Vite
- **Routing**: React Router DOM 7.6.3
- **Authentication**: Auth0 React 2.4.0
- **State Management**: React Hook Form 7.62.0 with Zod validation
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Data Fetching**: TanStack React Query 5.85.5
- **Testing**: Vitest 3.2.4, Playwright 1.55.0, Testing Library

### Key Features
- Multi-tenant architecture with school isolation
- Role-based access control (Admin, Parent, Teacher)
- Comprehensive form management system
- Advanced API client with caching, retries, and deduplication
- Real-time authentication state management
- PDF generation and export capabilities
- Progressive web app features

## System Architecture

```mermaid
graph TB
    subgraph "Frontend Application"
        A[Main Entry Point<br/>main.jsx] --> B[Auth0Provider<br/>Authentication Wrapper]
        B --> C[ApiServicesProvider<br/>Centralized API Management]
        C --> D[Router<br/>Route Management]
        
        subgraph "Route Protection"
            D --> E[ProtectedRoute<br/>Role-based Access]
            E --> F[Admin Routes]
            E --> G[Parent Routes]
            E --> H[Public Routes]
        end
        
        subgraph "Core Components"
            F --> I[AdminDashboard]
            F --> J[FormsRepository]
            F --> K[ParentDetails]
            G --> L[ParentDashboard]
            G --> M[EnrollmentForms]
            H --> N[Login/SignUp]
            H --> O[SelectSchool]
        end
    end
    
    subgraph "Services Layer"
        P[ApiClient<br/>Central HTTP Client] --> Q[Authentication<br/>Auth0 Integration]
        P --> R[Caching Layer<br/>TTL Cache]
        P --> S[Retry Logic<br/>Error Handling]
        P --> T[Request Deduplication]
        
        U[FormService] --> P
        V[ClassroomService] --> P
        W[StudentService] --> P
    end
    
    subgraph "Backend Integration"
        X[AWS API Gateway<br/>REST Endpoints]
        Y[Multi-tenant Database]
        Z[Auth0 Identity Provider]
    end
    
    P --> X
    Q --> Z
    X --> Y
```

## Directory Structure Analysis

### Root Structure
```
goddard-react/
├── src/                    # Source code
├── tests/                  # Test infrastructure
├── docs/                   # Documentation
├── public/                 # Static assets
├── dist/                   # Build output
└── config files           # Package.json, vite.config, etc.
```

### Source Code Organization

```mermaid
graph TD
    A[src/] --> B[components/]
    A --> C[services/]
    A --> D[hooks/]
    A --> E[utils/]
    A --> F[contexts/]
    A --> G[parentComponent/]
    
    B --> B1[ui/ - Reusable UI Components]
    B --> B2[common/ - Shared Components]
    B --> B3[dashboard/ - Dashboard Components]
    B --> B4[optimized/ - Performance Optimized]
    
    C --> C1[api/ - API Services]
    C --> C2[auth/ - Authentication]
    C --> C3[permissions/ - Access Control]
    C --> C4[cache/ - Caching Logic]
    
    D --> D1[useAuth - Authentication Hook]
    D --> D2[useApiData - Data Fetching]
    D --> D3[usePermissions - Access Control]
    
    E --> E1[auth.js - Auth Utilities]
    E --> E2[formSubmission.js - Form Logic]
    E --> E3[errorHandler.js - Error Management]
    
    G --> G1[forms/ - Complex Form Components]
    G --> G2[pdf_forms/ - PDF Generation]
```

## Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as Auth0Provider
    participant P as ProtectedRoute
    participant API as ApiClient
    participant BE as Backend
    
    U->>A: Access Application
    A->>A: Check Auth State
    
    alt Not Authenticated
        A->>U: Redirect to Auth0 Login
        U->>A: Complete Authentication
        A->>A: Store Token in LocalStorage
    end
    
    A->>P: Route Access Request
    P->>P: Check User Roles/Permissions
    
    alt Authorized
        P->>U: Allow Access to Component
        U->>API: Make API Request
        API->>API: Get Token from Auth0
        API->>BE: Authenticated Request
        BE->>API: Response
        API->>U: Data
    else Unauthorized
        P->>U: Show Access Denied
    end
```

## API Architecture

```mermaid
graph TB
    subgraph "Frontend API Layer"
        A[useApiServices Hook] --> B[ApiClient Instance]
        
        subgraph "Service Layer"
            C[FormService]
            D[ClassroomService] 
            E[StudentService]
        end
        
        C --> B
        D --> B
        E --> B
        
        subgraph "ApiClient Features"
            F[Request Deduplication]
            G[Response Caching]
            H[Retry Logic]
            I[Error Handling]
            J[Auth Token Management]
        end
        
        B --> F
        B --> G
        B --> H
        B --> I
        B --> J
    end
    
    subgraph "Backend Services"
        K[AWS API Gateway]
        L[Lambda Functions]
        M[Multi-tenant Database]
        N[Auth0 Management API]
    end
    
    B --> K
    K --> L
    L --> M
    J --> N
```

## Form Management System

```mermaid
graph TD
    subgraph "Form Architecture"
        A[Form Components] --> B[React Hook Form]
        B --> C[Zod Schema Validation]
        
        subgraph "Form Types"
            D[EnrollmentForm]
            E[AdmissionForm]
            F[AuthorizationForm]
            G[ParentHandbook]
        end
        
        A --> D
        A --> E
        A --> F
        A --> G
        
        subgraph "Form Features"
            H[Multi-step Navigation]
            I[Auto-save Functionality]
            J[PDF Generation]
            K[Progress Tracking]
            L[Conditional Logic]
        end
        
        D --> H
        D --> I
        D --> J
        D --> K
        D --> L
    end
    
    subgraph "Form Processing"
        M[Form Submission Handler] --> N[Data Validation]
        N --> O[API Integration]
        O --> P[Progress Updates]
        P --> Q[Success/Error Handling]
    end
    
    B --> M
```

## Component Hierarchy

```mermaid
graph TD
    subgraph "App Structure"
        A[main.jsx] --> B[Auth0Provider]
        B --> C[ApiServicesProvider]
        C --> D[Router]
        
        subgraph "Route Components"
            D --> E[SelectSchool - Public]
            D --> F[Login/SignUp - Public]
            D --> G[ProtectedRoute - Admin]
            D --> H[ProtectedRoute - Parent]
        end
        
        subgraph "Admin Components"
            G --> I[AdminDashboard]
            G --> J[ApplicationStatus]
            G --> K[FormsRepository]
            G --> L[ParentDetails]
            G --> M[InviteParent]
        end
        
        subgraph "Parent Components"
            H --> N[ParentDashboard]
            N --> O[ChildTabs]
            N --> P[FormSidebar]
            N --> Q[CompletedFormsTable]
        end
        
        subgraph "Shared UI"
            R[Header/Navigation]
            S[LoadingSpinner]
            T[ErrorBoundary]
            U[AlertManager]
        end
        
        I --> R
        N --> R
        All --> S
        All --> T
        All --> U
    end
```

## Multi-tenant Architecture

```mermaid
graph LR
    subgraph "Multi-tenant Isolation"
        A[School Selection] --> B[School ID Context]
        B --> C[API Requests with School ID]
        
        subgraph "Data Isolation"
            D[School A Data]
            E[School B Data]
            F[School C Data]
        end
        
        C --> D
        C --> E
        C --> F
        
        subgraph "User Context"
            G[Admin - Multiple Schools]
            H[Parent - Single School]
            I[Teacher - Single School]
        end
        
        B --> G
        B --> H
        B --> I
    end
```

## State Management

```mermaid
graph TB
    subgraph "State Architecture"
        A[Authentication State<br/>Auth0 + useAuth] --> B[API State<br/>React Query]
        A --> C[Form State<br/>React Hook Form]
        A --> D[UI State<br/>Local useState]
        
        subgraph "Global State"
            E[AuthContext]
            F[ApiServicesContext]
            G[PermissionContext]
        end
        
        A --> E
        B --> F
        A --> G
        
        subgraph "Local State"
            H[Component State]
            I[Form Validation]
            J[Loading States]
            K[Error States]
        end
        
        C --> H
        C --> I
        B --> J
        B --> K
    end
```

## Testing Architecture

```mermaid
graph TB
    subgraph "Testing Strategy"
        A[Unit Tests<br/>Vitest + Testing Library] --> B[Component Tests]
        A --> C[Hook Tests]
        A --> D[Service Tests]
        
        E[Integration Tests<br/>API Integration] --> F[Form Submission]
        E --> G[Authentication Flow]
        
        H[E2E Tests<br/>Playwright] --> I[User Workflows]
        H --> J[Cross-browser Testing]
        
        subgraph "Test Coverage"
            K[Components: ~80%]
            L[Services: ~90%]
            M[Utils: ~95%]
        end
        
        B --> K
        D --> L
        C --> M
    end
```

## Key Architectural Patterns

### 1. Service Layer Pattern
- Centralized API client with service abstraction
- Dependency injection through React Context
- Separation of concerns between UI and data logic

### 2. Protected Route Pattern
- Role-based access control
- Route-level authentication checks
- Flexible permission system

### 3. Form Management Pattern
- Multi-step form navigation
- Centralized validation with Zod schemas
- Auto-save and progress tracking

### 4. Error Boundary Pattern
- Graceful error handling
- Fallback UI components
- Error reporting and recovery

### 5. Multi-tenant Pattern
- School-based data isolation
- Context-aware API requests
- Role-based access per tenant

## Performance Optimizations

1. **Request Deduplication**: Prevents duplicate concurrent API calls
2. **Response Caching**: TTL-based caching for GET requests
3. **Code Splitting**: Route-based lazy loading
4. **Optimized Re-renders**: Memoization and selective updates
5. **Progressive Loading**: Skeleton screens and loading states

## Security Considerations

1. **Authentication**: Auth0 integration with secure token management
2. **Authorization**: Fine-grained role and permission checks
3. **HTTPS**: All API communications encrypted
4. **Token Refresh**: Automatic token refresh handling
5. **XSS Protection**: Input sanitization and validation
6. **CSRF Protection**: Token-based request authentication

## Deployment Architecture

The application is designed for cloud deployment with:
- Static hosting (Vite build output)
- CDN distribution for assets
- Environment-based configuration
- CI/CD pipeline integration
- Multi-environment support (dev, staging, prod)

This architecture provides a scalable, maintainable, and secure foundation for the Goddard Schools management system.