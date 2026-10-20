import express from "express";

import {
  createAssessmentSection,
  getAssessmentSections,
  getAssessmentSectionById,
  getAssessmentSectionsByAssessment,
  getAssessmentSectionsByQuestionType,
  updateAssessmentSection,
  deleteAssessmentSection,
} from "../controllers/assessmentSectionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    createAssessmentSection,
  )
  .get(
    protect,
    getAssessmentSections,
  );

router.get(
  "/assessment/:assessmentId",
  protect,
  getAssessmentSectionsByAssessment,
);

router.get(
  "/question-type/:questionType",
  protect,
  getAssessmentSectionsByQuestionType,
);

router
  .route("/:id")
  .get(
    protect,
    getAssessmentSectionById,
  )
  .put(
    protect,
    updateAssessmentSection,
  )
  .delete(
    protect,
    deleteAssessmentSection,
  );

export default router;
