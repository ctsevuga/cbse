import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import Result from "../models/resultModel.js";
import StudentAttempt from "../models/studentAttemptModel.js";
import Student from "../models/studentModel.js";
import Assessment from "../models/assessmentModel.js";
import AnswerEvaluation from "../models/answerEvaluationModel.js";

const RESULT_STATUSES = [
  "DRAFT",
  "PENDING_EVALUATION",
  "EVALUATED",
  "PUBLISHED",
  "WITHDRAWN",
];

/*
 * ============================================================
 * COMMON HELPERS
 * ============================================================
 */

/**
 * School is ALWAYS derived from the authenticated user.
 *
 * No SUPER_ADMIN bypass.
 * No schoolId supplied by the client.
 */
const getUserSchool = (req) => {
  const schoolId =
    req.user?.school?._id ||
    req.user?.school ||
    req.user?.schoolId;

  if (!schoolId) {
    const error = new Error(
      "School information is missing from the logged-in user",
    );
    error.statusCode = 403;
    throw error;
  }

  return schoolId;
};

const validateObjectId = (value, fieldName) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

const validateResultStatus = (status) => {
  if (!RESULT_STATUSES.includes(status)) {
    const error = new Error("Invalid result status");
    error.statusCode = 400;
    throw error;
  }
};

const calculatePercentage = (
  obtainedMarks,
  totalMarks,
) => {
  if (totalMarks <= 0) {
    return 0;
  }

  return Number(
    ((obtainedMarks / totalMarks) * 100).toFixed(2),
  );
};

const validateMarks = (
  totalMarks,
  obtainedMarks,
) => {
  if (
    !Number.isFinite(totalMarks) ||
    totalMarks < 0
  ) {
    const error = new Error("Invalid total marks");
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isFinite(obtainedMarks) ||
    obtainedMarks < 0
  ) {
    const error = new Error(
      "Invalid obtained marks",
    );
    error.statusCode = 400;
    throw error;
  }

  if (obtainedMarks > totalMarks) {
    const error = new Error(
      "Obtained marks cannot exceed total marks",
    );
    error.statusCode = 400;
    throw error;
  }
};

/*
 * ============================================================
 * SCHOOL / STUDENT / ASSESSMENT VALIDATION
 * ============================================================
 */

const validateStudent = async (
  studentId,
  schoolId,
) => {
  validateObjectId(studentId, "student ID");

  const student = await Student.findById(studentId)
    .populate("user", "name email phone role isActive")
    .populate("school", "name code")
    .populate("academicYear", "name")
    .populate("class", "name code")
    .populate("section", "name")
    .populate("stream", "name code");

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    String(student.school?._id) !==
    String(schoolId)
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

  return student;
};

const validateAssessment = async (
  assessmentId,
  schoolId,
) => {
  validateObjectId(
    assessmentId,
    "assessment ID",
  );

  const assessment = await Assessment.findById(
    assessmentId,
  )
    .populate("school", "name code")
    .populate("academicYear", "name")
    .populate("class", "name code")
    .populate("section", "name")
    .populate("stream", "name code")
    .populate("subject", "name code");

  if (!assessment) {
    const error = new Error("Assessment not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    String(assessment.school?._id) !==
    String(schoolId)
  ) {
    const error = new Error(
      "Assessment does not belong to your school",
    );
    error.statusCode = 403;
    throw error;
  }

  return assessment;
};

const getStudentFromUser = async (req) => {
  const schoolId = getUserSchool(req);

  const student = await Student.findOne({
    user: req.user._id,
    school: schoolId,
    isActive: true,
  })
    .populate("user", "name email phone role isActive")
    .populate("school", "name code")
    .populate("academicYear", "name")
    .populate("class", "name code")
    .populate("section", "name")
    .populate("stream", "name code");

  if (!student) {
    const error = new Error(
      "Student profile not found",
    );
    error.statusCode = 404;
    throw error;
  }

  return student;
};

/*
 * ============================================================
 * ATTEMPT VALIDATION
 * ============================================================
 */

const validateAttempt = async (
  attemptId,
  schoolId,
) => {
  validateObjectId(
    attemptId,
    "attempt ID",
  );

  const attempt =
    await StudentAttempt.findById(attemptId)
      .populate({
        path: "assessment",
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
        ],
      });

  if (!attempt) {
    const error = new Error(
      "Student attempt not found",
    );
    error.statusCode = 404;
    throw error;
  }

  const assessmentSchool =
    attempt.assessment?.school?._id ||
    attempt.assessment?.school;

  const studentSchool =
    attempt.student?.school?._id ||
    attempt.student?.school;

  if (
    String(assessmentSchool) !==
    String(schoolId)
  ) {
    const error = new Error(
      "Student attempt does not belong to your school",
    );
    error.statusCode = 403;
    throw error;
  }

  if (
    String(studentSchool) !==
    String(schoolId)
  ) {
    const error = new Error(
      "Student attempt does not belong to your school",
    );
    error.statusCode = 403;
    throw error;
  }

  return attempt;
};

