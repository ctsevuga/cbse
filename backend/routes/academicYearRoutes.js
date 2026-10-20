import express from "express";

import {
  createAcademicYear,
  getAcademicYears,
  getCurrentAcademicYear,
  getAcademicYearById,
  updateAcademicYear,
  setCurrentAcademicYear,
  updateAcademicYearStatus,
  deleteAcademicYear,
} from "../controllers/academicYearController.js";

import {
  protect,
  schoolAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Academic Year Management
==========================================================
*/

router.post(
  "/",
  protect,
  schoolAdmin,
  createAcademicYear,
);

router.get(
  "/",
  protect,
  getAcademicYears,
);

/*
==========================================================
Current Academic Year
==========================================================
*/

router.get(
  "/current",
  protect,
  getCurrentAcademicYear,
);

/*
==========================================================
Academic Year By ID
==========================================================
*/

router.get(
  "/:id",
  protect,
  getAcademicYearById,
);

router.put(
  "/:id",
  protect,
  schoolAdmin,
  updateAcademicYear,
);

router.patch(
  "/:id/current",
  protect,
  schoolAdmin,
  setCurrentAcademicYear,
);

router.patch(
  "/:id/status",
  protect,
  schoolAdmin,
  updateAcademicYearStatus,
);

router.delete(
  "/:id",
  protect,
  schoolAdmin,
  deleteAcademicYear,
);

export default router;
