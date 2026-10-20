import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import Assessment from "../models/assessmentModel.js";
import School from "../models/schoolModel.js";
import AcademicYear from "../models/academicYearModel.js";
import Class from "../models/classModel.js";
import Section from "../models/sectionModel.js";
import Stream from "../models/streamModel.js";
import Subject from "../models/subjectModel.js";
import User from "../models/userModel.js";
import QuestionBlueprint from "../models/questionBlueprintModel.js";
import Student from "../models/studentModel.js";
const AUTHORIZED_ROLES = [
  "SCHOOL_ADMIN",
  "HM",
  "TEACHER",
];

const ASSESSMENT_TYPES = [
  "CHAPTER_TEST",
  "UNIT_TEST",
  "MONTHLY_TEST",
  "REVISION_TEST",
  "MOCK_EXAM",
  "PRE_BOARD",
  "BOARD_PRACTICE",
];

const ASSESSMENT_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];

/**
 * ======================================================
 * Validate Authorized Role
 * ======================================================
 */
const validateAuthorizedRole = (req) => {
  if (!req.user) {
    throw new Error("Authentication required");
  }

  if (!AUTHORIZED_ROLES.includes(req.user.role)) {
    throw new Error(
      "User is not authorized to manage assessments",
    );
  }
};

/**
 * ======================================================
 * Get School Context
 * ======================================================
 *
 * School is ALWAYS resolved from req.schoolId.
 *
 * The client must never be able to provide school
 * through req.body or req.query.
 */
const getSchoolId = (req) => {
  if (!req.schoolId) {
    throw new Error("School is required");
  }

  if (!mongoose.Types.ObjectId.isValid(req.schoolId)) {
    throw new Error("Invalid school ID");
  }

  return req.schoolId;
};

/**
 * ======================================================
 * Validate School
 * ======================================================
 */
const validateSchool = async (schoolId) => {
  if (!schoolId) {
    throw new Error("School is required");
  }

  if (!mongoose.Types.ObjectId.isValid(schoolId)) {
    throw new Error("Invalid school ID");
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

/**
 * ======================================================
 * Validate Academic Year
 * ======================================================
 */
const validateAcademicYear = async (
  academicYearId,
  schoolId,
) => {
  if (!academicYearId) {
    throw new Error("Academic year is required");
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      academicYearId,
    )
  ) {
    throw new Error("Invalid academic year ID");
  }

  const academicYear =
    await AcademicYear.findOne({
      _id: academicYearId,
      school: schoolId,
    });

  if (!academicYear) {
    throw new Error(
      "Academic year not found for this school",
    );
  }

  if (!academicYear.isActive) {
    throw new Error("Academic year is inactive");
  }

  return academicYear;
};

/**
 * ======================================================
 * Validate Class
 * ======================================================
 */
const validateClass = async (
  classId,
  schoolId,
) => {
  if (!classId) {
    throw new Error("Class is required");
  }

  if (
    !mongoose.Types.ObjectId.isValid(classId)
  ) {
    throw new Error("Invalid class ID");
  }

  const classData = await Class.findOne({
    _id: classId,
    school: schoolId,
  });

  if (!classData) {
    throw new Error(
      "Class not found for this school",
    );
  }

  if (!classData.isActive) {
    throw new Error("Class is inactive");
  }

  return classData;
};

/**
 * ======================================================
 * Validate Section
 * ======================================================
 */
const validateSection = async (
  sectionId,
  schoolId,
  academicYearId,
  classId,
) => {
  if (!sectionId) {
    return null;
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      sectionId,
    )
  ) {
    throw new Error("Invalid section ID");
  }

  const section = await Section.findOne({
    _id: sectionId,
    school: schoolId,
    academicYear: academicYearId,
    class: classId,
  });

  if (!section) {
    throw new Error(
      "Section not found for this school, academic year and class",
    );
  }

  if (!section.isActive) {
    throw new Error("Section is inactive");
  }

  return section;
};

/**
 * ======================================================
 * Validate Stream
 * ======================================================
 */
const validateStream = async (
  streamId,
  schoolId,
) => {
  if (!streamId) {
    return null;
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      streamId,
    )
  ) {
    throw new Error("Invalid stream ID");
  }

  const stream = await Stream.findOne({
    _id: streamId,
    school: schoolId,
  });

  if (!stream) {
    throw new Error(
      "Stream not found for this school",
    );
  }

  if (!stream.isActive) {
    throw new Error("Stream is inactive");
  }

  return stream;
};

