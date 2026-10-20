import React from "react";
import RoleGuard from "./RoleGuard";

/**
 * ======================================================
 * Authenticated User Route
 * ======================================================
 *
 * Allows any authenticated user with a valid application
 * role to access the protected route.
 *
 * Roles:
 * - SUPER_ADMIN
 * - SCHOOL_ADMIN
 * - HM
 * - TEACHER
 * - STUDENT
 * - PARENT
 *
 * Used for routes such as:
 * - My School
 * - View School
 * - School Users
 *
 * NOTE:
 * This guard only controls frontend access.
 * Backend authorization must still be enforced by
 * protect middleware and controller-level school scope.
 */
export const AuthenticatedRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={[
      "SUPER_ADMIN",
      "SCHOOL_ADMIN",
      "HM",
      "TEACHER",
      "STUDENT",
      "PARENT",
    ]}
  >
    {children}
  </RoleGuard>
);

/**
 * ======================================================
 * Individual Role Guards
 * ======================================================
 */

/**
 * SUPER_ADMIN only
 */
export const SuperAdminRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={["SUPER_ADMIN"]}
  >
    {children}
  </RoleGuard>
);

/**
 * SCHOOL_ADMIN only
 */
export const SchoolAdminRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={["SCHOOL_ADMIN"]}
  >
    {children}
  </RoleGuard>
);

/**
 * HM only
 */
export const HMRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={["HM"]}
  >
    {children}
  </RoleGuard>
);

/**
 * TEACHER only
 */
export const TeacherRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={["TEACHER"]}
  >
    {children}
  </RoleGuard>
);

/**
 * STUDENT only
 */
export const StudentRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={["STUDENT"]}
  >
    {children}
  </RoleGuard>
);

/**
 * PARENT only
 */
export const ParentRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={["PARENT"]}
  >
    {children}
  </RoleGuard>
);

/**
 * ======================================================
 * Combined Role Guards
 * ======================================================
 */

/**
 * SCHOOL_ADMIN or SUPER_ADMIN
 *
 * Used for:
 * - User management
 * - Admin-level management
 */
export const AdminOrSuperAdminRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={[
      "SCHOOL_ADMIN",
      "SUPER_ADMIN",
    ]}
  >
    {children}
  </RoleGuard>
);

/**
 * HM or SCHOOL_ADMIN
 */
export const HMOrAdminRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={[
      "HM",
      "SCHOOL_ADMIN",
    ]}
  >
    {children}
  </RoleGuard>
);

/**
 * TEACHER or HM
 */
export const TeacherOrHMRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={[
      "TEACHER",
      "HM",
    ]}
  >
    {children}
  </RoleGuard>
);

/**
 * TEACHER or HM or SCHOOL_ADMIN
 */
export const TeacherOrHMOrAdminRoute = ({
  user,
  children,
}) => (
  <RoleGuard
    user={user}
    allowedRoles={[
      "TEACHER",
      "HM",
      "SCHOOL_ADMIN",
    ]}
  >
    {children}
  </RoleGuard>
);