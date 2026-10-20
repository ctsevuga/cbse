import asyncHandler from "../middleware/asyncHandler.js";

import StudentParent from "../models/studentParentModel.js";
import Student from "../models/studentModel.js";
import Parent from "../models/parentModel.js";

/*
  ============================================================
  HELPERS
  ============================================================
*/

/*
  Validate Student and Parent and ensure
  that both belong to the same school.
*/
const validateStudentAndParent = async (
  studentId,
  parentId,
) => {
  const student = await Student.findById(studentId);

  if (!student) {
    return {
      error: "Student not found",
    };
  }

  if (!student.isActive) {
    return {
      error: "Student is inactive",
    };
  }

  const parent = await Parent.findById(parentId);

  if (!parent) {
    return {
      error: "Parent not found",
    };
  }

  if (!parent.isActive) {
    return {
      error: "Parent is inactive",
    };
  }

  if (
    String(student.school) !==
    String(parent.school)
  ) {
    return {
      error:
        "Student and parent must belong to the same school",
    };
  }

  return {
    student,
    parent,
  };
};

/*
  Check whether the requesting user
  is authorized to access the school.
*/
const checkSchoolAccess = (req, schoolId) => {
  if (req.user.role === "SUPER_ADMIN") {
    return true;
  }

  if (!req.schoolId || !schoolId) {
    return false;
  }

  return String(req.schoolId) === String(schoolId);
};

/*
  Populate Student-Parent relationship
  consistently across all endpoints.
*/
const populateStudentParent = (query) => {
  return query
    .populate(
      "student",
      "admissionNumber dateOfBirth gender stream isActive school",
    )
    .populate({
      path: "student",
      populate: {
        path: "user",
        select:
          "name email phone role isActive",
      },
    })
    .populate({
      path: "parent",
      populate: {
        path: "user",
        select:
          "name email phone role isActive",
      },
    });
};

/*
  ============================================================
  CREATE STUDENT-PARENT RELATIONSHIP
  ============================================================
*/

export const createStudentParent = asyncHandler(
  async (req, res) => {
    const {
      student,
      parent,
      relationship,
      isPrimary,
    } = req.body;

    /*
      Required fields
    */
    if (!student || !parent || !relationship) {
      res.status(400);
      throw new Error(
        "Student, parent and relationship are required",
      );
    }

    /*
      Validate student and parent
    */
    const validation =
      await validateStudentAndParent(
        student,
        parent,
      );

    if (validation.error) {
      res.status(400);
      throw new Error(validation.error);
    }

    const {
      student: studentRecord,
    } = validation;

    /*
      School authorization
    */
    if (
      !checkSchoolAccess(
        req,
        studentRecord.school,
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this school",
      );
    }

    /*
      Prevent duplicate relationship
    */
    const existingRelationship =
      await StudentParent.findOne({
        student,
        parent,
      });

    if (existingRelationship) {
      res.status(400);
      throw new Error(
        "Student-parent relationship already exists",
      );
    }

    /*
      Only one active primary relationship
      should exist for a student.
    */
    if (isPrimary === true) {
      await StudentParent.updateMany(
        {
          student,
          isActive: true,
        },
        {
          $set: {
            isPrimary: false,
          },
        },
      );
    }

    /*
      Create relationship
    */
    const studentParent =
      await StudentParent.create({
        student,
        parent,
        relationship:
          relationship.toUpperCase(),
        isPrimary: isPrimary === true,
        isActive: true,
      });

    /*
      Return populated relationship
    */
    const populatedStudentParent =
      await populateStudentParent(
        StudentParent.findById(
          studentParent._id,
        ),
      );

    res.status(201).json(
      populatedStudentParent,
    );
  },
);

/*
  ============================================================
  GET ALL STUDENT-PARENT RELATIONSHIPS
  ============================================================
*/

