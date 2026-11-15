
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";

import StudentParent from "../models/studentParentModel.js";
import Student from "../models/studentModel.js";
import Parent from "../models/parentModel.js";
import User from "../models/userModel.js";
/*
============================================================
HELPERS
============================================================
*/

// ----------------------------------------------------------
// Validate SCHOOL_ADMIN access
// ----------------------------------------------------------

const validateAdminAccess = (req) => {
  if (req.user.role !== "SCHOOL_ADMIN") {
    const error = new Error(
      "Only SCHOOL_ADMIN can manage student-parent relationships"
    );
    error.statusCode = 403;
    throw error;
  }

  if (!req.schoolId) {
    const error = new Error(
      "User is not associated with a school"
    );
    error.statusCode = 403;
    throw error;
  }
};

// ----------------------------------------------------------
// Populate relationship information
// ----------------------------------------------------------

const populateStudentParent = (query) => {
  return query
    .populate({
      path: "student",
      select:
        "admissionNumber academicYear class section stream isActive school",
      populate: [
        {
          path: "user",
          select: "name email phone",
        },
        {
          path: "academicYear",
          select: "name",
        },
        {
          path: "class",
          select: "name",
        },
        {
          path: "section",
          select: "name",
        },
        {
          path: "stream",
          select: "name",
        },
      ],
    })
    .populate({
      path: "parent",
      select: "school isActive",
      populate: {
        path: "user",
        select: "name email phone",
      },
    });
};

// ----------------------------------------------------------
// Validate student and parent belong to the same school
// ----------------------------------------------------------

const validateStudentAndParent = async (
  studentId,
  parentId,
  schoolId
) => {
  const [student, parent] = await Promise.all([
    Student.findOne({
      _id: studentId,
      school: schoolId,
      isActive: true,
    }),

    Parent.findOne({
      _id: parentId,
      school: schoolId,
      isActive: true,
    }),
  ]);

  if (!student) {
    throw new Error(
      "Student not found or inactive in this school"
    );
  }

  if (!parent) {
    throw new Error(
      "Parent not found or inactive in this school"
    );
  }

  return { student, parent };
};


/*
============================================================
1. CREATE STUDENT-PARENT RELATIONSHIP
SCHOOL_ADMIN
============================================================
*/

