
import express from "express";

import {
  getTeacherDashboard,
  getClassTeacherDashboard,
  getStudentDashboard,
  getParentDashboard,
  getSchoolAdminDashboard,
} from "../controllers/dashboardController.js";

import { protect } from "../middleware/authMiddleware.js";
import resolveSchool from "../middleware/resolveSchool.js";

const router = express.Router();

// --------------------------------------------------
// Subject Teacher Dashboard
// GET /api/dashboard/:slug/teacher
// --------------------------------------------------

router.get(
  "/:slug/teacher",
  protect,
  resolveSchool,
  getTeacherDashboard
);

// --------------------------------------------------
// Class Teacher Dashboard
// GET /api/dashboard/:slug/class-teacher
// --------------------------------------------------

router.get(
  "/:slug/class-teacher",
  protect,
  resolveSchool,
  getClassTeacherDashboard
);

// --------------------------------------------------
// Student Dashboard
// GET /api/dashboard/:slug/student
// --------------------------------------------------

router.get(
  "/:slug/student",
  protect,
  resolveSchool,
  getStudentDashboard
);

// --------------------------------------------------
// Parent Dashboard
// GET /api/dashboard/:slug/parent
// --------------------------------------------------

router.get(
  "/:slug/parent",
  protect,
  resolveSchool,
  getParentDashboard
);

// --------------------------------------------------
// School Admin / HM Dashboard
// GET /api/dashboard/:slug/admin
// --------------------------------------------------

router.get(
  "/:slug/admin",
  protect,
  resolveSchool,
  getSchoolAdminDashboard
);

export default router;
