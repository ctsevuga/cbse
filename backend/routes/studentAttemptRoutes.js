import express from "express";

import {
  startStudentAttempt,
  getStudentAttempts,
  getStudentAttemptById,
  getAttemptsByAssessment,
  getAttemptsByStudent,
  getMyStudentAttempts,
  updateStudentAttemptActivity,
  submitStudentAttempt,
  updateStudentAttemptStatus,
  updateStudentAttemptResult,
  deleteStudentAttempt,
} from "../controllers/studentAttemptController.js";

import {
  protect,
  studentOnly,
  hmOrAdmin,
  teacherOrHmOrAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * ============================================================
 * STUDENT ATTEMPT LIFECYCLE
 * ============================================================
 */

/*
 * Start an attempt.
 *
 * Student is derived from req.user.
 * studentId must NOT be accepted from the request body.
 */
router.post(
  "/start",
  protect,
  studentOnly,
  startStudentAttempt,
);

/*
 * Get attempts belonging to the logged-in student.
 */
router.get(
  "/my",
  protect,
  studentOnly,
  getMyStudentAttempts,
);

/*
 * Update activity while taking an assessment.
 *
 * Only the owner/student can update their attempt.
 */
router.patch(
  "/:id/activity",
  protect,
  studentOnly,
  updateStudentAttemptActivity,
);

/*
 * Submit an attempt.
 *
 * Only the student who owns the attempt can submit it.
 */
router.patch(
  "/:id/submit",
  protect,
  studentOnly,
  submitStudentAttempt,
);


/*
 * ============================================================
 * ATTEMPT VIEWING
 * ============================================================
 */

/*
 * Get attempts for a particular assessment.
 *
 * STUDENT:
 *   Controller should return only their own attempts.
 *
 * STAFF:
 *   Controller may return attempts for the school/assessment.
 */
router.get(
  "/assessment/:assessmentId",
  protect,
  getAttemptsByAssessment,
);

/*
 * Get attempts for a particular student.
 *
 * STUDENT:
 *   Controller must ensure studentId belongs to req.user.
 *
 * STAFF:
 *   Controller can access students within their school.
 */
router.get(
  "/student/:studentId",
  protect,
  teacherOrHmOrAdmin,
  getAttemptsByStudent,
);

/*
 * Get all attempts.
 *
 * STUDENT:
 *   Only their own attempts.
 *
 * SCHOOL STAFF:
 *   Attempts belonging to their school.
 */
router.get(
  "/",
  protect,
  getStudentAttempts,
);


/*
 * ============================================================
 * SINGLE ATTEMPT
 * ============================================================
 */

router
  .route("/:id")
  .get(
    protect,
    getStudentAttemptById,
  )
  .delete(
    protect,
    hmOrAdmin,
    deleteStudentAttempt,
  );


/*
 * ============================================================
 * STAFF / EVALUATION WORKFLOW
 * ============================================================
 */

/*
 * Change attempt status:
 *
 * SUBMITTED -> EVALUATING
 * EVALUATING -> EVALUATED
 * etc., according to controller rules.
 *
 * Students cannot use this endpoint.
 */
router.patch(
  "/:id/status",
  protect,
  teacherOrHmOrAdmin,
  updateStudentAttemptStatus,
);

/*
 * Update evaluation/result values.
 *
 * Students cannot modify marks or evaluation state.
 */
router.patch(
  "/:id/result",
  protect,
  teacherOrHmOrAdmin,
  updateStudentAttemptResult,
);

export default router;