export const createStudentParent = asyncHandler(
  async (req, res) => {
    validateAdminAccess(req);

    const {
      student,
      parent,
      relationship,
      isPrimary = false,
    } = req.body;

    // --------------------------------------------------
    // 1. Required field validation
    // --------------------------------------------------

    if (!student || !parent || !relationship) {
      res.status(400);

      throw new Error(
        "Student, parent and relationship are required"
      );
    }

    // --------------------------------------------------
    // 2. Validate primary flag
    // --------------------------------------------------

    if (typeof isPrimary !== "boolean") {
      res.status(400);

      throw new Error(
        "isPrimary must be true or false"
      );
    }

    // --------------------------------------------------
    // 3. Validate relationship
    // --------------------------------------------------

    const allowedRelationships = [
      "FATHER",
      "MOTHER",
      "GUARDIAN",
      "GRANDFATHER",
      "GRANDMOTHER",
      "OTHER",
    ];

    const normalizedRelationship =
      relationship.toUpperCase().trim();

    if (
      !allowedRelationships.includes(
        normalizedRelationship
      )
    ) {
      res.status(400);

      throw new Error(
        "Invalid relationship type"
      );
    }

    // --------------------------------------------------
    // 4. Validate Student
    // --------------------------------------------------

    const studentRecord = await Student.findOne({
      _id: student,
      school: req.schoolId,
      isActive: true,
    });

    if (!studentRecord) {
      res.status(404);

      throw new Error(
        "Student not found or inactive in this school"
      );
    }

    // --------------------------------------------------
    // 5. Validate Parent
    // --------------------------------------------------

    const parentRecord = await Parent.findOne({
      _id: parent,
      school: req.schoolId,
      isActive: true,
    });

    if (!parentRecord) {
      res.status(404);

      throw new Error(
        "Parent not found or inactive in this school"
      );
    }

    // --------------------------------------------------
    // 6. Validate associated User accounts
    // --------------------------------------------------

    const [studentUser, parentUser] = await Promise.all([
      User.findOne({
        _id: studentRecord.user,
        school: req.schoolId,
        isActive: true,
      }),

      User.findOne({
        _id: parentRecord.user,
        school: req.schoolId,
        isActive: true,
      }),
    ]);

    if (!studentUser) {
      res.status(400);

      throw new Error(
        "Student user account is inactive or invalid"
      );
    }

    if (!parentUser) {
      res.status(400);

      throw new Error(
        "Parent user account is inactive or invalid"
      );
    }

    if (studentUser.role !== "STUDENT") {
      res.status(400);

      throw new Error(
        "Selected user is not a student"
      );
    }

    if (parentUser.role !== "PARENT") {
      res.status(400);

      throw new Error(
        "Selected user is not a parent"
      );
    }

    // --------------------------------------------------
    // 7. Prevent duplicate relationship
    // --------------------------------------------------

    const existing = await StudentParent.findOne({
      student,
      parent,
    });

    if (existing) {
      res.status(400);

      throw new Error(
        "Student-parent relationship already exists. Update the existing relationship if necessary."
      );
    }

    // --------------------------------------------------
    // 8. Only one active primary relationship
    //    per student
    // --------------------------------------------------

    if (isPrimary) {
      await StudentParent.updateMany(
        {
          student,
          isActive: true,
          isPrimary: true,
        },
        {
          $set: {
            isPrimary: false,
          },
        }
      );
    }

    // --------------------------------------------------
    // 9. Create relationship
    // --------------------------------------------------

    const studentParent = await StudentParent.create({
      student,
      parent,
      relationship: normalizedRelationship,
      isPrimary,
      isActive: true,
    });

    // --------------------------------------------------
    // 10. Populate response
    // --------------------------------------------------

    const result = await populateStudentParent(
      StudentParent.findById(studentParent._id)
    );

    res.status(201).json(result);
  }
);


/*
============================================================
2. GET STUDENT-PARENT RELATIONSHIPS
SCHOOL_ADMIN

Optional filters:
- student
- parent
- relationship
- isPrimary
- isActive
============================================================
*/

