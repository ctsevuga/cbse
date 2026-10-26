import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import AnswerEvaluation from "../models/answerEvaluationModel.js";
import StudentAnswer from "../models/studentAnswerModel.js";
import StudentAttempt from "../models/studentAttemptModel.js";
import Student from "../models/studentModel.js";
import Assessment from "../models/assessmentModel.js";
import AssessmentQuestion from "../models/assessmentQuestionModel.js";
import Teacher from "../models/teacherModel.js";
import Result from "../models/resultModel.js";
import ResultDetail from "../models/resultDetailModel.js";
import School from "../models/schoolModel.js";


const EVALUATION_STATUSES = [
  "PENDING",
  "EVALUATED",
  "REVIEW_REQUIRED",
  "REVISED",
];

/**
 * ======================================================
 * SCHOOL CONTEXT
 * ======================================================
 *
 * There is NO SUPER_ADMIN in this application.
 *
 * Authentication middleware should resolve:
 *
 * req.user
 * req.user.school
 * req.schoolId
 *
 * Every operation in this controller is school-scoped.
 */

const getUserSchool = (req) => {
  const schoolId =
    req.schoolId ||
    req.user?.school?._id ||
    req.user?.school;

  if (!schoolId) {
    const error = new Error(
      "School context could not be determined",
    );
    error.statusCode = 403;
    throw error;
  }

  return schoolId;
};

/**
 * ======================================================
 * OBJECT ID VALIDATION
 * ======================================================
 */

const validateObjectId = (value, fieldName) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

/**
 * ======================================================
 * VALIDATE STUDENT
 * ======================================================
 */

const validateStudent = async (studentId, schoolId) => {
  validateObjectId(studentId, "student ID");

  const student = await Student.findById(studentId)
    .populate(
      "user",
      "name email phone role isActive",
    )
    .populate(
      "school",
      "name code isActive",
    )
    .populate(
      "academicYear",
      "name",
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
      "stream",
      "name code",
    );

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    String(student.school?._id) !== String(schoolId)
  ) {
    const error = new Error(
      "Student does not belong to your school",
    );
    error.statusCode = 403;
    throw error;
  }

  if (!student.isActive) {
    const error = new Error("Student is inactive");
    error.statusCode = 400;
    throw error;
  }

  if (student.user && !student.user.isActive) {
    const error = new Error(
      "Student user is inactive",
    );
    error.statusCode = 400;
    throw error;
  }

  return student;
};

/**
 * ======================================================
 * GET LOGGED-IN TEACHER
 * ======================================================
 *
 * IMPORTANT:
 * Never accept teacherId from the frontend for
 * normal teacher evaluation.
 *
 * The teacher is derived from req.user.
 */

const getTeacherFromUser = async (req) => {
  if (!req.user?._id) {
    const error = new Error(
      "Authenticated user not found",
    );
    error.statusCode = 401;
    throw error;
  }

  const teacher = await Teacher.findOne({
    user: req.user._id,
    isActive: true,
  })
    .populate(
      "user",
      "name email phone role isActive",
    )
    .populate(
      "school",
      "name code isActive",
    );

  if (!teacher) {
    const error = new Error(
      "Teacher profile not found",
    );
    error.statusCode = 404;
    throw error;
  }

  const schoolId = getUserSchool(req);

  if (
    String(teacher.school?._id) !==
    String(schoolId)
  ) {
    const error = new Error(
      "Teacher does not belong to your school",
    );
    error.statusCode = 403;
    throw error;
  }

  if (!teacher.user?.isActive) {
    const error = new Error(
      "Teacher user is inactive",
    );
    error.statusCode = 400;
    throw error;
  }

  return teacher;
};

/**
 * ======================================================
 * VALIDATE STUDENT ANSWER
 * ======================================================
 */

const validateStudentAnswer = async (
  studentAnswerId,
  schoolId,
) => {
  validateObjectId(
    studentAnswerId,
    "student answer ID",
  );

  const studentAnswer =
    await StudentAnswer.findById(studentAnswerId)
      .populate({
        path: "attempt",
        populate: {
          path: "assessment",
          populate: [
            {
              path: "school",
              select: "name code isActive",
            },
            {
              path: "academicYear",
              select: "name",
            },
            {
              path: "class",
              select: "name code",
            },
            {
              path: "section",
              select: "name",
            },
            {
              path: "stream",
              select: "name code",
            },
            {
              path: "subject",
              select: "name code",
            },
          ],
        },
      })
      .populate({
        path: "student",
        populate: [
          {
            path: "user",
            select:
              "name email phone role isActive",
          },
          {
            path: "school",
            select:
              "name code isActive",
          },
          {
            path: "academicYear",
            select: "name",
          },
          {
            path: "class",
            select: "name code",
          },
          {
            path: "section",
            select: "name",
          },
          {
            path: "stream",
            select: "name code",
          },
        ],
      })
      .populate({
        path: "assessmentQuestion",
        populate: [
          {
            path: "question",
            select:
              "questionText questionType answerMode marks status isActive",
          },
          {
            path: "section",
            select:
              "sectionCode title questionType marksPerQuestion numberOfQuestions totalMarks",
          },
        ],
      })
      .populate({
        path: "question",
        select:
          "questionText questionType answerMode marks status isActive",
      });

  if (!studentAnswer) {
    const error = new Error(
      "Student answer not found",
    );
    error.statusCode = 404;
    throw error;
  }

  /**
   * ----------------------------------------------------
   * Assessment school
   * ----------------------------------------------------
   */

  const assessmentSchool =
    studentAnswer.attempt?.assessment?.school?._id ||
    studentAnswer.attempt?.assessment?.school;

  if (
    String(assessmentSchool) !== String(schoolId)
  ) {
    const error = new Error(
      "Student answer does not belong to your school",
    );
    error.statusCode = 403;
    throw error;
  }

  /**
   * ----------------------------------------------------
   * Student school
   * ----------------------------------------------------
   */

  const studentSchool =
    studentAnswer.student?.school?._id ||
    studentAnswer.student?.school;

  if (
    String(studentSchool) !== String(schoolId)
  ) {
    const error = new Error(
      "Student does not belong to your school",
    );
    error.statusCode = 403;
    throw error;
  }

  return studentAnswer;
};

/**
 * ======================================================
 * VALIDATE ANSWER FOR EVALUATION
 * ======================================================
 */

const validateAnswerForEvaluation = (
  studentAnswer,
) => {
  if (!studentAnswer.attempt) {
    const error = new Error(
      "Student attempt not found for this answer",
    );
    error.statusCode = 400;
    throw error;
  }

  if (!studentAnswer.assessmentQuestion) {
    const error = new Error(
      "Assessment question not found for this answer",
    );
    error.statusCode = 400;
    throw error;
  }

  if (!studentAnswer.question) {
    const error = new Error(
      "Question not found for this answer",
    );
    error.statusCode = 400;
    throw error;
  }

  /**
   * Only submitted answers can be evaluated.
   */
  if (studentAnswer.status !== "SUBMITTED") {
    const error = new Error(
      "Only submitted answers can be evaluated",
    );
    error.statusCode = 400;
    throw error;
  }

  /**
   * The attempt must also be in an appropriate state.
   */
  if (
    ![
      "SUBMITTED",
      "EVALUATING",
      "EVALUATED",
    ].includes(studentAnswer.attempt.status)
  ) {
    const error = new Error(
      "The student attempt is not ready for evaluation",
    );
    error.statusCode = 400;
    throw error;
  }
};

