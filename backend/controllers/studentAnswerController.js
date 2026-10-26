import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import StudentAnswer from "../models/studentAnswerModel.js";
import AnswerEvaluation from "../models/answerEvaluationModel.js";
import StudentAttempt from "../models/studentAttemptModel.js";
import AssessmentQuestion from "../models/assessmentQuestionModel.js";
import Student from "../models/studentModel.js";

const ANSWER_MODES = [
  "MCQ",
  "TEXT",
  "RICH_TEXT",
  "MATH",
  "TABLE",
  "CODE",
  "IMAGE",
  "DRAWING",
  "MATH_TEXT",
  "RICH_TEXT_IMAGE",
  "MATH_TABLE",
  "COMBINED",
];

const ANSWER_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "SAVED",
  "SUBMITTED",
];

const STUDENT_EDITABLE_ATTEMPT_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
];

const validateObjectId = (value, fieldName) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

/**
 * School always comes from the authenticated user/session.
 *
 * SUPER_ADMIN is intentionally not supported in this controller.
 */
const getUserSchool = (req) => {
  if (!req.schoolId) {
    const error = new Error(
      "Authenticated user's school could not be determined",
    );

    error.statusCode = 403;
    throw error;
  }

  return req.schoolId;
};

/**
 * Get the Student document belonging to the logged-in user.
 *
 * This is the authoritative student identity for STUDENT requests.
 */
const getStudentFromUser = async (req) => {
  const schoolId = getUserSchool(req);

  const student = await Student.findOne({
    user: req.user._id,
    school: schoolId,
    isActive: true,
  })
    .populate(
      "user",
      "name email phone role isActive",
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
    const error = new Error(
      "Student profile not found for the authenticated user",
    );

    error.statusCode = 404;
    throw error;
  }

  return student;
};

/**
 * Validate a student belongs to the authenticated user's school.
 */
const validateStudent = async (studentId) => {
  const schoolId = getUserSchoolFromRequestContext();

  validateObjectId(studentId, "student ID");

  const student = await Student.findOne({
    _id: studentId,
    school: schoolId,
  })
    .populate(
      "user",
      "name email phone role isActive",
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
    const error = new Error(
      "Student not found",
    );

    error.statusCode = 404;
    throw error;
  }

  if (!student.isActive) {
    const error = new Error(
      "Student is inactive",
    );

    error.statusCode = 400;
    throw error;
  }

  return student;
};

/**
 * Request-scoped school helper used internally by validation helpers.
 *
 * If you prefer, validateStudent() can receive schoolId explicitly.
 * Passing it explicitly is generally cleaner.
 */
const validateStudentInSchool = async (
  studentId,
  schoolId,
) => {
  validateObjectId(studentId, "student ID");

  const student = await Student.findOne({
    _id: studentId,
    school: schoolId,
  })
    .populate(
      "user",
      "name email phone role isActive",
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
    const error = new Error(
      "Student not found",
    );

    error.statusCode = 404;
    throw error;
  }

  if (!student.isActive) {
    const error = new Error(
      "Student is inactive",
    );

    error.statusCode = 400;
    throw error;
  }

  return student;
};

/**
 * Validate and load an attempt belonging to the
 * authenticated user's school.
 */
const validateAttempt = async (
  attemptId,
  schoolId,
) => {
  validateObjectId(attemptId, "attempt ID");

  const attempt = await StudentAttempt.findById(
    attemptId,
  )
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

  if (
    !assessmentSchool ||
    String(assessmentSchool) !== String(schoolId)
  ) {
    const error = new Error(
      "Attempt does not belong to your school",
    );

    error.statusCode = 403;
    throw error;
  }

  const studentSchool =
    attempt.student?.school?._id ||
    attempt.student?.school;

  if (
    !studentSchool ||
    String(studentSchool) !== String(schoolId)
  ) {
    const error = new Error(
      "Attempt student does not belong to your school",
    );

    error.statusCode = 403;
    throw error;
  }

  return attempt;
};

