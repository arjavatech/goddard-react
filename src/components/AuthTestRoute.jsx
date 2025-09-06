/**
 * Simple Route Example for Adding AuthenticationTest Component
 * 
 * Add this route to your main router to make the test component accessible.
 * This can be added temporarily for testing purposes.
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthenticationTest from './AuthenticationTest';

// Example of how to add the auth test route
const ExampleRouting = () => {
  return (
    <Routes>
      {/* Your existing routes */}
      <Route path="/" element={<div>Home</div>} />
      <Route path="/dashboard" element={<div>Dashboard</div>} />
      <Route path="/forms" element={<div>Forms</div>} />
      
      {/* Add this route for authentication testing */}
      <Route path="/auth-test" element={<AuthenticationTest />} />
      
      {/* Your other routes */}
    </Routes>
  );
};

export default ExampleRouting;

// Alternative: Add directly to your existing App.jsx or main router file:
/*
import AuthenticationTest from './components/AuthenticationTest';

// Inside your Routes component:
<Route path="/auth-test" element={<AuthenticationTest />} />
*/