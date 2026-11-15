import asyncHandler from "../middleware/asyncHandler.js";

import TeacherAssignment from "../models/teacherAssignmentModel.js";
import User from "../models/userModel.js";
import School from "../models/schoolModel.js";
import AcademicYear from "../models/academicYearModel.js";
import Class from "../models/classModel.js";
import Section from "../models/sectionModel.js";
import Teacher from "../models/teacherModel.js";


const validateSchool = async (schoolId) => {
  if (!schoolId) {
    throw new Error("School is required");
  }

  const school = await School.findById(schoolId);

  if (!school) {
    throw new Error("School not found");
  }

  if (!school.isActive) {
    throw new Error("School is inactive");
  }

  return school;
};

// teacherUserId is the User collection's ObjectId.
// Resolve the corresponding Teacher document before validating.
const validateTeacher = async (
  teacherUserId,
  schoolId,
) => {
  if (!teacherUserId) {
    throw new Error("Teacher is required");
  }

  const teacher = await Teacher.findOne({
    user: teacherUserId,
    school: schoolId,
    isActive: true,
  });

  if (!teacher) {
    throw new Error(
      "Active teacher profile not found for the selected user in this school",
    );
  }

  return teacher;
};

const validateAcademicYear = async (
  academicYearId,
  schoolId,
) => {
  if (!academicYearId) {
    throw new Error("Academic year is required");
  }

  const academicYear =
    await AcademicYear.findById(academicYearId);

  if (!academicYear) {
    throw new Error("Academic year not found");
  }

  if (
    String(academicYear.school) !== String(schoolId)
  ) {
    throw new Error(
      "Academic year does not belong to the school",
    );
  }

  if (!academicYear.isActive) {
    throw new Error("Academic year is inactive");
  }

  return academicYear;
};

const validateClass = async (
  classId,
  schoolId,
) => {
  if (!classId) {
    throw new Error("Class is required");
  }

  const classData = await Class.findById(classId);

  if (!classData) {
    throw new Error("Class not found");
  }

  if (
    String(classData.school) !== String(schoolId)
  ) {
    throw new Error(
      "Class does not belong to the school",
    );
  }

  if (!classData.isActive) {
    throw new Error("Class is inactive");
  }

  return classData;
};

const validateSection = async ({
  sectionId,
  schoolId,
  academicYearId,
  classId,
}) => {
  if (!sectionId) {
    throw new Error("Section is required");
  }

  const section = await Section.findById(sectionId);

  if (!section) {
    throw new Error("Section not found");
  }

  if (
    String(section.school) !== String(schoolId)
  ) {
    throw new Error(
      "Section does not belong to the school",
    );
  }

  if (
    String(section.academicYear) !==
    String(academicYearId)
  ) {
    throw new Error(
      "Section does not belong to the selected academic year",
    );
  }

  if (
    String(section.class) !== String(classId)
  ) {
    throw new Error(
      "Section does not belong to the selected class",
    );
  }

  if (!section.isActive) {
    throw new Error("Section is inactive");
  }

  return section;
};

const validateAssignmentType = (assignmentType) => {
  if (
    !["CLASS_TEACHER", "SUBJECT_TEACHER"].includes(
      assignmentType,
    )
  ) {
    throw new Error("Invalid assignment type");
  }
};

const validateAssignmentData = async ({
  schoolId,
  academicYearId,
  teacherUserId,
  classId,
  sectionId,
  assignmentType,
}) => {
  // Validate the school first.
  const school = await validateSchool(schoolId);

  // Validate the assignment type.
  validateAssignmentType(assignmentType);

  // Await every asynchronous validation.
  const academicYear = await validateAcademicYear(
    academicYearId,
    school._id,
  );

  // Resolve User ObjectId -> Teacher document.
  const teacher = await validateTeacher(
    teacherUserId,
    school._id,
  );

  const classData = await validateClass(
    classId,
    school._id,
  );

  const section = await validateSection({
    sectionId,
    schoolId: school._id,
    academicYearId: academicYear._id,
    classId: classData._id,
  });

  // Subject ownership validation intentionally omitted.
  return {
    school,
    academicYear,
    teacher,
    class: classData,
    section,
  };
};