/**
 * ======================================================
 * GET MAXIMUM MARKS
 * ======================================================
 *
 * maximumMarks is determined by the server.
 * The frontend must NOT be trusted to supply it.
 */

const getMaximumMarks = (studentAnswer) => {
  const assessmentQuestion =
    studentAnswer.assessmentQuestion;

  /**
   * Preferred:
   * AssessmentQuestion.marks
   */
  if (
    typeof assessmentQuestion.marks === "number" &&
    assessmentQuestion.marks >= 0
  ) {
    return assessmentQuestion.marks;
  }

  /**
   * Fallback:
   * Question.marks
   */
  if (
    typeof studentAnswer.question?.marks ===
      "number" &&
    studentAnswer.question.marks >= 0
  ) {
    return studentAnswer.question.marks;
  }

  /**
   * Fallback if the populated question exists
   * under assessmentQuestion.question.
   */
  if (
    typeof assessmentQuestion.question?.marks ===
      "number" &&
    assessmentQuestion.question.marks >= 0
  ) {
    return assessmentQuestion.question.marks;
  }

  const error = new Error(
    "Maximum marks could not be determined",
  );
  error.statusCode = 400;
  throw error;
};

/**
 * ======================================================
 * MARKS VALIDATION
 * ======================================================
 */

const validateMarksAwarded = (
  marksAwarded,
  maximumMarks,
) => {
  const marks = Number(marksAwarded);

  if (!Number.isFinite(marks)) {
    const error = new Error(
      "marksAwarded must be a valid number",
    );
    error.statusCode = 400;
    throw error;
  }

  if (marks < 0) {
    const error = new Error(
      "marksAwarded cannot be negative",
    );
    error.statusCode = 400;
    throw error;
  }

  if (marks > maximumMarks) {
    const error = new Error(
      `marksAwarded cannot exceed maximum marks ${maximumMarks}`,
    );
    error.statusCode = 400;
    throw error;
  }

  return marks;
};

/**
 * ======================================================
 * EVALUATION STATUS
 * ======================================================
 */

const validateEvaluationStatus = (status) => {
  if (!EVALUATION_STATUSES.includes(status)) {
    const error = new Error(
      "Invalid evaluation status",
    );
    error.statusCode = 400;
    throw error;
  }
};

/**
 * ======================================================
 * POPULATE EVALUATION
 * ======================================================
 */

const populateAnswerEvaluation = (query) => {
  return query
    .populate({
      path: "studentAnswer",
      populate: [
        {
          path: "attempt",
          select:
            "assessment student attemptNumber status totalQuestions attemptedQuestions totalMarks obtainedMarks",
          populate: {
            path: "assessment",
            select:
              "school academicYear class section stream subject title assessmentType totalQuestions totalMarks",
            populate: [
              {
                path: "school",
                select: "name code",
              },
              {
                path: "academicYear",
                select: "name",
              },
              {
                path: "class",
                select: "name code",
              },
              {
                path: "section",
                select: "name",
              },
              {
                path: "stream",
                select: "name code",
              },
              {
                path: "subject",
                select: "name code",
              },
            ],
          },
        },
        {
          path: "assessmentQuestion",
          populate: [
            {
              path: "section",
              select:
                "sectionCode title questionType marksPerQuestion numberOfQuestions totalMarks",
            },
            {
              path: "question",
              select:
                "questionText questionType answerMode marks options difficulty",
            },
          ],
        },
        {
          path: "question",
          select:
            "questionText questionType answerMode marks options difficulty",
        },
        {
          path: "student",
          select:
            "user school admissionNumber academicYear class section stream",
          populate: [
            {
              path: "user",
              select:
                "name email phone",
            },
            {
              path: "school",
              select:
                "name code",
            },
            {
              path: "academicYear",
              select:
                "name",
            },
            {
              path: "class",
              select:
                "name code",
            },
            {
              path: "section",
              select:
                "name",
            },
            {
              path: "stream",
              select:
                "name code",
            },
          ],
        },
      ],
    })
    .populate({
      path: "student",
      select:
        "user school admissionNumber academicYear class section stream",
      populate: [
        {
          path: "user",
          select:
            "name email phone",
        },
        {
          path: "school",
          select:
            "name code",
        },
        {
          path: "academicYear",
          select:
            "name",
        },
        {
          path: "class",
          select:
            "name code",
        },
        {
          path: "section",
          select:
            "name",
        },
        {
          path: "stream",
          select:
            "name code",
        },
      ],
    })
    .populate({
      path: "teacher",
      select:
        "user school employeeCode qualification isActive",
      populate: [
        {
          path: "user",
          select:
            "name email phone",
        },
        {
          path: "school",
          select:
            "name code",
        },
      ],
    })
    .populate({
      path: "updatedBy",
      select:
        "user employeeCode",
      populate: {
        path: "user",
        select:
          "name email phone",
      },
    });
};

/**
 * ======================================================
 * CREATE ANSWER EVALUATION
 * ======================================================
 *
 * Workflow:
 *
 * StudentAnswer
 *      ↓
 * Teacher opens answer
 *      ↓
 * Teacher gives marks
 *      ↓
 * AnswerEvaluation created
 *
 * Therefore a newly-created evaluation is normally
 * EVALUATED, not PENDING.
 */

export const createAnswerEvaluation =
  asyncHandler(async (req, res) => {
    const {
      studentAnswerId,
      marksAwarded,
      feedback,
    } = req.body;

    validateObjectId(
      studentAnswerId,
      "student answer ID",
    );

    const schoolId = getUserSchool(req);

    /**
     * The authenticated teacher is the evaluator.
     */
    const teacher =
      await getTeacherFromUser(req);

    const studentAnswer =
      await validateStudentAnswer(
        studentAnswerId,
        schoolId,
      );

    validateAnswerForEvaluation(
      studentAnswer,
    );

    /**
     * Student must belong to the same school
     * as the authenticated teacher.
     */
    const student = await validateStudent(
      studentAnswer.student._id,
      schoolId,
    );

    if (
      String(student.school?._id) !==
      String(teacher.school?._id)
    ) {
      res.status(403);
      throw new Error(
        "Teacher and student must belong to the same school",
      );
    }

    const maximumMarks =
      getMaximumMarks(studentAnswer);

    const awardedMarks =
      validateMarksAwarded(
        marksAwarded,
        maximumMarks,
      );

    /**
     * Only one current evaluation is allowed
     * for one StudentAnswer.
     */
    const existingEvaluation =
      await AnswerEvaluation.findOne({
        studentAnswer:
          studentAnswer._id,
      });

    if (existingEvaluation) {
      res.status(409);
      throw new Error(
        "This student answer has already been evaluated",
      );
    }

    const now = new Date();

    const evaluation =
      await AnswerEvaluation.create({
        studentAnswer:
          studentAnswer._id,

        student:
          student._id,

        teacher:
          teacher._id,

        maximumMarks,

        marksAwarded:
          awardedMarks,

        feedback:
          feedback?.trim() || undefined,

        evaluationStatus:
          "EVALUATED",

        evaluatedAt:
          now,

        updatedBy:
          teacher._id,
      });

    const result =
      await populateAnswerEvaluation(
        AnswerEvaluation.findById(
          evaluation._id,
        ),
      );

    res.status(201).json(result);
  });