/**
 * Students may only access their own attempts.
 *
 * Staff users are allowed to access school-scoped attempts.
 */
const validateAttemptOwner = async (
  attempt,
  req,
) => {
  if (req.user.role !== "STUDENT") {
    return;
  }

  const student = await getStudentFromUser(req);

  const attemptStudentId =
    attempt.student?._id ||
    attempt.student;

  if (
    String(attemptStudentId) !==
    String(student._id)
  ) {
    const error = new Error(
      "You are not authorized to access this attempt",
    );

    error.statusCode = 403;
    throw error;
  }
};

/**
 * Validate an AssessmentQuestion belongs to the
 * assessment being attempted.
 */
const validateAssessmentQuestion = async (
  assessmentQuestionId,
  attempt,
) => {
  validateObjectId(
    assessmentQuestionId,
    "assessment question ID",
  );

  const assessmentQuestion =
    await AssessmentQuestion.findById(
      assessmentQuestionId,
    )
      .populate({
        path: "question",
        select:
          "school academicYear class subject chapter topic questionType marks answerMode options correctAnswer difficulty status isActive",
      })
      .populate({
        path: "section",
        select:
          "assessment sectionCode title questionType marksPerQuestion numberOfQuestions totalMarks",
      });

  if (!assessmentQuestion) {
    const error = new Error(
      "Assessment question not found",
    );

    error.statusCode = 404;
    throw error;
  }

  if (
    String(assessmentQuestion.assessment) !==
    String(attempt.assessment._id)
  ) {
    const error = new Error(
      "Assessment question does not belong to this assessment",
    );

    error.statusCode = 400;
    throw error;
  }

  const questionOrder =
    attempt.questionOrder || [];

  if (
    !questionOrder.some(
      (questionId) =>
        String(questionId) ===
        String(assessmentQuestion._id),
    )
  ) {
    const error = new Error(
      "This question is not part of the student's attempt",
    );

    error.statusCode = 400;
    throw error;
  }

  if (!assessmentQuestion.question) {
    const error = new Error(
      "Question associated with assessment question was not found",
    );

    error.statusCode = 400;
    throw error;
  }

  return assessmentQuestion;
};

const validateAnswerMode = (
  answerMode,
  question,
) => {
  if (!ANSWER_MODES.includes(answerMode)) {
    const error = new Error(
      "Invalid answerMode",
    );

    error.statusCode = 400;
    throw error;
  }

  if (question.answerMode !== answerMode) {
    const error = new Error(
      `Answer mode ${answerMode} does not match the question answer mode ${question.answerMode}`,
    );

    error.statusCode = 400;
    throw error;
  }
};