export const getStudentParents =
  asyncHandler(async (req, res) => {
    const {
      student,
      parent,
      relationship,
      isPrimary,
      isActive,
    } = req.query;

    const filter = {};

    if (student) {
      filter.student = student;
    }

    if (parent) {
      filter.parent = parent;
    }

    if (relationship) {
      filter.relationship =
        relationship.toUpperCase();
    }

    if (isPrimary !== undefined) {
      filter.isPrimary =
        isPrimary === "true";
    }

    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    /*
      Restrict normal users to their school.
    */
    if (req.user.role !== "SUPER_ADMIN") {
      if (!req.schoolId) {
        res.status(403);
        throw new Error(
          "User is not associated with a school",
        );
      }

      const studentIds =
        await Student.find({
          school: req.schoolId,
        }).distinct("_id");

      const parentIds =
        await Parent.find({
          school: req.schoolId,
        }).distinct("_id");

      filter.$and = [
        {
          $or: [
            {
              student: {
                $in: studentIds,
              },
            },
            {
              parent: {
                $in: parentIds,
              },
            },
          ],
        },
      ];
    }

    const relationships =
      await populateStudentParent(
        StudentParent.find(filter).sort({
          student: 1,
          isPrimary: -1,
          createdAt: 1,
        }),
      );

    /*
      Additional school validation.
    */
    const filteredRelationships =
      req.user.role === "SUPER_ADMIN"
        ? relationships
        : relationships.filter((item) => {
            if (
              !item.student ||
              !item.parent
            ) {
              return false;
            }

            const studentSchool =
              item.student.school;

            const parentSchool =
              item.parent.school;

            return (
              studentSchool &&
              parentSchool &&
              String(studentSchool) ===
                String(req.schoolId) &&
              String(parentSchool) ===
                String(req.schoolId)
            );
          });

    res.status(200).json(
      filteredRelationships,
    );
  });

/*
  ============================================================
  GET STUDENT-PARENT RELATIONSHIP BY ID
  ============================================================
*/

export const getStudentParentById =
  asyncHandler(async (req, res) => {
    const studentParent =
      await StudentParent.findById(
        req.params.id,
      )
        .populate(
          "student",
          "admissionNumber dateOfBirth gender stream isActive school",
        )
        .populate({
          path: "student",
          populate: {
            path: "user",
            select:
              "name email phone role isActive",
          },
        })
        .populate("parent")
        .populate({
          path: "parent",
          populate: {
            path: "user",
            select:
              "name email phone role isActive",
          },
        });

    if (!studentParent) {
      res.status(404);
      throw new Error(
        "Student-parent relationship not found",
      );
    }

    /*
      Make sure student exists before checking school.
    */
    if (!studentParent.student) {
      res.status(404);
      throw new Error(
        "Student associated with this relationship was not found",
      );
    }

    if (
      !checkSchoolAccess(
        req,
        studentParent.student.school,
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this relationship",
      );
    }

    res.status(200).json(
      studentParent,
    );
  });

/*
  ============================================================
  GET PARENTS BY STUDENT
  ============================================================
*/

export const getParentsByStudent =
  asyncHandler(async (req, res) => {
    const student =
      await Student.findById(
        req.params.studentId,
      );

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    if (
      !checkSchoolAccess(
        req,
        student.school,
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this student",
      );
    }

    const relationships =
      await StudentParent.find({
        student: student._id,
        isActive: true,
      })
        .populate({
          path: "parent",
          populate: {
            path: "user",
            select:
              "name email phone role isActive",
          },
        })
        .sort({
          isPrimary: -1,
          createdAt: 1,
        });

    res.status(200).json(
      relationships,
    );
  });

/*
  ============================================================
  GET STUDENTS BY PARENT
  ============================================================
*/

export const getStudentsByParent =
  asyncHandler(async (req, res) => {
    const parent =
      await Parent.findById(
        req.params.parentId,
      );

    if (!parent) {
      res.status(404);
      throw new Error("Parent not found");
    }

    if (
      !checkSchoolAccess(
        req,
        parent.school,
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this parent",
      );
    }

    const relationships =
      await StudentParent.find({
        parent: parent._id,
        isActive: true,
      })
        .populate({
          path: "student",
          populate: {
            path: "user",
            select:
              "name email phone role isActive",
          },
        })
        .sort({
          createdAt: 1,
        });

    res.status(200).json(
      relationships,
    );
  });

