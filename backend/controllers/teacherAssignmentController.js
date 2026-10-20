import asyncHandler from "../middleware/asyncHandler.js";

import TeacherAssignment from "../models/teacherAssignmentModel.js";
import User from "../models/userModel.js";
import School from "../models/schoolModel.js";
import AcademicYear from "../models/academicYearModel.js";
import Class from "../models/classModel.js";
import Section from "../models/sectionModel.js";
import Subject from "../models/subjectModel.js";

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

const validateTeacher = async (
  teacherId,
  schoolId,
) => {
  if (!teacherId) {
    throw new Error("Teacher is required");
  }

  const teacher = await User.findById(
    teacherId,
  ).select(
    "_id name role school isActive",
  );

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  if (teacher.role !== "TEACHER") {
    throw new Error(
      "Selected user is not a teacher",
    );
  }

  if (
    !teacher.school ||
    String(teacher.school) !==
      String(schoolId)
  ) {
    throw new Error(
      "Teacher does not belong to the school",
    );
  }

  if (!teacher.isActive) {
    throw new Error("Teacher is inactive");
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
    await AcademicYear.findById(
      academicYearId,
    );

  if (!academicYear) {
    throw new Error(
      "Academic year not found",
    );
  }

  if (
    String(academicYear.school) !==
    String(schoolId)
  ) {
    throw new Error(
      "Academic year does not belong to the school",
    );
  }

  if (!academicYear.isActive) {
    throw new Error(
      "Academic year is inactive",
    );
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

  const classData =
    await Class.findById(classId);

  if (!classData) {
    throw new Error("Class not found");
  }

  if (
    String(classData.school) !==
    String(schoolId)
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

  const section =
    await Section.findById(sectionId);

  if (!section) {
    throw new Error("Section not found");
  }

  if (
    String(section.school) !==
    String(schoolId)
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
    String(section.class) !==
    String(classId)
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

const validateSubject = async (
  subjectId,
  schoolId,
) => {
  if (!subjectId) {
    throw new Error(
      "Subject is required for a subject teacher assignment",
    );
  }

  const subject =
    await Subject.findById(subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  if (
    String(subject.school) !==
    String(schoolId)
  ) {
    throw new Error(
      "Subject does not belong to the school",
    );
  }

  if (!subject.isActive) {
    throw new Error("Subject is inactive");
  }

  return subject;
};

const validateAssignmentType = (
  assignmentType,
) => {
  if (
    ![
      "CLASS_TEACHER",
      "SUBJECT_TEACHER",
    ].includes(assignmentType)
  ) {
    throw new Error(
      "Invalid assignment type",
    );
  }
};

const validateAssignmentData = async ({
  schoolId,
  academicYearId,
  teacherId,
  classId,
  sectionId,
  subjectId,
  assignmentType,
}) => {
  validateAssignmentType(
    assignmentType,
  );

  await validateSchool(schoolId);

  await validateAcademicYear(
    academicYearId,
    schoolId,
  );

  await validateTeacher(
    teacherId,
    schoolId,
  );

  await validateClass(
    classId,
    schoolId,
  );

  await validateSection({
    sectionId,
    schoolId,
    academicYearId,
    classId,
  });

  if (
    assignmentType ===
    "CLASS_TEACHER"
  ) {
    if (subjectId) {
      throw new Error(
        "Subject should not be specified for a class teacher assignment",
      );
    }
  }

  if (
    assignmentType ===
    "SUBJECT_TEACHER"
  ) {
    await validateSubject(
      subjectId,
      schoolId,
    );
  }
};

export const createTeacherAssignment =
  asyncHandler(async (req, res) => {
    const {
      academicYear,
      teacher,
      class: classId,
      section,
      subject,
      assignmentType,
    } = req.body;

    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(403);
      throw new Error(
        "School could not be determined",
      );
    }

    await validateAssignmentData({
      schoolId,
      academicYearId: academicYear,
      teacherId: teacher,
      classId,
      sectionId: section,
      subjectId: subject,
      assignmentType,
    });

    if (
      assignmentType ===
      "CLASS_TEACHER"
    ) {
      const existingClassTeacher =
        await TeacherAssignment.findOne({
          school: schoolId,
          academicYear,
          section,
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

    const duplicateQuery = {
      school: schoolId,
      academicYear,
      teacher,
      class: classId,
      section,
      assignmentType,
      isActive: true,
    };

    if (
      assignmentType ===
      "SUBJECT_TEACHER"
    ) {
      duplicateQuery.subject =
        subject;
    }

    const existingAssignment =
      await TeacherAssignment.findOne(
        duplicateQuery,
      );

    if (existingAssignment) {
      res.status(400);
      throw new Error(
        "Teacher assignment already exists",
      );
    }

    const assignment =
      await TeacherAssignment.create({
        school: schoolId,
        academicYear,
        teacher,
        class: classId,
        section,
        subject:
          assignmentType ===
          "SUBJECT_TEACHER"
            ? subject
            : undefined,
        assignmentType,
        isActive: true,
      });

    const populatedAssignment =
      await TeacherAssignment.findById(
        assignment._id,
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

    res
      .status(201)
      .json(populatedAssignment);
  });

export const getTeacherAssignments =
  asyncHandler(async (req, res) => {
    const {
      academicYear,
      teacher,
      class: classId,
      section,
      subject,
      assignmentType,
      isActive,
    } = req.query;

    const schoolId = req.schoolId;
    console.log("Teacher assignments request:", {
      schoolId,
      schoolIdType: typeof schoolId,
      query: req.query,
      user: req.user?._id,
    });

    if (!schoolId) {
      res.status(403);
      throw new Error(
        "School could not be determined",
      );
    }

    await validateSchool(schoolId);

    const filter = {
      school: schoolId,
    };

    if (academicYear) {
      filter.academicYear =
        academicYear;
    }

    if (teacher) {
      filter.teacher = teacher;
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
      filter.assignmentType =
        assignmentType;
    }

    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    const assignments =
      await TeacherAssignment.find(
        filter,
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
        )
        .sort({
          academicYear: 1,
          class: 1,
          section: 1,
          assignmentType: 1,
        });

    res.json(assignments);
  });

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

export const getMyTeacherAssignments =
  asyncHandler(async (req, res) => {
    if (req.user.role !== "TEACHER") {
      res.status(403);
      throw new Error(
        "Only teachers can access their assignments",
      );
    }

    if (!req.schoolId) {
      res.status(403);
      throw new Error(
        "Teacher does not belong to a school",
      );
    }

    const assignments =
      await TeacherAssignment.find({
        school: req.schoolId,
        teacher: req.user._id,
        isActive: true,
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

    const {
      academicYear,
      teacher,
      class: classId,
      section,
      subject,
      assignmentType,
    } = req.body;

    const schoolId =
      req.schoolId;

    const academicYearId =
      academicYear ||
      assignment.academicYear.toString();

    const teacherId =
      teacher ||
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

    if (
      selectedType ===
      "SUBJECT_TEACHER"
    ) {
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

    await validateAssignmentData({
      schoolId,
      academicYearId,
      teacherId,
      classId: selectedClass,
      sectionId: selectedSection,
      subjectId: selectedSubject,
      assignmentType:
        selectedType,
    });

    if (
      selectedType ===
      "CLASS_TEACHER"
    ) {
      const existingClassTeacher =
        await TeacherAssignment.findOne({
          _id: {
            $ne: assignment._id,
          },
          school: schoolId,
          academicYear:
            academicYearId,
          section:
            selectedSection,
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

    const duplicateQuery = {
      _id: {
        $ne: assignment._id,
      },
      school: schoolId,
      academicYear:
        academicYearId,
      teacher: teacherId,
      class: selectedClass,
      section: selectedSection,
      assignmentType:
        selectedType,
      isActive: true,
    };

    if (
      selectedType ===
      "SUBJECT_TEACHER"
    ) {
      duplicateQuery.subject =
        selectedSubject;
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

    assignment.academicYear =
      academicYearId;

    assignment.teacher =
      teacherId;

    assignment.class =
      selectedClass;

    assignment.section =
      selectedSection;

    assignment.assignmentType =
      selectedType;

    assignment.subject =
      selectedType ===
      "SUBJECT_TEACHER"
        ? selectedSubject
        : undefined;

    const updatedAssignment =
      await assignment.save();

    const populatedAssignment =
      await TeacherAssignment.findById(
        updatedAssignment._id,
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