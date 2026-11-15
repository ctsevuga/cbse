
import Student from "../models/studentModel.js";

/**
 * Validate that the authenticated user is a STUDENT.
 *
 * Requires:
 *   protect middleware
 *
 * Uses:
 *   req.user
 */
export const requireStudentUser = (req) => {
  // ------------------------------------------
  // 1. Authentication validation
  // ------------------------------------------

  if (!req.user) {
    const error = new Error(
      "Authentication required."
    );

    error.statusCode = 401;
    throw error;
  }

  // ------------------------------------------
  // 2. Role validation
  // ------------------------------------------

  if (req.user.role !== "STUDENT") {
    const error = new Error(
      "Only students can access this resource."
    );

    error.statusCode = 403;
    throw error;
  }

  return true;
};


/**
 * Retrieve the Student profile associated with
 * the authenticated User.
 *
 * Requires:
 *   protect middleware
 *   resolveSchool middleware
 *
 * Uses:
 *   req.user._id
 *   req.schoolId
 *
 * Returns:
 *   Student document
 */
export const getStudentFromUser = async (req) => {

  // ------------------------------------------
  // 1. Validate authenticated user
  // ------------------------------------------

  if (!req.user?._id) {
    const error = new Error(
      "Authenticated user not found."
    );

    error.statusCode = 401;
    throw error;
  }

  // ------------------------------------------
  // 2. Validate school context
  // ------------------------------------------

  if (!req.schoolId) {
    const error = new Error(
      "School context is missing."
    );

    error.statusCode = 403;
    throw error;
  }

  // ------------------------------------------
  // 3. Find student profile
  // ------------------------------------------

  const student = await Student.findOne({
    user: req.user._id,
    school: req.schoolId,
  });

  // ------------------------------------------
  // 4. Validate student profile
  // ------------------------------------------

  if (!student) {
    const error = new Error(
      "Student profile not found for this school."
    );

    error.statusCode = 404;
    throw error;
  }

  // ------------------------------------------
  // 5. Validate active student
  // ------------------------------------------

  if (student.isActive === false) {
    const error = new Error(
      "Student account is inactive."
    );

    error.statusCode = 403;
    throw error;
  }

  return student;
};