export const getStudentParents = asyncHandler(
  async (req, res) => {
    validateAdminAccess(req);

    const {
      student,
      parent,
      relationship,
      isPrimary,
      isActive,
    } = req.query;

    // --------------------------------------------------
    // 1. Validate ObjectIds
    // --------------------------------------------------

    if (
      student &&
      !mongoose.Types.ObjectId.isValid(student)
    ) {
      res.status(400);
      throw new Error("Invalid student ID");
    }

    if (
      parent &&
      !mongoose.Types.ObjectId.isValid(parent)
    ) {
      res.status(400);
      throw new Error("Invalid parent ID");
    }

    // --------------------------------------------------
    // 2. Validate selected Student belongs to school
    // --------------------------------------------------

    if (student) {
      const studentExists = await Student.exists({
        _id: student,
        school: req.schoolId,
      });

      if (!studentExists) {
        res.status(404);
        throw new Error(
          "Student not found in this school"
        );
      }
    }

    // --------------------------------------------------
    // 3. Validate selected Parent belongs to school
    // --------------------------------------------------

    if (parent) {
      const parentExists = await Parent.exists({
        _id: parent,
        school: req.schoolId,
      });

      if (!parentExists) {
        res.status(404);
        throw new Error(
          "Parent not found in this school"
        );
      }
    }

    // --------------------------------------------------
    // 4. Get all Student IDs and Parent IDs
    //    belonging to authorized school
    // --------------------------------------------------

    const [studentIds, parentIds] = await Promise.all([
      Student.find({
        school: req.schoolId,
      }).distinct("_id"),

      Parent.find({
        school: req.schoolId,
      }).distinct("_id"),
    ]);

    // --------------------------------------------------
    // 5. Base school-level filter
    // --------------------------------------------------

    const filter = {
      student: { $in: studentIds },
      parent: { $in: parentIds },
    };

    // --------------------------------------------------
    // 6. Student filter
    // --------------------------------------------------

    if (student) {
      filter.student = student;
    }

    // --------------------------------------------------
    // 7. Parent filter
    // --------------------------------------------------

    if (parent) {
      filter.parent = parent;
    }

    // --------------------------------------------------
    // 8. Relationship filter
    // --------------------------------------------------

    if (relationship) {
      const normalizedRelationship =
        relationship.trim().toUpperCase();

      const allowedRelationships = [
        "FATHER",
        "MOTHER",
        "GUARDIAN",
        "GRANDFATHER",
        "GRANDMOTHER",
        "OTHER",
      ];

      if (
        !allowedRelationships.includes(
          normalizedRelationship
        )
      ) {
        res.status(400);
        throw new Error(
          "Invalid relationship type"
        );
      }

      filter.relationship =
        normalizedRelationship;
    }

    // --------------------------------------------------
    // 9. Primary Parent filter
    // --------------------------------------------------

    if (isPrimary !== undefined) {
      if (!["true", "false"].includes(isPrimary)) {
        res.status(400);
        throw new Error(
          "isPrimary must be true or false"
        );
      }

      filter.isPrimary = isPrimary === "true";
    }

    // --------------------------------------------------
    // 10. Active / Inactive filter
    // --------------------------------------------------

    if (isActive !== undefined) {
      if (!["true", "false"].includes(isActive)) {
        res.status(400);
        throw new Error(
          "isActive must be true or false"
        );
      }

      filter.isActive = isActive === "true";
    }

    // --------------------------------------------------
    // 11. Fetch Student-Parent Relationships
    // --------------------------------------------------

    const relationships = await populateStudentParent(
      StudentParent.find(filter).sort({
        student: 1,
        isPrimary: -1,
        createdAt: 1,
      })
    );

    // --------------------------------------------------
    // 12. Response
    // --------------------------------------------------

    res.status(200).json(relationships);
  }
);


/*
============================================================
GET PARENTS BY STUDENT
SCHOOL_ADMIN

GET /student/:studentId

Returns:
- Student-parent relationship ID
- Parent details
- Parent user name
- Email
- Phone
- Relationship (FATHER, MOTHER, GUARDIAN)
- Primary relationship status

Security:
- SCHOOL_ADMIN only
- Student must belong to the resolved school
- Only active relationships are returned
- Parent must belong to the same school and be active
============================================================
*/

export const getParentsByStudent = asyncHandler(
  async (req, res) => {
    validateAdminAccess(req);

    const { studentId } = req.params;

    // Validate student ID
    if (!mongoose.isValidObjectId(studentId)) {
      res.status(400);

      throw new Error("Invalid student ID");
    }

    // Verify student belongs to the logged-in admin's school
    const student = await Student.findOne({
      _id: studentId,
      school: req.schoolId,
      isActive: true,
    });

    if (!student) {
      res.status(404);

      throw new Error(
        "Student not found or inactive in this school"
      );
    }

    // Retrieve active parent relationships
    const relationships = await StudentParent.find({
      student: student._id,
      isActive: true,
    })
      .populate({
        path: "parent",

        match: {
          school: req.schoolId,
          isActive: true,
        },

        populate: {
          path: "user",
          select: "name email phone role isActive",
        },
      })
      .sort({
        isPrimary: -1,
        createdAt: 1,
      });

    // Remove relationships where parent is inactive
    // or does not belong to this school
    const validRelationships = relationships.filter(
      (relationship) => relationship.parent
    );

    res.status(200).json(validRelationships);
  }
);