const validateAttemptOwner = (
  attempt,
  req,
) => {
  if (req.user.role !== "STUDENT") {
    return;
  }

  const studentUserId =
    attempt.student?.user?._id ||
    attempt.student?.user;

  if (
    String(studentUserId) !==
    String(req.user._id)
  ) {
    const error = new Error(
      "You are not authorized to access this attempt",
    );
    error.statusCode = 403;
    throw error;
  }
};

const validateAttemptForResult = (
  attempt,
) => {
  if (
    ![
      "SUBMITTED",
      "EVALUATING",
      "EVALUATED",
    ].includes(attempt.status)
  ) {
    const error = new Error(
      "The attempt is not ready for result processing",
    );
    error.statusCode = 400;
    throw error;
  }
};

const validateAttemptAssessmentStudent = (
  attempt,
) => {
  if (
    !attempt.assessment ||
    !attempt.student
  ) {
    const error = new Error(
      "Assessment or student information is missing from the attempt",
    );
    error.statusCode = 400;
    throw error;
  }
};

/*
 * ============================================================
 * ANSWER EVALUATION
 * ============================================================
 */

/**
 * Returns the number of submitted answers that still
 * require evaluation.
 *
 * MCQs that were automatically evaluated should already have
 * an AnswerEvaluation record with EVALUATED/REVISED status.
 *
 * Descriptive answers remain pending until the teacher evaluates
 * them.
 */
const getPendingEvaluationCount = async (
  attemptId,
) => {
  const StudentAnswer =
    mongoose.model("StudentAnswer");

  const answers =
    await StudentAnswer.find({
      attempt: attemptId,
      status: "SUBMITTED",
    }).select("_id");

  if (answers.length === 0) {
    return 0;
  }

  const answerIds = answers.map(
    (answer) => answer._id,
  );

  const evaluatedAnswers =
    await AnswerEvaluation.find({
      studentAnswer: {
        $in: answerIds,
      },
      evaluationStatus: {
        $in: ["EVALUATED", "REVISED"],
      },
    }).select("studentAnswer");

  const evaluatedIds = new Set(
    evaluatedAnswers.map((item) =>
      String(item.studentAnswer),
    ),
  );

  return answers.filter(
    (answer) =>
      !evaluatedIds.has(
        String(answer._id),
      ),
  ).length;
};

/**
 * Returns the current calculated marks from the attempt.
 *
 * The StudentAttempt is assumed to be updated whenever
 * MCQ/descriptive evaluations change.
 */
const getCalculatedAttemptMarks = (
  attempt,
) => {
  const totalMarks =
    Number(attempt.totalMarks) || 0;

  const obtainedMarks =
    Number(attempt.obtainedMarks) || 0;

  validateMarks(
    totalMarks,
    obtainedMarks,
  );

  return {
    totalMarks,
    obtainedMarks,
    percentage: calculatePercentage(
      obtainedMarks,
      totalMarks,
    ),
  };
};

/*
 * ============================================================
 * RESULT POPULATION
 * ============================================================
 */

const populateResult = (query) => {
  return query
    .populate({
      path: "assessment",
      select:
        "school academicYear class section stream subject title assessmentType durationMinutes totalQuestions totalMarks startDate endDate status",
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
    })
    .populate({
      path: "student",
      select:
        "user school admissionNumber academicYear class section stream subjectCombination",
      populate: [
        {
          path: "user",
          select: "name email phone role",
        },
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
      ],
    })
    .populate({
      path: "attempt",
      select:
        "assessment student attemptNumber startedAt submittedAt lastActivityAt status questionOrder totalQuestions attemptedQuestions totalMarks obtainedMarks timeSpent",
    })
    .populate({
      path: "publishedBy",
      select: "name email phone role",
    })
    .populate({
      path: "withdrawnBy",
      select: "name email phone role",
    });
};