/**
 * ======================================================
 * GET ALL EVALUATIONS
 * ======================================================
 *
 * Every query is automatically limited to the
 * authenticated teacher's school.
 *
 * Optional filters:
 *
 * ?studentAnswerId=
 * ?studentId=
 * ?teacherId=
 * ?evaluationStatus=
 *
 * NOTE:
 * teacherId should normally only be used by
 * school-level management/reporting.
 */

export const getAnswerEvaluations =
  asyncHandler(async (req, res) => {
    const schoolId =
      getUserSchool(req);

    const filter = {};

    /**
     * Get all students of this school.
     *
     * This guarantees tenant isolation.
     */
    const students =
      await Student.find({
        school: schoolId,
      }).select("_id");

    filter.student = {
      $in: students.map(
        (student) => student._id,
      ),
    };

    /**
     * ----------------------------------------------------
     * Student answer filter
     * ----------------------------------------------------
     */

    if (req.query.studentAnswerId) {
      validateObjectId(
        req.query.studentAnswerId,
        "student answer ID",
      );

      const studentAnswer =
        await validateStudentAnswer(
          req.query.studentAnswerId,
          schoolId,
        );

      filter.studentAnswer =
        studentAnswer._id;
    }

    /**
     * ----------------------------------------------------
     * Student filter
     * ----------------------------------------------------
     */

    if (req.query.studentId) {
      const student =
        await validateStudent(
          req.query.studentId,
          schoolId,
        );

      filter.student =
        student._id;
    }

    /**
     * ----------------------------------------------------
     * Teacher filter
     * ----------------------------------------------------
     */

    if (req.query.teacherId) {
      validateObjectId(
        req.query.teacherId,
        "teacher ID",
      );

      const teacher =
        await Teacher.findOne({
          _id: req.query.teacherId,
          school: schoolId,
          isActive: true,
        });

      if (!teacher) {
        res.status(404);
        throw new Error(
          "Teacher not found in your school",
        );
      }

      filter.teacher =
        teacher._id;
    }

    /**
     * ----------------------------------------------------
     * Status filter
     * ----------------------------------------------------
     */

    if (req.query.evaluationStatus) {
      validateEvaluationStatus(
        req.query.evaluationStatus,
      );

      filter.evaluationStatus =
        req.query.evaluationStatus;
    }

    const evaluations =
      await populateAnswerEvaluation(
        AnswerEvaluation.find(filter).sort({
          evaluatedAt: -1,
          createdAt: -1,
        }),
      );

    res.json(evaluations);
  });
export const getAttemptsForEvaluation = async (req, res) => {
  try {
    const { assessment, student } = req.query;
    const schoolId = getUserSchool(req);

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School could not be identified.",
      });
    }

    if (!assessment || !student) {
      return res.status(400).json({
        success: false,
        message: "Assessment and student IDs are required.",
      });
    }

    const schoolStudent = await Student.findOne({
      _id: student,
      school: schoolId,
    }).select("_id");

    if (!schoolStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found in this school.",
      });
    }

    const attempts = await StudentAttempt.find({
      assessment,
      student: schoolStudent._id,
      status: {
        $in: ["SUBMITTED", "EVALUATING", "IN_PROGRESS"],
      },
    })
      .populate("assessment")
      .populate("student")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Student attempts fetched successfully.",
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    console.error("Error fetching student attempts:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student attempts.",
      error: error.message,
    });
  }
};


export const getAttemptsForReview = async (req, res) => {
  try {
    const { assessment, student } = req.query;
console.log(assessment, student)
    // School ID is attached by resolveSchool middleware
    const schoolId = getUserSchool(req);

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School could not be identified.",
      });
    }

    if (!assessment || !student) {
      return res.status(400).json({
        success: false,
        message: "Assessment ID and student ID are required.",
      });
    }

    // Ensure the requested student belongs to this school
    const schoolStudent = await Student.findOne({
      _id: student,
      school: schoolId,
    }).select("_id");

    if (!schoolStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found in this school.",
      });
    }

    // Fetch only evaluated attempts for this school student
    const attempts = await StudentAttempt.find({
      assessment,
      student: schoolStudent._id,
      status: "EVALUATED",
    })
      .populate("assessment")
      .populate("student")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Evaluated student attempts fetched successfully.",
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    console.error("Error fetching attempts for review:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attempts for review.",
      error: error.message,
    });
  }
};