export const getStudentParentById = asyncHandler(
  async (req, res) => {
    validateAdminAccess(req);

    const { id } = req.params;

    // --------------------------------------------------
    // 1. Validate ObjectId
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);

      throw new Error(
        "Invalid student-parent relationship ID"
      );
    }

    // --------------------------------------------------
    // 2. Find relationship
    // --------------------------------------------------

    const studentParent = await StudentParent.findById(id);

    if (!studentParent) {
      res.status(404);

      throw new Error(
        "Student-parent relationship not found"
      );
    }

    // --------------------------------------------------
    // 3. Validate Student belongs to authorized school
    // --------------------------------------------------

    const studentExists = await Student.exists({
      _id: studentParent.student,
      school: req.schoolId,
    });

    if (!studentExists) {
      res.status(404);

      throw new Error(
        "Student-parent relationship not found in this school"
      );
    }

    // --------------------------------------------------
    // 4. Validate Parent belongs to authorized school
    // --------------------------------------------------

    const parentExists = await Parent.exists({
      _id: studentParent.parent,
      school: req.schoolId,
    });

    if (!parentExists) {
      res.status(404);

      throw new Error(
        "Student-parent relationship not found in this school"
      );
    }

    // --------------------------------------------------
    // 5. Populate relationship details
    // --------------------------------------------------

    const result = await populateStudentParent(
      StudentParent.findById(id)
    );

    // --------------------------------------------------
    // 6. Response
    // --------------------------------------------------

    res.status(200).json(result);
  }
);

/*
============================================================
3. UPDATE STUDENT-PARENT RELATIONSHIP
SCHOOL_ADMIN

Supported fields:
- relationship
- isPrimary
- isActive

Student and Parent references cannot be changed here.
Delete and recreate the relationship if necessary.
============================================================
*/



export const updateStudentParent = asyncHandler(
  async (req, res) => {
    validateAdminAccess(req);

    const { id } = req.params;

    // --------------------------------------------------
    // 1. Validate ObjectId
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);

      throw new Error(
        "Invalid student-parent relationship ID"
      );
    }

    // --------------------------------------------------
    // 2. Find relationship
    // --------------------------------------------------

    const studentParent =
      await StudentParent.findById(id);

    if (!studentParent) {
      res.status(404);

      throw new Error(
        "Student-parent relationship not found"
      );
    }

    // --------------------------------------------------
    // 3. Verify Student and Parent belong to school
    // --------------------------------------------------

    await validateStudentAndParent(
      studentParent.student,
      studentParent.parent,
      req.schoolId
    );

    // --------------------------------------------------
    // 4. Extract request body
    // --------------------------------------------------

    const {
      relationship,
      isPrimary,
      isActive,
    } = req.body;

    // --------------------------------------------------
    // 5. Validate allowed fields
    // --------------------------------------------------

    const allowedFields = [
      "relationship",
      "isPrimary",
      "isActive",
    ];

    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      res.status(400);

      throw new Error(
        `Invalid fields: ${invalidFields.join(", ")}`
      );
    }

    // --------------------------------------------------
    // 6. Validate at least one field
    // --------------------------------------------------

    if (
      relationship === undefined &&
      isPrimary === undefined &&
      isActive === undefined
    ) {
      res.status(400);

      throw new Error(
        "No valid fields provided for update"
      );
    }

    // --------------------------------------------------
    // 7. Validate relationship
    // --------------------------------------------------

    if (relationship !== undefined) {
      const allowedRelationships = [
        "FATHER",
        "MOTHER",
        "GUARDIAN",
        "GRANDFATHER",
        "GRANDMOTHER",
        "OTHER",
      ];

      if (
        typeof relationship !== "string" ||
        !relationship.trim()
      ) {
        res.status(400);

        throw new Error(
          "Invalid relationship"
        );
      }

      const normalizedRelationship =
        relationship.trim().toUpperCase();

      if (
        !allowedRelationships.includes(
          normalizedRelationship
        )
      ) {
        res.status(400);

        throw new Error(
          "Invalid relationship type"
        );
      }

      studentParent.relationship =
        normalizedRelationship;
    }

    // --------------------------------------------------
    // 8. Validate isPrimary
    // --------------------------------------------------

    if (
      isPrimary !== undefined &&
      typeof isPrimary !== "boolean"
    ) {
      res.status(400);

      throw new Error(
        "isPrimary must be true or false"
      );
    }

    // --------------------------------------------------
    // 9. Validate isActive
    // --------------------------------------------------

    if (
      isActive !== undefined &&
      typeof isActive !== "boolean"
    ) {
      res.status(400);

      throw new Error(
        "isActive must be true or false"
      );
    }

    // --------------------------------------------------
    // 10. Determine final values
    // --------------------------------------------------

    const finalIsActive =
      isActive !== undefined
        ? isActive
        : studentParent.isActive;

    const finalIsPrimary =
      isPrimary !== undefined
        ? isPrimary
        : studentParent.isPrimary;

    // --------------------------------------------------
    // 11. Validate primary relationship
    // --------------------------------------------------

    if (!finalIsActive && finalIsPrimary) {
      res.status(400);

      throw new Error(
        "An inactive relationship cannot be primary"
      );
    }

    // --------------------------------------------------
    // 12. Maintain one active primary relationship
    // --------------------------------------------------

    if (finalIsPrimary) {
      await StudentParent.updateMany(
        {
          student: studentParent.student,
          _id: { $ne: studentParent._id },
          isActive: true,
          isPrimary: true,
        },
        {
          $set: {
            isPrimary: false,
          },
        }
      );
    }

    // --------------------------------------------------
    // 13. Update relationship
    // --------------------------------------------------

    studentParent.isActive = finalIsActive;

    studentParent.isPrimary = finalIsPrimary;

    await studentParent.save();

    // --------------------------------------------------
    // 14. Populate updated relationship
    // --------------------------------------------------

    const result = await populateStudentParent(
      StudentParent.findById(studentParent._id)
    );

    // --------------------------------------------------
    // 15. Response
    // --------------------------------------------------

    res.status(200).json(result);
  }
);