/*
 * ============================================================
 * RESULT ACCESS AUTHORIZATION
 * ============================================================
 */

const validateResultAccess = async (
  result,
  req,
) => {
  const schoolId = getUserSchool(req);

  await validateStudent(
    result.student,
    schoolId,
  );

  if (req.user.role === "STUDENT") {
    const student =
      await getStudentFromUser(req);

    if (
      String(result.student) !==
      String(student._id)
    ) {
      const error = new Error(
        "You are not authorized to access this result",
      );
      error.statusCode = 403;
      throw error;
    }

    if (
      ![
        "EVALUATED",
        "PUBLISHED",
      ].includes(result.status)
    ) {
      const error = new Error(
        "This result is not available to the student",
      );
      error.statusCode = 403;
      throw error;
    }
  }
};

/*
 * ============================================================
 * CREATE RESULT
 * ============================================================
 */

export const createResult = asyncHandler(
  async (req, res) => {
    const { attemptId } = req.body;

    validateObjectId(
      attemptId,
      "attempt ID",
    );

    const schoolId =
      getUserSchool(req);

    const attempt =
      await validateAttempt(
        attemptId,
        schoolId,
      );

    validateAttemptOwner(
      attempt,
      req,
    );

    validateAttemptForResult(
      attempt,
    );

    validateAttemptAssessmentStudent(
      attempt,
    );

    const existingResult =
      await Result.findOne({
        attempt: attempt._id,
      });

    if (existingResult) {
      res.status(400);
      throw new Error(
        "A result already exists for this attempt",
      );
    }

    const pendingEvaluationCount =
      await getPendingEvaluationCount(
        attempt._id,
      );

    const {
      totalMarks,
      obtainedMarks,
      percentage,
    } = getCalculatedAttemptMarks(
      attempt,
    );

    /*
     * Status is NOT accepted from the client.
     *
     * It is derived from the evaluation state.
     */
    const resultStatus =
      pendingEvaluationCount > 0
        ? "PENDING_EVALUATION"
        : "EVALUATED";

    const result = await Result.create({
      assessment:
        attempt.assessment._id,

      student:
        attempt.student._id,

      attempt: attempt._id,

      totalMarks,

      obtainedMarks,

      percentage,

      status: resultStatus,
    });

    const populatedResult =
      await populateResult(
        Result.findById(result._id),
      );

    res.status(201).json(
      populatedResult,
    );
  },
);

/*
 * ============================================================
 * GET ALL RESULTS
 * ============================================================
 */

export const getResults =
  asyncHandler(async (req, res) => {
    const schoolId =
      getUserSchool(req);

    const filter = {};

    /*
     * STUDENT:
     * Only their own results.
     */
    if (req.user.role === "STUDENT") {
      const student =
        await getStudentFromUser(req);

      filter.student = student._id;

      /*
       * Students cannot see draft/pending/withdrawn results.
       */
      filter.status = {
        $in: [
          "EVALUATED",
          "PUBLISHED",
        ],
      };
    }

    /*
     * Non-student users:
     * Restrict results to students belonging to
     * the logged-in user's school.
     */
    else {
      const students =
        await Student.find({
          school: schoolId,
        }).select("_id");

      filter.student = {
        $in: students.map(
          (student) => student._id,
        ),
      };

      if (req.query.status) {
        validateResultStatus(
          req.query.status,
        );

        filter.status =
          req.query.status;
      }
    }

    if (req.query.assessmentId) {
      validateObjectId(
        req.query.assessmentId,
        "assessment ID",
      );

      await validateAssessment(
        req.query.assessmentId,
        schoolId,
      );

      filter.assessment =
        req.query.assessmentId;
    }

    if (req.query.studentId) {
      validateObjectId(
        req.query.studentId,
        "student ID",
      );

      await validateStudent(
        req.query.studentId,
        schoolId,
      );

      if (req.user.role === "STUDENT") {
        const student =
          await getStudentFromUser(req);

        if (
          String(req.query.studentId) !==
          String(student._id)
        ) {
          res.status(403);
          throw new Error(
            "You are not authorized to access these results",
          );
        }
      }

      filter.student =
        req.query.studentId;
    }

    if (req.query.attemptId) {
      validateObjectId(
        req.query.attemptId,
        "attempt ID",
      );

      const attempt =
        await validateAttempt(
          req.query.attemptId,
          schoolId,
        );

      validateAttemptOwner(
        attempt,
        req,
      );

      filter.attempt =
        req.query.attemptId;
    }

    const results =
      await populateResult(
        Result.find(filter).sort({
          createdAt: -1,
        }),
      );

    res.json(results);
  });

