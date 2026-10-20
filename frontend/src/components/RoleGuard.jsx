// components/RoleGuard.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleGuard = ({ user, allowedRoles, children }) => {
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export default RoleGuard;
