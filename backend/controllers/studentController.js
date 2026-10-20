import asyncHandler from "../middleware/asyncHandler.js";

import Student from "../models/studentModel.js";
import User from "../models/userModel.js";
import School from "../models/schoolModel.js";
import AcademicYear from "../models/academicYearModel.js";
import SubjectCombination from "../models/subjectCombinationModel.js";
import Subject from "../models/subjectModel.js";
import Stream from "../models/streamModel.js";

/**
 * Get school for the request.
 *
 * SUPER_ADMIN may specify a school.
 * Other users can only use their own school.
 */
const getUserSchool = (req, requestedSchool) => {
  if (req.user.role === "SUPER_ADMIN") {
    return requestedSchool || null;
  }

  return req.schoolId;
};

/**
 * ======================================================
 * Validate student subjects against SubjectCombination
 * ======================================================
 *
 * Student stores actual enrollment:
 *
 * subjects: [
 *   {
 *     subject: ObjectId,
 *     type: "CORE",
 *   },
 *   {
 *     subject: ObjectId,
 *     type: "ELECTIVE",
 *   },
 * ]
 *
 * SubjectCombination stores the rules/configuration:
 *
 * coreSubjects: [...]
 * electiveSubjects: [...]
 * minimumElectives
 * maximumElectives
 */
const validateStudentSubjects = async ({
  school,
  academicYear,
  stream,
  subjects,
}) => {
  if (!Array.isArray(subjects)) {
    throw new Error("Subjects must be an array");
  }

  if (subjects.length === 0) {
    throw new Error("At least one subject is required");
  }

  /**
   * ------------------------------------------------------
   * Validate subject object structure
   * ------------------------------------------------------
   */
  for (const item of subjects) {
    if (!item || !item.subject) {
      throw new Error(
        "Every selected subject must contain a subject",
      );
    }

    if (!["CORE", "ELECTIVE"].includes(item.type)) {
      throw new Error(
        "Every selected subject must have type CORE or ELECTIVE",
      );
    }
  }

  /**
   * ------------------------------------------------------
   * Prevent duplicate subjects
   * ------------------------------------------------------
   */
  const subjectIds = subjects.map((item) =>
    String(item.subject),
  );

  const uniqueSubjectIds = new Set(subjectIds);

  if (uniqueSubjectIds.size !== subjectIds.length) {
    throw new Error(
      "A subject cannot be selected more than once",
    );
  }

  /**
   * ------------------------------------------------------
   * Find applicable combination
   *
   * Combination belongs to:
   *   AcademicYear + Stream
   * ------------------------------------------------------
   */
  const combination = await SubjectCombination.findOne({
    school,
    academicYear,
    stream,
    isActive: true,
  }).lean();

  if (!combination) {
    throw new Error(
      "No active subject combination found for this academic year and stream",
    );
  }

  const coreSubjectIds = new Set(
    (combination.coreSubjects || []).map(String),
  );

  const electiveSubjectIds = new Set(
    (combination.electiveSubjects || []).map(String),
  );

  /**
   * ------------------------------------------------------
   * Validate actual Subject documents
   * ------------------------------------------------------
   */
  const existingSubjects = await Subject.find({
    _id: {
      $in: subjectIds,
    },
    school,
    isActive: true,
  }).select("_id name code");

  if (existingSubjects.length !== subjectIds.length) {
    throw new Error(
      "One or more selected subjects are invalid or inactive",
    );
  }

  /**
   * ------------------------------------------------------
   * Validate each subject against combination
   * ------------------------------------------------------
   */
  for (const item of subjects) {
    const subjectId = String(item.subject);

    const belongsToCore = coreSubjectIds.has(subjectId);
    const belongsToElective =
      electiveSubjectIds.has(subjectId);

    if (!belongsToCore && !belongsToElective) {
      throw new Error(
        "One or more selected subjects are not available in the subject combination",
      );
    }

    if (item.type === "CORE" && !belongsToCore) {
      throw new Error(
        "A selected subject is classified as CORE but is not a core subject in the combination",
      );
    }

    if (item.type === "ELECTIVE" && !belongsToElective) {
      throw new Error(
        "A selected subject is classified as ELECTIVE but is not an elective subject in the combination",
      );
    }
  }

  /**
   * ------------------------------------------------------
   * Count core/elective subjects
   * ------------------------------------------------------
   */
  const coreSubjects = subjects.filter(
    (item) => item.type === "CORE",
  );

  const electiveSubjects = subjects.filter(
    (item) => item.type === "ELECTIVE",
  );

  /**
   * ------------------------------------------------------
   * At least one core subject
   * ------------------------------------------------------
   */
  if (coreSubjects.length === 0) {
    throw new Error(
      "At least one core subject must be selected",
    );
  }

  /**
   * ------------------------------------------------------
   * Validate elective rules
   * ------------------------------------------------------
   */
  const minimumElectives =
    combination.minimumElectives ?? 0;

  const maximumElectives =
    combination.maximumElectives ?? 0;

  if (minimumElectives > maximumElectives) {
    throw new Error(
      "Invalid subject combination: minimum electives cannot exceed maximum electives",
    );
  }

  if (electiveSubjects.length < minimumElectives) {
    throw new Error(
      `At least ${minimumElectives} elective subject${
        minimumElectives === 1 ? "" : "s"
      } must be selected`,
    );
  }

  if (electiveSubjects.length > maximumElectives) {
    throw new Error(
      `A maximum of ${maximumElectives} elective subject${
        maximumElectives === 1 ? "" : "s"
      } can be selected`,
    );
  }

  /**
   * ------------------------------------------------------
   * Ensure combination itself has enough electives
   * ------------------------------------------------------
   */
  if (
    maximumElectives >
    (combination.electiveSubjects || []).length
  ) {
    throw new Error(
      "Invalid subject combination: maximum electives exceeds available elective subjects",
    );
  }

  return combination;
};