export const createTeacherAssignment = asyncHandler(
  async (req, res) => {
    const {
      academicYear,
      teacher: teacherUserId,
      class: classId,
      section: sectionId,
      subject: subjectId,
      assignmentType,
    } = req.body;

    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(403);
      throw new Error("School could not be determined");
    }

    // 1. Validate input and resolve the Teacher profile.
    const validated = await validateAssignmentData({
      schoolId,
      academicYearId: academicYear,
      teacherUserId,
      classId,
      sectionId,
      assignmentType,
    });

    const {
      school,
      academicYear: validatedAcademicYear,
      teacher,
      class: validatedClass,
      section,
    } = validated;

    // Use canonical document IDs for database operations.
    const assignmentData = {
      school: school._id,
      academicYear: validatedAcademicYear._id,
      teacher: teacher._id,
      class: validatedClass._id,
      section: section._id,
      assignmentType,
      isActive: true,
    };

    if (assignmentType === "SUBJECT_TEACHER") {
      if (!subjectId) {
        res.status(400);
        throw new Error(
          "Subject is required for a subject teacher assignment",
        );
      }

      // Subject ownership validation is intentionally omitted.
      assignmentData.subject = subjectId;
    }

    // 2. Only one active class teacher per section/year.
    if (assignmentType === "CLASS_TEACHER") {
      const existingClassTeacher =
        await TeacherAssignment.findOne({
          school: school._id,
          academicYear: validatedAcademicYear._id,
          section: section._id,
          assignmentType: "CLASS_TEACHER",
          isActive: true,
        });

      if (existingClassTeacher) {
        res.status(400);
        throw new Error(
          "A class teacher is already assigned to this section",
        );
      }
    }

    // 3. Prevent duplicate active assignments.
    const duplicateQuery = {
      school: school._id,
      academicYear: validatedAcademicYear._id,
      teacher: teacher._id,
      class: validatedClass._id,
      section: section._id,
      assignmentType,
      isActive: true,
    };

    if (assignmentType === "SUBJECT_TEACHER") {
      duplicateQuery.subject = subjectId;
    }

    const existingAssignment =
      await TeacherAssignment.findOne(duplicateQuery);

    if (existingAssignment) {
      res.status(400);
      throw new Error(
        "Teacher assignment already exists",
      );
    }

    // 4. Save the Teacher collection's ObjectId, not User._id.
    const assignment =
      await TeacherAssignment.create(assignmentData);

    // 5. Return the populated assignment.
    const populatedAssignment =
      await TeacherAssignment.findById(assignment._id)
        .populate("school", "name code")
        .populate(
          "academicYear",
          "name startDate endDate",
        )
        .populate({
          path: "teacher",
          populate: {
            path: "user",
            select: "name email phone role",
          },
        })
        .populate("class", "name code")
        .populate("section", "name")
        .populate("subject", "name code");

    return res.status(201).json(populatedAssignment);
  },
);




export const getTeacherAssignments = asyncHandler(
  async (req, res) => {
    const {
      academicYear,
      teacher: teacherId,
      class: classId,
      section,
      subject,
      assignmentType,
      isActive,
    } = req.query;

    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(403);
      throw new Error("School could not be determined");
    }

    await validateSchool(schoolId);

    const filter = {
      school: schoolId,
    };

    if (academicYear) {
      filter.academicYear = academicYear;
    }

    if (teacherId) {
      filter.teacher = teacherId;
    }

    if (classId) {
      filter.class = classId;
    }

    if (section) {
      filter.section = section;
    }

    if (subject) {
      filter.subject = subject;
    }

    if (assignmentType) {
      filter.assignmentType = assignmentType;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const assignments = await TeacherAssignment.find(filter)
      .populate("school", "name code")
      .populate("academicYear", "name startDate endDate")
      .populate({
        path: "teacher",
        select: "user school employeeCode qualification isActive",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .populate("class", "name code")
      .populate("section", "name")
      .populate("subject", "name code")
      .sort({
        academicYear: 1,
        class: 1,
        section: 1,
        assignmentType: 1,
      });
console.log(
  "Teacher assignment data:",
  JSON.stringify(assignments, null, 2),
);
    res.json(assignments);
  },
);


export const getTeacherAssignmentById =
  asyncHandler(async (req, res) => {
    const assignment =
      await TeacherAssignment.findById(
        req.params.id,
      )
        .populate(
          "school",
          "name code",
        )
        .populate(
          "academicYear",
          "name startDate endDate",
        )
        .populate(
          "teacher",
          "name email phone role",
        )
        .populate(
          "class",
          "name code",
        )
        .populate(
          "section",
          "name",
        )
        .populate(
          "subject",
          "name code",
        );

    if (!assignment) {
      res.status(404);
      throw new Error(
        "Teacher assignment not found",
      );
    }

    if (
      !req.schoolId ||
      String(assignment.school?._id) !==
        String(req.schoolId)
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this assignment",
      );
    }

    res.json(assignment);
  });

export const getAssignmentsByTeacher =
  asyncHandler(async (req, res) => {
    const teacherId =
      req.params.teacherId;

    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(403);
      throw new Error(
        "School could not be determined",
      );
    }

    const teacher =
      await User.findById(
        teacherId,
      ).select(
        "_id school role",
      );

    if (!teacher) {
      res.status(404);
      throw new Error(
        "Teacher not found",
      );
    }

    if (teacher.role !== "TEACHER") {
      res.status(400);
      throw new Error(
        "Selected user is not a teacher",
      );
    }

    if (
      !teacher.school ||
      String(teacher.school) !==
        String(schoolId)
    ) {
      res.status(403);
      throw new Error(
        "Teacher does not belong to the school",
      );
    }

    const assignments =
      await TeacherAssignment.find({
        school: schoolId,
        teacher: teacherId,
      })
        .populate(
          "academicYear",
          "name startDate endDate",
        )
        .populate(
          "class",
          "name code",
        )
        .populate(
          "section",
          "name",
        )
        .populate(
          "subject",
          "name code",
        )
        .sort({
          academicYear: 1,
          class: 1,
          section: 1,
        });

    res.json(assignments);
  });

