import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const userRole = localStorage.getItem('userRole');

  if (userRole !== requiredRole) {
    return <Navigate to="/veiw" />;
  }

  return children;
};

export default ProtectedRoute;