/**
 * ======================================================
 * @desc    Create Student
 * @route   POST /api/students
 * @access  Admin
 * ======================================================
 */
const createStudent = asyncHandler(async (req, res) => {
  const {
    user,
    school,
    admissionNumber,
    dateOfBirth,
    gender,
    academicYear,
    class: classId,
    section,
    stream,
    subjects,
    isActive,
  } = req.body;

  const userSchool = getUserSchool(req, school);

  if (!userSchool) {
    res.status(400);
    throw new Error("School is required");
  }

  if (
    !user ||
    !admissionNumber ||
    !dateOfBirth ||
    !gender ||
    !academicYear ||
    !classId ||
    !section ||
    !stream
  ) {
    res.status(400);
    throw new Error(
      "User, admission number, date of birth, gender, academic year, class, section and stream are required",
    );
  }

  const schoolExists = await School.findById(userSchool);

  if (!schoolExists) {
    res.status(404);
    throw new Error("School not found");
  }

  if (!schoolExists.isActive) {
    res.status(400);
    throw new Error(
      "Cannot create student for an inactive school",
    );
  }

  const studentUser = await User.findById(user);

  if (!studentUser) {
    res.status(404);
    throw new Error("User not found");
  }

  if (studentUser.role !== "STUDENT") {
    res.status(400);
    throw new Error(
      "Selected user must have the STUDENT role",
    );
  }

  if (
    !studentUser.school ||
    String(studentUser.school) !== String(userSchool)
  ) {
    res.status(400);
    throw new Error(
      "Student user does not belong to this school",
    );
  }

  const existingStudentByUser = await Student.findOne({
    user,
  });

  if (existingStudentByUser) {
    res.status(400);
    throw new Error(
      "A student profile already exists for this user",
    );
  }

  const normalizedAdmissionNumber =
    admissionNumber.trim().toUpperCase();

  const existingStudent = await Student.findOne({
    school: userSchool,
    admissionNumber: normalizedAdmissionNumber,
  });

  if (existingStudent) {
    res.status(400);
    throw new Error(
      "Admission number already exists in this school",
    );
  }

  const academicYearExists = await AcademicYear.findOne({
    _id: academicYear,
    school: userSchool,
    isActive: true,
  });

  if (!academicYearExists) {
    res.status(400);
    throw new Error(
      "Invalid or inactive academic year for this school",
    );
  }

  const dob = new Date(dateOfBirth);

  if (Number.isNaN(dob.getTime())) {
    res.status(400);
    throw new Error("Invalid date of birth");
  }

  /**
   * Validate student's actual subject enrollment.
   */
  let validatedSubjects = [];

  try {
    await validateStudentSubjects({
      school: userSchool,
      academicYear,
      stream,
      subjects,
    });

    validatedSubjects = subjects.map((item) => ({
      subject: item.subject,
      type: item.type,
    }));
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

  const student = await Student.create({
    user,
    school: userSchool,
    admissionNumber: normalizedAdmissionNumber,
    dateOfBirth: dob,
    gender,
    academicYear,
    class: classId,
    section,
    stream,
    subjects: validatedSubjects,
    isActive: isActive !== undefined ? isActive : true,
  });

  const createdStudent = await Student.findById(student._id)
    .populate("user", "name email phone role isActive")
    .populate("school", "name code")
    .populate(
      "academicYear",
      "name startDate endDate isCurrent",
    )
    .populate("class", "name code")
    .populate("section", "name")
    .populate("subjects.subject", "name code");

  res.status(201).json(createdStudent);
});

/**
 * ======================================================
 * @desc    Get All Students
 * @route   GET /api/students
 * @access  Private
 * ======================================================
 */
const getStudents = asyncHandler(async (req, res) => {
  const query = {};

  const schoolId = getUserSchool(req, req.query.school);

  if (req.user.role !== "SUPER_ADMIN") {
    if (!req.schoolId) {
      res.status(403);
      throw new Error(
        "User is not associated with a school",
      );
    }

    query.school = req.schoolId;
  } else if (schoolId) {
    query.school = schoolId;
  }

  if (req.query.academicYear) {
    query.academicYear = req.query.academicYear;
  }

  if (req.query.class) {
    query.class = req.query.class;
  }

  if (req.query.section) {
    query.section = req.query.section;
  }

  // Filter by the Stream document's ObjectId.
  if (req.query.stream) {
  const streamCode = req.query.stream.trim().toUpperCase();

  const streamQuery = {
    code: streamCode,
    isActive: true,
  };

  // Restrict stream lookup to the authorized school.
  if (req.user.role !== "SUPER_ADMIN") {
    streamQuery.school = req.schoolId;
  } else if (schoolId) {
    streamQuery.school = schoolId;
  }

  const stream = await Stream.findOne(streamQuery)
    .select("_id")
    .lean();

  if (!stream) {
    return res.json([]);
  }

  query.stream = stream._id;
}

  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === "true";
  }

  const students = await Student.find(query)
    .populate("user", "name email phone role isActive")
    .populate("school", "name code")
    .populate(
      "academicYear",
      "name startDate endDate isCurrent",
    )
    .populate("class", "name code")
    .populate("section", "name")
    .populate("stream", "name code")
    .populate("subjects.subject", "name code")
    .sort({
      admissionNumber: 1,
    })
    .lean();

  res.json(students);
});