/*
============================================================
4. DELETE STUDENT-PARENT RELATIONSHIP
SCHOOL_ADMIN
============================================================
*/

export const deleteStudentParent = asyncHandler(
  async (req, res) => {
    validateAdminAccess(req);

    const studentParent = await StudentParent.findById(
      req.params.id
    );

    if (!studentParent) {
      res.status(404);

      throw new Error(
        "Student-parent relationship not found"
      );
    }

    // Validate school ownership

    await validateStudentAndParent(
      studentParent.student,
      studentParent.parent,
      req.schoolId
    );

    await studentParent.deleteOne();

    res.status(200).json({
      message:
        "Student-parent relationship deleted successfully",
    });
  }
);


/*
============================================================
5. GET MY CHILDREN
PARENT
============================================================
*/

export const getMyChildren = asyncHandler(
  async (req, res) => {

    if (req.user.role !== "PARENT") {
      res.status(403);

      throw new Error(
        "Only parents can access their children"
      );
    }

    if (!req.schoolId) {
      res.status(403);

      throw new Error(
        "User is not associated with a school"
      );
    }

    // Find logged-in parent's profile

    const parent = await Parent.findOne({
      user: req.user._id,
      school: req.schoolId,
      isActive: true,
    });

    if (!parent) {
      res.status(404);

      throw new Error(
        "Parent profile not found"
      );
    }

    // Retrieve only this parent's active relationships

    const relationships = await StudentParent.find({
      parent: parent._id,
      isActive: true,
    })
      .populate({
        path: "student",

        match: {
          school: req.schoolId,
          isActive: true,
        },

        select:
          "admissionNumber dateOfBirth gender academicYear class section stream subjects isActive",

        populate: [
          {
            path: "user",
            select: "name",
          },
          {
            path: "academicYear",
            select: "name",
          },
          {
            path: "class",
            select: "name",
          },
          {
            path: "section",
            select: "name",
          },
          {
            path: "stream",
            select: "name",
          },
          {
            path: "subjects.subject",
            select: "name code",
          },
        ],
      })
      .sort({
        isPrimary: -1,
        createdAt: 1,
      });

    // Remove inactive or missing students

    const children = relationships.filter(
      (item) => item.student
    );

    res.status(200).json(children);
  }
);
