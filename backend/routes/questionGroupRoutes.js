import express from "express";

import {
  createQuestionGroup,
  getQuestionGroups,
  getQuestionGroupById,
  getQuestionGroupsBySubject,
  getQuestionGroupsByChapter,
  getMyQuestionGroups,
  getQuestionsInGroup,
  updateQuestionGroup,
  updateQuestionGroupStatus,
  refreshQuestionGroupStatistics,
  deleteQuestionGroup,
} from "../controllers/questionGroupController.js";

import {
  protect,
  superAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Question Groups
==========================================================
*/

// Create - SUPER_ADMIN only
// List - Authenticated users
router
  .route("/")
  .post(
    protect,
    superAdmin,
    createQuestionGroup,
  )
  .get(
    protect,
    getQuestionGroups,
  );

/*
==========================================================
My Question Groups
==========================================================
*/

router.get(
  "/my",
  protect,
  getMyQuestionGroups,
);

/*
==========================================================
Question Groups By Subject
==========================================================
*/

router.get(
  "/subject/:subjectId",
  protect,
  getQuestionGroupsBySubject,
);

/*
==========================================================
Question Groups By Chapter
==========================================================
*/

router.get(
  "/chapter/:chapterId",
  protect,
  getQuestionGroupsByChapter,
);

/*
==========================================================
Questions In Group
==========================================================
*/

router.get(
  "/:id/questions",
  protect,
  getQuestionsInGroup,
);

/*
==========================================================
Question Group Status
==========================================================
*/

router.patch(
  "/:id/status",
  protect,
  superAdmin,
  updateQuestionGroupStatus,
);

/*
==========================================================
Refresh Question Group Statistics
==========================================================
*/

router.patch(
  "/:id/statistics",
  protect,
  superAdmin,
  refreshQuestionGroupStatistics,
);

/*
==========================================================
Single Question Group
==========================================================
*/

router
  .route("/:id")
  .get(
    protect,
    getQuestionGroupById,
  )
  .put(
    protect,
    superAdmin,
    updateQuestionGroup,
  )
  .delete(
    protect,
    superAdmin,
    deleteQuestionGroup,
  );

export default router;