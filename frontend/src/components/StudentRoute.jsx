import RoleGuard from "./RoleGuard";

const StudentRoute = ({ user, children }) => (
  <RoleGuard user={user} allowedRoles={["student"]}>
    {children}
  </RoleGuard>
);

export default StudentRoute;