/**
 * ======================================================
 * Validate Subject
 * ======================================================
 *
 * Subject is a GLOBAL MASTER.
 *
 * It is intentionally NOT filtered by school.
 */
const validateSubject = async (
  subjectId,
) => {
  if (!subjectId) {
    throw new Error("Subject is required");
  }

  if (
    !mongoose.Types.ObjectId.isValid(subjectId)
  ) {
    throw new Error("Invalid subject ID");
  }

  const subject =
    await Subject.findById(subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  if (!subject.isActive) {
    throw new Error("Subject is inactive");
  }

  return subject;
};

/**
 * ======================================================
 * Validate Creator
 * ======================================================
 *
 * Creator:
 * - Must exist
 * - Must be active
 * - Must belong to resolved school
 * - Must have an authorized role
 */
const validateCreator = async (
  userId,
  schoolId,
) => {
  if (!userId) {
    throw new Error("Creator is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Creator not found");
  }

  if (
    !user.school ||
    user.school.toString() !==
      schoolId.toString()
  ) {
    throw new Error(
      "Creator does not belong to this school",
    );
  }

  if (!user.isActive) {
    throw new Error("Creator is inactive");
  }

  if (
    !AUTHORIZED_ROLES.includes(user.role)
  ) {
    throw new Error(
      "User is not authorized to create assessments",
    );
  }

  return user;
};

/**
 * ======================================================
 * Validate Question Blueprint
 * ======================================================
 *
 * Blueprint must match:
 * - school
 * - academic year
 * - class
 * - subject
 * - stream
 */
const validateQuestionBlueprint = async (
  blueprintId,
  schoolId,
  academicYearId,
  classId,
  subjectId,
  streamId,
) => {
  if (!blueprintId) {
    return null;
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      blueprintId,
    )
  ) {
    throw new Error(
      "Invalid question blueprint ID",
    );
  }

  const blueprint =
    await QuestionBlueprint.findOne({
      _id: blueprintId,
      school: schoolId,
      academicYear: academicYearId,
      class: classId,
      subject: subjectId,
    });

  if (!blueprint) {
    throw new Error(
      "Question blueprint not found for this academic structure",
    );
  }

  if (!blueprint.isActive) {
    throw new Error(
      "Question blueprint is inactive",
    );
  }

  if (streamId) {
    if (
      !blueprint.stream ||
      blueprint.stream.toString() !==
        streamId.toString()
    ) {
      throw new Error(
        "Question blueprint does not belong to the selected stream",
      );
    }
  } else if (blueprint.stream) {
    throw new Error(
      "Question blueprint belongs to a stream and cannot be used without a stream",
    );
  }

  return blueprint;
};

/**
 * ======================================================
 * Validation Helpers
 * ======================================================
 */
const validateAssessmentType = (
  assessmentType,
) => {
  if (
    !ASSESSMENT_TYPES.includes(
      assessmentType,
    )
  ) {
    throw new Error(
      "Invalid assessment type",
    );
  }
};

const validateStatus = (status) => {
  if (
    !ASSESSMENT_STATUSES.includes(status)
  ) {
    throw new Error(
      "Invalid assessment status",
    );
  }
};

const validateNumbers = (
  durationMinutes,
  totalQuestions,
  totalMarks,
  maxAttempts,
) => {
  if (
    durationMinutes === undefined ||
    Number(durationMinutes) < 1 ||
    !Number.isInteger(
      Number(durationMinutes),
    )
  ) {
    throw new Error(
      "durationMinutes must be a positive integer",
    );
  }

  if (
    totalQuestions === undefined ||
    Number(totalQuestions) < 1 ||
    !Number.isInteger(
      Number(totalQuestions),
    )
  ) {
    throw new Error(
      "totalQuestions must be a positive integer",
    );
  }

  if (
    totalMarks === undefined ||
    Number(totalMarks) < 1
  ) {
    throw new Error(
      "totalMarks must be greater than 0",
    );
  }

  if (
    maxAttempts === undefined ||
    Number(maxAttempts) < 1 ||
    !Number.isInteger(
      Number(maxAttempts),
    )
  ) {
    throw new Error(
      "maxAttempts must be a positive integer",
    );
  }
};

