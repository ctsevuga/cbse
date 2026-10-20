import express from "express";

import {
  createResult,
  getResults,
  getResultById,
  getResultByAssessmentAndStudent,
  getResultByAttempt,
  getResultsByStudent,
  getResultsByAssessment,
  updateResult,
  updateResultStatus,
  publishResult,
  withdrawResult,
  deleteResult,
} from "../controllers/resultController.js";

import {
  protect,
  teacherOrHmOrAdmin,
  hmOrAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
RESULTS
==========================================================

POST /
    Create a Result from a StudentAttempt.

    The controller:
    - derives school from logged-in user
    - validates the attempt
    - calculates marks from the attempt
    - determines PENDING_EVALUATION / EVALUATED
    - does NOT accept marks/status from client

GET /
    Get results accessible to the logged-in user.
==========================================================
*/

router
  .route("/")
  .post(
    protect,
    teacherOrHmOrAdmin,
    createResult,
  )
  .get(
    protect,
    getResults,
  );

/*
==========================================================
RESULT BY ASSESSMENT AND STUDENT
==========================================================

GET /assessment/:assessmentId/student/:studentId

Examples:
- Teacher/HM/Admin can retrieve results for students
  belonging to their school.
- Student can retrieve only their own results.

School is derived from req.user.
==========================================================
*/

router.get(
  "/assessment/:assessmentId/student/:studentId",
  protect,
  getResultByAssessmentAndStudent,
);

/*
==========================================================
RESULTS BY ASSESSMENT
==========================================================

GET /assessment/:assessmentId

Returns results belonging to the logged-in user's school.

Optional query:
    ?studentId=
    ?status=
==========================================================
*/

router.get(
  "/assessment/:assessmentId",
  protect,
  getResultsByAssessment,
);

/*
==========================================================
RESULT BY ATTEMPT
==========================================================

GET /attempt/:attemptId

The attempt is validated against:
    req.user.school

Students can only access their own attempt/result.
==========================================================
*/

router.get(
  "/attempt/:attemptId",
  protect,
  getResultByAttempt,
);

/*
==========================================================
RESULTS BY STUDENT
==========================================================

GET /student/:studentId

Students can only retrieve their own results.

Teachers/HM/Admin can retrieve students belonging
to their school.
==========================================================
*/

router.get(
  "/student/:studentId",
  protect,
  getResultsByStudent,
);

/*
==========================================================
SINGLE RESULT
==========================================================

GET /:id
    Retrieve one result.

PUT /:id
    Recalculate/update the result from StudentAttempt.

    IMPORTANT:
    The client must NOT send:
        totalMarks
        obtainedMarks
        percentage

    These are derived by the controller.

DELETE /:id
    Delete only non-published/non-withdrawn results.

    Published results must be withdrawn instead.
==========================================================
*/

router
  .route("/:id")
  .get(
    protect,
    getResultById,
  )
  .put(
    protect,
    teacherOrHmOrAdmin,
    updateResult,
  )
  .delete(
    protect,
    hmOrAdmin,
    deleteResult,
  );

/*
==========================================================
RESULT STATUS
==========================================================

PATCH /:id/status

Used for controlled evaluation-state transitions:

    DRAFT
       ↓
    PENDING_EVALUATION
       ↓
    EVALUATED

PUBLISHED and WITHDRAWN must use their dedicated
endpoints below.

The controller validates the allowed transition.
==========================================================
*/

router.patch(
  "/:id/status",
  protect,
  teacherOrHmOrAdmin,
  updateResultStatus,
);

/*
==========================================================
PUBLISH RESULT
==========================================================

PATCH /:id/publish

Only HM/Admin can publish.

The controller:
    - verifies result is EVALUATED
    - verifies no answers remain pending
    - recalculates marks from StudentAttempt
    - sets status = PUBLISHED
    - sets publishedAt
    - sets publishedBy = req.user._id
==========================================================
*/

router.patch(
  "/:id/publish",
  protect,
  hmOrAdmin,
  publishResult,
);

/*
==========================================================
WITHDRAW RESULT
==========================================================

PATCH /:id/withdraw

Only HM/Admin can withdraw.

The controller:
    - verifies result is PUBLISHED
    - sets status = WITHDRAWN
    - sets withdrawnAt
    - sets withdrawnBy = req.user._id

Original publication audit is retained.
==========================================================
*/

router.patch(
  "/:id/withdraw",
  protect,
  hmOrAdmin,
  withdrawResult,
);

export default router;
