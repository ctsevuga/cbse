import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ======================================================
 * Role Guard
 * ======================================================
 *
 * Protects routes based on:
 *
 * 1. Authentication
 * 2. User role
 *
 * If the user is not logged in:
 *   → Redirect to Login
 *
 * If the user is logged in but does not have
 * the required role:
 *   → Redirect to Unauthorized
 *
 * If the user has an allowed role:
 *   → Render the protected page
 */
const RoleGuard = ({
  user,
  allowedRoles = [],
  children,
}) => {
  /**
   * ====================================================
   * Authentication Check
   * ====================================================
   *
   * Your LoginScreen is currently registered at "/"
   * in index.js:
   *
   * <Route index element={<LoginScreen />} />
   *
   * Therefore redirect to "/" rather than "/login".
   */
  if (!user) {
    return <Navigate to="/" replace />;
  }

  /**
   * ====================================================
   * Role Authorization Check
   * ====================================================
   */
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  /**
   * ====================================================
   * Access Granted
   * ====================================================
   */
  return children;
};

export default RoleGuard;