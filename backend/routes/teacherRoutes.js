import express from "express";

import {
  createTeacher,
  getTeachers,
  getTeacherById,
  getTeacherByUser,
  getMyTeacherProfile,
  updateTeacher,
  updateTeacherStatus,
  deleteTeacher,
} from "../controllers/teacherController.js";

import {
  protect,
  adminOrSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Teacher Routes
==========================================================
*/

/*
 * Create Teacher / Get Teachers
 */
router
  .route("/")
  .post(
    protect,
    adminOrSuperAdmin,
    createTeacher,
  )
  .get(
    protect,
    getTeachers,
  );

/*
==========================================================
Logged-in Teacher
==========================================================
*/

/*
 * Get logged-in user's teacher profile
 */
router.get(
  "/me",
  protect,
  getMyTeacherProfile,
);

/*
==========================================================
Teacher By User
==========================================================
*/

/*
 * Get teacher by User ID
 */
router.get(
  "/user/:userId",
  protect,
  getTeacherByUser,
);

/*
==========================================================
Teacher By ID
==========================================================
*/

/*
 * Get, update and delete teacher by ID
 */
router
  .route("/:id")
  .get(
    protect,
    getTeacherById,
  )
  .put(
    protect,
    adminOrSuperAdmin,
    updateTeacher,
  )
  .delete(
    protect,
    adminOrSuperAdmin,
    deleteTeacher,
  );

/*
==========================================================
Teacher Status
==========================================================
*/

/*
 * Update teacher active status
 */
router.patch(
  "/:id/status",
  protect,
  adminOrSuperAdmin,
  updateTeacherStatus,
);

export default router;