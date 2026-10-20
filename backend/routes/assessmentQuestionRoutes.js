import express from "express";

import {
  createAssessmentQuestion,
  getAssessmentQuestions,
  getAssessmentQuestionById,
  getQuestionsByAssessment,
  getQuestionsBySection,
  getQuestionsByQuestionGroup,
  getQuestionsByChoiceGroup,
  getQuestionsByQuestionType,
  updateAssessmentQuestion,
  deleteAssessmentQuestion,
} from "../controllers/assessmentQuestionController.js";

import {
  protect,
  allowRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Authorized Roles
==========================================================

AssessmentQuestion is a school-level entity.

Allowed roles:
  - SCHOOL_ADMIN
  - HM
  - TEACHER

The school is determined from req.schoolId by the
authentication middleware.

Clients must not provide/override the school.
==========================================================
*/

const assessmentQuestionRoles = [
  "SCHOOL_ADMIN",
  "HM",
  "TEACHER",
];

/*
==========================================================
Assessment Questions
==========================================================
*/

/*
 * Create Assessment Question
 *
 * SCHOOL_ADMIN / HM / TEACHER:
 *   Can create only within their authenticated school.
 *
 * The controller validates:
 *   req.schoolId === assessment.school
 *   req.schoolId === assessmentSection.school
 *   req.schoolId === question.school
 *   req.schoolId === questionGroup.school
 */
router
  .route("/")
  .post(
    protect,
    allowRole(
      ...assessmentQuestionRoles,
    ),
    createAssessmentQuestion,
  )
  .get(
    protect,
    allowRole(
      ...assessmentQuestionRoles,
    ),
    getAssessmentQuestions,
  );

/*
==========================================================
Questions By Assessment
==========================================================
*/

/*
 * GET /assessment/:assessmentId
 *
 * Controller verifies that the assessment belongs
 * to req.schoolId before returning questions.
 */
router.get(
  "/assessment/:assessmentId",
  protect,
  allowRole(
    ...assessmentQuestionRoles,
  ),
  getQuestionsByAssessment,
);

/*
==========================================================
Questions By Section
==========================================================
*/

/*
 * GET /section/:sectionId
 *
 * Controller verifies:
 *   AssessmentSection.school === req.schoolId
 *   Assessment.school === req.schoolId
 */
router.get(
  "/section/:sectionId",
  protect,
  allowRole(
    ...assessmentQuestionRoles,
  ),
  getQuestionsBySection,
);

/*
==========================================================
Questions By Question Group
==========================================================
*/

/*
 * GET /question-group/:questionGroupId
 *
 * Controller verifies:
 *   QuestionGroup.school === req.schoolId
 */
router.get(
  "/question-group/:questionGroupId",
  protect,
  allowRole(
    ...assessmentQuestionRoles,
  ),
  getQuestionsByQuestionGroup,
);

/*
==========================================================
Questions By Choice Group
==========================================================
*/

/*
 * GET /choice-group/:choiceGroupId
 *
 * Controller validates the choice group's assessment
 * against req.schoolId.
 */
router.get(
  "/choice-group/:choiceGroupId",
  protect,
  allowRole(
    ...assessmentQuestionRoles,
  ),
  getQuestionsByChoiceGroup,
);

/*
==========================================================
Questions By Question Type
==========================================================
*/

/*
 * GET /question-type/:questionType
 *
 * Results are restricted to req.schoolId.
 */
router.get(
  "/question-type/:questionType",
  protect,
  allowRole(
    ...assessmentQuestionRoles,
  ),
  getQuestionsByQuestionType,
);

/*
==========================================================
Single Assessment Question
==========================================================
*/

/*
 * GET
 *
 * Any authorized school user can retrieve an
 * AssessmentQuestion from their own school.
 */
router
  .route("/:id")
  .get(
    protect,
    allowRole(
      ...assessmentQuestionRoles,
    ),
    getAssessmentQuestionById,
  )

  /*
   * PUT
   *
   * SCHOOL_ADMIN / HM / TEACHER can update.
   *
   * Controller prevents changing the school context
   * and validates all related school-level records.
   */
  .put(
    protect,
    allowRole(
      ...assessmentQuestionRoles,
    ),
    updateAssessmentQuestion,
  )

  /*
   * DELETE
   *
   * SCHOOL_ADMIN / HM / TEACHER can delete.
   *
   * Controller verifies that the AssessmentQuestion,
   * Assessment and authenticated school all match.
   */
  .delete(
    protect,
    allowRole(
      ...assessmentQuestionRoles,
    ),
    deleteAssessmentQuestion,
  );

export default router;