export const getAssignmentsBySection =
  asyncHandler(async (req, res) => {
    const { sectionId } =
      req.params;

    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(403);
      throw new Error(
        "School could not be determined",
      );
    }

    const section =
      await Section.findById(
        sectionId,
      );

    if (!section) {
      res.status(404);
      throw new Error(
        "Section not found",
      );
    }

    if (
      String(section.school) !==
      String(schoolId)
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this section",
      );
    }

    const assignments =
      await TeacherAssignment.find({
        school: schoolId,
        academicYear:
          section.academicYear,
        class: section.class,
        section: sectionId,
      })
        .populate(
          "teacher",
          "name email phone",
        )
        .populate(
          "subject",
          "name code",
        )
        .sort({
          assignmentType: 1,
          subject: 1,
        });

    res.json(assignments);
  });

export const getMyTeacherAssignments = asyncHandler(
  async (req, res) => {
    if (req.user.role !== "TEACHER") {
      res.status(403);
      throw new Error(
        "Only teachers can access their assignments"
      );
    }

    if (!req.schoolId) {
      res.status(403);
      throw new Error(
        "Teacher does not belong to a school"
      );
    }

    // Find the teacher using the logged-in user's ObjectId
    const teacher = await Teacher.findOne({
      user: req.user._id,
      school: req.schoolId,
      isActive: true,
    });

    if (!teacher) {
      res.status(404);
      throw new Error("Teacher profile not found");
    }

    // Use the Teacher document's ObjectId
    const assignments = await TeacherAssignment.find({
      school: req.schoolId,
      teacher: teacher._id,
      isActive: true,
    })
      .populate("academicYear", "name startDate endDate")
      .populate("class", "name code")
      .populate("section", "name")
      .populate("subject", "name code")
      .sort({
        academicYear: 1,
        class: 1,
        section: 1,
      });

    res.json(assignments);
  }
);