const validateDates = (
  startDate,
  endDate,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime())) {
    throw new Error(
      "Invalid startDate",
    );
  }

  if (Number.isNaN(end.getTime())) {
    throw new Error(
      "Invalid endDate",
    );
  }

  if (start >= end) {
    throw new Error(
      "startDate must be before endDate",
    );
  }

  return { start, end };
};

const validateAssessmentStatusTransition = (
  currentStatus,
  newStatus,
) => {
  const allowedTransitions = {
    DRAFT: [
      "DRAFT",
      "SCHEDULED",
      "CANCELLED",
    ],
    SCHEDULED: [
      "SCHEDULED",
      "ACTIVE",
      "CANCELLED",
    ],
    ACTIVE: [
      "ACTIVE",
      "COMPLETED",
      "CANCELLED",
    ],
    COMPLETED: ["COMPLETED"],
    CANCELLED: ["CANCELLED"],
  };

  if (
    !allowedTransitions[currentStatus]?.includes(
      newStatus,
    )
  ) {
    throw new Error(
      `Assessment cannot change from ${currentStatus} to ${newStatus}`,
    );
  }
};

/**
 * ======================================================
 * Populate Assessment
 * ======================================================
 */
const populateAssessment = (query) =>
  query
    .populate(
      "school",
      "name code",
    )
    .populate(
      "academicYear",
      "name startDate endDate isCurrent",
    )
    .populate(
      "class",
      "name code",
    )
    .populate(
      "section",
      "name classTeacher",
    )
    .populate(
      "stream",
      "name code",
    )
    .populate(
      "subject",
      "name code shortName subjectType cbseSubjectCode",
    )
    .populate(
      "createdBy",
      "name email phone role",
    )
    .populate(
      "questionBlueprint",
      "totalQuestions totalMarks rules difficultyDistribution questionTypeDistribution",
    );

/**
 * ======================================================
 * Create Assessment
 * ======================================================
 */
const createAssessment = asyncHandler(
  async (req, res) => {
    validateAuthorizedRole(req);

    const schoolId = getSchoolId(req);

    const {
      academicYear,
      class: classId,
      section,
      stream,
      subject,
      title,
      description,
      assessmentType,
      durationMinutes,
      totalQuestions,
      totalMarks,
      randomizeQuestions,
      randomizeOptions,
      maxAttempts,
      startDate,
      endDate,
      status,
      questionBlueprint,
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error(
        "Assessment title is required",
      );
    }

    await validateSchool(schoolId);

    await validateAcademicYear(
      academicYear,
      schoolId,
    );

    await validateClass(
      classId,
      schoolId,
    );

    await validateSection(
      section,
      schoolId,
      academicYear,
      classId,
    );

    await validateStream(
      stream,
      schoolId,
    );

    // Subject is global.
    await validateSubject(subject);

    await validateCreator(
      req.user._id,
      schoolId,
    );

    validateAssessmentType(
      assessmentType,
    );

    validateNumbers(
      durationMinutes,
      totalQuestions,
      totalMarks,
      maxAttempts === undefined
        ? 1
        : maxAttempts,
    );

    const dates = validateDates(
      startDate,
      endDate,
    );

    if (status !== undefined) {
      validateStatus(status);

      if (
        status === "ACTIVE" ||
        status === "COMPLETED"
      ) {
        res.status(400);
        throw new Error(
          "New assessments can only be created as DRAFT, SCHEDULED or CANCELLED",
        );
      }
    }

    await validateQuestionBlueprint(
      questionBlueprint,
      schoolId,
      academicYear,
      classId,
      subject,
      stream,
    );

    const existingQuery = {
      school: schoolId,
      academicYear,
      class: classId,
      subject,
      title: title.trim(),
    };

    if (section) {
      existingQuery.section = section;
    } else {
      existingQuery.section = {
        $exists: false,
      };
    }

    const existingAssessment =
      await Assessment.findOne(
        existingQuery,
      );

    if (existingAssessment) {
      res.status(400);
      throw new Error(
        "An assessment with the same title already exists for this academic structure",
      );
    }

    const assessment =
      await Assessment.create({
        school: schoolId,
        academicYear,
        class: classId,
        section:
          section || undefined,
        stream:
          stream || undefined,
        subject,
        title: title.trim(),
        description,
        assessmentType,
        durationMinutes,
        totalQuestions,
        totalMarks,
        randomizeQuestions:
          randomizeQuestions !==
          undefined
            ? randomizeQuestions
            : false,
        randomizeOptions:
          randomizeOptions !==
          undefined
            ? randomizeOptions
            : false,
        maxAttempts:
          maxAttempts !== undefined
            ? maxAttempts
            : 1,
        startDate: dates.start,
        endDate: dates.end,
        status:
          status || "DRAFT",
        createdBy: req.user._id,
        questionBlueprint:
          questionBlueprint ||
          undefined,
      });

    const result =
      await populateAssessment(
        Assessment.findById(
          assessment._id,
        ),
      );

    res.status(201).json(result);
  },
);

