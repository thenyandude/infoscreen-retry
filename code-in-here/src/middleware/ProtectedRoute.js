import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const userRole = localStorage.getItem('userRole');
  const isApproved = localStorage.getItem('isApproved'); 

  if (userRole !== requiredRole || isApproved !== 'true') {
    return <Navigate to="/v" />;
  }

  return children;
};


export default ProtectedRoute;
