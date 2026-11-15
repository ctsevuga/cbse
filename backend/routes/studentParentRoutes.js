
import express from "express";

import {
  createStudentParent,
  getStudentParents,
  getStudentParentById,
  getParentsByStudent,
  getMyChildren,
  updateStudentParent,
  deleteStudentParent,
} from "../controllers/studentParentController.js";
import {
  protect,
} from "../middleware/authMiddleware.js";

import resolveSchool from "../middleware/resolveSchool.js";

const router = express.Router();

/*
============================================================
STUDENT-PARENT RELATIONSHIPS
============================================================

Access:
    SCHOOL_ADMIN

POST /
    Create a student-parent relationship.

GET /
    Get student-parent relationships.

Optional query filters:
    ?student=...
    ?parent=...
    ?relationship=FATHER
    ?isPrimary=true
    ?isActive=true

School is resolved using the school slug.
============================================================
*/

router
  .route("/")
  .post(
    protect,
    resolveSchool,
    createStudentParent,
  )
  .get(
    protect,
    resolveSchool,
    getStudentParents,
  );


/*
============================================================
LOGGED-IN PARENT - MY CHILDREN
============================================================

GET /me/children

Access:
    PARENT

Returns:
    - Linked children
    - Admission number
    - Student name
    - Class
    - Section
    - Academic year
    - Stream
    - Enrolled subjects
    - Relationship
    - Primary relationship status

Security:
    Parent is identified using req.user._id.

    The controller returns only active
    student-parent relationships.
============================================================
*/

router.get(
  "/me/children",
  protect,
  resolveSchool,
  getMyChildren,
);


/*
============================================================
GET PARENTS BY STUDENT
============================================================

GET /student/:studentId

Access:
    SCHOOL_ADMIN

Returns:
    - Parent details
    - Parent user details
    - Relationship
    - Primary relationship status

Security:
    Student must belong to the resolved school.
    Only active parent relationships are returned.
============================================================
*/

router.get(
  "/student/:studentId",
  protect,
  resolveSchool,
  getParentsByStudent
);

/*
============================================================
GET STUDENT-PARENT RELATIONSHIP BY ID
============================================================

GET /:id

Access:
    SCHOOL_ADMIN / HM

Returns:
    - Student details
    - Student user details
    - Class and section
    - Parent details
    - Parent user details
    - Relationship
    - Primary relationship status
    - Active status

Security:
    Both student and parent must belong
    to the resolved school.
============================================================
*/

router.get(
  "/:id",
  protect,
  resolveSchool,
  getStudentParentById,
);

/*
============================================================
UPDATE STUDENT-PARENT RELATIONSHIP
============================================================

PUT /:id

Access:
    SCHOOL_ADMIN

Supported fields:
    - relationship
    - isPrimary
    - isActive

Student and Parent references cannot be changed.

To change the linked student or parent,
delete the existing relationship and create
a new relationship.
============================================================
*/

router.put(
  "/:id",
  protect,
  resolveSchool,
  updateStudentParent,
);


/*
============================================================
DELETE STUDENT-PARENT RELATIONSHIP
============================================================

DELETE /:id

Access:
    SCHOOL_ADMIN

Permanently removes the relationship.

The controller validates that both the
student and parent belong to the resolved school.
============================================================
*/

router.delete(
  "/:id",
  protect,
  resolveSchool,
  deleteStudentParent,
);


export default router;