/**
 * ======================================================
 * @desc    Get Student By Id
 * @route   GET /api/students/:id
 * @access  Private
 * ======================================================
 */
const getStudentById = asyncHandler(async (req, res) => {
  const query = {
    _id: req.params.id,
  };

  if (req.user.role !== "SUPER_ADMIN") {
    if (!req.schoolId) {
      res.status(403);
      throw new Error(
        "User is not associated with a school",
      );
    }

    query.school = req.schoolId;
  }

  const student = await Student.findOne(query)
    .populate("user", "name email phone role isActive")
    .populate("school", "name code")
    .populate(
      "academicYear",
      "name startDate endDate isCurrent",
    )
    .populate("class", "name code")
    .populate("section", "name")
    .populate("stream", "name code")
    .populate("subjects.subject", "name code")
    .lean();

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  res.json(student);
});

/**
 * ======================================================
 * @desc    Get Student By User
 * @route   GET /api/students/user/:userId
 * @access  Private
 * ======================================================
 */
const getStudentByUser = asyncHandler(async (req, res) => {
  const query = {
    user: req.params.userId,
  };

  if (req.user.role !== "SUPER_ADMIN") {
    if (!req.schoolId) {
      res.status(403);
      throw new Error(
        "User is not associated with a school",
      );
    }

    query.school = req.schoolId;
  }

  const student = await Student.findOne(query)
    .populate("user", "name email phone role isActive")
    .populate("school", "name code")
    .populate(
      "academicYear",
      "name startDate endDate isCurrent",
    )
    .populate("class", "name code")
    .populate("section", "name")
    .populate("subjects.subject", "name code")
    .lean();

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  res.json(student);
});

