import express from "express";

import {
  createStream,
  getStreams,
  getStreamById,
  getStreamsBySchool,
  updateStream,
  updateStreamStatus,
  deleteStream,
} from "../controllers/streamController.js";

import {
  protect,
  adminOrSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    adminOrSuperAdmin,
    createStream,
  )
  .get(
    protect,
    getStreams,
  );

router.get(
  "/school/:schoolId",
  protect,
  getStreamsBySchool,
);

router
  .route("/:id")
  .get(
    protect,
    getStreamById,
  )
  .put(
    protect,
    adminOrSuperAdmin,
    updateStream,
  )
  .delete(
    protect,
    adminOrSuperAdmin,
    deleteStream,
  );

router.patch(
  "/:id/status",
  protect,
  adminOrSuperAdmin,
  updateStreamStatus,
);

export default router;