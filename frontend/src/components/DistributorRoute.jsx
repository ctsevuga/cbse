import RoleGuard from './RoleGuard';
const DistributorRoute = ({ user, children }) => (
  <RoleGuard user={user} allowedRoles={['distributor']}>
    {children}
  </RoleGuard>
);
export default DistributorRoute;