// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

// Import components
import PortalSelection from './components/PortalSelection';
import ClientLogin from './pages/ClientLogin';
import ClientSignup from './pages/ClientSignup';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeSignup from './pages/EmployeeSignup';
import ClientDashboard from './pages/ClientDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

// Import CSS
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PortalSelection />} />

            {/* Client Routes */}
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/signup" element={<ClientSignup />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/employee/dashboard" element={<EmployeeDashboard/>}/>

            {/* Employee Routes */}
            <Route path="/employee/login" element={<EmployeeLogin />} />
            <Route path="/employee/signup" element={<EmployeeSignup />} />

            {/* Protected Dashboard Routes - Placeholder for future */}
            {/* <Route path="/client/dashboard" element={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-2xl font-bold text-gray-900 mb-4">Client Dashboard</h2><p className="text-gray-600">Coming Soon...</p></div></div>} /> */}
            {/* <Route path="/employee/dashboard" element={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-2xl font-bold text-gray-900 mb-4">Employee Dashboard</h2><p className="text-gray-600">Coming Soon...</p></div></div>} /> */}

            {/* Legal Pages - Placeholder for future */}
            <Route path="/terms" element={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-2xl font-bold text-gray-900 mb-4">Terms and Conditions</h2><p className="text-gray-600">Coming Soon...</p></div></div>} />
            <Route path="/privacy" element={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2><p className="text-gray-600">Coming Soon...</p></div></div>} />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
