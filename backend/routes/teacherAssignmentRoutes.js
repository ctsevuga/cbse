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

// All routes in this router are school-specific.
// Mount this router at /api/:slug/teacher-assignments.

// Create and list teacher assignments
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

// Get the logged-in teacher's assignments
router.get(
  "/my",
  protect,
  resolveSchool,
  getMyTeacherAssignments,
);

// Get assignments by teacher
router.get(
  "/teacher/:teacherId",
  protect,
  adminOrSuperAdmin,
  resolveSchool,
  getAssignmentsByTeacher,
);

// Get assignments by section
router.get(
  "/section/:sectionId",
  protect,
  adminOrSuperAdmin,
  resolveSchool,
  getAssignmentsBySection,
);

// Get, update, or delete a specific assignment
router
  .route("/:id")
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

// Update assignment active status
router.patch(
  "/:id/status",
  protect,
  adminOrSuperAdmin,
  resolveSchool,
  updateTeacherAssignmentStatus,
);

export default router;