/*
  ============================================================
  GET MY CHILDREN
  ============================================================
*/

export const getMyChildren =
  asyncHandler(async (req, res) => {
    if (!req.schoolId) {
      res.status(403);
      throw new Error(
        "User is not associated with a school",
      );
    }

    const parent =
      await Parent.findOne({
        user: req.user._id,
        school: req.schoolId,
        isActive: true,
      });

    if (!parent) {
      res.status(404);
      throw new Error(
        "Parent profile not found",
      );
    }

    const relationships =
      await StudentParent.find({
        parent: parent._id,
        isActive: true,
      })
        .populate({
          path: "student",
          populate: {
            path: "user",
            select:
              "name email phone role isActive",
          },
        })
        .sort({
          createdAt: 1,
        });

    res.status(200).json(
      relationships,
    );
  });

/*
  ============================================================
  UPDATE STUDENT-PARENT RELATIONSHIP
  ============================================================

  Supports:

  - student
  - parent
  - relationship
  - isPrimary
  - isActive

  IMPORTANT UX:

  When editing from Student Details, the frontend
  should NOT allow changing the student.

  The backend still supports changing student because
  this endpoint is the general-purpose relationship
  update endpoint.
*/
export const updateStudentParent =
  asyncHandler(async (req, res) => {
    const studentParent =
      await StudentParent.findById(
        req.params.id,
      );

    if (!studentParent) {
      res.status(404);
      throw new Error(
        "Student-parent relationship not found",
      );
    }

    /*
      Get current student.
    */
    const currentStudent =
      await Student.findById(
        studentParent.student,
      );

    if (!currentStudent) {
      res.status(404);
      throw new Error("Student not found");
    }

    /*
      First authorization check using
      the current student.
    */
    if (
      !checkSchoolAccess(
        req,
        currentStudent.school,
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to update this relationship",
      );
    }

    /*
      Read request body.
    */
    const {
      student: newStudent,
      parent: newParent,
      relationship,
      isPrimary,
      isActive,
    } = req.body;

    /*
      Determine final student and parent.

      If they are not supplied, keep the
      existing values.
    */
    const finalStudent =
      newStudent !== undefined
        ? newStudent
        : String(studentParent.student);

    const finalParent =
      newParent !== undefined
        ? newParent
        : String(studentParent.parent);

    /*
      Validate final Student + Parent combination.

      This also checks:

      - Student exists
      - Student is active
      - Parent exists
      - Parent is active
      - Same school
    */
    const validation =
      await validateStudentAndParent(
        finalStudent,
        finalParent,
      );

    if (validation.error) {
      res.status(400);
      throw new Error(
        validation.error,
      );
    }

    const {
      student: finalStudentRecord,
      parent: finalParentRecord,
    } = validation;

    /*
      Make sure the final student belongs
      to the requesting user's school.
    */
    if (
      !checkSchoolAccess(
        req,
        finalStudentRecord.school,
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this school",
      );
    }

    /*
      Also make sure the parent belongs
      to the same authorized school.
    */
    if (
      !checkSchoolAccess(
        req,
        finalParentRecord.school,
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this parent",
      );
    }

    /*
      Prevent duplicate student-parent relationship.

      Example:

      Arun + Raj already exists

      Admin tries to edit another relationship
      to Arun + Raj

      This must be rejected.
    */
    const duplicate =
      await StudentParent.findOne({
        student: finalStudentRecord._id,
        parent: finalParentRecord._id,
        _id: {
          $ne: studentParent._id,
        },
      });

    if (duplicate) {
      res.status(400);
      throw new Error(
        "Student-parent relationship already exists",
      );
    }

    /*
      Determine final relationship status.

      If isActive is omitted, preserve
      the current status.
    */
    const finalIsActive =
      isActive !== undefined
        ? isActive
        : studentParent.isActive;

    /*
      Validate isActive when provided.
    */
    if (
      isActive !== undefined &&
      typeof isActive !== "boolean"
    ) {
      res.status(400);
      throw new Error(
        "isActive must be true or false",
      );
    }

    /*
      Determine final primary status.
    */
    const finalIsPrimary =
      isPrimary !== undefined
        ? isPrimary
        : studentParent.isPrimary;

    /*
      Validate isPrimary when provided.
    */
    if (
      isPrimary !== undefined &&
      typeof isPrimary !== "boolean"
    ) {
      res.status(400);
      throw new Error(
        "isPrimary must be true or false",
      );
    }

    /*
      An inactive relationship cannot be primary.
    */
    if (
      finalIsPrimary === true &&
      finalIsActive === false
    ) {
      res.status(400);
      throw new Error(
        "An inactive relationship cannot be primary",
      );
    }

    /*
      Validate relationship when provided.
    */
    if (
      relationship !== undefined &&
      (!relationship ||
        typeof relationship !== "string")
    ) {
      res.status(400);
      throw new Error(
        "Relationship must be a valid value",
      );
    }

    /*
      Update Student.
    */
    studentParent.student =
      finalStudentRecord._id;

    /*
      Update Parent.
    */
    studentParent.parent =
      finalParentRecord._id;

    /*
      Update relationship.
    */
    if (relationship !== undefined) {
      studentParent.relationship =
        relationship.toUpperCase();
    }

    /*
      If relationship becomes primary,
      remove primary status from all
      other active relationships for
      the final student.
    */
    if (finalIsPrimary === true) {
      await StudentParent.updateMany(
        {
          student:
            finalStudentRecord._id,
          _id: {
            $ne: studentParent._id,
          },
          isActive: true,
        },
        {
          $set: {
            isPrimary: false,
          },
        },
      );

      studentParent.isPrimary = true;
    } else {
      studentParent.isPrimary = false;
    }

    /*
      Update active status.
    */
    studentParent.isActive =
      finalIsActive;

    /*
      Safety rule:

      If relationship is inactive,
      it can never remain primary.
    */
    if (!studentParent.isActive) {
      studentParent.isPrimary = false;
    }

    /*
      Save changes.
    */
    const updatedStudentParent =
      await studentParent.save();

    /*
      Return fully populated relationship.
    */
    const populatedStudentParent =
      await populateStudentParent(
        StudentParent.findById(
          updatedStudentParent._id,
        ),
      );

    res.status(200).json(
      populatedStudentParent,
    );
  });

