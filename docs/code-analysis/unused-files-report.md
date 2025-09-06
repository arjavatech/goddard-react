# Code Quality Analysis Report: Unused Files
**Generated:** goddard-react

## 📊 Project Statistics
- **Total files analyzed:** 243
- **Files with imports:** 217
- **Files with exports:** 235
- **Empty/minimal files:** 2
- **Potentially unused files:** 116

## 🗑️ Potentially Unused Files

### src/setupTests.js
**Lines:** 5
**Issues:**
- Never imported by any file
- Has no exports
- File is empty or has minimal content
- Test file not in main application flow

### src/parentComponent/js/parentdashboard.js
**Lines:** 0
**Issues:**
- Never imported by any file
- Has no exports
- File is empty or has minimal content

### src/tests/hooks/useParentDashboard.test.js
**Lines:** 357
**Issues:**
- Never imported by any file
- Has no exports
- Test file not in main application flow

### src/tests/performance/performanceTests.js
**Lines:** 350
**Issues:**
- Never imported by any file
- Has no exports
- Test file not in main application flow

### src/tests/services/unifiedParentService.test.js
**Lines:** 304
**Issues:**
- Never imported by any file
- Has no exports
- Test file not in main application flow

### src/main-fixed.jsx
**Lines:** 86
**Issues:**
- Never imported by any file
- Has no exports

### src/main.jsx
**Lines:** 92
**Issues:**
- Never imported by any file
- Has no exports

### src/tests/formSubmissionTest.js
**Lines:** 134
**Issues:**
- Never imported by any file
- Test file not in main application flow

### src/utils/apiTestHelper.js
**Lines:** 197
**Issues:**
- Never imported by any file
- Test file not in main application flow

### src/components/FormsRepositoryRefactored.jsx
**Lines:** 741
**Issues:**
- Never imported by any file
- Potential duplicate of another file

### src/components/LoginNew.jsx
**Lines:** 369
**Issues:**
- Never imported by any file
- Potential duplicate of another file

### src/components/DataTableNew.jsx
**Lines:** 313
**Issues:**
- Never imported by any file
- Potential duplicate of another file

### src/components/AuthTestRoute.jsx
**Lines:** 37
**Issues:**
- Never imported by any file
- Test file not in main application flow

### src/components/LoginFixed.jsx
**Lines:** 357
**Issues:**
- Never imported by any file
- Potential duplicate of another file

### src/components/AddChildModalNew.jsx
**Lines:** 347
**Issues:**
- Never imported by any file
- Potential duplicate of another file

### src/services/api/core/ApiClientFixed.js
**Lines:** 303
**Issues:**
- Never imported by any file
- Potential duplicate of another file

### src/tests/api/ApiClient.test.js
**Lines:** 522
**Issues:**
- Never imported by any file
- Test file not in main application flow

### src/FormsRepositoryNew.jsx
**Lines:** 1300
**Issues:**
- Potential duplicate of another file

### src/InviteParentNew.jsx
**Lines:** 444
**Issues:**
- Potential duplicate of another file

### src/AdminDashboardNew.jsx
**Lines:** 226
**Issues:**
- Potential duplicate of another file

## 🔄 Duplicate Component Groups

### FormsRepository variants:
- **src/FormsRepositoryNew.jsx** (1300 lines)
- **src/components/FormsRepositoryRefactored.jsx** (741 lines)
- **src/components/FormsRepositoryClean.jsx** (384 lines)

### ParentDashboard variants:
- **src/components/ParentDashboardSimple.jsx** (290 lines)
- **src/parentComponent/ParentDashboardNew.jsx** (1042 lines)
- **src/parentComponent/ParentDashboardWrapper.jsx** (123 lines)
- **src/parentComponent/ParentDashboardRefactored.jsx** (350 lines)

### Login variants:
- **src/components/LoginNew.jsx** (369 lines)
- **src/components/LoginFixed.jsx** (357 lines)

## 💡 Recommendations
- SAFE TO DELETE: 17 files with multiple issues or empty content
- CONSOLIDATE: 3 groups of duplicate components found
- REVIEW: 8 test files may be orphaned

📋 **Detailed report saved to:** docs/code-analysis/unused-files-detailed.json
