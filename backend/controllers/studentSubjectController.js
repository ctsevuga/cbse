import asyncHandler from "../middleware/asyncHandler.js";

import StudentSubject from "../models/studentSubjectModel.js";
import Student from "../models/studentModel.js";
import AcademicYear from "../models/academicYearModel.js";
import Class from "../models/classModel.js";
import Section from "../models/sectionModel.js";
import Stream from "../models/streamModel.js";
import SubjectCombination from "../models/subjectCombinationModel.js";
import Subject from "../models/subjectModel.js";


// Get user's school
const getUserSchool = (req) => {
  if (req.user.role === "SUPER_ADMIN") {
    return null;
  }

  return req.schoolId;
};


// Validate student
const validateStudent = async (
  studentId,
  schoolId = null,
) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  if (
    schoolId &&
    String(student.school) !== String(schoolId)
  ) {
    throw new Error(
      "Student does not belong to your school",
    );
  }

  if (!student.isActive) {
    throw new Error("Student is inactive");
  }

  return student;
};


// Validate academic year
const validateAcademicYear = async (
  academicYearId,
  schoolId,
) => {
  const academicYear = await AcademicYear.findOne({
    _id: academicYearId,
    school: schoolId,
  });

  if (!academicYear) {
    throw new Error(
      "Academic year not found or does not belong to the student's school",
    );
  }

  if (!academicYear.isActive) {
    throw new Error("Academic year is inactive");
  }

  return academicYear;
};


// Validate class
const validateClass = async (
  classId,
  schoolId,
) => {
  const classData = await Class.findOne({
    _id: classId,
    school: schoolId,
  });

  if (!classData) {
    throw new Error(
      "Class not found or does not belong to the student's school",
    );
  }

  if (!classData.isActive) {
    throw new Error("Class is inactive");
  }

  return classData;
};


// Validate section
const validateSection = async (
  sectionId,
  schoolId,
  academicYearId,
  classId,
) => {
  const section = await Section.findOne({
    _id: sectionId,
    school: schoolId,
    academicYear: academicYearId,
    class: classId,
  });

  if (!section) {
    throw new Error(
      "Section not found or does not match the academic year and class",
    );
  }

  if (!section.isActive) {
    throw new Error("Section is inactive");
  }

  return section;
};


// Validate stream
const validateStream = async (
  streamId,
  schoolId,
) => {
  const stream = await Stream.findOne({
    _id: streamId,
    school: schoolId,
  });

  if (!stream) {
    throw new Error(
      "Stream not found or does not belong to the student's school",
    );
  }

  if (!stream.isActive) {
    throw new Error("Stream is inactive");
  }

  return stream;
};


// Validate subject combination
const validateSubjectCombination = async (
  subjectCombinationId,
  schoolId,
  academicYearId,
  streamId,
) => {
  const subjectCombination =
    await SubjectCombination.findOne({
      _id: subjectCombinationId,
      school: schoolId,
      academicYear: academicYearId,
      stream: streamId,
    });

  if (!subjectCombination) {
    throw new Error(
      "Subject combination not found or does not match the academic year and stream",
    );
  }

  if (!subjectCombination.isActive) {
    throw new Error("Subject combination is inactive");
  }

  return subjectCombination;
};


// Validate subject
const validateSubject = async (
  subjectId,
  schoolId,
  subjectCombination,
) => {
  const subject = await Subject.findOne({
    _id: subjectId,
    school: schoolId,
  });

  if (!subject) {
    throw new Error(
      "Subject not found or does not belong to the student's school",
    );
  }

  if (!subject.isActive) {
    throw new Error("Subject is inactive");
  }

  const belongsToCombination =
    subjectCombination.subjects.some(
      (combinationSubject) =>
        String(combinationSubject) ===
        String(subjectId),
    );

  if (!belongsToCombination) {
    throw new Error(
      "Selected subject does not belong to the subject combination",
    );
  }

  return subject;
};


// Validate student's academic structure
const validateStudentAcademicStructure = async ({
  student,
  academicYearId,
  classId,
  sectionId,
  streamId,
}) => {
  if (
    String(student.academicYear) !==
    String(academicYearId)
  ) {
    throw new Error(
      "Academic year does not match the student's academic year",
    );
  }

  if (
    String(student.class) !==
    String(classId)
  ) {
    throw new Error(
      "Class does not match the student's class",
    );
  }

  if (
    String(student.section) !==
    String(sectionId)
  ) {
    throw new Error(
      "Section does not match the student's section",
    );
  }

  if (
    String(student.stream) !==
    String(streamId)
  ) {
    throw new Error(
      "Stream does not match the student's stream",
    );
  }
};


