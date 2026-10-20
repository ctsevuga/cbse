import express from "express";

import {
  createAssessment,
  getAssessments,
  getStudentEligibleAssessments,
  getAssessmentById,
  getAssessmentsByAcademicYear,
  getAssessmentsByClass,
  getAssessmentsBySection,
  getAssessmentsBySubject,
  getAssessmentsByStream,
  getMyAssessments,
  updateAssessment,
  updateAssessmentStatus,
  deleteAssessment,
} from "../controllers/assessmentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Assessments
==========================================================
*/

/*
 * Create Assessment
 *
 * protect:
 * - authenticates the user
 * - populates req.user
 * - populates req.schoolId
 *
 * Controller:
 * - allows SCHOOL_ADMIN, HM, TEACHER
 * - validates creator belongs to req.schoolId
 */
router
  .route("/")
  .post(
    protect,
    createAssessment,
  )
  .get(
    protect,
    getAssessments,
  );

/*
==========================================================
My Assessments
==========================================================
*/
router.get(
  "/student/eligible",
  protect,
  getStudentEligibleAssessments,
);
router.get(
  "/my-assessments",
  protect,
  getMyAssessments,
);

/*
==========================================================
Assessments By Academic Year
==========================================================
*/

router.get(
  "/academic-year/:academicYearId",
  protect,
  getAssessmentsByAcademicYear,
);

/*
==========================================================
Assessments By Class
==========================================================
*/

router.get(
  "/class/:classId",
  protect,
  getAssessmentsByClass,
);

/*
==========================================================
Assessments By Section
==========================================================
*/

router.get(
  "/section/:sectionId",
  protect,
  getAssessmentsBySection,
);

/*
==========================================================
Assessments By Subject
==========================================================
*/

router.get(
  "/subject/:subjectId",
  protect,
  getAssessmentsBySubject,
);

/*
==========================================================
Assessments By Stream
==========================================================
*/

router.get(
  "/stream/:streamId",
  protect,
  getAssessmentsByStream,
);

/*
==========================================================
Single Assessment
==========================================================
*/

router
  .route("/:id")
  .get(
    protect,
    getAssessmentById,
  )
  .put(
    protect,
    updateAssessment,
  )
  .delete(
    protect,
    deleteAssessment,
  );

/*
==========================================================
Assessment Status
==========================================================
*/

router.patch(
  "/:id/status",
  protect,
  updateAssessmentStatus,
);

export default router;
