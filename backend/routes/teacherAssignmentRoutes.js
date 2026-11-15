import express from "express";

import {
  createTeacherAssignment,
  getTeacherAssignments,
  getTeacherAssignmentById,
  getAssignmentsByTeacher,
  getAssignmentsBySection,
  getMyTeacherAssignments,
  updateTeacherAssignment,
  updateTeacherAssignmentStatus,
  deleteTeacherAssignment,
} from "../controllers/teacherAssignmentController.js";

import {
  protect,
  adminOrSuperAdmin,
} from "../middleware/authMiddleware.js";

import resolveSchool from "../middleware/resolveSchool.js";

const router = express.Router();

// ======================================================
// MY TEACHER ASSIGNMENTS
// GET /api/teacher-assignments/:slug/my
// ======================================================

router.get(
  "/:slug/my",
  protect,
  resolveSchool,
  getMyTeacherAssignments,
);

// ======================================================
// CREATE AND LIST TEACHER ASSIGNMENTS
// POST /api/teacher-assignments/:slug
// GET  /api/teacher-assignments/:slug
// ======================================================

router
  .route("/:slug")
  .post(
    protect,
    adminOrSuperAdmin,
    resolveSchool,
    createTeacherAssignment,
  )
  .get(
    protect,
    adminOrSuperAdmin,
    resolveSchool,
    getTeacherAssignments,
  );

// ======================================================
// GET ASSIGNMENTS BY TEACHER
// GET /api/teacher-assignments/:slug/teacher/:teacherId
// ======================================================

router.get(
  "/:slug/teacher/:teacherId",
  protect,
  adminOrSuperAdmin,
  resolveSchool,
  getAssignmentsByTeacher,
);

// ======================================================
// GET ASSIGNMENTS BY SECTION
// GET /api/teacher-assignments/:slug/section/:sectionId
// ======================================================

router.get(
  "/:slug/section/:sectionId",
  protect,
  adminOrSuperAdmin,
  resolveSchool,
  getAssignmentsBySection,
);

// ======================================================
// GET, UPDATE, OR DELETE A SPECIFIC ASSIGNMENT
// GET    /api/teacher-assignments/:slug/:id
// PUT    /api/teacher-assignments/:slug/:id
// DELETE /api/teacher-assignments/:slug/:id
// ======================================================

router
  .route("/:slug/:id")
  .get(
    protect,
    resolveSchool,
    getTeacherAssignmentById,
  )
  .put(
    protect,
    adminOrSuperAdmin,
    resolveSchool,
    updateTeacherAssignment,
  )
  .delete(
    protect,
    adminOrSuperAdmin,
    resolveSchool,
    deleteTeacherAssignment,
  );

// ======================================================
// UPDATE ASSIGNMENT ACTIVE STATUS
// PATCH /api/teacher-assignments/:slug/:id/status
// ======================================================

router.patch(
  "/:slug/:id/status",
  protect,
  adminOrSuperAdmin,
  resolveSchool,
  updateTeacherAssignmentStatus,
);

export default router;