// @desc    Create student subject
// @route   POST /api/student-subjects
// @access  Private
const createStudentSubject = asyncHandler(
  async (req, res) => {
    const {
      student,
      academicYear,
      class: classId,
      section,
      stream,
      subjectCombination,
      subject,
      subjectType,
      isCompulsory,
      isAdditional,
    } = req.body;

    if (!student) {
      res.status(400);
      throw new Error("Student is required");
    }

    if (!academicYear) {
      res.status(400);
      throw new Error("Academic year is required");
    }

    if (!classId) {
      res.status(400);
      throw new Error("Class is required");
    }

    if (!section) {
      res.status(400);
      throw new Error("Section is required");
    }

    if (!stream) {
      res.status(400);
      throw new Error("Stream is required");
    }

    if (!subjectCombination) {
      res.status(400);
      throw new Error(
        "Subject combination is required",
      );
    }

    if (!subject) {
      res.status(400);
      throw new Error("Subject is required");
    }

    if (!subjectType) {
      res.status(400);
      throw new Error("Subject type is required");
    }

    const schoolId = getUserSchool(req);

    const studentData = await validateStudent(
      student,
      schoolId,
    );

    const studentSchoolId = studentData.school;

    await validateAcademicYear(
      academicYear,
      studentSchoolId,
    );

    await validateClass(
      classId,
      studentSchoolId,
    );

    await validateSection(
      section,
      studentSchoolId,
      academicYear,
      classId,
    );

    await validateStream(
      stream,
      studentSchoolId,
    );

    await validateStudentAcademicStructure({
      student: studentData,
      academicYearId: academicYear,
      classId,
      sectionId: section,
      streamId: stream,
    });

    const combination =
      await validateSubjectCombination(
        subjectCombination,
        studentSchoolId,
        academicYear,
        stream,
      );

    await validateSubject(
      subject,
      studentSchoolId,
      combination,
    );

    const existingSubject =
      await StudentSubject.findOne({
        student,
        academicYear,
        subject,
      });

    if (existingSubject) {
      res.status(400);
      throw new Error(
        "This subject is already assigned to the student for this academic year",
      );
    }

    const studentSubject =
      await StudentSubject.create({
        student,
        academicYear,
        class: classId,
        section,
        stream,
        subjectCombination,
        subject,
        subjectType,
        isCompulsory: Boolean(isCompulsory),
        isAdditional: Boolean(isAdditional),
      });

    const result =
      await StudentSubject.findById(
        studentSubject._id,
      )
        .populate(
          "student",
          "admissionNumber dateOfBirth gender",
        )
        .populate(
          "academicYear",
          "name startDate endDate isCurrent",
        )
        .populate("class", "name code")
        .populate("section", "name")
        .populate("stream", "name code")
        .populate(
          "subjectCombination",
          "name code minimumSubjects maximumSubjects",
        )
        .populate("subject", "name code");

    res.status(201).json(result);
  },
);


// @desc    Get student subjects
// @route   GET /api/student-subjects
// @access  Private
const getStudentSubjects = asyncHandler(
  async (req, res) => {
    const {
      student,
      academicYear,
      class: classId,
      section,
      stream,
      subjectCombination,
      subject,
      subjectType,
      isCompulsory,
      isAdditional,
      isActive,
    } = req.query;

    const filter = {};

    if (student) {
      filter.student = student;
    }

    if (academicYear) {
      filter.academicYear = academicYear;
    }

    if (classId) {
      filter.class = classId;
    }

    if (section) {
      filter.section = section;
    }

    if (stream) {
      filter.stream = stream;
    }

    if (subjectCombination) {
      filter.subjectCombination =
        subjectCombination;
    }

    if (subject) {
      filter.subject = subject;
    }

    if (subjectType) {
      filter.subjectType = subjectType;
    }

    if (isCompulsory !== undefined) {
      filter.isCompulsory =
        isCompulsory === "true";
    }

    if (isAdditional !== undefined) {
      filter.isAdditional =
        isAdditional === "true";
    }

    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

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

      if (student) {
        const studentData =
          await validateStudent(
            student,
            req.schoolId,
          );

        filter.student = studentData._id;
      } else {
        filter.student = {
          $in: studentIds,
        };
      }
    }

    const studentSubjects =
      await StudentSubject.find(filter)
        .populate(
          "student",
          "admissionNumber dateOfBirth gender",
        )
        .populate(
          "academicYear",
          "name startDate endDate isCurrent",
        )
        .populate("class", "name code")
        .populate("section", "name")
        .populate("stream", "name code")
        .populate(
          "subjectCombination",
          "name code minimumSubjects maximumSubjects",
        )
        .populate("subject", "name code")
        .sort({
          student: 1,
          academicYear: 1,
          subject: 1,
        });

    res.json(studentSubjects);
  },
);