const validateMCQAnswer = (
  answerMode,
  answer,
  selectedOption,
  question,
) => {
  if (answerMode !== "MCQ") {
    return;
  }

  if (
    selectedOption === undefined ||
    selectedOption === null ||
    String(selectedOption).trim() === ""
  ) {
    const error = new Error(
      "selectedOption is required for MCQ questions",
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    Array.isArray(question.options) &&
    question.options.length > 0
  ) {
    const optionExists = question.options.some(
      (option) => {
        if (typeof option === "string") {
          return option === selectedOption;
        }

        if (
          option &&
          typeof option === "object"
        ) {
          return (
            option.value === selectedOption ||
            option.label === selectedOption ||
            option.key === selectedOption
          );
        }

        return false;
      },
    );

    if (!optionExists) {
      const error = new Error(
        "Selected option is not available for this question",
      );

      error.statusCode = 400;
      throw error;
    }
  }

  if (
    answer !== undefined &&
    answer !== null &&
    typeof answer !== "string" &&
    typeof answer !== "object"
  ) {
    const error = new Error(
      "Invalid MCQ answer",
    );

    error.statusCode = 400;
    throw error;
  }
};

const validateAnswerValue = (
  answerMode,
  answer,
) => {
  if (
    answer === undefined ||
    answer === null
  ) {
    return;
  }

  if (
    ["TEXT", "RICH_TEXT", "MATH_TEXT"].includes(
      answerMode,
    ) &&
    typeof answer !== "string"
  ) {
    const error = new Error(
      `${answerMode} answers must be strings`,
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    [
      "TABLE",
      "MATH_TABLE",
      "COMBINED",
    ].includes(answerMode) &&
    (
      typeof answer !== "object" ||
      Array.isArray(answer) === false
    )
  ) {
    const error = new Error(
      `${answerMode} answers must be structured data`,
    );

    error.statusCode = 400;
    throw error;
  }
};

const validateAnswerStatus = (status) => {
  if (!ANSWER_STATUSES.includes(status)) {
    const error = new Error(
      "Invalid answer status",
    );

    error.statusCode = 400;
    throw error;
  }
};

const validateAnswerCanBeEdited = (
  attempt,
) => {
  if (
    !STUDENT_EDITABLE_ATTEMPT_STATUSES.includes(
      attempt.status,
    )
  ) {
    const error = new Error(
      "Answers cannot be modified after the attempt has been submitted",
    );

    error.statusCode = 400;
    throw error;
  }
};

const validateAssessmentWindow = (
  attempt,
) => {
  const assessment = attempt.assessment;
  const now = new Date();

  if (
    assessment.endDate &&
    now > new Date(assessment.endDate)
  ) {
    const error = new Error(
      "The assessment time has expired",
    );

    error.statusCode = 400;
    error.code = "ASSESSMENT_EXPIRED";

    throw error;
  }
};

const populateStudentAnswer = (query) => {
  return query
    .populate({
      path: "attempt",
      select:
        "assessment student attemptNumber startedAt submittedAt lastActivityAt status totalQuestions attemptedQuestions totalMarks obtainedMarks timeSpent",
    })
    .populate({
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
            "questionText questionType answerMode options difficulty marks",
        },
      ],
    })
    .populate({
      path: "question",
      select:
        "questionText questionType answerMode options difficulty marks",
    })
    .populate({
      path: "student",
      select:
        "user school admissionNumber academicYear class section stream",
      populate: [
        {
          path: "user",
          select:
            "name email phone role",
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
};

/**
 * Keep StudentAttempt activity synchronized with answers.
 */
const updateAttemptActivity = async (
  attemptId,
) => {
  const attemptedQuestions =
    await StudentAnswer.countDocuments({
      attempt: attemptId,
      status: {
        $in: [
          "SAVED",
          "SUBMITTED",
        ],
      },
    });

  await StudentAttempt.findByIdAndUpdate(
    attemptId,
    {
      lastActivityAt: new Date(),
      attemptedQuestions,
    },
  );
};

/**
 * Make sure StudentAnswer has internally
 * consistent references.
 */
const validateExistingAnswerReferences = async (
  answer,
  attempt,
) => {
  const attemptStudentId =
    attempt.student?._id ||
    attempt.student;

  if (
    String(answer.student) !==
    String(attemptStudentId)
  ) {
    const error = new Error(
      "Student answer does not belong to the attempt student",
    );

    error.statusCode = 400;
    throw error;
  }

  const assessmentQuestion =
    await validateAssessmentQuestion(
      answer.assessmentQuestion,
      attempt,
    );

  if (
    String(answer.question) !==
    String(assessmentQuestion.question._id)
  ) {
    const error = new Error(
      "Student answer question does not match the assessment question",
    );

    error.statusCode = 400;
    throw error;
  }

  return assessmentQuestion;
};

/*
 * Create or save an answer.
 */
export const saveStudentAnswer =
  asyncHandler(async (req, res) => {
    const {
      attemptId,
      assessmentQuestionId,
      answerMode,
      answer = null,
      selectedOption = null,
      attachments = [],
    } = req.body;

    const schoolId = getUserSchool(req);

    validateObjectId(
      attemptId,
      "attempt ID",
    );

    validateObjectId(
      assessmentQuestionId,
      "assessment question ID",
    );

    if (!answerMode) {
      res.status(400);
      throw new Error(
        "answerMode is required",
      );
    }

    const attempt =
      await validateAttempt(
        attemptId,
        schoolId,
      );

    await validateAttemptOwner(
      attempt,
      req,
    );

    validateAnswerCanBeEdited(attempt);
    validateAssessmentWindow(attempt);

    const assessmentQuestion =
      await validateAssessmentQuestion(
        assessmentQuestionId,
        attempt,
      );

    const question =
      assessmentQuestion.question;

    if (!question.isActive) {
      res.status(400);
      throw new Error(
        "The question is no longer active",
      );
    }

    if (question.status !== "APPROVED") {
      res.status(400);
      throw new Error(
        "Only approved questions can be answered",
      );
    }

    validateAnswerMode(
      answerMode,
      question,
    );

    validateMCQAnswer(
      answerMode,
      answer,
      selectedOption,
      question,
    );

    validateAnswerValue(
      answerMode,
      answer,
    );

    const now = new Date();

    let studentAnswer =
      await StudentAnswer.findOne({
        attempt: attempt._id,
        assessmentQuestion:
          assessmentQuestion._id,
      });

    if (
      studentAnswer &&
      studentAnswer.status === "SUBMITTED"
    ) {
      res.status(400);
      throw new Error(
        "This answer has already been submitted",
      );
    }

    const studentId =
      attempt.student?._id ||
      attempt.student;

    if (!studentAnswer) {
      studentAnswer =
        new StudentAnswer({
          attempt: attempt._id,
          assessmentQuestion:
            assessmentQuestion._id,
          question: question._id,
          student: studentId,
          answerMode,
          answer,
          selectedOption,
          attachments,
          status: "SAVED",
          startedAt: now,
          lastSavedAt: now,
        });
    } else {
      if (
        String(studentAnswer.student) !==
        String(studentId)
      ) {
        res.status(400);
        throw new Error(
          "Existing answer belongs to another student",
        );
      }

      if (
        String(studentAnswer.question) !==
        String(question._id)
      ) {
        res.status(400);
        throw new Error(
          "Existing answer question does not match the assessment question",
        );
      }

      studentAnswer.answerMode = answerMode;
      studentAnswer.answer = answer;
      studentAnswer.selectedOption =
        selectedOption;
      studentAnswer.attachments =
        attachments;
      studentAnswer.status = "SAVED";
      studentAnswer.lastSavedAt = now;

      if (!studentAnswer.startedAt) {
        studentAnswer.startedAt = now;
      }
    }

    const savedAnswer =
      await studentAnswer.save();

    await updateAttemptActivity(
      attempt._id,
    );

    const result =
      await populateStudentAnswer(
        StudentAnswer.findById(
          savedAnswer._id,
        ),
      );

    res.status(201).json(
      await result,
    );
  });

/*
 * Get all student answers.
 *
 * Students can only retrieve their own answers.
 * Staff can retrieve answers belonging to their school.
 */
export const getStudentAnswers =
  asyncHandler(async (req, res) => {
    const schoolId = getUserSchool(req);

    const filter = {};

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

      await validateAttemptOwner(
        attempt,
        req,
      );

      filter.attempt = attempt._id;
    }

    if (req.query.studentId) {
      validateObjectId(
        req.query.studentId,
        "student ID",
      );

      const student =
        await validateStudentInSchool(
          req.query.studentId,
          schoolId,
        );

      if (req.user.role === "STUDENT") {
        const myStudent =
          await getStudentFromUser(req);

        if (
          String(student._id) !==
          String(myStudent._id)
        ) {
          res.status(403);
          throw new Error(
            "You are not authorized to access these answers",
          );
        }
      }

      filter.student = student._id;
    }

    if (
      req.query.assessmentQuestionId
    ) {
      validateObjectId(
        req.query.assessmentQuestionId,
        "assessment question ID",
      );

      filter.assessmentQuestion =
        req.query.assessmentQuestionId;
    }

    if (req.query.status) {
      validateAnswerStatus(
        req.query.status,
      );

      filter.status = req.query.status;
    }

    /*
     * If a student did not provide attemptId/studentId,
     * force the query to the authenticated student.
     */
    if (req.user.role === "STUDENT") {
      const student =
        await getStudentFromUser(req);

      filter.student = student._id;
    }

    const answers =
      await populateStudentAnswer(
        StudentAnswer.find(filter).sort({
          createdAt: 1,
        }),
      );

    res.json(await answers);
  });

/*
 * Get a single answer.
 */
export const getStudentAnswerById =
  asyncHandler(async (req, res) => {
    const schoolId = getUserSchool(req);

    validateObjectId(
      req.params.id,
      "answer ID",
    );

    const answer =
      await StudentAnswer.findById(
        req.params.id,
      );

    if (!answer) {
      res.status(404);
      throw new Error(
        "Student answer not found",
      );
    }

    const attempt =
      await validateAttempt(
        answer.attempt,
        schoolId,
      );

    await validateAttemptOwner(
      attempt,
      req,
    );

    await validateExistingAnswerReferences(
      answer,
      attempt,
    );

    const result =
      await populateStudentAnswer(
        StudentAnswer.findById(
          answer._id,
        ),
      );

    res.json(await result);
  });

/*
 * Get answers for an attempt.
 */

export const getAnswersByAttempt = asyncHandler(
  async (req, res) => {
    const schoolId = getUserSchool(req);

    validateObjectId(req.params.attemptId, "attempt ID");

    const attempt = await validateAttempt(
      req.params.attemptId,
      schoolId
    );

    await validateAttemptOwner(attempt, req);

    const answers = await populateStudentAnswer(
      StudentAnswer.find({
        attempt: attempt._id,
      }).sort({
        createdAt: 1,
      })
    );

    // Get IDs of all student answers.
    const answerIds = answers.map((answer) => answer._id);

    // Fetch evaluation documents linked to these answers.
    const evaluations = await AnswerEvaluation.find({
      studentAnswer: { $in: answerIds },
    }).lean();

    // Map evaluations by studentAnswer ID.
    const evaluationMap = new Map(
      evaluations.map((evaluation) => [
        String(evaluation.studentAnswer?._id ??
          evaluation.studentAnswer),
        evaluation,
      ])
    );

    // Attach the evaluation document to each answer.
    const result = answers.map((answer) => {
      const answerObject = answer.toObject();

      return {
        ...answerObject,
        evaluation:
          evaluationMap.get(String(answer._id)) ?? null,
      };
    });

    res.json(result);
  }
);


/*
 * Get the answer for one question in an attempt.
 */
export const getAnswerByAssessmentQuestion =
  asyncHandler(async (req, res) => {
    const schoolId = getUserSchool(req);

    validateObjectId(
      req.params.attemptId,
      "attempt ID",
    );

    validateObjectId(
      req.params.assessmentQuestionId,
      "assessment question ID",
    );

    const attempt =
      await validateAttempt(
        req.params.attemptId,
        schoolId,
      );

    await validateAttemptOwner(
      attempt,
      req,
    );

    const assessmentQuestion =
      await validateAssessmentQuestion(
        req.params.assessmentQuestionId,
        attempt,
      );

    const answer =
      await populateStudentAnswer(
        StudentAnswer.findOne({
          attempt: attempt._id,
          assessmentQuestion:
            assessmentQuestion._id,
        }),
      );

    if (!answer) {
      res.status(404);
      throw new Error(
        "Student answer not found",
      );
    }

    res.json(answer);
  });

/*
 * Submit one answer.
 */
export const submitStudentAnswer =
  asyncHandler(async (req, res) => {
    const schoolId = getUserSchool(req);

    validateObjectId(
      req.params.id,
      "answer ID",
    );

    const answer =
      await StudentAnswer.findById(
        req.params.id,
      );

    if (!answer) {
      res.status(404);
      throw new Error(
        "Student answer not found",
      );
    }

    const attempt =
      await validateAttempt(
        answer.attempt,
        schoolId,
      );

    await validateAttemptOwner(
      attempt,
      req,
    );

    validateAnswerCanBeEdited(attempt);
    validateAssessmentWindow(attempt);

    await validateExistingAnswerReferences(
      answer,
      attempt,
    );

    if (answer.status === "SUBMITTED") {
      res.status(400);
      throw new Error(
        "This answer has already been submitted",
      );
    }

    const now = new Date();

    answer.status = "SUBMITTED";
    answer.submittedAt = now;
    answer.lastSavedAt = now;

    const updatedAnswer =
      await answer.save();

    await updateAttemptActivity(
      attempt._id,
    );

    const result =
      await populateStudentAnswer(
        StudentAnswer.findById(
          updatedAnswer._id,
        ),
      );

    res.json(await result);
  });

/*
 * Submit all saved answers belonging to an attempt.
 */
export const submitAllStudentAnswers =
  asyncHandler(async (req, res) => {
    const schoolId = getUserSchool(req);

    validateObjectId(
      req.params.attemptId,
      "attempt ID",
    );

    const attempt =
      await validateAttempt(
        req.params.attemptId,
        schoolId,
      );

    await validateAttemptOwner(
      attempt,
      req,
    );

    validateAnswerCanBeEdited(attempt);
    validateAssessmentWindow(attempt);

    const now = new Date();

    const result =
      await StudentAnswer.updateMany(
        {
          attempt: attempt._id,
          status: {
            $in: [
              "IN_PROGRESS",
              "SAVED",
            ],
          },
        },
        {
          $set: {
            status: "SUBMITTED",
            submittedAt: now,
            lastSavedAt: now,
          },
        },
      );

    await updateAttemptActivity(
      attempt._id,
    );

    const answers =
      await populateStudentAnswer(
        StudentAnswer.find({
          attempt: attempt._id,
        }).sort({
          createdAt: 1,
        }),
      );

    res.json({
      message:
        "Student answers submitted successfully",
      modifiedCount:
        result.modifiedCount,
      answers: await answers,
    });
  });

/*
 * Update an answer.
 */
export const updateStudentAnswer =
  asyncHandler(async (req, res) => {
    const schoolId = getUserSchool(req);

    validateObjectId(
      req.params.id,
      "answer ID",
    );

    const answer =
      await StudentAnswer.findById(
        req.params.id,
      );

    if (!answer) {
      res.status(404);
      throw new Error(
        "Student answer not found",
      );
    }

    const attempt =
      await validateAttempt(
        answer.attempt,
        schoolId,
      );

    await validateAttemptOwner(
      attempt,
      req,
    );

    validateAnswerCanBeEdited(attempt);
    validateAssessmentWindow(attempt);

    if (answer.status === "SUBMITTED") {
      res.status(400);
      throw new Error(
        "A submitted answer cannot be modified",
      );
    }

    const assessmentQuestion =
      await validateExistingAnswerReferences(
        answer,
        attempt,
      );

    const question =
      assessmentQuestion.question;

    const answerMode =
      req.body.answerMode ??
      answer.answerMode;

    const answerValue =
      req.body.answer !== undefined
        ? req.body.answer
        : answer.answer;

    const selectedOption =
      req.body.selectedOption !==
      undefined
        ? req.body.selectedOption
        : answer.selectedOption;

    const attachments =
      req.body.attachments !==
      undefined
        ? req.body.attachments
        : answer.attachments;

    validateAnswerMode(
      answerMode,
      question,
    );

    validateMCQAnswer(
      answerMode,
      answerValue,
      selectedOption,
      question,
    );

    validateAnswerValue(
      answerMode,
      answerValue,
    );

    answer.answerMode = answerMode;
    answer.answer = answerValue;
    answer.selectedOption =
      selectedOption;
    answer.attachments = attachments;
    answer.status = "SAVED";
    answer.lastSavedAt = new Date();

    if (!answer.startedAt) {
      answer.startedAt = new Date();
    }

    const updatedAnswer =
      await answer.save();

    await updateAttemptActivity(
      attempt._id,
    );

    const result =
      await populateStudentAnswer(
        StudentAnswer.findById(
          updatedAnswer._id,
        ),
      );

    res.json(await result);
  });

/*
 * Change answer status.
 *
 * Intended for school staff/evaluation workflow.
 */
export const updateStudentAnswerStatus =
  asyncHandler(async (req, res) => {
    const schoolId = getUserSchool(req);

    validateObjectId(
      req.params.id,
      "answer ID",
    );

    const { status } = req.body;

    validateAnswerStatus(status);

    const answer =
      await StudentAnswer.findById(
        req.params.id,
      );

    if (!answer) {
      res.status(404);
      throw new Error(
        "Student answer not found",
      );
    }

    const attempt =
      await validateAttempt(
        answer.attempt,
        schoolId,
      );

    await validateExistingAnswerReferences(
      answer,
      attempt,
    );

    /*
     * Students should use the dedicated submit
     * endpoints rather than arbitrary status changes.
     */
    if (req.user.role === "STUDENT") {
      res.status(403);
      throw new Error(
        "Students cannot directly change answer status",
      );
    }

    const now = new Date();

    answer.status = status;
    answer.lastSavedAt = now;

    if (status === "SUBMITTED") {
      answer.submittedAt =
        answer.submittedAt || now;
    }

    const updatedAnswer =
      await answer.save();

    await updateAttemptActivity(
      attempt._id,
    );

    const result =
      await populateStudentAnswer(
        StudentAnswer.findById(
          updatedAnswer._id,
        ),
      );

    res.json(await result);
  });

/*
 * Delete an answer.
 */
export const deleteStudentAnswer =
  asyncHandler(async (req, res) => {
    const schoolId = getUserSchool(req);

    validateObjectId(
      req.params.id,
      "answer ID",
    );

    const answer =
      await StudentAnswer.findById(
        req.params.id,
      );

    if (!answer) {
      res.status(404);
      throw new Error(
        "Student answer not found",
      );
    }

    const attempt =
      await validateAttempt(
        answer.attempt,
        schoolId,
      );

    await validateAttemptOwner(
      attempt,
      req,
    );

    if (answer.status === "SUBMITTED") {
      res.status(400);
      throw new Error(
        "A submitted answer cannot be deleted",
      );
    }

    if (
      !STUDENT_EDITABLE_ATTEMPT_STATUSES.includes(
        attempt.status,
      )
    ) {
      res.status(400);
      throw new Error(
        "Answer cannot be deleted after the attempt is submitted",
      );
    }

    await validateExistingAnswerReferences(
      answer,
      attempt,
    );

    await answer.deleteOne();

    await updateAttemptActivity(
      attempt._id,
    );

    res.json({
      message:
        "Student answer deleted successfully",
      id: answer._id,
    });
  });

/*
 * Get answers belonging to the logged-in student.
 */
export const getMyStudentAnswers =
  asyncHandler(async (req, res) => {
    const student =
      await getStudentFromUser(req);

    const filter = {
      student: student._id,
    };

    if (req.query.attemptId) {
      validateObjectId(
        req.query.attemptId,
        "attempt ID",
      );

      const attempt =
        await validateAttempt(
          req.query.attemptId,
          student.school._id ||
            student.school,
        );

      await validateAttemptOwner(
        attempt,
        req,
      );

      const attemptStudentId =
        attempt.student?._id ||
        attempt.student;

      if (
        String(attemptStudentId) !==
        String(student._id)
      ) {
        res.status(403);
        throw new Error(
          "You are not authorized to access this attempt",
        );
      }

      filter.attempt = attempt._id;
    }

    if (req.query.status) {
      validateAnswerStatus(
        req.query.status,
      );

      filter.status =
        req.query.status;
    }

    const answers =
      await populateStudentAnswer(
        StudentAnswer.find(filter).sort({
          createdAt: 1,
        }),
      );

    res.json(await answers);
  });
