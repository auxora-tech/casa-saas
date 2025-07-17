// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

// Auth Components
import PortalSelection from './components/auth/PortalSelection';
import ClientLogin from './components/auth/ClientLogin';
import ClientSignup from './components/auth/ClientSignup';
import EmployeeLogin from './components/auth/EmployeeLogin';
import EmployeeSignup from './components/auth/EmployeeSignup';

// Dashboard Components
import ClientDashboard from './pages/ClientDashboard';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

// Global Styles
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PortalSelection />} />

            {/* Client Routes */}
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/signup" element={<ClientSignup />} />

            {/* Protected Client Dashboard */}
            <Route
              path="/client/dashboard/*"
              element={
                <ProtectedRoute requiredUserType="client">
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Employee Routes (for future implementation) */}
            <Route path="/employee/login" element={<EmployeeLogin />} />
            <Route path='/employee/signup' element={<EmployeeSignup/>}/>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