export const saveAnswerEvaluation = async (req, res) => {
  try {
    const { studentAnswerId, marksAwarded, feedback } = req.body;

    // Get the authenticated teacher's ID.
    const teacherId = req.user?.id || req.user?._id;

    // Validate required fields.
    if (
      !studentAnswerId ||
      marksAwarded === undefined ||
      !teacherId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student answer ID, marks awarded, and teacher authentication are required.",
      });
    }

    // Validate MongoDB ObjectIds.
    if (
      !mongoose.isValidObjectId(studentAnswerId) ||
      !mongoose.isValidObjectId(teacherId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid student answer ID or teacher ID.",
      });
    }

    // Validate marks.
    const marks = Number(marksAwarded);

    if (!Number.isFinite(marks) || marks < 0) {
      return res.status(400).json({
        success: false,
        message: "Marks awarded must be a valid non-negative number.",
      });
    }

    // Validate feedback.
    if (
      feedback !== undefined &&
      (typeof feedback !== "string" || feedback.length > 2000)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Feedback must be a string with at most 2000 characters.",
      });
    }

    // Find the student answer.
    const studentAnswer = await StudentAnswer.findById(
      studentAnswerId
    );

    if (!studentAnswer) {
      return res.status(404).json({
        success: false,
        message: "Student answer not found.",
      });
    }

    // Get the student ID from the answer.
    const studentId = studentAnswer.student;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student information is missing from this answer.",
      });
    }

    // Check whether this answer has already been evaluated.
    const existingEvaluation = await AnswerEvaluation.findOne({
      studentAnswer: studentAnswerId,
    });

    if (existingEvaluation?.evaluationStatus === "EVALUATED") {
      return res.status(409).json({
        success: false,
        alreadyEvaluated: true,
        message: "This answer has already been evaluated.",
        data: existingEvaluation,
      });
    }

    // Get maximum marks from the related assessment question.
    const assessmentQuestion = await AssessmentQuestion.findById(
      studentAnswer.assessmentQuestion
    ).select("marks");

    if (!assessmentQuestion) {
      return res.status(404).json({
        success: false,
        message: "Assessment question not found.",
      });
    }

    const maximumMarks = Number(assessmentQuestion.marks);

    if (
      !Number.isFinite(maximumMarks) ||
      maximumMarks < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum marks could not be determined for this answer.",
      });
    }

    if (marks > maximumMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks awarded cannot exceed ${maximumMarks}.`,
      });
    }

    // Create a new evaluation or update an existing non-evaluated one.
    const evaluation = await AnswerEvaluation.findOneAndUpdate(
      {
        studentAnswer: studentAnswerId,
        evaluationStatus: { $ne: "EVALUATED" },
      },
      {
        $set: {
          student: studentId,
          teacher: teacherId,
          maximumMarks,
          marksAwarded: marks,
          feedback: feedback ?? "",
          evaluationStatus: "EVALUATED",
          evaluatedAt: new Date(),
          updatedBy: teacherId,
        },
        $setOnInsert: {
          studentAnswer: studentAnswerId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // If another request evaluated the answer concurrently,
    // do not overwrite the existing evaluation.
    if (!evaluation) {
      return res.status(409).json({
        success: false,
        alreadyEvaluated: true,
        message: "This answer has already been evaluated.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Answer evaluated and saved successfully.",
      data: evaluation,
    });
  } catch (error) {
    console.error("Save answer evaluation error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        alreadyEvaluated: true,
        message:
          "This answer has already been evaluated or is being evaluated concurrently.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Internal server error while saving answer evaluation.",
    });
  }
};


export const completeAttemptEvaluation = async (req, res) => {
  const { attemptId } = req.params;
  const teacherId = req.user?._id || req.user?.id;

  if (!mongoose.isValidObjectId(attemptId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student attempt ID.",
    });
  }

  if (!teacherId) {
    return res.status(401).json({
      success: false,
      message: "Teacher authentication is required.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let responseData;

    await session.withTransaction(async () => {
      // 1. Find the attempt.
      const attempt = await StudentAttempt.findById(attemptId)
        .session(session);

      if (!attempt) {
        throw Object.assign(
          new Error("Student attempt not found."),
          { statusCode: 404 }
        );
      }

      if (
        !["SUBMITTED", "EVALUATING", "EVALUATED"].includes(
          attempt.status
        )
      ) {
        throw Object.assign(
          new Error(
            "This attempt is not available for evaluation."
          ),
          { statusCode: 400 }
        );
      }

      // IMPORTANT:
      // Verify that this teacher is authorized to evaluate
      // this student's assessment in the relevant school.

      // 2. Check for an existing result.
      const existingResult = await Result.findOne({
        assessment: attempt.assessment,
        student: attempt.student,
        attempt: attempt._id,
      }).session(session);

      if (existingResult) {
        responseData = {
          resultId: existingResult._id,
          attemptId: attempt._id,
          totalMarks: existingResult.totalMarks,
          obtainedMarks: existingResult.obtainedMarks,
          percentage: existingResult.percentage,
          status: existingResult.status,
          alreadyCompleted: true,
        };

        return;
      }

      // 3. Retrieve the assessment.
      const assessment = await Assessment.findById(
        attempt.assessment
      ).session(session).lean();

      if (!assessment) {
        throw Object.assign(
          new Error("Assessment not found."),
          { statusCode: 404 }
        );
      }

      // 4. Retrieve answers belonging to this attempt
      // and this student.
      const studentAnswers = await StudentAnswer.find({
        attempt: attempt._id,
        student: attempt.student,
      })
        .session(session)
        .lean();

      if (studentAnswers.length === 0) {
        throw Object.assign(
          new Error(
            "No student answers were found for this attempt."
          ),
          { statusCode: 400 }
        );
      }

      // 5. Retrieve all answer evaluations.
      // 5. Retrieve evaluations for the answers belonging to this attempt.
// Query by studentAnswer first so mismatched student references
// can be diagnosed instead of silently excluding evaluations.
const answerIds = studentAnswers.map((answer) => answer._id);

const evaluations = await AnswerEvaluation.find({
  studentAnswer: { $in: answerIds },
})
  .session(session)
  .lean();

const evaluationMap = new Map();

for (const evaluation of evaluations) {
  const key = evaluation.studentAnswer.toString();

  if (evaluationMap.has(key)) {
    throw Object.assign(
      new Error(
        "Multiple evaluations exist for the same student answer."
      ),
      { statusCode: 400 }
    );
  }

  evaluationMap.set(key, evaluation);
}

// 6. Identify missing, incorrectly associated, and unevaluated answers.
const missingAnswers = [];

for (const answer of studentAnswers) {
  const answerId = answer._id.toString();
  const evaluation = evaluationMap.get(answerId);

  if (!evaluation) {
    missingAnswers.push({
      studentAnswerId: answerId,
      reason: "EVALUATION_NOT_FOUND",
    });
    continue;
  }

  if (
    evaluation.student.toString() !==
    attempt.student.toString()
  ) {
    missingAnswers.push({
      studentAnswerId: answerId,
      reason: "STUDENT_MISMATCH",
    });
    continue;
  }

  if (evaluation.evaluationStatus !== "EVALUATED") {
    missingAnswers.push({
      studentAnswerId: answerId,
      reason: evaluation.evaluationStatus,
    });
  }
}

if (missingAnswers.length > 0) {
  throw Object.assign(
    new Error(
      `Please complete evaluation of all answers. ` +
      `${studentAnswers.length - missingAnswers.length} of ` +
      `${studentAnswers.length} answers are evaluated.`
    ),
    {
      statusCode: 400,
      details: {
        totalAnswers: studentAnswers.length,
        evaluatedAnswers:
          studentAnswers.length - missingAnswers.length,
        remainingAnswers: missingAnswers.length,
        missingAnswers,
      },
    }
  );
}

      // 7. Retrieve assessment questions and original questions.
      const assessmentQuestionIds = studentAnswers.map(
        (answer) => answer.assessmentQuestion
      );

      const assessmentQuestions =
        await AssessmentQuestion.find({
          _id: { $in: assessmentQuestionIds },
          assessment: attempt.assessment,
          school: assessment.school,
        })
          .populate({
            path: "question",
            select: "subject chapter topic questionType",
          })
          .session(session)
          .lean();

      const assessmentQuestionMap = new Map(
        assessmentQuestions.map((aq) => [
          aq._id.toString(),
          aq,
        ])
      );

      // 8. Build question-level result details and calculate marks.
      let obtainedMarks = 0;

      const detailDocuments = studentAnswers.map((answer) => {
        const aq = assessmentQuestionMap.get(
          answer.assessmentQuestion.toString()
        );

        const evaluation = evaluationMap.get(
          answer._id.toString()
        );

        if (!aq || !aq.question) {
          throw Object.assign(
            new Error(
              "Assessment question or original question not found."
            ),
            { statusCode: 400 }
          );
        }

        const question = aq.question;
        const maximumMarks = aq.marks;
        const marksAwarded = evaluation.marksAwarded;

        // Confirm the answer references the same question
        // as its assessment-question instance.
        if (
          answer.question.toString() !==
          question._id.toString()
        ) {
          throw Object.assign(
            new Error(
              "Student answer and assessment question references do not match."
            ),
            { statusCode: 400 }
          );
        }

        if (
          !Number.isFinite(maximumMarks) ||
          maximumMarks < 0 ||
          marksAwarded > maximumMarks
        ) {
          throw Object.assign(
            new Error(
              "Awarded marks exceed the question's maximum marks."
            ),
            { statusCode: 400 }
          );
        }

        // The question schema defines these fields.
        if (
          !question.subject ||
          !question.questionType
        ) {
          throw Object.assign(
            new Error(
              "Question subject or question type is missing."
            ),
            { statusCode: 400 }
          );
        }

        obtainedMarks += marksAwarded;

        return {
          assessmentQuestion: aq._id,
          question: question._id,
          subject: question.subject,
          chapter: question.chapter ?? undefined,
          topic: question.topic ?? undefined,
          questionType: question.questionType,
          maximumMarks,
          obtainedMarks: marksAwarded,
          evaluationStatus: "EVALUATED",
          evaluatedBy: teacherId,
          evaluatedAt: new Date(),
        };
      });

      // 9. Verify the final marks against the attempt.
      const totalMarks = attempt.totalMarks;

      if (
        !Number.isFinite(totalMarks) ||
        totalMarks < 0 ||
        obtainedMarks > totalMarks
      ) {
        throw Object.assign(
          new Error(
            "Total marks awarded exceed the maximum marks for this attempt."
          ),
          { statusCode: 400 }
        );
      }

      const percentage =
        totalMarks === 0
          ? 0
          : Number(
              ((obtainedMarks / totalMarks) * 100).toFixed(2)
            );

      // 10. Create the Result document.
      const [result] = await Result.create(
        [
          {
            assessment: attempt.assessment,
            student: attempt.student,
            attempt: attempt._id,
            totalMarks,
            obtainedMarks,
            percentage,
            status: "EVALUATED",
          },
        ],
        { session }
      );

      // 11. Create one ResultDetail per student answer.
      const resultDetails = detailDocuments.map((detail) => ({
        ...detail,
        result: result._id,
      }));

      await ResultDetail.insertMany(resultDetails, {
        session,
      });

      // 12. Update the attempt last.
      attempt.obtainedMarks = obtainedMarks;
      attempt.status = "EVALUATED";

      await attempt.save({ session });

      responseData = {
        resultId: result._id,
        attemptId: attempt._id,
        studentId: attempt.student,
        assessmentId: attempt.assessment,
        totalQuestions: studentAnswers.length,
        evaluatedAnswers: studentAnswers.length,
        totalMarks,
        obtainedMarks,
        percentage,
        status: attempt.status,
        resultDetailsCreated: resultDetails.length,
        alreadyCompleted: false,
      };
    });

    return res.status(200).json({
      success: true,
      message: responseData.alreadyCompleted
        ? "A result already exists for this attempt."
        : "Attempt evaluation completed and result created successfully.",
      data: responseData,
    });
  } catch (error) {
  if (error.statusCode) {
    // Expected validation errors should not be logged as server errors.
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  console.error("Complete attempt evaluation error:", error);

  return res.status(500).json({
    success: false,
    message: "Failed to complete attempt evaluation.",
  });
} finally {
  await session.endSession();
}
};


export const reviseAttemptEvaluation = async (req, res) => {
  const { attemptId } = req.params;
  const teacherId = req.user?._id || req.user?.id;
  const { corrections } = req.body;

  if (!mongoose.isValidObjectId(attemptId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student attempt ID.",
    });
  }

  if (!teacherId) {
    return res.status(401).json({
      success: false,
      message: "Teacher authentication is required.",
    });
  }

  if (!mongoose.isValidObjectId(teacherId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid teacher ID.",
    });
  }

  if (!Array.isArray(corrections) || corrections.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one correction is required.",
    });
  }

  const correctionIds = new Set();

  for (const correction of corrections) {
    if (
      !correction.studentAnswerId ||
      !mongoose.isValidObjectId(correction.studentAnswerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Every correction must contain a valid studentAnswerId.",
      });
    }

    const answerId = correction.studentAnswerId.toString();

    if (correctionIds.has(answerId)) {
      return res.status(400).json({
        success: false,
        message: "Duplicate corrections for the same student answer are not allowed.",
      });
    }

    correctionIds.add(answerId);

    if (
      typeof correction.marksAwarded !== "number" ||
      !Number.isFinite(correction.marksAwarded) ||
      correction.marksAwarded < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Corrected marks must be a valid non-negative number.",
      });
    }

    if (
      correction.feedback !== undefined &&
      correction.feedback !== null &&
      typeof correction.feedback !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Feedback must be a string.",
      });
    }
  }

  const session = await mongoose.startSession();

  try {
    let responseData;

    await session.withTransaction(async () => {
      const attempt = await StudentAttempt.findById(attemptId)
        .session(session);

      if (!attempt) {
        throw Object.assign(
          new Error("Student attempt not found."),
          { statusCode: 404 }
        );
      }

      if (attempt.status !== "EVALUATED") {
        throw Object.assign(
          new Error(
            "Only completed and evaluated attempts can be revised."
          ),
          { statusCode: 400 }
        );
      }

      // Verify that the teacher is authorized to revise this
      // student's assessment in the relevant school.

      const result = await Result.findOne({
        assessment: attempt.assessment,
        student: attempt.student,
        attempt: attempt._id,
      }).session(session);

      if (!result) {
        throw Object.assign(
          new Error("The completed result for this attempt was not found."),
          { statusCode: 404 }
        );
      }

      // Support common publication fields. Adapt these checks
      // to the actual Result schema and publication workflow.
      const isPublished =
        result.isPublished === true ||
        result.published === true ||
        result.publishedAt != null ||
        result.status === "PUBLISHED";

      if (isPublished) {
        throw Object.assign(
          new Error("Published results cannot be revised."),
          { statusCode: 400 }
        );
      }

      const assessment = await Assessment.findById(
        attempt.assessment
      )
        .session(session)
        .lean();

      if (!assessment) {
        throw Object.assign(
          new Error("Assessment not found."),
          { statusCode: 404 }
        );
      }

      const studentAnswers = await StudentAnswer.find({
        attempt: attempt._id,
        student: attempt.student,
      })
        .session(session)
        .lean();

      if (studentAnswers.length === 0) {
        throw Object.assign(
          new Error("No student answers were found for this attempt."),
          { statusCode: 400 }
        );
      }

      const answerMap = new Map(
        studentAnswers.map((answer) => [
          answer._id.toString(),
          answer,
        ])
      );

      // Ensure every submitted correction belongs to this attempt.
      for (const correction of corrections) {
        if (!answerMap.has(correction.studentAnswerId.toString())) {
          throw Object.assign(
            new Error(
              `Student answer ${correction.studentAnswerId} does not belong to this attempt.`
            ),
            { statusCode: 400 }
          );
        }
      }

      const answerIds = studentAnswers.map((answer) => answer._id);

      const evaluations = await AnswerEvaluation.find({
        studentAnswer: { $in: answerIds },
      }).session(session);

      const evaluationMap = new Map();

      for (const evaluation of evaluations) {
        const answerId = evaluation.studentAnswer.toString();

        if (evaluationMap.has(answerId)) {
          throw Object.assign(
            new Error(
              "Multiple evaluations exist for the same student answer."
            ),
            { statusCode: 400 }
          );
        }

        if (
          !evaluation.student ||
          evaluation.student.toString() !== attempt.student.toString()
        ) {
          throw Object.assign(
            new Error(
              "An evaluation has an incorrect student reference."
            ),
            { statusCode: 400 }
          );
        }

        evaluationMap.set(answerId, evaluation);
      }

      const assessmentQuestionIds = studentAnswers.map(
        (answer) => answer.assessmentQuestion
      );

      const assessmentQuestions = await AssessmentQuestion.find({
        _id: { $in: assessmentQuestionIds },
        assessment: attempt.assessment,
        school: assessment.school,
      })
        .populate({
          path: "question",
          select: "subject chapter topic questionType",
        })
        .session(session)
        .lean();

      const assessmentQuestionMap = new Map(
        assessmentQuestions.map((aq) => [
          aq._id.toString(),
          aq,
        ])
      );

      const resultDetails = await ResultDetail.find({
        result: result._id,
      }).session(session);

      const resultDetailMap = new Map();

      for (const detail of resultDetails) {
        const key = detail.assessmentQuestion.toString();

        if (resultDetailMap.has(key)) {
          throw Object.assign(
            new Error(
              "Multiple result details exist for the same assessment question."
            ),
            { statusCode: 400 }
          );
        }

        resultDetailMap.set(key, detail);
      }

      const correctionMap = new Map(
        corrections.map((correction) => [
          correction.studentAnswerId.toString(),
          correction,
        ])
      );

      const now = new Date();
      let obtainedMarks = 0;
      const updatedAnswers = [];

      // Recalculate the entire result using existing evaluations
      // plus the submitted corrections.
      for (const answer of studentAnswers) {
        const answerId = answer._id.toString();
        const evaluation = evaluationMap.get(answerId);

        if (!evaluation) {
          throw Object.assign(
            new Error(
              `Evaluation not found for student answer ${answerId}.`
            ),
            { statusCode: 400 }
          );
        }

        if (evaluation.evaluationStatus !== "EVALUATED") {
          throw Object.assign(
            new Error(
              `Student answer ${answerId} has not been fully evaluated.`
            ),
            { statusCode: 400 }
          );
        }

        const aq = assessmentQuestionMap.get(
          answer.assessmentQuestion.toString()
        );

        if (!aq || !aq.question) {
          throw Object.assign(
            new Error(
              "Assessment question or original question not found."
            ),
            { statusCode: 400 }
          );
        }

        if (
          !answer.question ||
          answer.question.toString() !== aq.question._id.toString()
        ) {
          throw Object.assign(
            new Error(
              "Student answer and assessment question references do not match."
            ),
            { statusCode: 400 }
          );
        }

        const maximumMarks = aq.marks;

        if (
          !Number.isFinite(maximumMarks) ||
          maximumMarks < 0
        ) {
          throw Object.assign(
            new Error(
              "The question has an invalid maximum marks value."
            ),
            { statusCode: 400 }
          );
        }

        const correction = correctionMap.get(answerId);

        const marksAwarded = correction
          ? correction.marksAwarded
          : evaluation.marksAwarded;

        if (
          !Number.isFinite(marksAwarded) ||
          marksAwarded < 0 ||
          marksAwarded > maximumMarks
        ) {
          throw Object.assign(
            new Error(
              `Awarded marks for answer ${answerId} must be between 0 and ${maximumMarks}.`
            ),
            { statusCode: 400 }
          );
        }

        const detail = resultDetailMap.get(aq._id.toString());

        if (!detail) {
          throw Object.assign(
            new Error(
              `Result detail not found for assessment question ${aq._id}.`
            ),
            { statusCode: 400 }
          );
        }

        if (correction) {
          evaluation.marksAwarded = marksAwarded;
          evaluation.feedback = correction.feedback ?? "";
          evaluation.evaluationStatus = "EVALUATED";
          evaluation.evaluatedBy = teacherId;
          evaluation.evaluatedAt = now;

          detail.obtainedMarks = marksAwarded;
          detail.maximumMarks = maximumMarks;
          detail.evaluationStatus = "EVALUATED";
          detail.evaluatedBy = teacherId;
          detail.evaluatedAt = now;

          // Persist feedback in ResultDetail only if that field
          // exists in its Mongoose schema.
          if (
            ResultDetail.schema.path("feedback")
          ) {
            detail.feedback = evaluation.feedback;
          }

          await evaluation.save({ session });
          await detail.save({ session });

          updatedAnswers.push({
            studentAnswerId: answer._id,
            marksAwarded,
            feedback: evaluation.feedback,
          });
        } else {
          // Keep existing question-level marks synchronized.
          if (detail.obtainedMarks !== marksAwarded) {
            detail.obtainedMarks = marksAwarded;
            await detail.save({ session });
          }
        }

        obtainedMarks += marksAwarded;
      }

      const totalMarks = result.totalMarks;

      if (
        !Number.isFinite(totalMarks) ||
        totalMarks < 0 ||
        obtainedMarks > totalMarks
      ) {
        throw Object.assign(
          new Error(
            "Total awarded marks exceed the maximum marks for this result."
          ),
          { statusCode: 400 }
        );
      }

      const percentage =
        totalMarks === 0
          ? 0
          : Number(
              ((obtainedMarks / totalMarks) * 100).toFixed(2)
            );

      // Update the existing Result rather than creating a new one.
      result.obtainedMarks = obtainedMarks;
      result.percentage = percentage;
      result.status = "EVALUATED";

      await result.save({ session });

      // Keep the attempt evaluated and synchronize its marks.
      attempt.obtainedMarks = obtainedMarks;
      attempt.status = "EVALUATED";

      await attempt.save({ session });

      responseData = {
        resultId: result._id,
        resultDetailCount: resultDetails.length,
        attemptId: attempt._id,
        studentId: attempt.student,
        assessmentId: attempt.assessment,
        totalQuestions: studentAnswers.length,
        totalMarks,
        obtainedMarks,
        percentage,
        status: attempt.status,
        correctedAnswers: updatedAnswers.length,
        corrections: updatedAnswers,
        published: false,
      };
    });

    return res.status(200).json({
      success: true,
      message:
        "Evaluation corrections saved successfully. The result remains unpublished.",
      data: responseData,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Revise attempt evaluation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to revise attempt evaluation.",
    });
  } finally {
    await session.endSession();
  }
};

/**
 * ======================================================
 * GET EVALUATION BY ID
 * ======================================================
 */

export const getAnswerEvaluationById =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.id,
      "evaluation ID",
    );

    const schoolId =
      getUserSchool(req);

    const evaluation =
      await populateAnswerEvaluation(
        AnswerEvaluation.findOne({
          _id: req.params.id,
          /**
           * School isolation happens through the
           * student's school.
           */
          student: {
            $in: await Student.find({
              school: schoolId,
            }).distinct("_id"),
          },
        }),
      );

    if (!evaluation) {
      res.status(404);
      throw new Error(
        "Answer evaluation not found",
      );
    }

    res.json(evaluation);
  });

/**
 * ======================================================
 * GET EVALUATION BY STUDENT ANSWER
 * ======================================================
 */

export const getEvaluationByStudentAnswer =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.studentAnswerId,
      "student answer ID",
    );

    const schoolId =
      getUserSchool(req);

    const studentAnswer =
      await validateStudentAnswer(
        req.params.studentAnswerId,
        schoolId,
      );

    const evaluation =
      await populateAnswerEvaluation(
        AnswerEvaluation.findOne({
          studentAnswer:
            studentAnswer._id,
        }),
      );

    if (!evaluation) {
      res.status(404);
      throw new Error(
        "Evaluation not found for this answer",
      );
    }

    res.json(evaluation);
  });

/**
 * ======================================================
 * GET EVALUATIONS BY ATTEMPT
 * ======================================================
 */


export const getEvaluationsByAttempt =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.attemptId,
      "attempt ID",
    );

    // Get school ID from resolveSchool middleware
    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(400);
      throw new Error(
        "School could not be identified.",
      );
    }

    // Find the attempt only if it belongs to a student
    // associated with the resolved school.
    const schoolStudents = await Student.find({
      school: schoolId,
    }).distinct("_id");

    const attempt = await StudentAttempt.findOne({
      _id: req.params.attemptId,
      student: { $in: schoolStudents },
    });

    if (!attempt) {
      res.status(404);
      throw new Error(
        "Student attempt not found in this school.",
      );
    }

    const student = await validateStudent(
      attempt.student,
      schoolId,
    );

    const answers = await StudentAnswer.find({
      attempt: attempt._id,
    })
      .populate("assessmentQuestion")
      .sort({ createdAt: 1 });

    const evaluations = await populateAnswerEvaluation(
      AnswerEvaluation.find({
        studentAnswer: {
          $in: answers.map((answer) => answer._id),
        },
      }).sort({ createdAt: 1 }),
    );

    return res.json({
      student,
      attempt,
      answers,
      evaluations,
    });
  });


/**
 * ======================================================
 * GET EVALUATIONS BY STUDENT
 * ======================================================
 */

export const getEvaluationsByStudent =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.studentId,
      "student ID",
    );

    const schoolId =
      getUserSchool(req);

    const student =
      await validateStudent(
        req.params.studentId,
        schoolId,
      );

    const filter = {
      student: student._id,
    };

    if (req.query.evaluationStatus) {
      validateEvaluationStatus(
        req.query.evaluationStatus,
      );

      filter.evaluationStatus =
        req.query.evaluationStatus;
    }

    const evaluations =
      await populateAnswerEvaluation(
        AnswerEvaluation.find(
          filter,
        ).sort({
          evaluatedAt: -1,
          createdAt: -1,
        }),
      );

    res.json(evaluations);
  });

/**
 * ======================================================
 * GET MY EVALUATIONS
 * ======================================================
 *
 * Only the authenticated teacher's evaluations.
 */

export const getMyAnswerEvaluations =
  asyncHandler(async (req, res) => {
    const teacher =
      await getTeacherFromUser(req);

    const filter = {
      teacher: teacher._id,
    };

    if (req.query.evaluationStatus) {
      validateEvaluationStatus(
        req.query.evaluationStatus,
      );

      filter.evaluationStatus =
        req.query.evaluationStatus;
    }

    const evaluations =
      await populateAnswerEvaluation(
        AnswerEvaluation.find(
          filter,
        ).sort({
          evaluatedAt: -1,
          createdAt: -1,
        }),
      );

    res.json(evaluations);
  });

/**
 * ======================================================
 * UPDATE / RE-EVALUATE
 * ======================================================
 *
 * A teacher can revise an existing evaluation.
 *
 * We do NOT allow the frontend to change:
 *
 * - student
 * - studentAnswer
 * - maximumMarks
 * - teacher
 *
 * These values are controlled by the backend.
 */


export const updateAnswerEvaluation = async (req, res) => {
  try {
    const {
      studentAnswerId,
      marksAwarded,
      feedback,
    } = req.body;

    // Get the authenticated teacher's ID.
    const teacherId = req.user?.id || req.user?._id;

    // Validate required fields.
    if (
      !studentAnswerId ||
      !teacherId ||
      (marksAwarded === undefined && feedback === undefined)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student answer ID, teacher authentication, and at least one field to update are required.",
      });
    }

    // Validate MongoDB ObjectIds.
    if (
      !mongoose.isValidObjectId(studentAnswerId) ||
      !mongoose.isValidObjectId(teacherId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid student answer ID or teacher ID.",
      });
    }

    // Validate marks if provided.
    let marks;

    if (marksAwarded !== undefined) {
      marks = Number(marksAwarded);

      if (
        typeof marksAwarded === "boolean" ||
        (typeof marksAwarded === "string" &&
          marksAwarded.trim() === "") ||
        !Number.isFinite(marks) ||
        marks < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Marks awarded must be a valid non-negative number.",
        });
      }
    }

    // Validate feedback if provided.
    if (
      feedback !== undefined &&
      (typeof feedback !== "string" ||
        feedback.length > 2000)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Feedback must be a string with at most 2000 characters.",
      });
    }

    // Find the student answer.
    const studentAnswer = await StudentAnswer.findById(
      studentAnswerId
    );

    if (!studentAnswer) {
      return res.status(404).json({
        success: false,
        message: "Student answer not found.",
      });
    }

    // Ensure the answer has student information.
    const studentId = studentAnswer.student;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message:
          "Student information is missing from this answer.",
      });
    }

    // Find the existing evaluation.
    const evaluation = await AnswerEvaluation.findOne({
      studentAnswer: studentAnswerId,
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message:
          "Evaluation not found. Evaluate the answer before updating it.",
      });
    }

    // Only evaluated answers can be edited before publication.
    if (evaluation.evaluationStatus !== "EVALUATED") {
      return res.status(409).json({
        success: false,
        message:
          evaluation.evaluationStatus === "PUBLISHED"
            ? "Published evaluations cannot be edited."
            : "Only evaluated, unpublished answers can be updated.",
        evaluationStatus: evaluation.evaluationStatus,
      });
    }

    // Get maximum marks from the assessment question.
    const assessmentQuestion = await AssessmentQuestion.findById(
      studentAnswer.assessmentQuestion
    ).select("marks");

    if (!assessmentQuestion) {
      return res.status(404).json({
        success: false,
        message: "Assessment question not found.",
      });
    }

    const maximumMarks = Number(assessmentQuestion.marks);

    if (
      !Number.isFinite(maximumMarks) ||
      maximumMarks < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum marks could not be determined for this answer.",
      });
    }

    // Validate marks against the maximum marks.
    if (
      marksAwarded !== undefined &&
      marks > maximumMarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Marks awarded cannot exceed ${maximumMarks}.`,
      });
    }

    // Build the fields to update.
    const updateFields = {
      updatedBy: teacherId,
      updatedAt: new Date(),
    };

    if (marksAwarded !== undefined) {
      updateFields.marksAwarded = marks;
    }

    if (feedback !== undefined) {
      updateFields.feedback = feedback;
    }

    // Update the existing evaluation without changing its status.
    const updatedEvaluation =
      await AnswerEvaluation.findOneAndUpdate(
        {
          _id: evaluation._id,
          studentAnswer: studentAnswerId,
          evaluationStatus: "EVALUATED",
        },
        {
          $set: updateFields,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    // Protect against publication or another update occurring
    // between the initial read and the update.
    if (!updatedEvaluation) {
      return res.status(409).json({
        success: false,
        message:
          "The evaluation status has changed or the evaluation was updated concurrently. Please refresh and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Answer evaluation marks and feedback updated successfully.",
      data: updatedEvaluation,
    });
  } catch (error) {
    console.error(
      "Update answer evaluation error:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID or field value.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Internal server error while updating answer evaluation.",
    });
  }
};

