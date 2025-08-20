# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application for The Goddard School, built with Vite and Tailwind CSS. The application manages parent-child enrollment, forms submission, and administrative tasks for a preschool/childcare center.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Technology Stack
- **Frontend Framework**: React 19.1 with React Router for routing
- **Build Tool**: Vite with React plugin
- **Styling**: Tailwind CSS (using @tailwindcss/vite plugin)
- **Code Quality**: ESLint with React hooks and refresh plugins
- **PDF Generation**: jspdf and html2canvas for form exports
- **Icons**: Lucide React and FontAwesome

### Application Structure

The application has two main user flows:

1. **Admin Flow** (`/admin-dashboard`)
   - Dashboard for school administrators
   - Application status tracking
   - Parent invitation system
   - Forms repository management
   - Classroom repository

2. **Parent Flow** (`/parent-dashboard`)
   - Parent portal for enrollment and forms
   - Child information management
   - Multiple form types: Admission, Authorization, Enrollment Agreement, Parent Handbook
   - PDF generation for completed forms

### Key Directories

- `/src/components/` - Shared UI components (Header, Sidebar, Modals, DataTable, etc.)
- `/src/parentComponent/` - Parent dashboard specific components
- `/src/parentComponent/forms/` - Complex multi-section enrollment forms
- `/src/parentComponent/pdf_forms/` - PDF generation components for each form type
- `/src/services/` - API service layer (formService.js)
- `/src/utils/` - Utility functions for auth, form submission, etc.
- `/src/hooks/` - Custom React hooks (useAuth)

### API Integration

The application connects to AWS API Gateway endpoints:
- Base URL: `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test`
- Key endpoints:
  - `/admission_child_personal/` - Parent and child data management
  - `/child_all_form_details/` - Detailed form data operations
  - Form completion status tracking

### Form System Architecture

The forms system is complex with multiple interconnected components:

1. **Admission Form** - Multi-section form with child info, family history, medical details
2. **Authorization Form** - ACH payment authorization
3. **Parent Handbook** - Policy acknowledgments with 18+ policy sections
4. **Enrollment Agreement** - Terms and conditions with initials required

Each form has:
- A main component in `/src/parentComponent/forms/`
- A PDF export component in `/src/parentComponent/pdf_forms/`
- Validation logic in `/src/services/formService.js`
- Status tracking through the FormSidebar component

### Routing Structure

The application uses dual routing configuration:
- Main routing in `/src/main.jsx` (currently active)
- Alternative routing in `/src/App.jsx` (appears to be legacy)

Note: There's inconsistency in import paths - some components reference `/parent/Components/` while others use `/parentComponent/`

### State Management

The application uses React's built-in state management with useState and useEffect hooks. Authentication state is managed through a custom useAuth hook.

### Important Considerations

1. The application is currently on branch `feature/react-conversion`, suggesting ongoing migration work
2. There are no test files in the main source code - testing strategy needs to be established
3. PDF generation is handled client-side using jspdf and html2canvas
4. Form validation is extensive with specific field requirements for each form type

## Claude Code Agents

Specialized agents have been created to assist with common development tasks:

### 1. Form Validator Agent (`.claude/agents/form-validator.md`)
- Validates multi-section enrollment forms
- Checks required fields and completion status
- Identifies validation errors and suggests fixes
- Manages form status tracking

### 2. API Integration Agent (`.claude/agents/api-integration.md`)
- Manages AWS API Gateway integrations
- Handles API endpoints and error responses
- Implements retry logic and caching
- Manages authentication headers

### 3. PDF Generator Agent (`.claude/agents/pdf-generator.md`)
- Handles PDF generation for all forms
- Customizes PDF layouts and styling
- Optimizes file sizes and formatting
- Manages batch exports

### 4. Component Builder Agent (`.claude/agents/component-builder.md`)
- Creates React components following project patterns
- Builds reusable UI components
- Implements modals, forms, and data tables
- Follows Tailwind CSS conventions

### 5. Route Manager Agent (`.claude/agents/route-manager.md`)
- Manages React Router configuration
- Implements route guards and authentication
- Handles navigation flow
- Resolves routing inconsistencies

Use these agents by referencing their specific documentation when working on related tasks. Each agent contains detailed usage examples, patterns, and best practices specific to their domain.