import express from "express";

import {
  createSubjectCombination,
  getSubjectCombinations,
  getSubjectCombinationById,
  getSubjectCombinationByStream,
  updateSubjectCombination,
  updateSubjectCombinationStatus,
} from "../controllers/subjectCombinationController.js";

import {
  protect,
  superAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ------------------------------------------------------
// Subject combinations
// ------------------------------------------------------

// Create subject combination
// Get all subject combinations
//
// POST /api/subject-combinations
// GET  /api/subject-combinations

router
  .route("/")
  .post(
    protect,
    superAdmin,
    createSubjectCombination,
  )
  .get(
    protect,
    getSubjectCombinations,
  );


// ------------------------------------------------------
// Get subject combination by stream
// ------------------------------------------------------
//
// GET /api/subject-combinations/stream/:streamId
//
// This route MUST appear before /:id so that
// "stream" is not interpreted as an ID.

router.get(
  "/stream/:streamId",
  protect,
  getSubjectCombinationByStream,
);


// ------------------------------------------------------
// Get / Update subject combination by ID
// ------------------------------------------------------
//
// GET /api/subject-combinations/:id
// PUT /api/subject-combinations/:id

router
  .route("/:id")
  .get(
    protect,
    getSubjectCombinationById,
  )
  .put(
    protect,
    superAdmin,
    updateSubjectCombination,
  );


// ------------------------------------------------------
// Activate / Deactivate subject combination
// ------------------------------------------------------
//
// PATCH /api/subject-combinations/:id/status

router.patch(
  "/:id/status",
  protect,
  superAdmin,
  updateSubjectCombinationStatus,
);


export default router;