/**
 * ======================================================
 * Get Assessments
 * ======================================================
 */
const getAssessments = asyncHandler(
  async (req, res) => {
    validateAuthorizedRole(req);

    const schoolId = getSchoolId(req);

    const {
      academicYear,
      class: classId,
      section,
      stream,
      subject,
      assessmentType,
      status,
      createdBy,
    } = req.query;

    await validateSchool(schoolId);

    const filter = {
      school: schoolId,
    };

    if (academicYear) {
      await validateAcademicYear(
        academicYear,
        schoolId,
      );

      filter.academicYear =
        academicYear;
    }

    if (classId) {
      await validateClass(
        classId,
        schoolId,
      );

      filter.class = classId;
    }

    if (section) {
      filter.section = section;
    }

    if (stream) {
      await validateStream(
        stream,
        schoolId,
      );

      filter.stream = stream;
    }

    if (subject) {
      // Global subject validation.
      await validateSubject(subject);

      filter.subject = subject;
    }

    if (assessmentType) {
      validateAssessmentType(
        assessmentType,
      );

      filter.assessmentType =
        assessmentType;
    }

    if (status) {
      validateStatus(status);
      filter.status = status;
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    const assessments =
      await populateAssessment(
        Assessment.find(filter).sort({
          startDate: 1,
          createdAt: -1,
        }),
      );

    res.json(assessments);
  },
);


const getStudentEligibleAssessments = asyncHandler(
  async (req, res) => {
    // School is resolved by your existing middleware.
    const schoolId = getSchoolId(req);

    // The authenticated user ID must come from your
    // authentication middleware, never from req.query.
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      res.status(401);
      throw new Error("Authentication required");
    }

    if (!schoolId) {
      res.status(400);
      throw new Error("School could not be resolved");
    }

    // Find the authenticated student's profile.
    const student = await Student.findOne({
      user: userId,
      school: schoolId,
      isActive: true,
    }).select(
      "_id school academicYear class section stream subjects",
    );

    if (!student) {
      res.status(404);
      throw new Error(
        "Active student profile not found",
      );
    }

    const now = new Date();

    // Build the eligibility filter from the student's
    // own academic profile.
    const filter = {
      school: student.school,
      academicYear: student.academicYear,
      class: student.class,
      status: "ACTIVE",
      startDate: { $lte: now },
      endDate: { $gte: now },
      $and: [
        {
          $or: [
            { section: null },
            { section: { $exists: false } },
            { section: student.section },
          ],
        },
        {
          $or: [
            { stream: null },
            { stream: { $exists: false } },
            { stream: student.stream },
          ],
        },
      ],
    };

    // Only include subjects actually enrolled by the student.
    const subjectIds = student.subjects.map(
      (item) => item.subject,
    );

    if (subjectIds.length === 0) {
      return res.status(200).json([]);
    }

    filter.subject = { $in: subjectIds };

    const assessments = await Assessment.find(filter)
      .select(
        [
          "_id",
          "title",
          "description",
          "school",
          "academicYear",
          "class",
          "section",
          "stream",
          "subject",
          "assessmentType",
          "durationMinutes",
          "totalQuestions",
          "totalMarks",
          "maxAttempts",
          "startDate",
          "endDate",
          "status",
        ].join(" "),
      )
      .populate("subject", "name")
      .sort({
        startDate: 1,
        createdAt: -1,
      })
      .lean();

    res.status(200).json(assessments);
  },
);




/**
 * ======================================================
 * Get Assessment By ID
 * ======================================================
 */
