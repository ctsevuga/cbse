import express from "express";

import {
  createChapter,
  getChapters,
  getChaptersBySubject,
  getChapterById,
  updateChapter,
  updateChapterStatus,
  deleteChapter,
} from "../controllers/chapterController.js";

import {
  protect,
  superAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Chapters
==========================================================
*/

router
  .route("/")
  .post(
    protect,
    superAdmin,
    createChapter,
  )
  .get(
    protect,
    getChapters,
  );

/*
==========================================================
Chapters By Subject
==========================================================
*/

router.get(
  "/subject/:subjectId",
  protect,
  getChaptersBySubject,
);

/*
==========================================================
Single Chapter
==========================================================
*/

router
  .route("/:id")
  .get(
    protect,
    getChapterById,
  )
  .put(
    protect,
    superAdmin,
    updateChapter,
  )
  .delete(
    protect,
    superAdmin,
    deleteChapter,
  );

/*
==========================================================
Chapter Status
==========================================================
*/

router.patch(
  "/:id/status",
  protect,
  superAdmin,
  updateChapterStatus,
);

export default router;