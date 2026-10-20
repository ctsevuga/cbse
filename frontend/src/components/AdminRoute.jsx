import React from 'react';
import RoleGuard from './RoleGuard';

const AdminRoute = ({ user, children }) => (
  <RoleGuard user={user} allowedRoles={['admin']}>
    {children}
  </RoleGuard>
);

export default AdminRoute;