/**
 * ======================================================
 * UPDATE EVALUATION STATUS
 * ======================================================
 *
 * This endpoint is useful for REVIEW_REQUIRED.
 *
 * The teacher can change:
 *
 * EVALUATED
 * REVIEW_REQUIRED
 * REVISED
 *
 * PENDING is intentionally not used here for an
 * existing teacher evaluation.
 */

export const updateAnswerEvaluationStatus =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.id,
      "evaluation ID",
    );

    const {
      evaluationStatus,
    } = req.body;

    validateEvaluationStatus(
      evaluationStatus,
    );

    if (
      evaluationStatus === "PENDING"
    ) {
      res.status(400);
      throw new Error(
        "PENDING is not a valid status for an existing teacher evaluation",
      );
    }

    const schoolId =
      getUserSchool(req);

    const teacher =
      await getTeacherFromUser(req);

    const evaluation =
      await AnswerEvaluation.findById(
        req.params.id,
      );

    if (!evaluation) {
      res.status(404);
      throw new Error(
        "Answer evaluation not found",
      );
    }

    await validateStudent(
      evaluation.student,
      schoolId,
    );

    /**
     * Only the evaluating teacher can change
     * the evaluation status.
     */
    if (
      String(evaluation.teacher) !==
      String(teacher._id)
    ) {
      res.status(403);
      throw new Error(
        "Only the evaluating teacher can change this evaluation",
      );
    }

    evaluation.evaluationStatus =
      evaluationStatus;

    if (
      evaluationStatus === "EVALUATED" ||
      evaluationStatus === "REVISED"
    ) {
      evaluation.evaluatedAt =
        new Date();
    }

    evaluation.updatedBy =
      teacher._id;

    const updatedEvaluation =
      await evaluation.save();

    const result =
      await populateAnswerEvaluation(
        AnswerEvaluation.findById(
          updatedEvaluation._id,
        ),
      );

    res.json(result);
  });

