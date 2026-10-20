import express from "express";

import {
  createQuestionBlueprint,
  getQuestionBlueprints,
  getQuestionBlueprintById,
  getQuestionBlueprintsByAcademicYear,
  getQuestionBlueprintsByClass,
  getQuestionBlueprintsBySubject,
  getQuestionBlueprintsByStream,
  getMyQuestionBlueprints,
  updateQuestionBlueprint,
  updateQuestionBlueprintStatus,
  deleteQuestionBlueprint,
} from "../controllers/questionBlueprintController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    createQuestionBlueprint,
  )
  .get(
    protect,
    getQuestionBlueprints,
  );

router.get(
  "/my-blueprints",
  protect,
  getMyQuestionBlueprints,
);

router.get(
  "/academic-year/:academicYearId",
  protect,
  getQuestionBlueprintsByAcademicYear,
);

router.get(
  "/class/:classId",
  protect,
  getQuestionBlueprintsByClass,
);

router.get(
  "/subject/:subjectId",
  protect,
  getQuestionBlueprintsBySubject,
);

router.get(
  "/stream/:streamId",
  protect,
  getQuestionBlueprintsByStream,
);

router.patch(
  "/:id/status",
  protect,
  updateQuestionBlueprintStatus,
);

router
  .route("/:id")
  .get(
    protect,
    getQuestionBlueprintById,
  )
  .put(
    protect,
    updateQuestionBlueprint,
  )
  .delete(
    protect,
    deleteQuestionBlueprint,
  );

export default router;