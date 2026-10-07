import { Navigate } from 'react-router';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If not allowed, redirect to their respective dashboard
    if (userRole === 'counselor') return <Navigate to="/dashboard/counselor" replace />;
    if (userRole === 'trainer') return <Navigate to="/dashboard/trainer" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