/*
  ============================================================
  UPDATE RELATIONSHIP STATUS
  ============================================================

  Used by the quick Activate / Deactivate
  button on Student Details.
*/
export const updateStudentParentStatus =
  asyncHandler(async (req, res) => {
    const studentParent =
      await StudentParent.findById(
        req.params.id,
      );

    if (!studentParent) {
      res.status(404);
      throw new Error(
        "Student-parent relationship not found",
      );
    }

    const student =
      await Student.findById(
        studentParent.student,
      );

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    /*
      School authorization.
    */
    if (
      !checkSchoolAccess(
        req,
        student.school,
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to update this relationship",
      );
    }

    const { isActive } = req.body;

    /*
      Validate boolean.
    */
    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be true or false",
      );
    }

    /*
      Update status.
    */
    studentParent.isActive =
      isActive;

    /*
      An inactive relationship cannot
      remain primary.
    */
    if (!isActive) {
      studentParent.isPrimary = false;
    }

    await studentParent.save();

    /*
      Return populated relationship.
    */
    const populatedStudentParent =
      await populateStudentParent(
        StudentParent.findById(
          studentParent._id,
        ),
      );

    res.status(200).json(
      populatedStudentParent,
    );
  });

/*
  ============================================================
  DELETE STUDENT-PARENT RELATIONSHIP
  ============================================================
*/

export const deleteStudentParent =
  asyncHandler(async (req, res) => {
    const studentParent =
      await StudentParent.findById(
        req.params.id,
      );

    if (!studentParent) {
      res.status(404);
      throw new Error(
        "Student-parent relationship not found",
      );
    }

    const student =
      await Student.findById(
        studentParent.student,
      );

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    /*
      School authorization.
    */
    if (
      !checkSchoolAccess(
        req,
        student.school,
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to delete this relationship",
      );
    }

    await studentParent.deleteOne();

    res.status(200).json({
      message:
        "Student-parent relationship deleted successfully",
    });
  });
