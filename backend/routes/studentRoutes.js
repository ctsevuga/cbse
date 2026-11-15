import express from "express";

import {
  createStudent,
  getStudents,
  getStudentsByTeacherAssignment,
  getStudentById,
  getStudentByUser,
  getMyStudentProfile,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
} from "../controllers/studentController.js";

import {
  protect,
  adminOrSuperAdmin,
} from "../middleware/authMiddleware.js";

import resolveSchool from "../middleware/resolveSchool.js";

const router = express.Router();

/*
==========================================================
Student Management
==========================================================
*/

/*
 * Create Student
 *
 * POST /api/students
 *
 * SUPER_ADMIN:
 *   Can create a student for a specified school.
 *
 * SCHOOL_ADMIN:
 *   Student is automatically associated with req.schoolId.
 *
 * Student subjects are actual enrollment records:
 *
 * subjects: [
 *   {
 *     subject: "<subjectId>",
 *     type: "CORE"
 *   },
 *   {
 *     subject: "<subjectId>",
 *     type: "ELECTIVE"
 *   }
 * ]
 *
 * The controller validates the selected subjects against
 * the active SubjectCombination for:
 *
 *   AcademicYear + Stream
 */
router.post(
  "/",
  protect,
  adminOrSuperAdmin,
  createStudent,
);

/*
 * Get All Students
 *
 * GET /api/students
 *
 * SUPER_ADMIN:
 *   Can view students across schools and optionally
 *   filter by school.
 *
 * Other authenticated users:
 *   Can view students belonging to their own school.
 *
 * Optional query parameters:
 *
 *   ?school=<schoolId>
 *   ?academicYear=<academicYearId>
 *   ?class=<classId>
 *   ?section=<sectionId>
 *   ?stream=<stream>
 *   ?isActive=true
 *
 * Response includes:
 *
 *   subjects: [
 *     {
 *       subject: {
 *         _id,
 *         name,
 *         code
 *       },
 *       type: "CORE" | "ELECTIVE"
 *     }
 *   ]
 */
router.get(
  "/",
  protect,
  getStudents,
);

/*
 * Get Students By Teacher Assignment
 *
 * GET /api/students/teacher-assignment
 *
 * TEACHER ONLY.
 *
 * Required query parameters:
 *
 *   ?assignmentType=CLASS_TEACHER
 *   &sectionId=<sectionId>
 *   &academicYearId=<academicYearId>
 *
 * OR
 *
 *   ?assignmentType=SUBJECT_TEACHER
 *   &sectionId=<sectionId>
 *   &academicYearId=<academicYearId>
 *
 * Authorization:
 *
 * CLASS_TEACHER:
 *   Can retrieve students belonging to their assigned
 *   class and section.
 *
 * SUBJECT_TEACHER:
 *   Can retrieve students belonging to sections where
 *   they have an active subject assignment.
 *
 * The controller validates the teacher's assignment
 * before retrieving students.
 */
router.get(
  "/teacher-assignment",
  protect,
  resolveSchool,
  getStudentsByTeacherAssignment
);

/*
==========================================================
Logged-in Student
==========================================================
*/

/*
 * Get Logged-in Student Profile
 *
 * GET /api/students/me
 *
 * This route must appear before /:id.
 */
router.get(
  "/me",
  protect,
  getMyStudentProfile,
);

/*
==========================================================
Student By User
==========================================================
*/

/*
 * Get Student Profile By User ID
 *
 * GET /api/students/user/:userId
 *
 * Example:
 *
 * GET /api/students/user/64abc...
 *
 * This route must appear before /:id.
 */
router.get(
  "/user/:userId",
  protect,
  getStudentByUser,
);

/*
==========================================================
Student By ID
==========================================================
*/

/*
 * Get Student By Student ID
 *
 * GET /api/students/:id
 *
 * SUPER_ADMIN:
 *   Can access students from any school.
 *
 * Other authenticated users:
 *   Can access only students from their own school.
 *
 * Response includes the student's actual enrolled
 * subjects, not the SubjectCombination configuration.
 */
router.get(
  "/:id",
  protect,
  getStudentById,
);

/*
==========================================================
Update Student
==========================================================
*/

/*
 * Update Student
 *
 * PUT /api/students/:id
 *
 * SUPER_ADMIN:
 *   Can update students across schools.
 *
 * SCHOOL_ADMIN:
 *   Can update only students belonging to their school.
 *
 * Subjects can be updated using:
 *
 * subjects: [
 *   {
 *     subject: "<subjectId>",
 *     type: "CORE"
 *   },
 *   {
 *     subject: "<subjectId>",
 *     type: "ELECTIVE"
 *   }
 * ]
 *
 * When subjects, academicYear, or stream changes,
 * the controller revalidates the enrollment against
 * the applicable SubjectCombination.
 */
router.put(
  "/:id",
  protect,
  adminOrSuperAdmin,
  updateStudent,
);

/*
==========================================================
Student Status
==========================================================
*/

/*
 * Activate / Deactivate Student
 *
 * PATCH /api/students/:id/status
 *
 * Body:
 *
 * {
 *   "isActive": true
 * }
 */
router.patch(
  "/:id/status",
  protect,
  adminOrSuperAdmin,
  updateStudentStatus,
);

/*
==========================================================
Delete Student
==========================================================
*/

/*
 * Delete Student Profile
 *
 * DELETE /api/students/:id
 *
 * The controller deliberately does not delete the
 * associated User account.
 */
router.delete(
  "/:id",
  protect,
  adminOrSuperAdmin,
  deleteStudent,
);

export default router;
