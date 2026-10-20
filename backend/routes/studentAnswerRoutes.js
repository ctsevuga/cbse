import express from "express";

import {
  saveStudentAnswer,
  getStudentAnswers,
  getStudentAnswerById,
  getAnswersByAttempt,
  getAnswerByAssessmentQuestion,
  submitStudentAnswer,
  submitAllStudentAnswers,
  updateStudentAnswer,
  updateStudentAnswerStatus,
  deleteStudentAnswer,
  getMyStudentAnswers,
} from "../controllers/studentAnswerController.js";

import {
  protect,
  teacherOrHmOrAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * ============================================================
 * STUDENT ANSWER ROUTES
 * ============================================================
 *
 * School is derived from req.user / req.schoolId.
 *
 * No schoolId or studentId is accepted from the client
 * for student ownership.
 */


/*
 * ------------------------------------------------------------
 * Student: Save/Create an answer
 * ------------------------------------------------------------
 *
 * Body:
 * {
 *   attemptId,
 *   assessmentQuestionId,
 *   answerMode,
 *   answer,
 *   selectedOption,
 *   attachments
 * }
 *
 * Student identity is derived from the authenticated user.
 */
router.post(
  "/save",
  protect,
  saveStudentAnswer,
);


/*
 * ------------------------------------------------------------
 * Student: Get my answers
 * ------------------------------------------------------------
 *
 * Optional query parameters:
 *
 * ?attemptId=...
 * ?status=SAVED
 *
 * Student identity is derived from req.user.
 */
router.get(
  "/my",
  protect,
  getMyStudentAnswers,
);


/*
 * ------------------------------------------------------------
 * Attempt-level answers
 * ------------------------------------------------------------
 *
 * The controller validates:
 *
 * - attempt belongs to req.schoolId
 * - STUDENT owns the attempt
 * - staff user belongs to the same school
 */
router.get(
  "/attempt/:attemptId",
  protect,
  getAnswersByAttempt,
);


/*
 * ------------------------------------------------------------
 * Answer for one assessment question in an attempt
 * ------------------------------------------------------------
 */
router.get(
  "/attempt/:attemptId/question/:assessmentQuestionId",
  protect,
  getAnswerByAssessmentQuestion,
);


/*
 * ------------------------------------------------------------
 * General answer listing
 * ------------------------------------------------------------
 *
 * Intended primarily for school staff.
 *
 * Supported filters can include:
 *
 * ?attemptId=...
 * ?studentId=...
 * ?assessmentQuestionId=...
 * ?status=SAVED
 *
 * The controller always validates school ownership.
 */
router.get(
  "/",
  protect,
  teacherOrHmOrAdmin,
  getStudentAnswers,
);


/*
 * ------------------------------------------------------------
 * Single answer
 * ------------------------------------------------------------
 *
 * GET    /:id       → view answer
 * PUT    /:id       → update answer
 * DELETE /:id       → delete answer
 */
router
  .route("/:id")
  .get(
    protect,
    getStudentAnswerById,
  )
  .put(
    protect,
    updateStudentAnswer,
  )
  .delete(
    protect,
    deleteStudentAnswer,
  );


/*
 * ------------------------------------------------------------
 * Submit one answer
 * ------------------------------------------------------------
 *
 * Student can submit their own answer.
 */
router.patch(
  "/:id/submit",
  protect,
  submitStudentAnswer,
);


/*
 * ------------------------------------------------------------
 * Submit all answers for an attempt
 * ------------------------------------------------------------
 *
 * Student can submit all answers belonging to
 * their own attempt.
 */
router.patch(
  "/attempt/:attemptId/submit-all",
  protect,
  submitAllStudentAnswers,
);


/*
 * ------------------------------------------------------------
 * Staff-only answer status update
 * ------------------------------------------------------------
 *
 * Used for school staff/evaluation workflow.
 *
 * Students should NOT be able to arbitrarily change:
 *
 * SAVED
 * IN_PROGRESS
 * SUBMITTED
 * etc.
 */
router.patch(
  "/:id/status",
  protect,
  teacherOrHmOrAdmin,
  updateStudentAnswerStatus,
);


export default router;