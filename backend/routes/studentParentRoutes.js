import express from "express";

import {
  createStudentParent,
  getStudentParents,
  getStudentParentById,
  getParentsByStudent,
  getStudentsByParent,
  getMyChildren,
  updateStudentParent,
  updateStudentParentStatus,
  deleteStudentParent,
} from "../controllers/studentParentController.js";

import {
  protect,
  adminOrSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
  ============================================================
  STUDENT-PARENT RELATIONSHIPS
  ============================================================

  POST /
    Create a new student-parent relationship

  GET /
    Get student-parent relationships
    Supports query filters such as:

    ?student=...
    ?parent=...
    ?relationship=FATHER
    ?isPrimary=true
    ?isActive=true
*/
router
  .route("/")
  .post(
    protect,
    adminOrSuperAdmin,
    createStudentParent,
  )
  .get(
    protect,
    getStudentParents,
  );

/*
  ============================================================
  LOGGED-IN PARENT
  ============================================================

  GET /me/children

  Returns the children/relationships belonging
  to the currently logged-in parent.
*/
router.get(
  "/me/children",
  protect,
  getMyChildren,
);

/*
  ============================================================
  STUDENT -> PARENTS
  ============================================================

  GET /student/:studentId

  Returns active parent/guardian relationships
  for a specific student.

  Used by:
  StudentDetailsScreen
*/
router.get(
  "/student/:studentId",
  protect,
  getParentsByStudent,
);

/*
  ============================================================
  PARENT -> STUDENTS
  ============================================================

  GET /parent/:parentId

  Returns active student relationships
  for a specific parent.
*/
router.get(
  "/parent/:parentId",
  protect,
  getStudentsByParent,
);

/*
  ============================================================
  SINGLE STUDENT-PARENT RELATIONSHIP
  ============================================================

  GET /:id
    View relationship details

  PUT /:id
    Edit complete relationship

    Supports:
      - student
      - parent
      - relationship
      - isPrimary
      - isActive

    NOTE:
    The frontend Student Details edit screen
    should normally send only:

      {
        parent,
        relationship,
        isPrimary,
        isActive
      }

    because the student is fixed by the
    Student Details page.

  DELETE /:id
    Permanently remove relationship
*/
router
  .route("/:id")
  .get(
    protect,
    getStudentParentById,
  )
  .put(
    protect,
    adminOrSuperAdmin,
    updateStudentParent,
  )
  .delete(
    protect,
    adminOrSuperAdmin,
    deleteStudentParent,
  );

/*
  ============================================================
  RELATIONSHIP STATUS
  ============================================================

  PATCH /:id/status

  Used for the quick Activate / Deactivate
  action from StudentDetailsScreen.

  Body:

    {
      "isActive": true
    }

  or:

    {
      "isActive": false
    }

  If deactivated, the controller automatically
  removes primary status.
*/
router.patch(
  "/:id/status",
  protect,
  adminOrSuperAdmin,
  updateStudentParentStatus,
);

export default router;
