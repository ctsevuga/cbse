import express from "express";

import {
  createStudentSubject,
  getStudentSubjects,
  getStudentSubjectById,
  getSubjectsByStudent,
  getMySubjects,
  getSubjectsByAcademicYear,
  getSubjectsByStream,
  updateStudentSubject,
  updateStudentSubjectStatus,
  deleteStudentSubject,
} from "../controllers/studentSubjectController.js";

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
    createStudentSubject,
  )
  .get(
    protect,
    getStudentSubjects,
  );

router.get(
  "/my-subjects",
  protect,
  getMySubjects,
);

router.get(
  "/student/:studentId",
  protect,
  getSubjectsByStudent,
);

router.get(
  "/academic-year/:academicYearId",
  protect,
  getSubjectsByAcademicYear,
);

router.get(
  "/stream/:streamId",
  protect,
  getSubjectsByStream,
);

router
  .route("/:id")
  .get(
    protect,
    getStudentSubjectById,
  )
  .put(
    protect,
    adminOrSuperAdmin,
    updateStudentSubject,
  )
  .delete(
    protect,
    adminOrSuperAdmin,
    deleteStudentSubject,
  );

router.patch(
  "/:id/status",
  protect,
  adminOrSuperAdmin,
  updateStudentSubjectStatus,
);

export default router;