/**
 * ======================================================
 * @desc    Get Logged-in Student Profile
 * @route   GET /api/students/me
 * @access  STUDENT
 * ======================================================
 */
const getMyStudentProfile = asyncHandler(async (req, res) => {
  if (!req.schoolId) {
    res.status(403);
    throw new Error(
      "User is not associated with a school",
    );
  }

  const student = await Student.findOne({
    user: req.user._id,
    school: req.schoolId,
  })
    .populate("user", "name email phone role isActive")
    .populate("school", "name code")
    .populate(
      "academicYear",
      "name startDate endDate isCurrent",
    )
    .populate("class", "name code")
    .populate("section", "name")
    .populate("subjects.subject", "name code")
    .lean();

  if (!student) {
    res.status(404);
    throw new Error(
      "Student profile not found",
    );
  }

  res.json(student);
});

/**
 * ======================================================
 * @desc    Update Student
 * @route   PUT /api/students/:id
 * @access  Admin
 * ======================================================
 */
const updateStudent = asyncHandler(async (req, res) => {
  const query = {
    _id: req.params.id,
  };

  if (req.user.role !== "SUPER_ADMIN") {
    if (!req.schoolId) {
      res.status(403);
      throw new Error(
        "User is not associated with a school",
      );
    }

    query.school = req.schoolId;
  }

  const student = await Student.findOne(query);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  if (
    req.body.school &&
    req.user.role !== "SUPER_ADMIN" &&
    String(req.body.school) !== String(req.schoolId)
  ) {
    res.status(403);
    throw new Error(
      "You cannot move a student to another school",
    );
  }

  /**
   * ------------------------------------------------------
   * Admission number
   * ------------------------------------------------------
   */
  if (
    req.body.admissionNumber &&
    req.body.admissionNumber.trim().toUpperCase() !==
      student.admissionNumber
  ) {
    const normalizedAdmissionNumber =
      req.body.admissionNumber.trim().toUpperCase();

    const admissionExists = await Student.findOne({
      school: student.school,
      admissionNumber: normalizedAdmissionNumber,
      _id: {
        $ne: student._id,
      },
    });

    if (admissionExists) {
      res.status(400);
      throw new Error(
        "Admission number already exists in this school",
      );
    }

    student.admissionNumber =
      normalizedAdmissionNumber;
  }

  /**
   * ------------------------------------------------------
   * Date of birth
   * ------------------------------------------------------
   */
  if (req.body.dateOfBirth) {
    const dob = new Date(req.body.dateOfBirth);

    if (Number.isNaN(dob.getTime())) {
      res.status(400);
      throw new Error("Invalid date of birth");
    }

    student.dateOfBirth = dob;
  }

  /**
   * ------------------------------------------------------
   * User
   * ------------------------------------------------------
   */
  if (
    req.body.user &&
    String(req.body.user) !== String(student.user)
  ) {
    const newUser = await User.findById(req.body.user);

    if (!newUser) {
      res.status(404);
      throw new Error("User not found");
    }

    if (newUser.role !== "STUDENT") {
      res.status(400);
      throw new Error(
        "Selected user must have the STUDENT role",
      );
    }

    if (
      !newUser.school ||
      String(newUser.school) !== String(student.school)
    ) {
      res.status(400);
      throw new Error(
        "Student user does not belong to this school",
      );
    }

    const userAlreadyAssigned = await Student.findOne({
      user: newUser._id,
      _id: {
        $ne: student._id,
      },
    });

    if (userAlreadyAssigned) {
      res.status(400);
      throw new Error(
        "A student profile already exists for this user",
      );
    }

    student.user = newUser._id;
  }

  /**
   * ------------------------------------------------------
   * Academic year
   * ------------------------------------------------------
   */
  if (req.body.academicYear) {
    const academicYear = await AcademicYear.findOne({
      _id: req.body.academicYear,
      school: student.school,
      isActive: true,
    });

    if (!academicYear) {
      res.status(400);
      throw new Error(
        "Invalid or inactive academic year for this school",
      );
    }

    student.academicYear = academicYear._id;
  }

  /**
   * ------------------------------------------------------
   * Basic fields
   * ------------------------------------------------------
   */
  student.gender =
    req.body.gender ?? student.gender;

  student.class =
    req.body.class ?? student.class;

  student.section =
    req.body.section ?? student.section;

  student.stream =
    req.body.stream ?? student.stream;

  /**
   * ------------------------------------------------------
   * Subjects
   *
   * Revalidate whenever subjects, academic year, or
   * stream changes.
   * ------------------------------------------------------
   */
  const subjectsChanged =
    req.body.subjects !== undefined;

  const academicYearChanged =
    req.body.academicYear !== undefined;

  const streamChanged =
    req.body.stream !== undefined;

  if (
    subjectsChanged ||
    academicYearChanged ||
    streamChanged
  ) {
    const subjects =
      req.body.subjects !== undefined
        ? req.body.subjects
        : student.subjects;

    try {
      await validateStudentSubjects({
        school: student.school,
        academicYear: student.academicYear,
        stream: student.stream,
        subjects,
      });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }

    student.subjects = subjects.map((item) => ({
      subject: item.subject,
      type: item.type,
    }));
  }

  /**
   * ------------------------------------------------------
   * Active status
   * ------------------------------------------------------
   */
  if (req.body.isActive !== undefined) {
    student.isActive = req.body.isActive;
  }

  const updatedStudent = await student.save();

  const populatedStudent = await Student.findById(
    updatedStudent._id,
  )
    .populate("user", "name email phone role isActive")
    .populate("school", "name code")
    .populate(
      "academicYear",
      "name startDate endDate isCurrent",
    )
    .populate("class", "name code")
    .populate("section", "name")
    .populate("subjects.subject", "name code");

  res.json(populatedStudent);
});