/*
 * ============================================================
 * GET RESULT BY ID
 * ============================================================
 */

export const getResultById =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.id,
      "result ID",
    );

    const result =
      await Result.findById(
        req.params.id,
      );

    if (!result) {
      res.status(404);
      throw new Error(
        "Result not found",
      );
    }

    await validateResultAccess(
      result,
      req,
    );

    const populatedResult =
      await populateResult(
        Result.findById(
          result._id,
        ),
      );

    res.json(populatedResult);
  });

/*
 * ============================================================
 * GET RESULT BY ASSESSMENT + STUDENT
 * ============================================================
 */

export const getResultByAssessmentAndStudent =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.assessmentId,
      "assessment ID",
    );

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

    if (req.user.role === "STUDENT") {
      const loggedInStudent =
        await getStudentFromUser(req);

      if (
        String(student._id) !==
        String(loggedInStudent._id)
      ) {
        res.status(403);
        throw new Error(
          "You are not authorized to access these results",
        );
      }
    }

    await validateAssessment(
      req.params.assessmentId,
      schoolId,
    );

    const filter = {
      assessment:
        req.params.assessmentId,

      student: student._id,
    };

    if (req.user.role === "STUDENT") {
      filter.status = {
        $in: [
          "EVALUATED",
          "PUBLISHED",
        ],
      };
    }

    const results =
      await populateResult(
        Result.find(filter).sort({
          createdAt: -1,
        }),
      );

    res.json(results);
  });

/*
 * ============================================================
 * GET RESULT BY ATTEMPT
 * ============================================================
 */

export const getResultByAttempt =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.attemptId,
      "attempt ID",
    );

    const schoolId =
      getUserSchool(req);

    const attempt =
      await validateAttempt(
        req.params.attemptId,
        schoolId,
      );

    validateAttemptOwner(
      attempt,
      req,
    );

    const result =
      await Result.findOne({
        attempt: attempt._id,
      });

    if (!result) {
      res.status(404);
      throw new Error(
        "Result not found for this attempt",
      );
    }

    await validateResultAccess(
      result,
      req,
    );

    const populatedResult =
      await populateResult(
        Result.findById(
          result._id,
        ),
      );

    res.json(populatedResult);
  });

/*
 * ============================================================
 * GET RESULTS BY STUDENT
 * ============================================================
 */

export const getResultsByStudent =
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

    if (req.user.role === "STUDENT") {
      const loggedInStudent =
        await getStudentFromUser(req);

      if (
        String(student._id) !==
        String(loggedInStudent._id)
      ) {
        res.status(403);
        throw new Error(
          "You are not authorized to access these results",
        );
      }
    }

    const filter = {
      student: student._id,
    };

    if (req.query.assessmentId) {
      validateObjectId(
        req.query.assessmentId,
        "assessment ID",
      );

      await validateAssessment(
        req.query.assessmentId,
        schoolId,
      );

      filter.assessment =
        req.query.assessmentId;
    }

    if (req.user.role === "STUDENT") {
      filter.status = {
        $in: [
          "EVALUATED",
          "PUBLISHED",
        ],
      };
    } else if (req.query.status) {
      validateResultStatus(
        req.query.status,
      );

      filter.status =
        req.query.status;
    }

    const results =
      await populateResult(
        Result.find(filter).sort({
          publishedAt: -1,
          createdAt: -1,
        }),
      );

    res.json(results);
  });

/*
 * ============================================================
 * GET RESULTS BY ASSESSMENT
 * ============================================================
 */

