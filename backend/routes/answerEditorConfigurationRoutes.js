import express from "express";

import {
  createAnswerEditorConfiguration,
  getAnswerEditorConfigurations,
  getAnswerEditorConfigurationsBySubject,
  getAnswerEditorConfigurationById,
  updateAnswerEditorConfiguration,
  updateAnswerEditorConfigurationStatus,
  deleteAnswerEditorConfiguration,
} from "../controllers/answerEditorConfigurationController.js";

import {
  protect,
  superAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ======================================================
 * Answer Editor Configuration
 * ======================================================
 *
 * Global standard master data.
 *
 * SUPER_ADMIN:
 *   Can create, update, activate/deactivate,
 *   and delete configurations.
 *
 * Other authenticated users:
 *   Can read and use configurations.
 *
 * There is no school-specific configuration.
 */

/**
 * ======================================================
 * Create / Get All
 * ======================================================
 */

/*
 * Create Answer Editor Configuration
 *
 * SUPER_ADMIN only.
 */
router
  .route("/")
  .post(
    protect,
    superAdmin,
    createAnswerEditorConfiguration,
  )
  .get(
    protect,
    getAnswerEditorConfigurations,
  );

/**
 * ======================================================
 * Get By Subject
 * ======================================================
 *
 * Subject is a global CBSE master.
 *
 * Returns all standard editor configurations
 * defined for the specified subject.
 */
router.get(
  "/subject/:subjectId",
  protect,
  getAnswerEditorConfigurationsBySubject,
);

/**
 * ======================================================
 * Get / Update / Delete By ID
 * ======================================================
 */

router
  .route("/:id")
  .get(
    protect,
    getAnswerEditorConfigurationById,
  )
  .put(
    protect,
    superAdmin,
    updateAnswerEditorConfiguration,
  )
  .delete(
    protect,
    superAdmin,
    deleteAnswerEditorConfiguration,
  );

/**
 * ======================================================
 * Update Status
 * ======================================================
 *
 * SUPER_ADMIN only.
 */
router.patch(
  "/:id/status",
  protect,
  superAdmin,
  updateAnswerEditorConfigurationStatus,
);

export default router;