// @desc    Get student subject by ID
// @route   GET /api/student-subjects/:id
// @access  Private
const getStudentSubjectById =
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const studentSubject =
      await StudentSubject.findById(id)
        .populate(
          "student",
          "admissionNumber dateOfBirth gender school",
        )
        .populate(
          "academicYear",
          "name startDate endDate isCurrent",
        )
        .populate("class", "name code")
        .populate("section", "name")
        .populate("stream", "name code")
        .populate(
          "subjectCombination",
          "name code minimumSubjects maximumSubjects",
        )
        .populate("subject", "name code");

    if (!studentSubject) {
      res.status(404);
      throw new Error(
        "Student subject not found",
      );
    }

    if (
      req.user.role !== "SUPER_ADMIN"
    ) {
      if (!req.schoolId) {
        res.status(403);
        throw new Error(
          "User is not associated with a school",
        );
      }

      if (
        !studentSubject.student?.school ||
        String(
          studentSubject.student.school,
        ) !== String(req.schoolId)
      ) {
        res.status(403);
        throw new Error(
          "Not authorized to access this student subject",
        );
      }
    }

    res.json(studentSubject);
  });


// @desc    Get subjects assigned to a student
// @route   GET /api/student-subjects/student/:studentId
// @access  Private
const getSubjectsByStudent =
  asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await validateStudent(
      studentId,
      getUserSchool(req),
    );

    const studentSubjects =
      await StudentSubject.find({
        student: student._id,
      })
        .populate(
          "academicYear",
          "name startDate endDate isCurrent",
        )
        .populate("class", "name code")
        .populate("section", "name")
        .populate("stream", "name code")
        .populate(
          "subjectCombination",
          "name code minimumSubjects maximumSubjects",
        )
        .populate("subject", "name code")
        .sort({
          academicYear: 1,
          subject: 1,
        });

    res.json(studentSubjects);
  });


// @desc    Get my subjects
// @route   GET /api/student-subjects/my-subjects
// @access  Private
const getMySubjects =
  asyncHandler(async (req, res) => {
    if (req.user.role !== "STUDENT") {
      res.status(403);
      throw new Error(
        "Only students can access their subjects",
      );
    }

    if (!req.schoolId) {
      res.status(403);
      throw new Error(
        "User is not associated with a school",
      );
    }

    const student = await Student.findOne({
      user: req.user._id,
      school: req.schoolId,
    });

    if (!student) {
      res.status(404);
      throw new Error(
        "Student profile not found",
      );
    }

    const studentSubjects =
      await StudentSubject.find({
        student: student._id,
        isActive: true,
      })
        .populate(
          "academicYear",
          "name startDate endDate isCurrent",
        )
        .populate("class", "name code")
        .populate("section", "name")
        .populate("stream", "name code")
        .populate(
          "subjectCombination",
          "name code minimumSubjects maximumSubjects",
        )
        .populate("subject", "name code")
        .sort({
          academicYear: 1,
          subject: 1,
        });

    res.json(studentSubjects);
  });


// @desc    Get subjects by academic year
// @route   GET /api/student-subjects/academic-year/:academicYearId
// @access  Private
const getSubjectsByAcademicYear =
  asyncHandler(async (req, res) => {
    const { academicYearId } =
      req.params;

    const filter = {
      academicYear: academicYearId,
    };

    if (req.user.role !== "SUPER_ADMIN") {
      if (!req.schoolId) {
        res.status(403);
        throw new Error(
          "User is not associated with a school",
        );
      }

      await validateAcademicYear(
        academicYearId,
        req.schoolId,
      );

      filter.student = {
        $in: await Student.find({
          school: req.schoolId,
        }).distinct("_id"),
      };
    }

    const studentSubjects =
      await StudentSubject.find(filter)
        .populate(
          "student",
          "admissionNumber dateOfBirth gender",
        )
        .populate("class", "name code")
        .populate("section", "name")
        .populate("stream", "name code")
        .populate(
          "subjectCombination",
          "name code minimumSubjects maximumSubjects",
        )
        .populate("subject", "name code")
        .sort({
          student: 1,
          subject: 1,
        });

    res.json(studentSubjects);
  });


