import RoleGuard from "./RoleGuard";

const SuperAdminRoute = ({ user, children }) => (
  <RoleGuard user={user} allowedRoles={["superAdmin"]}>
    {children}
  </RoleGuard>
);

export default SuperAdminRoute;