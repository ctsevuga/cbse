import RoleGuard from './RoleGuard';
const SupplierRoute = ({ user, children }) => (
  <RoleGuard user={user} allowedRoles={['supplier']}>
    {children}
  </RoleGuard>
);
export default SupplierRoute;