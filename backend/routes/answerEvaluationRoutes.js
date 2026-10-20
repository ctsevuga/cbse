import express from "express";

import {
  createAnswerEvaluation,
  getAnswerEvaluations,
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