const getAssessmentById = asyncHandler(
  async (req, res) => {
    validateAuthorizedRole(req);

    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400);
      throw new Error(
        "Invalid assessment ID",
      );
    }

    const schoolId = getSchoolId(req);

    await validateSchool(schoolId);

    const assessment =
      await populateAssessment(
        Assessment.findOne({
          _id: id,
          school: schoolId,
        }),
      );

    if (!assessment) {
      res.status(404);
      throw new Error(
        "Assessment not found",
      );
    }

    res.json(assessment);
  },
);

/**
 * ======================================================
 * Get Assessments By Academic Year
 * ======================================================
 */
const getAssessmentsByAcademicYear =
  asyncHandler(
    async (req, res) => {
      validateAuthorizedRole(req);

      const { academicYearId } =
        req.params;

      const schoolId =
        getSchoolId(req);

      await validateSchool(
        schoolId,
      );

      await validateAcademicYear(
        academicYearId,
        schoolId,
      );

      const assessments =
        await populateAssessment(
          Assessment.find({
            school: schoolId,
            academicYear:
              academicYearId,
          }).sort({
            startDate: 1,
          }),
        );

      res.json(assessments);
    },
  );

/**
 * ======================================================
 * Get Assessments By Class
 * ======================================================
 */
const getAssessmentsByClass =
  asyncHandler(
    async (req, res) => {
      validateAuthorizedRole(req);

      const { classId } =
        req.params;

      const schoolId =
        getSchoolId(req);

      await validateSchool(
        schoolId,
      );

      await validateClass(
        classId,
        schoolId,
      );

      const assessments =
        await populateAssessment(
          Assessment.find({
            school: schoolId,
            class: classId,
          }).sort({
            startDate: 1,
          }),
        );

      res.json(assessments);
    },
  );

/**
 * ======================================================
 * Get Assessments By Section
 * ======================================================
 */
const getAssessmentsBySection =
  asyncHandler(
    async (req, res) => {
      validateAuthorizedRole(req);

      const { sectionId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          sectionId,
        )
      ) {
        res.status(400);
        throw new Error(
          "Invalid section ID",
        );
      }

      const schoolId =
        getSchoolId(req);

      await validateSchool(
        schoolId,
      );

      const section =
        await Section.findOne({
          _id: sectionId,
          school: schoolId,
        });

      if (!section) {
        res.status(404);
        throw new Error(
          "Section not found for this school",
        );
      }

      const assessments =
        await populateAssessment(
          Assessment.find({
            school: schoolId,
            section: sectionId,
          }).sort({
            startDate: 1,
          }),
        );

      res.json(assessments);
    },
  );

/**
 * ======================================================
 * Get Assessments By Subject
 * ======================================================
 */
const getAssessmentsBySubject =
  asyncHandler(
    async (req, res) => {
      validateAuthorizedRole(req);

      const { subjectId } =
        req.params;

      const schoolId =
        getSchoolId(req);

      await validateSchool(
        schoolId,
      );

      // Subject is global.
      await validateSubject(
        subjectId,
      );

      const assessments =
        await populateAssessment(
          Assessment.find({
            school: schoolId,
            subject: subjectId,
          }).sort({
            startDate: 1,
          }),
        );

      res.json(assessments);
    },
  );

/**
 * ======================================================
 * Get Assessments By Stream
 * ======================================================
 */
const getAssessmentsByStream =
  asyncHandler(
    async (req, res) => {
      validateAuthorizedRole(req);

      const { streamId } =
        req.params;

      const schoolId =
        getSchoolId(req);

      await validateSchool(
        schoolId,
      );

      await validateStream(
        streamId,
        schoolId,
      );

      const assessments =
        await populateAssessment(
          Assessment.find({
            school: schoolId,
            stream: streamId,
          }).sort({
            startDate: 1,
          }),
        );

      res.json(assessments);
    },
  );

/**
 * ======================================================
 * Get My Assessments
 * ======================================================
 */
const getMyAssessments =
  asyncHandler(
    async (req, res) => {
      validateAuthorizedRole(req);

      const schoolId =
        getSchoolId(req);

      await validateSchool(
        schoolId,
      );

      // Ensure the current user belongs
      // to the resolved school.
      await validateCreator(
        req.user._id,
        schoolId,
      );

      const assessments =
        await populateAssessment(
          Assessment.find({
            school: schoolId,
            createdBy:
              req.user._id,
          }).sort({
            startDate: 1,
            createdAt: -1,
          }),
        );

      res.json(assessments);
    },
  );

/**
 * ======================================================
 * Update Assessment
 * ======================================================
 */