// @desc    Get subjects by stream
// @route   GET /api/student-subjects/stream/:streamId
// @access  Private
const getSubjectsByStream =
  asyncHandler(async (req, res) => {
    const { streamId } = req.params;

    const filter = {
      stream: streamId,
    };

    if (req.user.role !== "SUPER_ADMIN") {
      if (!req.schoolId) {
        res.status(403);
        throw new Error(
          "User is not associated with a school",
        );
      }

      await validateStream(
        streamId,
        req.schoolId,
      );

      filter.student = {
        $in: await Student.find({
          school: req.schoolId,
        }).distinct("_id"),
      };
    }

    const studentSubjects =
      await StudentSubject.find(filter)
        .populate(
          "student",
          "admissionNumber dateOfBirth gender",
        )
        .populate(
          "academicYear",
          "name startDate endDate isCurrent",
        )
        .populate("class", "name code")
        .populate("section", "name")
        .populate("stream", "name code")
        .populate(
          "subjectCombination",
          "name code minimumSubjects maximumSubjects",
        )
        .populate("subject", "name code")
        .sort({
          student: 1,
          academicYear: 1,
          subject: 1,
        });

    res.json(studentSubjects);
  });


// @desc    Update student subject
// @route   PUT /api/student-subjects/:id
// @access  Private
const updateStudentSubject =
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const studentSubject =
      await StudentSubject.findById(id)
        .populate("student");

    if (!studentSubject) {
      res.status(404);
      throw new Error(
        "Student subject not found",
      );
    }

    if (
      req.user.role !== "SUPER_ADMIN"
    ) {
      if (!req.schoolId) {
        res.status(403);
        throw new Error(
          "User is not associated with a school",
        );
      }

      if (
        !studentSubject.student?.school ||
        String(
          studentSubject.student.school,
        ) !== String(req.schoolId)
      ) {
        res.status(403);
        throw new Error(
          "Not authorized to update this student subject",
        );
      }
    }

    const {
      academicYear,
      class: classId,
      section,
      stream,
      subjectCombination,
      subject,
      subjectType,
      isCompulsory,
      isAdditional,
    } = req.body;

    const newAcademicYear =
      academicYear ||
      studentSubject.academicYear;

    const newClass =
      classId ||
      studentSubject.class;

    const newSection =
      section ||
      studentSubject.section;

    const newStream =
      stream ||
      studentSubject.stream;

    const newSubjectCombination =
      subjectCombination ||
      studentSubject.subjectCombination;

    const newSubject =
      subject ||
      studentSubject.subject;

    const newSubjectType =
      subjectType ||
      studentSubject.subjectType;

    const newIsCompulsory =
      isCompulsory !== undefined
        ? Boolean(isCompulsory)
        : studentSubject.isCompulsory;

    const newIsAdditional =
      isAdditional !== undefined
        ? Boolean(isAdditional)
        : studentSubject.isAdditional;

    const studentSchoolId =
      studentSubject.student.school;

    await validateAcademicYear(
      newAcademicYear,
      studentSchoolId,
    );

    await validateClass(
      newClass,
      studentSchoolId,
    );

    await validateSection(
      newSection,
      studentSchoolId,
      newAcademicYear,
      newClass,
    );

    await validateStream(
      newStream,
      studentSchoolId,
    );

    await validateStudentAcademicStructure({
      student: studentSubject.student,
      academicYearId: newAcademicYear,
      classId: newClass,
      sectionId: newSection,
      streamId: newStream,
    });

    const combination =
      await validateSubjectCombination(
        newSubjectCombination,
        studentSchoolId,
        newAcademicYear,
        newStream,
      );

    await validateSubject(
      newSubject,
      studentSchoolId,
      combination,
    );

    const duplicateSubject =
      await StudentSubject.findOne({
        _id: { $ne: id },
        student: studentSubject.student._id,
        academicYear: newAcademicYear,
        subject: newSubject,
      });

    if (duplicateSubject) {
      res.status(400);
      throw new Error(
        "This subject is already assigned to the student for this academic year",
      );
    }

    studentSubject.academicYear =
      newAcademicYear;

    studentSubject.class = newClass;
    studentSubject.section = newSection;
    studentSubject.stream = newStream;

    studentSubject.subjectCombination =
      newSubjectCombination;

    studentSubject.subject = newSubject;
    studentSubject.subjectType =
      newSubjectType;

    studentSubject.isCompulsory =
      newIsCompulsory;

    studentSubject.isAdditional =
      newIsAdditional;

    const updatedStudentSubject =
      await studentSubject.save();

    const result =
      await StudentSubject.findById(
        updatedStudentSubject._id,
      )
        .populate(
          "student",
          "admissionNumber dateOfBirth gender",
        )
        .populate(
          "academicYear",
          "name startDate endDate isCurrent",
        )
        .populate("class", "name code")
        .populate("section", "name")
        .populate("stream", "name code")
        .populate(
          "subjectCombination",
          "name code minimumSubjects maximumSubjects",
        )
        .populate("subject", "name code");

    res.json(result);
  });


