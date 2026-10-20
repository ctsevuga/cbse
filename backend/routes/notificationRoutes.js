import express from "express";

import {
  createNotification,
  getNotifications,
  getNotificationById,
  getMyNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

import {
  protect,
  teacherOrHmOrAdmin,
  hmOrAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Notifications
==========================================================
*/

router
  .route("/")
  .post(
    protect,
    teacherOrHmOrAdmin,
    createNotification,
  )
  .get(
    protect,
    getNotifications,
  );

/*
==========================================================
My Notifications
==========================================================
*/

router.get(
  "/my",
  protect,
  getMyNotifications,
);

/*
==========================================================
Unread Notifications
==========================================================
*/

router.get(
  "/unread",
  protect,
  getUnreadNotifications,
);

/*
==========================================================
Unread Notification Count
==========================================================
*/

router.get(
  "/unread-count",
  protect,
  getUnreadNotificationCount,
);

/*
==========================================================
Mark All Notifications As Read
==========================================================
*/

router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead,
);

/*
==========================================================
Single Notification
==========================================================
*/

router
  .route("/:id")
  .get(
    protect,
    getNotificationById,
  )
  .put(
    protect,
    hmOrAdmin,
    updateNotification,
  )
  .delete(
    protect,
    hmOrAdmin,
    deleteNotification,
  );

/*
==========================================================
Mark Notification As Read
==========================================================
*/

router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead,
);

/*
==========================================================
Mark Notification As Unread
==========================================================
*/

router.patch(
  "/:id/unread",
  protect,
  markNotificationAsUnread,
);

export default router;