const updateAssessment =
  asyncHandler(
    async (req, res) => {
      validateAuthorizedRole(req);

      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id,
        )
      ) {
        res.status(400);
        throw new Error(
          "Invalid assessment ID",
        );
      }

      const schoolId =
        getSchoolId(req);

      await validateSchool(
        schoolId,
      );

      const assessment =
        await Assessment.findOne({
          _id: id,
          school: schoolId,
        });

      if (!assessment) {
        res.status(404);
        throw new Error(
          "Assessment not found",
        );
      }

      if (
        [
          "COMPLETED",
          "CANCELLED",
        ].includes(
          assessment.status,
        )
      ) {
        res.status(400);
        throw new Error(
          `Cannot update an assessment with status ${assessment.status}`,
        );
      }

      const {
        academicYear,
        class: classId,
        section,
        stream,
        subject,
        title,
        description,
        assessmentType,
        durationMinutes,
        totalQuestions,
        totalMarks,
        randomizeQuestions,
        randomizeOptions,
        maxAttempts,
        startDate,
        endDate,
        questionBlueprint,
      } = req.body;

      const newAcademicYear =
        academicYear ||
        assessment.academicYear;

      const newClass =
        classId ||
        assessment.class;

      const newSubject =
        subject ||
        assessment.subject;

      const newSection =
        Object.prototype.hasOwnProperty.call(
          req.body,
          "section",
        )
          ? section || null
          : assessment.section ||
            null;

      const newStream =
        Object.prototype.hasOwnProperty.call(
          req.body,
          "stream",
        )
          ? stream || null
          : assessment.stream ||
            null;

      await validateAcademicYear(
        newAcademicYear,
        schoolId,
      );

      await validateClass(
        newClass,
        schoolId,
      );

      await validateSection(
        newSection,
        schoolId,
        newAcademicYear,
        newClass,
      );

      await validateStream(
        newStream,
        schoolId,
      );

      // Subject is global.
      await validateSubject(
        newSubject,
      );

      const newDuration =
        durationMinutes !==
        undefined
          ? durationMinutes
          : assessment.durationMinutes;

      const newTotalQuestions =
        totalQuestions !==
        undefined
          ? totalQuestions
          : assessment.totalQuestions;

      const newTotalMarks =
        totalMarks !==
        undefined
          ? totalMarks
          : assessment.totalMarks;

      const newMaxAttempts =
        maxAttempts !==
        undefined
          ? maxAttempts
          : assessment.maxAttempts;

      validateNumbers(
        newDuration,
        newTotalQuestions,
        newTotalMarks,
        newMaxAttempts,
      );

      const newStartDate =
        startDate !==
        undefined
          ? startDate
          : assessment.startDate;

      const newEndDate =
        endDate !==
        undefined
          ? endDate
          : assessment.endDate;

      const dates =
        validateDates(
          newStartDate,
          newEndDate,
        );

      const newAssessmentType =
        assessmentType ||
        assessment.assessmentType;

      validateAssessmentType(
        newAssessmentType,
      );

      await validateQuestionBlueprint(
        questionBlueprint !==
          undefined
          ? questionBlueprint
          : assessment.questionBlueprint,
        schoolId,
        newAcademicYear,
        newClass,
        newSubject,
        newStream,
      );

      const newTitle =
        title !== undefined
          ? title.trim()
          : assessment.title;

      if (!newTitle) {
        res.status(400);
        throw new Error(
          "Assessment title is required",
        );
      }

      const duplicateQuery = {
        _id: {
          $ne: assessment._id,
        },
        school: schoolId,
        academicYear:
          newAcademicYear,
        class: newClass,
        subject: newSubject,
        title: newTitle,
      };

      if (newSection) {
        duplicateQuery.section =
          newSection;
      } else {
        duplicateQuery.section = {
          $exists: false,
        };
      }

      const duplicate =
        await Assessment.findOne(
          duplicateQuery,
        );

      if (duplicate) {
        res.status(400);
        throw new Error(
          "Another assessment with the same title already exists for this academic structure",
        );
      }

      assessment.academicYear =
        newAcademicYear;

      assessment.class =
        newClass;

      if (newSection) {
        assessment.section =
          newSection;
      } else {
        assessment.section =
          undefined;
      }

      if (newStream) {
        assessment.stream =
          newStream;
      } else {
        assessment.stream =
          undefined;
      }

      assessment.subject =
        newSubject;

      assessment.title =
        newTitle;

      if (
        description !==
        undefined
      ) {
        assessment.description =
          description;
      }

      assessment.assessmentType =
        newAssessmentType;

      assessment.durationMinutes =
        newDuration;

      assessment.totalQuestions =
        newTotalQuestions;

      assessment.totalMarks =
        newTotalMarks;

      if (
        randomizeQuestions !==
        undefined
      ) {
        assessment.randomizeQuestions =
          randomizeQuestions;
      }

      if (
        randomizeOptions !==
        undefined
      ) {
        assessment.randomizeOptions =
          randomizeOptions;
      }

      assessment.maxAttempts =
        newMaxAttempts;

      assessment.startDate =
        dates.start;

      assessment.endDate =
        dates.end;

      if (
        questionBlueprint !==
        undefined
      ) {
        assessment.questionBlueprint =
          questionBlueprint ||
          undefined;
      }

      await assessment.save();

      const result =
        await populateAssessment(
          Assessment.findById(
            assessment._id,
          ),
        );

      res.json(result);
    },
  );