/**
 * ======================================================
 * @desc    Activate / Deactivate Student
 * @route   PATCH /api/students/:id/status
 * @access  Admin
 * ======================================================
 */
const updateStudentStatus = asyncHandler(
  async (req, res) => {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be a boolean value",
      );
    }

    const query = {
      _id: req.params.id,
    };

    if (req.user.role !== "SUPER_ADMIN") {
      if (!req.schoolId) {
        res.status(403);
        throw new Error(
          "User is not associated with a school",
        );
      }

      query.school = req.schoolId;
    }

    const student = await Student.findOne(query);

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    student.isActive = isActive;

    const updatedStudent = await student.save();

    const populatedStudent = await Student.findById(
      updatedStudent._id,
    )
      .populate("user", "name email phone role isActive")
      .populate("school", "name code")
      .populate(
        "academicYear",
        "name startDate endDate isCurrent",
      )
      .populate("class", "name code")
      .populate("section", "name")
      .populate("subjects.subject", "name code");

    res.json(populatedStudent);
  },
);

/**
 * ======================================================
 * @desc    Delete Student
 * @route   DELETE /api/students/:id
 * @access  Admin
 * ======================================================
 */
const deleteStudent = asyncHandler(async (req, res) => {
  const query = {
    _id: req.params.id,
  };

  if (req.user.role !== "SUPER_ADMIN") {
    if (!req.schoolId) {
      res.status(403);
      throw new Error(
        "User is not associated with a school",
      );
    }

    query.school = req.schoolId;
  }

  const student = await Student.findOne(query);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  await student.deleteOne();

  res.json({
    message: "Student deleted successfully",
  });
});

export {
  createStudent,
  getStudents,
  getStudentById,
  getStudentByUser,
  getMyStudentProfile,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
};
