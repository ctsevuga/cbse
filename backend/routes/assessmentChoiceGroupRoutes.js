import express from "express";

import {
  createAssessmentChoiceGroup,
  getAssessmentChoiceGroups,
  getAssessmentChoiceGroupById,
  getChoiceGroupsByAssessment,
  getChoiceGroupsBySection,
  getQuestionsByChoiceGroup,
  updateAssessmentChoiceGroup,
  deleteAssessmentChoiceGroup,
  activateAssessmentChoiceGroup,
  deactivateAssessmentChoiceGroup,
} from "../controllers/assessmentChoiceGroupController.js";

import {
  protect,
  allowRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Assessment Choice Groups
==========================================================
*/

/**
 * Create / List Assessment Choice Groups
 *
 * POST:
 *   SCHOOL_ADMIN / HM / TEACHER
 *
 * GET:
 *   SCHOOL_ADMIN / HM / TEACHER
 */
router
  .route("/")
  .post(
    protect,
    allowRole(
      "SCHOOL_ADMIN",
      "HM",
      "TEACHER",
    ),
    createAssessmentChoiceGroup,
  )
  .get(
    protect,
    allowRole(
      "SCHOOL_ADMIN",
      "HM",
      "TEACHER",
    ),
    getAssessmentChoiceGroups,
  );

/*
==========================================================
Choice Groups By Assessment
==========================================================
*/

router.get(
  "/assessment/:assessmentId",
  protect,
  allowRole(
    "SCHOOL_ADMIN",
    "HM",
    "TEACHER",
  ),
  getChoiceGroupsByAssessment,
);

/*
==========================================================
Choice Groups By Section
==========================================================
*/

router.get(
  "/section/:sectionId",
  protect,
  allowRole(
    "SCHOOL_ADMIN",
    "HM",
    "TEACHER",
  ),
  getChoiceGroupsBySection,
);

/*
==========================================================
Single Assessment Choice Group
==========================================================
*/

router
  .route("/:id")
  .get(
    protect,
    allowRole(
      "SCHOOL_ADMIN",
      "HM",
      "TEACHER",
    ),
    getAssessmentChoiceGroupById,
  )
  .put(
    protect,
    allowRole(
      "SCHOOL_ADMIN",
      "HM",
      "TEACHER",
    ),
    updateAssessmentChoiceGroup,
  )
  .delete(
    protect,
    allowRole(
      "SCHOOL_ADMIN",
      "HM",
      "TEACHER",
    ),
    deleteAssessmentChoiceGroup,
  );

/*
==========================================================
Questions By Choice Group
==========================================================
*/

router.get(
  "/:id/questions",
  protect,
  allowRole(
    "SCHOOL_ADMIN",
    "HM",
    "TEACHER",
  ),
  getQuestionsByChoiceGroup,
);

/*
==========================================================
Activate Choice Group
==========================================================
*/

router.patch(
  "/:id/activate",
  protect,
  allowRole(
    "SCHOOL_ADMIN",
    "HM",
    "TEACHER",
  ),
  activateAssessmentChoiceGroup,
);

/*
==========================================================
Deactivate Choice Group
==========================================================
*/

router.patch(
  "/:id/deactivate",
  protect,
  allowRole(
    "SCHOOL_ADMIN",
    "HM",
    "TEACHER",
  ),
  deactivateAssessmentChoiceGroup,
);

export default router;