// @desc    Update student subject status
// @route   PATCH /api/student-subjects/:id/status
// @access  Private
const updateStudentSubjectStatus =
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be a boolean",
      );
    }

    const studentSubject =
      await StudentSubject.findById(id)
        .populate("student");

    if (!studentSubject) {
      res.status(404);
      throw new Error(
        "Student subject not found",
      );
    }

    if (
      req.user.role !== "SUPER_ADMIN"
    ) {
      if (!req.schoolId) {
        res.status(403);
        throw new Error(
          "User is not associated with a school",
        );
      }

      if (
        !studentSubject.student?.school ||
        String(
          studentSubject.student.school,
        ) !== String(req.schoolId)
      ) {
        res.status(403);
        throw new Error(
          "Not authorized to update this student subject",
        );
      }
    }

    if (isActive) {
      const studentSchoolId =
        studentSubject.student.school;

      await validateAcademicYear(
        studentSubject.academicYear,
        studentSchoolId,
      );

      await validateClass(
        studentSubject.class,
        studentSchoolId,
      );

      await validateSection(
        studentSubject.section,
        studentSchoolId,
        studentSubject.academicYear,
        studentSubject.class,
      );

      await validateStream(
        studentSubject.stream,
        studentSchoolId,
      );

      const combination =
        await validateSubjectCombination(
          studentSubject.subjectCombination,
          studentSchoolId,
          studentSubject.academicYear,
          studentSubject.stream,
        );

      await validateSubject(
        studentSubject.subject,
        studentSchoolId,
        combination,
      );
    }

    studentSubject.isActive =
      isActive;

    const updatedStudentSubject =
      await studentSubject.save();

    const result =
      await StudentSubject.findById(
        updatedStudentSubject._id,
      )
        .populate(
          "student",
          "admissionNumber dateOfBirth gender",
        )
        .populate(
          "academicYear",
          "name startDate endDate isCurrent",
        )
        .populate("class", "name code")
        .populate("section", "name")
        .populate("stream", "name code")
        .populate(
          "subjectCombination",
          "name code minimumSubjects maximumSubjects",
        )
        .populate("subject", "name code");

    res.json(result);
  });


// @desc    Delete student subject
// @route   DELETE /api/student-subjects/:id
// @access  Private
const deleteStudentSubject =
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const studentSubject =
      await StudentSubject.findById(id)
        .populate("student");

    if (!studentSubject) {
      res.status(404);
      throw new Error(
        "Student subject not found",
      );
    }

    if (
      req.user.role !== "SUPER_ADMIN"
    ) {
      if (!req.schoolId) {
        res.status(403);
        throw new Error(
          "User is not associated with a school",
        );
      }

      if (
        !studentSubject.student?.school ||
        String(
          studentSubject.student.school,
        ) !== String(req.schoolId)
      ) {
        res.status(403);
        throw new Error(
          "Not authorized to delete this student subject",
        );
      }
    }

    await studentSubject.deleteOne();

    res.json({
      message:
        "Student subject deleted successfully",
    });
  });


export {
  createStudentSubject,
  getStudentSubjects,
  getStudentSubjectById,
  getSubjectsByStudent,
  getMySubjects,
  getSubjectsByAcademicYear,
  getSubjectsByStream,
  updateStudentSubject,
  updateStudentSubjectStatus,
  deleteStudentSubject,
};