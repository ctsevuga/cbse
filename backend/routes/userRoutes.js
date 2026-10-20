import express from "express";

import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  forgotPassword,
  changePassword,
  getForgotPasswordUsers,
} from "../controllers/userController.js";

import {
  protect,
  allowRole,
} from "../middleware/authMiddleware.js";

import resolveSchool from "../middleware/resolveSchool.js";

const router = express.Router();

// ======================================================
// AUTHENTICATION
// ======================================================

// POST /api/:slug/users/auth
// School is resolved by slug or domain.
router.post(
  "/:slug/auth",
  (req, res, next) => {
    console.log("LOGIN ROUTE MATCHED :", req.originalUrl);
    next();
  },
  resolveSchool,
  authUser,
);

// POST /api/:slug/users/forgot-password
router.post(
  "/:slug/users/forgot-password",
  resolveSchool,
  forgotPassword,
);

// PUT /api/users/change-password
// Authenticated users can change their own password.
router.put(
  "/change-password",
  protect,
  changePassword,
);

// POST /api/users/logout
router.post(
  "/logout",
  logoutUser,
);

// ======================================================
// PASSWORD RESET MANAGEMENT
// ======================================================

// GET /api/users/forgot-password/users
router.get(
  "/forgot-password/users",
  protect,
  allowRole(
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "HM",
  ),
  resolveSchool,
  getForgotPasswordUsers,
);

// ======================================================
// USER MANAGEMENT
// ======================================================

// POST /api/users
// GET  /api/users
router
  .route("/")
  .post(
    protect,
    allowRole(
      "SUPER_ADMIN",
      "SCHOOL_ADMIN",
    ),
    registerUser,
  )
  .get(
    protect,
    allowRole(
      "SUPER_ADMIN",
      "SCHOOL_ADMIN",
      "HM",
    ),
    getUsers,
  );

// ======================================================
// LOGGED-IN USER PROFILE
// ======================================================

// GET /api/users/profile
router.get(
  "/profile",
  protect,
  getUserProfile,
);

// PUT /api/users/profile
router.put(
  "/profile",
  protect,
  updateUserProfile,
);

// ======================================================
// USER BY ID
// ======================================================

// GET /api/users/:id
router.get(
  "/:id",
  protect,
  allowRole(
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "HM",
  ),
  getUserById,
);

// PUT /api/users/:id
router.put(
  "/:id",
  protect,
  allowRole(
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "HM",
  ),
  updateUser,
);

// DELETE /api/users/:id
router.delete(
  "/:id",
  protect,
  allowRole(
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "HM",
  ),
  deleteUser,
);

export default router;