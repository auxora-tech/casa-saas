// components/common/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredUserType?: 'client' | 'employee';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredUserType
}) => {
    const { isAuthenticated, userType, loading } = useAuth();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        const redirectPath = requiredUserType === 'employee'
            ? '/employee/signin'
            : '/client/login';
        return <Navigate to={redirectPath} replace />;
    }

    // Check user type if specified
    if (requiredUserType && userType !== requiredUserType) {
        // Redirect to appropriate portal selection or login
        return <Navigate to="/" replace />;
    }

    // Render protected content
    return <>{children}</>;
};

export default ProtectedRoute;