export const getResultsByAssessment =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.assessmentId,
      "assessment ID",
    );

    const schoolId =
      getUserSchool(req);

    await validateAssessment(
      req.params.assessmentId,
      schoolId,
    );

    const filter = {
      assessment:
        req.params.assessmentId,
    };

    if (req.query.studentId) {
      validateObjectId(
        req.query.studentId,
        "student ID",
      );

      await validateStudent(
        req.query.studentId,
        schoolId,
      );

      filter.student =
        req.query.studentId;
    }

    if (req.query.status) {
      validateResultStatus(
        req.query.status,
      );

      filter.status =
        req.query.status;
    }

    const results =
      await populateResult(
        Result.find(filter).sort({
          percentage: -1,
          obtainedMarks: -1,
        }),
      );

    res.json(results);
  });

/*
 * ============================================================
 * UPDATE RESULT
 * ============================================================
 *
 * IMPORTANT:
 * Marks are NOT accepted from req.body.
 *
 * They are recalculated from StudentAttempt.
 */
export const updateResult =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.id,
      "result ID",
    );

    const result =
      await Result.findById(
        req.params.id,
      );

    if (!result) {
      res.status(404);
      throw new Error(
        "Result not found",
      );
    }

    const schoolId =
      getUserSchool(req);

    await validateStudent(
      result.student,
      schoolId,
    );

    /*
     * A published result must not be edited
     * through the generic update endpoint.
     */
    if (result.status === "PUBLISHED") {
      res.status(400);
      throw new Error(
        "Published results cannot be edited. Withdraw the result first.",
      );
    }

    if (result.status === "WITHDRAWN") {
      res.status(400);
      throw new Error(
        "Withdrawn results cannot be edited.",
      );
    }

    const attempt =
      await validateAttempt(
        result.attempt,
        schoolId,
      );

    validateAttemptForResult(
      attempt,
    );

    const pendingEvaluationCount =
      await getPendingEvaluationCount(
        attempt._id,
      );

    const {
      totalMarks,
      obtainedMarks,
      percentage,
    } = getCalculatedAttemptMarks(
      attempt,
    );

    result.totalMarks =
      totalMarks;

    result.obtainedMarks =
      obtainedMarks;

    result.percentage =
      percentage;

    /*
     * Status is derived from evaluation state.
     */
    result.status =
      pendingEvaluationCount > 0
        ? "PENDING_EVALUATION"
        : "EVALUATED";

    /*
     * Never allow publication metadata to be
     * modified through generic update.
     */
    result.publishedAt =
      undefined;

    result.publishedBy =
      undefined;

    const updatedResult =
      await result.save();

    const populatedResult =
      await populateResult(
        Result.findById(
          updatedResult._id,
        ),
      );

    res.json(populatedResult);
  });

/*
 * ============================================================
 * UPDATE RESULT STATUS
 * ============================================================
 *
 * This endpoint is deliberately restricted.
 *
 * PUBLISHED must use publishResult().
 * WITHDRAWN must use withdrawResult().
 */
export const updateResultStatus =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.id,
      "result ID",
    );

    const { status } = req.body;

    validateResultStatus(status);

    const result =
      await Result.findById(
        req.params.id,
      );

    if (!result) {
      res.status(404);
      throw new Error(
        "Result not found",
      );
    }

    const schoolId =
      getUserSchool(req);

    await validateStudent(
      result.student,
      schoolId,
    );

    /*
     * Publication has its own business operation.
     */
    if (status === "PUBLISHED") {
      res.status(400);
      throw new Error(
        "Use the publish result endpoint to publish a result",
      );
    }

    /*
     * Withdrawal has its own business operation.
     */
    if (status === "WITHDRAWN") {
      res.status(400);
      throw new Error(
        "Use the withdraw result endpoint to withdraw a result",
      );
    }

    /*
     * A published result can only be withdrawn.
     */
    if (result.status === "PUBLISHED") {
      res.status(400);
      throw new Error(
        "A published result can only be withdrawn",
      );
    }

    /*
     * A withdrawn result is final in this lifecycle.
     */
    if (result.status === "WITHDRAWN") {
      res.status(400);
      throw new Error(
        "A withdrawn result cannot be changed",
      );
    }

    /*
     * DRAFT -> PENDING_EVALUATION -> EVALUATED
     *
     * Do not allow arbitrary backward transitions.
     */
    const allowedTransitions = {
      DRAFT: [
        "PENDING_EVALUATION",
        "EVALUATED",
      ],

      PENDING_EVALUATION: [
        "EVALUATED",
      ],

      EVALUATED: [],
    };

    const allowed =
      allowedTransitions[
        result.status
      ] || [];

    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error(
        `Invalid result status transition from ${result.status} to ${status}`,
      );
    }

    result.status = status;

    const updatedResult =
      await result.save();

    const populatedResult =
      await populateResult(
        Result.findById(
          updatedResult._id,
        ),
      );

    res.json(populatedResult);
  });

