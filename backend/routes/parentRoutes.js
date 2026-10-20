import express from "express";

import {
  createParent,
  getParents,
  getParentById,
  getParentByUser,
  getMyParentProfile,
  updateParent,
  updateParentStatus,
  deleteParent,
} from "../controllers/parentController.js";

import {
  protect,
  adminOrSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Parents
==========================================================
*/

router
  .route("/")
  .post(
    protect,
    adminOrSuperAdmin,
    createParent,
  )
  .get(
    protect,
    getParents,
  );

/*
==========================================================
My Parent Profile
==========================================================
*/

router.get(
  "/me",
  protect,
  getMyParentProfile,
);

/*
==========================================================
Parent By User
==========================================================
*/

router.get(
  "/user/:userId",
  protect,
  getParentByUser,
);

/*
==========================================================
Single Parent
==========================================================
*/

router
  .route("/:id")
  .get(
    protect,
    getParentById,
  )
  .put(
    protect,
    adminOrSuperAdmin,
    updateParent,
  )
  .delete(
    protect,
    adminOrSuperAdmin,
    deleteParent,
  );

/*
==========================================================
Parent Status
==========================================================
*/

router.patch(
  "/:id/status",
  protect,
  adminOrSuperAdmin,
  updateParentStatus,
);

export default router;