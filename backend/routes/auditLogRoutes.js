import express from "express";

import {
  createAuditLog,
  getAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  getAuditLogsByEntity,
  getAuditLogsByAction,
  getMyAuditLogs,
  deleteAuditLog,
} from "../controllers/auditLogController.js";

import {
  protect,
  hmOrAdmin,
  superAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Audit Logs
==========================================================
*/

router
  .route("/")
  .post(
    protect,
    hmOrAdmin,
    createAuditLog,
  )
  .get(
    protect,
    hmOrAdmin,
    getAuditLogs,
  );

/*
==========================================================
My Audit Logs
==========================================================
*/

router.get(
  "/my",
  protect,
  hmOrAdmin,
  getMyAuditLogs,
);

/*
==========================================================
Audit Logs By User
==========================================================
*/

router.get(
  "/user/:userId",
  protect,
  hmOrAdmin,
  getAuditLogsByUser,
);

/*
==========================================================
Audit Logs By Entity
==========================================================
*/

router.get(
  "/entity/:entityType/:entityId",
  protect,
  hmOrAdmin,
  getAuditLogsByEntity,
);

/*
==========================================================
Audit Logs By Action
==========================================================
*/

router.get(
  "/action/:action",
  protect,
  hmOrAdmin,
  getAuditLogsByAction,
);

/*
==========================================================
Single Audit Log
==========================================================
*/

router
  .route("/:id")
  .get(
    protect,
    hmOrAdmin,
    getAuditLogById,
  )
  .delete(
    protect,
    superAdmin,
    deleteAuditLog,
  );

export default router;