export const updateTeacherAssignment =
  asyncHandler(async (req, res) => {
    const assignment =
      await TeacherAssignment.findById(
        req.params.id,
      );

    if (!assignment) {
      res.status(404);
      throw new Error(
        "Teacher assignment not found",
      );
    }

    const schoolId = req.schoolId;

    if (
      !schoolId ||
      String(assignment.school) !== String(schoolId)
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to update this assignment",
      );
    }

    const {
      academicYear,
      teacher: teacherUserId,
      class: classId,
      section,
      subject,
      assignmentType,
    } = req.body;

    const academicYearId =
      academicYear ||
      assignment.academicYear.toString();

    // Keep the User ObjectId, not the Teacher document ID.
    const selectedTeacherUserId =
      teacherUserId ||
      assignment.teacher.toString();

    const selectedClass =
      classId ||
      assignment.class.toString();

    const selectedSection =
      section ||
      assignment.section.toString();

    const selectedType =
      assignmentType ||
      assignment.assignmentType;

    let selectedSubject;

    if (selectedType === "SUBJECT_TEACHER") {
      selectedSubject =
        subject !== undefined
          ? subject
          : assignment.subject?.toString();

      if (!selectedSubject) {
        res.status(400);
        throw new Error(
          "Subject is required for a subject teacher assignment",
        );
      }
    }

    // Validate the selected teacher User ID and other fields.
    await validateAssignmentData({
      schoolId,
      academicYearId,
      teacherUserId: selectedTeacherUserId,
      classId: selectedClass,
      sectionId: selectedSection,
      assignmentType: selectedType,
    });

    // Only one active class teacher per section/year.
    if (selectedType === "CLASS_TEACHER") {
      const existingClassTeacher =
        await TeacherAssignment.findOne({
          _id: { $ne: assignment._id },
          school: schoolId,
          academicYear: academicYearId,
          section: selectedSection,
          assignmentType: "CLASS_TEACHER",
          isActive: true,
        });

      if (existingClassTeacher) {
        res.status(400);
        throw new Error(
          "A class teacher is already assigned to this section",
        );
      }
    }

    // Check duplicates using the User ObjectId.
    const duplicateQuery = {
      _id: { $ne: assignment._id },
      school: schoolId,
      academicYear: academicYearId,
      teacher: selectedTeacherUserId,
      class: selectedClass,
      section: selectedSection,
      assignmentType: selectedType,
      isActive: true,
    };

    if (selectedType === "SUBJECT_TEACHER") {
      duplicateQuery.subject = selectedSubject;
    }

    const duplicate =
      await TeacherAssignment.findOne(
        duplicateQuery,
      );

    if (duplicate) {
      res.status(400);
      throw new Error(
        "Teacher assignment already exists",
      );
    }

    // Save User ObjectId because schema ref is "User".
    assignment.academicYear = academicYearId;
    assignment.teacher = selectedTeacherUserId;
    assignment.class = selectedClass;
    assignment.section = selectedSection;
    assignment.assignmentType = selectedType;
    assignment.subject =
      selectedType === "SUBJECT_TEACHER"
        ? selectedSubject
        : undefined;

    const updatedAssignment =
      await assignment.save();

    const populatedAssignment =
      await TeacherAssignment.findById(
        updatedAssignment._id,
      )
        .populate("school", "name code")
        .populate(
          "academicYear",
          "name startDate endDate",
        )
        .populate(
          "teacher",
          "name email phone role",
        )
        .populate("class", "name code")
        .populate("section", "name")
        .populate("subject", "name code");

    res.json(populatedAssignment);
  });


export const updateTeacherAssignmentStatus =
  asyncHandler(async (req, res) => {
    const assignment =
      await TeacherAssignment.findById(
        req.params.id,
      );

    if (!assignment) {
      res.status(404);
      throw new Error(
        "Teacher assignment not found",
      );
    }

    if (
      !req.schoolId ||
      String(assignment.school) !==
        String(req.schoolId)
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to update this assignment",
      );
    }

    const { isActive } =
      req.body;

    if (
      typeof isActive !== "boolean"
    ) {
      res.status(400);
      throw new Error(
        "isActive must be a boolean",
      );
    }

    if (
      isActive &&
      assignment.assignmentType ===
        "CLASS_TEACHER"
    ) {
      const existingClassTeacher =
        await TeacherAssignment.findOne({
          _id: {
            $ne: assignment._id,
          },
          school: req.schoolId,
          academicYear:
            assignment.academicYear,
          section:
            assignment.section,
          assignmentType:
            "CLASS_TEACHER",
          isActive: true,
        });

      if (existingClassTeacher) {
        res.status(400);
        throw new Error(
          "A class teacher is already assigned to this section",
        );
      }
    }

    assignment.isActive =
      isActive;

    const updatedAssignment =
      await assignment.save();

    res.json(updatedAssignment);
  });

export const deleteTeacherAssignment =
  asyncHandler(async (req, res) => {
    const assignment =
      await TeacherAssignment.findById(
        req.params.id,
      );

    if (!assignment) {
      res.status(404);
      throw new Error(
        "Teacher assignment not found",
      );
    }

    if (
      !req.schoolId ||
      String(assignment.school) !==
        String(req.schoolId)
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to delete this assignment",
      );
    }

    await assignment.deleteOne();

    res.json({
      message:
        "Teacher assignment deleted successfully",
    });
  });