/**
 * ======================================================
 * DELETE EVALUATION
 * ======================================================
 *
 * Recommended:
 * Do not allow teachers to delete official
 * evaluations.
 *
 * If you need deletion for correction/admin
 * purposes, implement a dedicated school-level
 * permission rather than exposing unrestricted
 * DELETE behavior.
 */

export const deleteAnswerEvaluation =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.id,
      "evaluation ID",
    );

    const schoolId =
      getUserSchool(req);

    const teacher =
      await getTeacherFromUser(req);

    const evaluation =
      await AnswerEvaluation.findById(
        req.params.id,
      );

    if (!evaluation) {
      res.status(404);
      throw new Error(
        "Answer evaluation not found",
      );
    }

    await validateStudent(
      evaluation.student,
      schoolId,
    );

    if (
      String(evaluation.teacher) !==
      String(teacher._id)
    ) {
      res.status(403);
      throw new Error(
        "Only the evaluating teacher can delete this evaluation",
      );
    }

    /**
     * I recommend disabling this endpoint entirely
     * in production and using REVISED instead.
     *
     * If deletion is genuinely required, this code
     * permits the original evaluator to delete it.
     */
    await evaluation.deleteOne();

    res.json({
      message:
        "Answer evaluation deleted successfully",
      id: evaluation._id,
    });
  });