/**
 * ======================================================
 * Update Assessment Status
 * ======================================================
 */
const updateAssessmentStatus =
  asyncHandler(
    async (req, res) => {
      validateAuthorizedRole(req);

      const { id } =
        req.params;

      const { status } =
        req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          id,
        )
      ) {
        res.status(400);
        throw new Error(
          "Invalid assessment ID",
        );
      }

      validateStatus(status);

      const schoolId =
        getSchoolId(req);

      await validateSchool(
        schoolId,
      );

      const assessment =
        await Assessment.findOne({
          _id: id,
          school: schoolId,
        });

      if (!assessment) {
        res.status(404);
        throw new Error(
          "Assessment not found",
        );
      }

      validateAssessmentStatusTransition(
        assessment.status,
        status,
      );

      const now =
        new Date();

      if (status === "SCHEDULED") {
        if (
          new Date(
            assessment.startDate,
          ) <= now
        ) {
          res.status(400);
          throw new Error(
            "Assessment start date must be in the future before scheduling",
          );
        }
      }

      if (status === "ACTIVE") {
        if (
          now <
          new Date(
            assessment.startDate,
          )
        ) {
          res.status(400);
          throw new Error(
            "Assessment cannot be activated before its start date",
          );
        }

        if (
          now >=
          new Date(
            assessment.endDate,
          )
        ) {
          res.status(400);
          throw new Error(
            "Assessment end date has already passed",
          );
        }
      }

      if (status === "COMPLETED") {
        if (
          now <
          new Date(
            assessment.endDate,
          )
        ) {
          res.status(400);
          throw new Error(
            "Assessment cannot be completed before its end date",
          );
        }
      }

      assessment.status =
        status;

      await assessment.save();

      const result =
        await populateAssessment(
          Assessment.findById(
            assessment._id,
          ),
        );

      res.json(result);
    },
  );

/**
 * ======================================================
 * Delete Assessment
 * ======================================================
 */
const deleteAssessment =
  asyncHandler(
    async (req, res) => {
      validateAuthorizedRole(req);

      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id,
        )
      ) {
        res.status(400);
        throw new Error(
          "Invalid assessment ID",
        );
      }

      const schoolId =
        getSchoolId(req);

      await validateSchool(
        schoolId,
      );

      const assessment =
        await Assessment.findOne({
          _id: id,
          school: schoolId,
        });

      if (!assessment) {
        res.status(404);
        throw new Error(
          "Assessment not found",
        );
      }

      if (
        [
          "ACTIVE",
          "COMPLETED",
        ].includes(
          assessment.status,
        )
      ) {
        res.status(400);
        throw new Error(
          `Cannot delete an assessment with status ${assessment.status}`,
        );
      }

      await assessment.deleteOne();

      res.json({
        message:
          "Assessment deleted successfully",
      });
    },
  );

export {
  createAssessment,
  getAssessments,
  getStudentEligibleAssessments,
  getAssessmentById,
  getAssessmentsByAcademicYear,
  getAssessmentsByClass,
  getAssessmentsBySection,
  getAssessmentsBySubject,
  getAssessmentsByStream,
  getMyAssessments,
  updateAssessment,
  updateAssessmentStatus,
  deleteAssessment,
};
