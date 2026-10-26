import express from "express";

import {
  createAnswerEvaluation,
  saveAnswerEvaluation, // NEW
  completeAttemptEvaluation,
  reviseAttemptEvaluation,
  getAnswerEvaluations,
  getAttemptsForEvaluation,
  getAttemptsForReview,
  getAnswerEvaluationById,
  getEvaluationByStudentAnswer,
  getEvaluationsByAttempt,
  getEvaluationsByStudent,
  getMyAnswerEvaluations,
  updateAnswerEvaluation,
  updateAnswerEvaluationStatus,
  deleteAnswerEvaluation,
  getPendingAnswerEvaluations,
} from "../controllers/answerEvaluationController.js";

import {
  protect,
  schoolAdmin,
  hm,
  teacher,
} from "../middleware/authMiddleware.js";

import resolveSchool from "../middleware/resolveSchool.js";

const router = express.Router();

/**
 * ======================================================
 * Answer Evaluation
 * ======================================================
 *
 * SCHOOL-SPECIFIC APPLICATION
 *
 * There is NO SUPER_ADMIN.
 *
 * Teacher identity is taken from req.user by the
 * controller. The client must NOT send teacherId
 * to create an evaluation.
 */

/**
 * ======================================================
 * CREATE ANSWER EVALUATION
 * ======================================================
 *
 * Teacher evaluates a submitted StudentAnswer.
 *
 * Flow:
 *
 * StudentAnswer
 *      ↓
 * Teacher opens answer
 *      ↓
 * Teacher gives marks
 *      ↓
 * AnswerEvaluation
 *
 * TEACHER only.
 */
router.post(
  "/",
  protect,
  teacher,
  createAnswerEvaluation,
);

/**
 * ======================================================
 * SAVE ANSWER EVALUATION
 * ======================================================
 *
 * Teacher submits marks and feedback for a student's
 * submitted answer.
 *
 * - Creates an evaluation if one does not exist.
 * - Updates the existing evaluation if already saved.
 * - Sets evaluationStatus to "EVALUATED".
 * - Teacher identity comes from req.user.
 *
 * TEACHER only.
 */
router.post(
  "/save",
  protect,
  teacher,
  saveAnswerEvaluation,
);

/**
 * ======================================================
 * COMPLETE ATTEMPT EVALUATION
 * ======================================================
 *
 * Checks that every StudentAnswer has an evaluation
 * with evaluationStatus = "EVALUATED".
 *
 * If all answers are evaluated:
 *   - Calculates obtained marks.
 *   - Updates StudentAttempt.obtainedMarks.
 *   - Updates StudentAttempt.status to "EVALUATED".
 *
 * TEACHER only.
 */
router.post(
  "/attempt/:attemptId/complete",
  protect,
  teacher,
  completeAttemptEvaluation,
);

router.put(
  "/attempts/:attemptId/revise",
  protect,
  reviseAttemptEvaluation
);
/**
 * 
 * 
 * ======================================================
 * GET ALL ANSWER EVALUATIONS
 * ======================================================
 *
 * SCHOOL_ADMIN / HM:
 *   Can view evaluations in their school.
 *
 * TEACHER:
 *   Can also access evaluations, subject to the
 *   controller's school/teacher authorization.
 *
 * The controller always applies school isolation.
 */
router.get(
  "/",
  protect,
  getAnswerEvaluations,
);

/**
 * ======================================================
 * MY EVALUATIONS
 * ======================================================
 *
 * TEACHER only.
 *
 * Returns evaluations created by the authenticated
 * teacher.
 */
router.get(
  "/my",
  protect,
  teacher,
  getMyAnswerEvaluations,
);


/**
 * ======================================================
 * STUDENT ATTEMPTS FOR EVALUATION
 * ======================================================
 *
 * Fetches student attempts filtered by:
 *
 * - assessment ID
 * - student ID
 * - status: SUBMITTED, EVALUATING, IN_PROGRESS
 *
 * TEACHER only.
 *
 * Query parameters:
 *   assessment: Assessment ID
 *   student: Student ID
 */