/**
 * ======================================================
 * GET MY PENDING ANSWERS
 * ======================================================
 *
 * IMPORTANT:
 *
 * Pending work is NOT an AnswerEvaluation.
 *
 * Your workflow is:
 *
 * StudentAnswer
 *      ↓
 * no evaluation yet
 *      ↓
 * teacher needs to evaluate
 *
 * Therefore this endpoint returns StudentAnswer
 * records which:
 *
 * - are SUBMITTED
 * - belong to the teacher's school
 * - do NOT already have AnswerEvaluation
 *
 * This is much more accurate than:
 *
 * AnswerEvaluation.find({ evaluationStatus: "PENDING" })
 */

export const getPendingAnswerEvaluations =
  asyncHandler(async (req, res) => {
    const schoolId =
      getUserSchool(req);

    const teacher =
      await getTeacherFromUser(req);

    /**
     * Get students belonging to the teacher's school.
     */
    const studentIds =
      await Student.find({
        school: schoolId,
        isActive: true,
      }).distinct("_id");

    /**
     * Existing evaluations.
     */
    const evaluatedAnswerIds =
      await AnswerEvaluation.find({
        student: {
          $in: studentIds,
        },
      }).distinct("studentAnswer");

    /**
     * Submitted answers without evaluations.
     */
    const pendingAnswers =
      await StudentAnswer.find({
        student: {
          $in: studentIds,
        },

        status: "SUBMITTED",

        _id: {
          $nin: evaluatedAnswerIds,
        },
      })
        .populate({
          path: "student",
          select:
            "user school admissionNumber academicYear class section stream",
          populate: [
            {
              path: "user",
              select:
                "name email phone",
            },
            {
              path: "school",
              select:
                "name code",
            },
          ],
        })
        .populate({
          path: "attempt",
          select:
            "assessment attemptNumber status",
          populate: {
            path: "assessment",
            select:
              "title assessmentType subject class section stream academicYear",
            populate: [
              {
                path: "subject",
                select:
                  "name code",
              },
              {
                path: "class",
                select:
                  "name code",
              },
              {
                path: "section",
                select:
                  "name",
              },
              {
                path: "stream",
                select:
                  "name code",
              },
              {
                path: "academicYear",
                select:
                  "name",
              },
            ],
          },
        })
        .populate({
          path: "assessmentQuestion",
          populate: [
            {
              path: "question",
              select:
                "questionText questionType answerMode marks",
            },
            {
              path: "section",
              select:
                "sectionCode title questionType marksPerQuestion numberOfQuestions totalMarks",
            },
          ],
        })
        .populate({
          path: "question",
          select:
            "questionText questionType answerMode marks",
        })
        .sort({
          createdAt: 1,
        });

    /**
     * ----------------------------------------------------
     * IMPORTANT TEACHER-SUBJECT/CLASS AUTHORIZATION
     * ----------------------------------------------------
     *
     * If your Teacher model has subject/class/
     * section assignments, add that authorization
     * here.
     *
     * School membership alone proves that the teacher
     * belongs to the school, but it does NOT prove that
     * the teacher is responsible for this assessment.
     */

    res.json({
      teacher: teacher._id,
      count: pendingAnswers.length,
      answers: pendingAnswers,
    });
  });
