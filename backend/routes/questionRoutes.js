import express from "express";

import {
  createQuestion,
  getQuestions,
  getQuestionById,
  getQuestionsBySubject,
  getQuestionsByChapter,
  getQuestionsByTopic,
  getQuestionsByGroup,
  getMyQuestions,
  updateQuestion,
  submitQuestionForApproval,
  approveQuestion,
  rejectQuestion,
  archiveQuestion,
  updateQuestionStatus,
  deleteQuestion,
} from "../controllers/questionController.js";

import {
  protect,
  superAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    superAdmin,
    createQuestion,
  )
  .get(
    protect,
    getQuestions,
  );

router.get(
  "/my",
  protect,
  getMyQuestions,
);

router.get(
  "/subject/:subjectId",
  protect,
  getQuestionsBySubject,
);

router.get(
  "/chapter/:chapterId",
  protect,
  getQuestionsByChapter,
);

router.get(
  "/topic/:topicId",
  protect,
  getQuestionsByTopic,
);

router.get(
  "/group/:questionGroupId",
  protect,
  getQuestionsByGroup,
);

router
  .route("/:id")
  .get(
    protect,
    getQuestionById,
  )
  .put(
    protect,
    superAdmin,
    updateQuestion,
  )
  .delete(
    protect,
    superAdmin,
    deleteQuestion,
  );

router.patch(
  "/:id/submit",
  protect,
  superAdmin,
  submitQuestionForApproval,
);

router.patch(
  "/:id/approve",
  protect,
  superAdmin,
  approveQuestion,
);

router.patch(
  "/:id/reject",
  protect,
  superAdmin,
  rejectQuestion,
);

router.patch(
  "/:id/archive",
  protect,
  superAdmin,
  archiveQuestion,
);

router.patch(
  "/:id/status",
  protect,
  superAdmin,
  updateQuestionStatus,
);

export default router;