/*
 * ============================================================
 * PUBLISH RESULT
 * ============================================================
 */

export const publishResult =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.id,
      "result ID",
    );

    const result =
      await Result.findById(
        req.params.id,
      );

    if (!result) {
      res.status(404);
      throw new Error(
        "Result not found",
      );
    }

    const schoolId =
      getUserSchool(req);

    await validateStudent(
      result.student,
      schoolId,
    );

    /*
     * Only EVALUATED results can be published.
     */
    if (result.status !== "EVALUATED") {
      res.status(400);
      throw new Error(
        "Only evaluated results can be published",
      );
    }

    /*
     * Recheck evaluation state at publication time.
     *
     * This protects against publishing stale results.
     */
    const pendingEvaluationCount =
      await getPendingEvaluationCount(
        result.attempt,
      );

    if (pendingEvaluationCount > 0) {
      result.status =
        "PENDING_EVALUATION";

      await result.save();

      res.status(400);
      throw new Error(
        "All required answers must be evaluated before publishing the result",
      );
    }

    /*
     * Recalculate marks one final time before publication.
     */
    const attempt =
      await validateAttempt(
        result.attempt,
        schoolId,
      );

    const {
      totalMarks,
      obtainedMarks,
      percentage,
    } = getCalculatedAttemptMarks(
      attempt,
    );

    result.totalMarks =
      totalMarks;

    result.obtainedMarks =
      obtainedMarks;

    result.percentage =
      percentage;

    result.status = "PUBLISHED";

    result.publishedAt =
      new Date();

    result.publishedBy =
      req.user._id;

    /*
     * A newly published result should not
     * contain old withdrawal information.
     */
    result.withdrawnAt =
      undefined;

    result.withdrawnBy =
      undefined;

    const updatedResult =
      await result.save();

    const populatedResult =
      await populateResult(
        Result.findById(
          updatedResult._id,
        ),
      );

    res.json(populatedResult);
  });

/*
 * ============================================================
 * WITHDRAW RESULT
 * ============================================================
 */

export const withdrawResult =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.id,
      "result ID",
    );

    const result =
      await Result.findById(
        req.params.id,
      );

    if (!result) {
      res.status(404);
      throw new Error(
        "Result not found",
      );
    }

    const schoolId =
      getUserSchool(req);

    await validateStudent(
      result.student,
      schoolId,
    );

    if (result.status !== "PUBLISHED") {
      res.status(400);
      throw new Error(
        "Only published results can be withdrawn",
      );
    }

    result.status = "WITHDRAWN";

    result.withdrawnAt =
      new Date();

    result.withdrawnBy =
      req.user._id;

    /*
     * Keep publishedAt/publishedBy.
     *
     * They represent the original publication audit.
     */
    const updatedResult =
      await result.save();

    const populatedResult =
      await populateResult(
        Result.findById(
          updatedResult._id,
        ),
      );

    res.json(populatedResult);
  });

/*
 * ============================================================
 * DELETE RESULT
 * ============================================================
 */

export const deleteResult =
  asyncHandler(async (req, res) => {
    validateObjectId(
      req.params.id,
      "result ID",
    );

    const result =
      await Result.findById(
        req.params.id,
      );

    if (!result) {
      res.status(404);
      throw new Error(
        "Result not found",
      );
    }

    const schoolId =
      getUserSchool(req);

    await validateStudent(
      result.student,
      schoolId,
    );

    /*
     * Never hard-delete a published result.
     */
    if (result.status === "PUBLISHED") {
      res.status(400);
      throw new Error(
        "Published results cannot be deleted. Withdraw the result instead.",
      );
    }

    /*
     * A withdrawn result should remain for audit/history.
     */
    if (result.status === "WITHDRAWN") {
      res.status(400);
      throw new Error(
        "Withdrawn results cannot be deleted.",
      );
    }

    await result.deleteOne();

    res.json({
      message:
        "Result deleted successfully",
      id: result._id,
    });
  });