router.get(
  "/attempts",
  protect,
  teacher,
  getAttemptsForEvaluation,
);


/**
 * ======================================================
 * STUDENT ATTEMPTS FOR REVIEW
 * ======================================================
 *
 * Fetches previously evaluated student attempts filtered by:
 *
 * - assessmentId
 * - studentId
 * - status: EVALUATED
 *
 * Used by teachers to review and correct marks or
 * feedback before publishing results.
 *
 * TEACHER only.
 *
 * Query parameters:
 *   assessmentId: Assessment ID
 *   studentId: Student ID
 */
router.get(
  "/attempts/review",
  protect,
  teacher,
  resolveSchool,
  getAttemptsForReview,
);
/**
 * ======================================================
 * PENDING ANSWERS
 * ======================================================
 *
 * IMPORTANT:
 *
 * This does NOT mean AnswerEvaluation.status = PENDING.
 *
 * It means:
 *
 * StudentAnswer.status = SUBMITTED
 * AND
 * no AnswerEvaluation exists yet.
 *
 * Teacher uses this endpoint to find answers waiting
 * for evaluation.
 *
 * TEACHER only.
 */
router.get(
  "/pending",
  protect,
  teacher,
  getPendingAnswerEvaluations,
);

/**
 * ======================================================
 * EVALUATION BY STUDENT ANSWER
 * ======================================================
 *
 * Any authenticated school user can request this.
 *
 * Controller enforces school isolation.
 *
 * Useful for:
 *
 * - Student result view
 * - Teacher view
 * - HM view
 * - School Admin view
 */
router.get(
  "/student-answer/:studentAnswerId",
  protect,
  getEvaluationByStudentAnswer,
);

/**
 * ======================================================
 * EVALUATIONS BY ATTEMPT
 * ======================================================
 *
 * Any authenticated school user.
 *
 * Controller verifies that the attempt belongs to
 * the authenticated user's school.
 */
router.get(
  "/attempt/:attemptId",
  protect,
  getEvaluationsByAttempt,
);

/**
 * ======================================================
 * EVALUATIONS BY STUDENT
 * ======================================================
 *
 * Any authenticated school user.
 *
 * Controller enforces school isolation.
 */
router.get(
  "/student/:studentId",
  protect,
  getEvaluationsByStudent,
);

/**
 * ======================================================
 * EVALUATION BY ID
 * ======================================================
 *
 * Any authenticated school user.
 *
 * Controller enforces school isolation.
 */
router.get(
  "/:id",
  protect,
  getAnswerEvaluationById,
);

/**
 * ======================================================
 * UPDATE / RE-EVALUATE
 * ======================================================
 *
 * TEACHER only.
 *
 * The controller verifies that the authenticated teacher
 * is the teacher who originally evaluated the answer.
 *
 * The client cannot change:
 *
 * - student
 * - studentAnswer
 * - teacher
 * - maximumMarks
 *
 * The controller derives those values.
 */
router.put(
  "/:id",
  protect,
  teacher,
  updateAnswerEvaluation,
);

/**
 * ======================================================
 * UPDATE EVALUATION STATUS
 * ======================================================
 *
 * TEACHER only.
 *
 * Typical transitions:
 *
 * EVALUATED
 *     ↓
 * REVIEW_REQUIRED
 *
 * or
 *
 * EVALUATED
 *     ↓
 * REVISED
 */
router.patch(
  "/:id/status",
  protect,
  teacher,
  updateAnswerEvaluationStatus,
);

/**
 * ======================================================
 * DELETE EVALUATION
 * ======================================================
 *
 * RECOMMENDATION:
 *
 * Do NOT expose this to teachers.
 *
 * Official evaluations should normally be revised rather
 * than deleted.
 *
 * If your application has SCHOOL_ADMIN/HM deletion
 * permissions, you can expose this route to them.
 *
 * IMPORTANT:
 * The controller currently only permits the original
 * evaluating teacher, so the middleware and controller
 * would need to be changed together if you want
 * SCHOOL_ADMIN/HM deletion.
 */
router.delete(
  "/:id",
  protect,
  schoolAdmin,
  deleteAnswerEvaluation,
);

export default router;
