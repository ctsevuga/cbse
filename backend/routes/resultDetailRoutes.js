import express from "express";

import {
  createResultDetail,
  getResultDetails,
  getResultDetailById,
  getResultDetailsByResult,
  getResultDetailByAssessmentQuestion,
  getResultDetailsByStudent,
  getResultDetailsByQuestion,
  getResultDetailsBySubject,
  getMyResultDetailEvaluations,
  getPendingResultDetails,
  updateResultDetail,
  updateResultDetailStatus,
  deleteResultDetail,
} from "../controllers/resultDetailController.js";

import {
  protect,
  teacherOrHmOrAdmin,
  teacher,
  hmOrAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Result Details
==========================================================

School is derived from req.user / authenticated user context.

No SUPER_ADMIN-specific route or controller logic is required.
==========================================================
*/

router
  .route("/")
  .post(
    protect,
    teacherOrHmOrAdmin,
    createResultDetail,
  )
  .get(
    protect,
    getResultDetails,
  );

/*
==========================================================
My Evaluations

Only the logged-in teacher can access their own evaluations.
==========================================================
*/

router.get(
  "/my-evaluations",
  protect,
  teacher,
  getMyResultDetailEvaluations,
);

/*
==========================================================
Pending Evaluations

Teachers, HMs and school admins can view pending evaluations
within their own school.
==========================================================
*/

router.get(
  "/pending",
  protect,
  teacherOrHmOrAdmin,
  getPendingResultDetails,
);

/*
==========================================================
Result Details By Result
==========================================================
*/

router.get(
  "/result/:resultId",
  protect,
  getResultDetailsByResult,
);

/*
==========================================================
Result Detail By Assessment Question

The result query parameter identifies the student's result.

Example:
GET /assessment-question/:assessmentQuestionId?result=<resultId>
==========================================================
*/

router.get(
  "/assessment-question/:assessmentQuestionId",
  protect,
  getResultDetailByAssessmentQuestion,
);

/*
==========================================================
Result Details By Student
==========================================================
*/

router.get(
  "/student/:studentId",
  protect,
  getResultDetailsByStudent,
);

/*
==========================================================
Result Details By Question
==========================================================
*/

router.get(
  "/question/:questionId",
  protect,
  getResultDetailsByQuestion,
);

/*
==========================================================
Result Details By Subject
==========================================================
*/

router.get(
  "/subject/:subjectId",
  protect,
  getResultDetailsBySubject,
);

/*
==========================================================
Single Result Detail
==========================================================
*/

router
  .route("/:id")
  .get(
    protect,
    getResultDetailById,
  )
  .put(
    protect,
    teacherOrHmOrAdmin,
    updateResultDetail,
  )
  .delete(
    protect,
    hmOrAdmin,
    deleteResultDetail,
  );

/*
==========================================================
Update Evaluation Status
==========================================================
*/

router.patch(
  "/:id/status",
  protect,
  teacherOrHmOrAdmin,
  updateResultDetailStatus,
);

export default router;
