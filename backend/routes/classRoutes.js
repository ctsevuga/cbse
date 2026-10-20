import express from "express";

import {
  createClass,
  getClasses,
  getClassById,
  getClassesBySchool,
  updateClass,
  updateClassStatus,
  deleteClass,
} from "../controllers/classController.js";

import {
  protect,
  adminOrSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Classes
==========================================================
*/

router
  .route("/")
  .post(
    protect,
    adminOrSuperAdmin,
    createClass,
  )
  .get(
    protect,
    getClasses,
  );

/*
==========================================================
Classes By School
==========================================================
*/

router.get(
  "/school/:schoolId",
  protect,
  getClassesBySchool,
);

/*
==========================================================
Single Class
==========================================================
*/

router
  .route("/:id")
  .get(
    protect,
    getClassById,
  )
  .put(
    protect,
    adminOrSuperAdmin,
    updateClass,
  )
  .delete(
    protect,
    adminOrSuperAdmin,
    deleteClass,
  );

/*
==========================================================
Class Status
==========================================================
*/

router.patch(
  "/:id/status",
  protect,
  adminOrSuperAdmin,
  updateClassStatus,
);

export default router;