import express from "express";

import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  updateSubjectStatus,
  deleteSubject,
} from "../controllers/subjectController.js";

import {
  protect,
  superAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// Get all subjects
// Accessible to authenticated users
router.get(
  "/",
  protect,
  getSubjects,
);


// Create subject
// SUPER_ADMIN only
router.post(
  "/",
  protect,
  superAdmin,
  createSubject,
);


// Get subject by ID
// Accessible to authenticated users
router.get(
  "/:id",
  protect,
  getSubjectById,
);


// Update subject
// SUPER_ADMIN only
router.put(
  "/:id",
  protect,
  superAdmin,
  updateSubject,
);


// Update subject status
// SUPER_ADMIN only
router.patch(
  "/:id/status",
  protect,
  superAdmin,
  updateSubjectStatus,
);


// Delete subject
// SUPER_ADMIN only
router.delete(
  "/:id",
  protect,
  superAdmin,
  deleteSubject,
);


export default router;