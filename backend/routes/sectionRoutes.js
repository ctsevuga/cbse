import express from "express";

import {
  createSection,
  getSections,
  getSectionById,
  getSectionsByClass,
  getSectionsByAcademicYear,
  updateSection,
  updateSectionStatus,
  deleteSection,
} from "../controllers/sectionController.js";

import {
  protect,
  adminOrSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    adminOrSuperAdmin,
    createSection,
  )
  .get(
    protect,
    getSections,
  );

router.get(
  "/class/:classId",
  protect,
  getSectionsByClass,
);

router.get(
  "/academic-year/:academicYearId",
  protect,
  getSectionsByAcademicYear,
);

router
  .route("/:id")
  .get(
    protect,
    getSectionById,
  )
  .put(
    protect,
    adminOrSuperAdmin,
    updateSection,
  )
  .delete(
    protect,
    adminOrSuperAdmin,
    deleteSection,
  );

router.patch(
  "/:id/status",
  protect,
  adminOrSuperAdmin,
  updateSectionStatus,
);

export default router;