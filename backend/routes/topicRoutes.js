import express from "express";

import {
  createTopic,
  getTopics,
  getTopicsBySubject,
  getTopicsByChapter,
  getTopicById,
  updateTopic,
  updateTopicStatus,
  deleteTopic,
} from "../controllers/topicController.js";

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
    createTopic,
  )
  .get(
    protect,
    getTopics,
  );

router.get(
  "/subject/:subjectId",
  protect,
  getTopicsBySubject,
);

router.get(
  "/chapter/:chapterId",
  protect,
  getTopicsByChapter,
);

router
  .route("/:id")
  .get(
    protect,
    getTopicById,
  )
  .put(
    protect,
    superAdmin,
    updateTopic,
  )
  .delete(
    protect,
    superAdmin,
    deleteTopic,
  );

router.patch(
  "/:id/status",
  protect,
  superAdmin,
  updateTopicStatus,
);

export default router;