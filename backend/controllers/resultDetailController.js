import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import ResultDetail from "../models/resultDetailModel.js";
import Result from "../models/resultModel.js";
import AssessmentQuestion from "../models/assessmentQuestionModel.js";
import Question from "../models/questionModel.js";
import Subject from "../models/subjectModel.js";
import Chapter from "../models/chapterModel.js";
import Topic from "../models/topicModel.js";
import Teacher from "../models/teacherModel.js";

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const EVALUATION_STATUSES = [
  "NOT_ATTEMPTED",
  "AUTO_EVALUATED",
  "PENDING",
  "EVALUATED",
  "REVIEW_REQUIRED",
];

const MANUAL_EVALUATION_STATUSES = [
  "EVALUATED",
  "REVIEW_REQUIRED",
];

const IMMUTABLE_RESULT_STATUSES = [
  "PUBLISHED",
  "WITHDRAWN",
];

/**
 * ---------------------------------------------------------
 * Basic helpers
 * ---------------------------------------------------------
 */

/**
 * School is always derived from the authenticated user.
 *
 * IMPORTANT:
 * This controller does not accept schoolId from req.body
 * or req.query.
 *
 * If your authentication middleware stores the school as
 * req.schoolId instead of req.user.school, change this
 * helper in ONE place.
 */
const getUserSchool = (req) => {
  const schoolId = req.user?.school;

  if (!schoolId) {
    const error = new Error(
      "Authenticated user is not associated with a school",
    );
    error.statusCode = 403;
    throw error;
  }

  return schoolId;
};

const validateObjectId = (id, fieldName) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }

  return new mongoose.Types.ObjectId(id);
};

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const validateEvaluationStatus = (status) => {
  if (!EVALUATION_STATUSES.includes(status)) {
    throwError("Invalid evaluation status");
  }
};

const validateQuestionType = (questionType) => {
  if (!QUESTION_TYPES.includes(questionType)) {
    throwError("Invalid question type");
  }
};

const ensureResultEditable = (result) => {
  if (IMMUTABLE_RESULT_STATUSES.includes(result.status)) {
    throwError(
      "Result details cannot be modified after the result is published or withdrawn",
      400,
    );
  }
};

/**
 * ---------------------------------------------------------
 * Result / ownership helpers
 * ---------------------------------------------------------
 */

/**
 * Gets a result and verifies that it belongs to the
 * authenticated user's school.
 *
 * School ownership is established through the Result's
 * student and assessment.
 */
const getResult = async (resultId, userSchool) => {
  validateObjectId(resultId, "result ID");

  const result = await Result.findById(resultId)
    .populate(
      "assessment",
      "school academicYear class section stream subject title assessmentType totalMarks totalQuestions status",
    )
    .populate(
      "student",
      "user school admissionNumber academicYear class section stream",
    );

  if (!result) {
    throwError("Result not found", 404);
  }

  if (
    !result.student?.school ||
    result.student.school.toString() !== userSchool.toString()
  ) {
    throwError("Not authorized for this school", 403);
  }

  if (
    result.assessment?.school &&
    result.assessment.school.toString() !== userSchool.toString()
  ) {
    throwError(
      "Result does not belong to your school",
      403,
    );
  }

  return result;
};

/**
 * Returns result IDs belonging to the authenticated school.
 *
 * Used by broad listing endpoints so we don't load every
 * ResultDetail and then call getResult() once per document.
 */
const getSchoolResultIds = async (userSchool) => {
  const schoolObjectId = new mongoose.Types.ObjectId(
    userSchool,
  );

  const results = await Result.aggregate([
    {
      $lookup: {
        from: "students",
        localField: "student",
        foreignField: "_id",
        as: "studentData",
      },
    },
    {
      $unwind: "$studentData",
    },
    {
      $match: {
        "studentData.school": schoolObjectId,
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);

  return results.map((item) => item._id);
};

/**
 * ---------------------------------------------------------
 * Assessment Question / Question helpers
 * ---------------------------------------------------------
 */

const getAssessmentQuestion = async (
  assessmentQuestionId,
) => {
  validateObjectId(
    assessmentQuestionId,
    "assessment question ID",
  );

  const assessmentQuestion =
    await AssessmentQuestion.findById(
      assessmentQuestionId,
    )
      .populate(
        "assessment",
        "school academicYear class section stream subject title assessmentType status",
      )
      .populate("section")
      .populate("question")
      .populate("questionGroup");

  if (!assessmentQuestion) {
    throwError("Assessment question not found", 404);
  }

  return assessmentQuestion;
};

const getQuestion = async (questionId) => {
  validateObjectId(questionId, "question ID");

  const question = await Question.findById(questionId);

  if (!question) {
    throwError("Question not found", 404);
  }

  return question;
};

/**
 * ---------------------------------------------------------
 * Teacher helpers
 * ---------------------------------------------------------
 */

/**
 * Gets the currently authenticated teacher.
 *
 * The client is never allowed to tell us which teacher
 * performed an evaluation.
 */
const getAuthenticatedTeacher = async (req, userSchool) => {
  if (req.user.role !== "TEACHER") {
    throwError(
      "Only a teacher can perform this evaluation",
      403,
    );
  }

  const teacher = await Teacher.findOne({
    user: req.user._id,
    school: userSchool,
    isActive: true,
  }).populate(
    "user",
    "name email role isActive",
  );

  if (!teacher) {
    throwError("Active teacher profile not found", 404);
  }

  if (!teacher.user?.isActive) {
    throwError(
      "Teacher user account is inactive",
      400,
    );
  }

  return teacher;
};

/**
 * ---------------------------------------------------------
 * Question / hierarchy validation
 * ---------------------------------------------------------
 */

const validateResultQuestion = async (
  result,
  assessmentQuestion,
  question,
  userSchool,
) => {
  const assessment = result.assessment;

  if (!assessment) {
    throwError(
      "Assessment associated with result not found",
      400,
    );
  }

  if (
    assessmentQuestion.assessment?._id?.toString() !==
    assessment._id.toString()
  ) {
    throwError(
      "Assessment question does not belong to the result assessment",
      400,
    );
  }

  if (
    assessmentQuestion.question?._id?.toString() !==
    question._id.toString()
  ) {
    throwError(
      "Assessment question and question do not match",
      400,
    );
  }

  if (
    question.school &&
    question.school.toString() !== userSchool.toString()
  ) {
    throwError(
      "Question does not belong to your school",
      403,
    );
  }

  if (
    assessment.school &&
    assessment.school.toString() !== userSchool.toString()
  ) {
    throwError(
      "Assessment does not belong to your school",
      403,
    );
  }

  if (
    assessment.subject &&
    question.subject &&
    assessment.subject.toString() !==
      question.subject.toString()
  ) {
    throwError(
      "Question does not belong to the assessment subject",
      400,
    );
  }

  validateQuestionType(question.questionType);
};

const validateQuestionHierarchy = async (question) => {
  let subject = null;
  let chapter = null;
  let topic = null;

  if (question.subject) {
    subject = await Subject.findById(question.subject);

    if (!subject) {
      throwError("Question subject not found", 400);
    }
  }

  if (question.chapter) {
    chapter = await Chapter.findById(question.chapter);

    if (!chapter) {
      throwError("Question chapter not found", 400);
    }

    if (
      question.subject &&
      chapter.subject &&
      chapter.subject.toString() !==
        question.subject.toString()
    ) {
      throwError(
        "Question chapter does not belong to question subject",
        400,
      );
    }
  }

  if (question.topic) {
    topic = await Topic.findById(question.topic);

    if (!topic) {
      throwError("Question topic not found", 400);
    }

    if (
      question.chapter &&
      topic.chapter &&
      topic.chapter.toString() !==
        question.chapter.toString()
    ) {
      throwError(
        "Question topic does not belong to question chapter",
        400,
      );
    }
  }

  return {
    subject,
    chapter,
    topic,
  };
};

/**
 * ---------------------------------------------------------
 * Marks / evaluation helpers
 * ---------------------------------------------------------
 */

const validateObtainedMarks = (
  obtainedMarks,
  maximumMarks,
) => {
  if (
    obtainedMarks === undefined ||
    obtainedMarks === null ||
    obtainedMarks === ""
  ) {
    throwError("Obtained marks are required");
  }

  const marks = Number(obtainedMarks);

  if (!Number.isFinite(marks)) {
    throwError("Obtained marks must be a valid number");
  }

  if (marks < 0 || marks > maximumMarks) {
    throwError(
      `Obtained marks must be between 0 and ${maximumMarks}`,
    );
  }

  return marks;
};

/**
 * Validates the relationship between status and evaluator.
 *
 * evaluatedBy/evaluatedAt are server-controlled.
 */
const validateEvaluationData = ({
  evaluationStatus,
  teacher,
}) => {
  if (
    MANUAL_EVALUATION_STATUSES.includes(
      evaluationStatus,
    ) &&
    !teacher
  ) {
    throwError(
      "A teacher is required for manual evaluation",
    );
  }

  if (
    evaluationStatus === "AUTO_EVALUATED" &&
    teacher
  ) {
    throwError(
      "Auto-evaluated result details cannot have a teacher evaluator",
    );
  }

  if (
    ["PENDING", "NOT_ATTEMPTED"].includes(
      evaluationStatus,
    ) &&
    teacher
  ) {
    throwError(
      `${evaluationStatus} result details cannot have a teacher evaluator`,
    );
  }
};

/**
 * ---------------------------------------------------------
 * Population
 * ---------------------------------------------------------
 */

const populateResultDetail = (query) =>
  query
    .populate({
      path: "result",
      populate: [
        {
          path: "assessment",
          select:
            "school academicYear class section stream subject title assessmentType totalMarks totalQuestions status",
        },
        {
          path: "student",
          select:
            "user school admissionNumber academicYear class section stream",
          populate: {
            path: "user",
            select: "name email phone",
          },
        },
      ],
    })
    .populate({
      path: "assessmentQuestion",
      populate: [
        {
          path: "section",
          select:
            "assessment sectionCode title questionType marksPerQuestion numberOfQuestions totalMarks",
        },
      ],
    })
    .populate(
      "question",
      "school academicYear class subject chapter topic questionType questionText marks difficulty",
    )
    .populate(
      "subject",
      "code name shortName subjectType",
    )
    .populate(
      "chapter",
      "subject chapterNumber title",
    )
    .populate(
      "topic",
      "chapter name",
    )
    .populate({
      path: "evaluatedBy",
      populate: {
        path: "user",
        select: "name email",
      },
    });

/**
 * ---------------------------------------------------------
 * CREATE
 * ---------------------------------------------------------
 */

const createResultDetail = asyncHandler(
  async (req, res) => {
    const userSchool = getUserSchool(req);

    const {
      result,
      assessmentQuestion,
      question,
      obtainedMarks,
      evaluationStatus = "PENDING",
    } = req.body;

    /**
     * evaluatedBy is deliberately NOT read from req.body.
     */
    if (!result || !assessmentQuestion || !question) {
      throwError(
        "result, assessmentQuestion and question are required",
      );
    }

    const resultDoc = await getResult(
      result,
      userSchool,
    );

    const assessmentQuestionDoc =
      await getAssessmentQuestion(
        assessmentQuestion,
      );

    const questionDoc = await getQuestion(question);

    await validateResultQuestion(
      resultDoc,
      assessmentQuestionDoc,
      questionDoc,
      userSchool,
    );

    ensureResultEditable(resultDoc);

    const {
      subject,
      chapter,
      topic,
    } = await validateQuestionHierarchy(
      questionDoc,
    );

    validateEvaluationStatus(evaluationStatus);

    const maximumMarks =
      assessmentQuestionDoc.marks;

    if (
      maximumMarks === undefined ||
      maximumMarks === null
    ) {
      throwError(
        "Assessment question maximum marks are not defined",
        400,
      );
    }

    const marks = validateObtainedMarks(
      obtainedMarks,
      maximumMarks,
    );

    /**
     * A result detail must be unique for a result +
     * assessment question.
     */
    const existingDetail =
      await ResultDetail.findOne({
        result: resultDoc._id,
        assessmentQuestion:
          assessmentQuestionDoc._id,
      });

    if (existingDetail) {
      throwError(
        "Result detail already exists for this assessment question",
        409,
      );
    }

    let teacher = null;

    if (
      MANUAL_EVALUATION_STATUSES.includes(
        evaluationStatus,
      )
    ) {
      teacher = await getAuthenticatedTeacher(
        req,
        userSchool,
      );
    }

    validateEvaluationData({
      evaluationStatus,
      teacher,
    });

    /**
     * NOT_ATTEMPTED should always have zero marks.
     */
    if (
      evaluationStatus === "NOT_ATTEMPTED" &&
      marks !== 0
    ) {
      throwError(
        "A not-attempted question must have 0 obtained marks",
      );
    }

    const now = new Date();

    const resultDetail =
      await ResultDetail.create({
        result: resultDoc._id,

        assessmentQuestion:
          assessmentQuestionDoc._id,

        question: questionDoc._id,

        subject:
          subject?._id || questionDoc.subject,

        chapter:
          chapter?._id || questionDoc.chapter,

        topic:
          topic?._id || questionDoc.topic,

        questionType:
          questionDoc.questionType,

        maximumMarks,

        obtainedMarks: marks,

        evaluationStatus,

        /**
         * Server-controlled evaluator.
         */
        evaluatedBy:
          teacher?._id || null,

        evaluatedAt:
          teacher ? now : null,
      });

    const populated =
      await populateResultDetail(
        ResultDetail.findById(
          resultDetail._id,
        ),
      );

    res.status(201).json(
      await populated,
    );
  },
);

/**
 * ---------------------------------------------------------
 * GET ALL / FILTER
 * ---------------------------------------------------------
 */

const getResultDetails = asyncHandler(
  async (req, res) => {
    const userSchool = getUserSchool(req);

    const filter = {};

    if (req.query.result) {
      const result = await getResult(
        req.query.result,
        userSchool,
      );

      filter.result = result._id;
    }

    if (req.query.assessmentQuestion) {
      const assessmentQuestion =
        await getAssessmentQuestion(
          req.query.assessmentQuestion,
        );

      if (
        assessmentQuestion.assessment?.school &&
        assessmentQuestion.assessment.school.toString() !==
          userSchool.toString()
      ) {
        throwError(
          "Not authorized for this school",
          403,
        );
      }

      filter.assessmentQuestion =
        assessmentQuestion._id;
    }

    if (req.query.question) {
      const question =
        await getQuestion(req.query.question);

      if (
        question.school &&
        question.school.toString() !==
          userSchool.toString()
      ) {
        throwError(
          "Not authorized for this school",
          403,
        );
      }

      filter.question = question._id;
    }

    if (req.query.subject) {
      validateObjectId(
        req.query.subject,
        "subject ID",
      );

      filter.subject = req.query.subject;
    }

    if (req.query.chapter) {
      validateObjectId(
        req.query.chapter,
        "chapter ID",
      );

      filter.chapter = req.query.chapter;
    }

    if (req.query.topic) {
      validateObjectId(
        req.query.topic,
        "topic ID",
      );

      filter.topic = req.query.topic;
    }

    if (req.query.questionType) {
      validateQuestionType(
        req.query.questionType,
      );

      filter.questionType =
        req.query.questionType;
    }

    if (req.query.evaluationStatus) {
      validateEvaluationStatus(
        req.query.evaluationStatus,
      );

      filter.evaluationStatus =
        req.query.evaluationStatus;
    }

    /**
     * evaluatedBy can only be queried if the teacher
     * belongs to the authenticated school.
     */
    if (req.query.evaluatedBy) {
      validateObjectId(
        req.query.evaluatedBy,
        "teacher ID",
      );

      const teacher = await Teacher.findOne({
        _id: req.query.evaluatedBy,
        school: userSchool,
        isActive: true,
      });

      if (!teacher) {
        throwError(
          "Teacher not found in your school",
          404,
        );
      }

      filter.evaluatedBy = teacher._id;
    }

    /**
     * Always apply school scope.
     */
    if (!filter.result) {
      const schoolResultIds =
        await getSchoolResultIds(
          userSchool,
        );

      filter.result = {
        $in: schoolResultIds,
      };
    }

    const resultDetails =
      await populateResultDetail(
        ResultDetail.find(filter).sort({
          createdAt: -1,
        }),
      );

    res.json(
      await resultDetails,
    );
  },
);

/**
 * ---------------------------------------------------------
 * GET BY ID
 * ---------------------------------------------------------
 */

const getResultDetailById =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    validateObjectId(
      req.params.id,
      "result detail ID",
    );

    const resultDetail =
      await ResultDetail.findById(
        req.params.id,
      );

    if (!resultDetail) {
      throwError(
        "Result detail not found",
        404,
      );
    }

    await getResult(
      resultDetail.result,
      userSchool,
    );

    const populated =
      await populateResultDetail(
        ResultDetail.findById(
          resultDetail._id,
        ),
      );

    res.json(
      await populated,
    );
  });

/**
 * ---------------------------------------------------------
 * GET BY RESULT
 * ---------------------------------------------------------
 */

const getResultDetailsByResult =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    const result =
      await getResult(
        req.params.resultId,
        userSchool,
      );

    const resultDetails =
      await populateResultDetail(
        ResultDetail.find({
          result: result._id,
        }).sort({
          createdAt: 1,
        }),
      );

    res.json(
      await resultDetails,
    );
  });

/**
 * ---------------------------------------------------------
 * GET BY ASSESSMENT QUESTION
 * ---------------------------------------------------------
 *
 * This endpoint returns the result detail for a particular
 * student's result + assessment question.
 *
 * The result is therefore required.
 * ---------------------------------------------------------
 */

const getResultDetailByAssessmentQuestion =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    validateObjectId(
      req.params.assessmentQuestionId,
      "assessment question ID",
    );

    if (!req.query.result) {
      throwError(
        "result is required",
      );
    }

    const result =
      await getResult(
        req.query.result,
        userSchool,
      );

    const assessmentQuestion =
      await getAssessmentQuestion(
        req.params.assessmentQuestionId,
      );

    if (
      assessmentQuestion.assessment?.school &&
      assessmentQuestion.assessment.school.toString() !==
        userSchool.toString()
    ) {
      throwError(
        "Not authorized for this school",
        403,
      );
    }

    if (
      assessmentQuestion.assessment?._id?.toString() !==
      result.assessment?._id?.toString()
    ) {
      throwError(
        "Assessment question does not belong to the result assessment",
        400,
      );
    }

    const resultDetail =
      await ResultDetail.findOne({
        result: result._id,
        assessmentQuestion:
          assessmentQuestion._id,
      });

    if (!resultDetail) {
      throwError(
        "Result detail not found",
        404,
      );
    }

    const populated =
      await populateResultDetail(
        ResultDetail.findById(
          resultDetail._id,
        ),
      );

    res.json(
      await populated,
    );
  });

/**
 * ---------------------------------------------------------
 * GET BY STUDENT
 * ---------------------------------------------------------
 */

const getResultDetailsByStudent =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    const studentId =
      validateObjectId(
        req.params.studentId,
        "student ID",
      );

    const resultIds =
      await Result.aggregate([
        {
          $match: {
            student: studentId,
          },
        },
        {
          $lookup: {
            from: "students",
            localField: "student",
            foreignField: "_id",
            as: "studentData",
          },
        },
        {
          $unwind: "$studentData",
        },
        {
          $match: {
            "studentData.school":
              new mongoose.Types.ObjectId(
                userSchool,
              ),
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]);

    const ids =
      resultIds.map(
        (item) => item._id,
      );

    if (ids.length === 0) {
      return res.json([]);
    }

    const resultDetails =
      await populateResultDetail(
        ResultDetail.find({
          result: {
            $in: ids,
          },
        }).sort({
          createdAt: -1,
        }),
      );

    res.json(
      await resultDetails,
    );
  });

/**
 * ---------------------------------------------------------
 * GET BY QUESTION
 * ---------------------------------------------------------
 */

const getResultDetailsByQuestion =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    const question =
      await getQuestion(
        req.params.questionId,
      );

    if (
      question.school &&
      question.school.toString() !==
        userSchool.toString()
    ) {
      throwError(
        "Not authorized for this school",
        403,
      );
    }

    const resultIds =
      await getSchoolResultIds(
        userSchool,
      );

    const resultDetails =
      await populateResultDetail(
        ResultDetail.find({
          question: question._id,
          result: {
            $in: resultIds,
          },
        }).sort({
          createdAt: -1,
        }),
      );

    res.json(
      await resultDetails,
    );
  });

/**
 * ---------------------------------------------------------
 * GET BY SUBJECT
 * ---------------------------------------------------------
 */

const getResultDetailsBySubject =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    const subjectId =
      validateObjectId(
        req.params.subjectId,
        "subject ID",
      );

    const subject =
      await Subject.findById(subjectId);

    if (!subject) {
      throwError(
        "Subject not found",
        404,
      );
    }

    if (
      subject.school &&
      subject.school.toString() !==
        userSchool.toString()
    ) {
      throwError(
        "Not authorized for this school",
        403,
      );
    }

    const resultIds =
      await getSchoolResultIds(
        userSchool,
      );

    const resultDetails =
      await populateResultDetail(
        ResultDetail.find({
          subject: subjectId,
          result: {
            $in: resultIds,
          },
        }).sort({
          createdAt: -1,
        }),
      );

    res.json(
      await resultDetails,
    );
  });

/**
 * ---------------------------------------------------------
 * GET MY EVALUATIONS
 * ---------------------------------------------------------
 *
 * This endpoint is specifically for the currently logged-in
 * teacher.
 *
 * evaluatedBy is NEVER supplied by the client.
 * ---------------------------------------------------------
 */

const getMyResultDetailEvaluations =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    const teacher =
      await getAuthenticatedTeacher(
        req,
        userSchool,
      );

    const resultIds =
      await getSchoolResultIds(
        userSchool,
      );

    const resultDetails =
      await populateResultDetail(
        ResultDetail.find({
          evaluatedBy: teacher._id,
          result: {
            $in: resultIds,
          },
        }).sort({
          updatedAt: -1,
        }),
      );

    res.json(
      await resultDetails,
    );
  });

/**
 * ---------------------------------------------------------
 * GET PENDING EVALUATIONS
 * ---------------------------------------------------------
 */

const getPendingResultDetails =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    const resultIds =
      await getSchoolResultIds(
        userSchool,
      );

    const resultDetails =
      await populateResultDetail(
        ResultDetail.find({
          result: {
            $in: resultIds,
          },
          evaluationStatus: {
            $in: [
              "PENDING",
              "REVIEW_REQUIRED",
            ],
          },
        }).sort({
          createdAt: 1,
        }),
      );

    res.json(
      await resultDetails,
    );
  });

/**
 * ---------------------------------------------------------
 * UPDATE RESULT DETAIL
 * ---------------------------------------------------------
 *
 * This updates marks and/or evaluation status.
 *
 * The client CANNOT update:
 * - result
 * - assessmentQuestion
 * - question
 * - subject
 * - chapter
 * - topic
 * - questionType
 * - maximumMarks
 * - evaluatedBy
 * - evaluatedAt
 *
 * Those are server-controlled.
 * ---------------------------------------------------------
 */

const updateResultDetail =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    const resultDetailId =
      validateObjectId(
        req.params.id,
        "result detail ID",
      );

    const resultDetail =
      await ResultDetail.findById(
        resultDetailId,
      );

    if (!resultDetail) {
      throwError(
        "Result detail not found",
        404,
      );
    }

    const result =
      await getResult(
        resultDetail.result,
        userSchool,
      );

    ensureResultEditable(result);

    const assessmentQuestion =
      await getAssessmentQuestion(
        resultDetail.assessmentQuestion,
      );

    const question =
      await getQuestion(
        resultDetail.question,
      );

    await validateResultQuestion(
      result,
      assessmentQuestion,
      question,
      userSchool,
    );

    const {
      obtainedMarks,
      evaluationStatus,
    } = req.body;

    /**
     * At least one mutable field must be supplied.
     */
    if (
      obtainedMarks === undefined &&
      evaluationStatus === undefined
    ) {
      throwError(
        "Nothing to update",
      );
    }

    const maximumMarks =
      assessmentQuestion.marks;

    if (
      maximumMarks === undefined ||
      maximumMarks === null
    ) {
      throwError(
        "Assessment question maximum marks are not defined",
        400,
      );
    }

    /**
     * Determine final values before saving.
     */
    const finalStatus =
      evaluationStatus ??
      resultDetail.evaluationStatus;

    const finalMarks =
      obtainedMarks !== undefined
        ? validateObtainedMarks(
            obtainedMarks,
            maximumMarks,
          )
        : resultDetail.obtainedMarks;

    validateEvaluationStatus(
      finalStatus,
    );

    /**
     * Teacher identity is derived from authentication.
     */
    let teacher = null;

    if (
      MANUAL_EVALUATION_STATUSES.includes(
        finalStatus,
      )
    ) {
      teacher =
        await getAuthenticatedTeacher(
          req,
          userSchool,
        );
    }

    validateEvaluationData({
      evaluationStatus: finalStatus,
      teacher,
    });

    if (
      finalStatus === "NOT_ATTEMPTED" &&
      finalMarks !== 0
    ) {
      throwError(
        "A not-attempted question must have 0 obtained marks",
      );
    }

    resultDetail.obtainedMarks =
      finalMarks;

    resultDetail.evaluationStatus =
      finalStatus;

    /**
     * Evaluator and evaluation time are always controlled
     * by the server.
     */
    if (
      MANUAL_EVALUATION_STATUSES.includes(
        finalStatus,
      )
    ) {
      resultDetail.evaluatedBy =
        teacher._id;

      resultDetail.evaluatedAt =
        new Date();
    } else {
      resultDetail.evaluatedBy =
        null;

      resultDetail.evaluatedAt =
        null;
    }

    /**
     * maximumMarks is refreshed from the AssessmentQuestion.
     * Client cannot modify it.
     */
    resultDetail.maximumMarks =
      maximumMarks;

    await resultDetail.save();

    const populated =
      await populateResultDetail(
        ResultDetail.findById(
          resultDetail._id,
        ),
      );

    res.json(
      await populated,
    );
  });

/**
 * ---------------------------------------------------------
 * UPDATE EVALUATION STATUS
 * ---------------------------------------------------------
 *
 * Status-only operation.
 *
 * evaluatedBy/evaluatedAt remain server controlled.
 * ---------------------------------------------------------
 */

const updateResultDetailStatus =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    const resultDetailId =
      validateObjectId(
        req.params.id,
        "result detail ID",
      );

    const resultDetail =
      await ResultDetail.findById(
        resultDetailId,
      );

    if (!resultDetail) {
      throwError(
        "Result detail not found",
        404,
      );
    }

    const result =
      await getResult(
        resultDetail.result,
        userSchool,
      );

    ensureResultEditable(result);

    const {
      evaluationStatus,
    } = req.body;

    if (!evaluationStatus) {
      throwError(
        "evaluationStatus is required",
      );
    }

    validateEvaluationStatus(
      evaluationStatus,
    );

    let teacher = null;

    if (
      MANUAL_EVALUATION_STATUSES.includes(
        evaluationStatus,
      )
    ) {
      teacher =
        await getAuthenticatedTeacher(
          req,
          userSchool,
        );
    }

    validateEvaluationData({
      evaluationStatus,
      teacher,
    });

    if (
      evaluationStatus ===
        "NOT_ATTEMPTED" &&
      resultDetail.obtainedMarks !== 0
    ) {
      throwError(
        "A not-attempted question must have 0 obtained marks",
      );
    }

    resultDetail.evaluationStatus =
      evaluationStatus;

    if (
      MANUAL_EVALUATION_STATUSES.includes(
        evaluationStatus,
      )
    ) {
      resultDetail.evaluatedBy =
        teacher._id;

      resultDetail.evaluatedAt =
        new Date();
    } else {
      resultDetail.evaluatedBy =
        null;

      resultDetail.evaluatedAt =
        null;
    }

    await resultDetail.save();

    const populated =
      await populateResultDetail(
        ResultDetail.findById(
          resultDetail._id,
        ),
      );

    res.json(
      await populated,
    );
  });

/**
 * ---------------------------------------------------------
 * DELETE
 * ---------------------------------------------------------
 */

const deleteResultDetail =
  asyncHandler(async (req, res) => {
    const userSchool =
      getUserSchool(req);

    const resultDetailId =
      validateObjectId(
        req.params.id,
        "result detail ID",
      );

    const resultDetail =
      await ResultDetail.findById(
        resultDetailId,
      );

    if (!resultDetail) {
      throwError(
        "Result detail not found",
        404,
      );
    }

    const result =
      await getResult(
        resultDetail.result,
        userSchool,
      );

    ensureResultEditable(result);

    await ResultDetail.findByIdAndDelete(
      resultDetailId,
    );

    res.json({
      message:
        "Result detail removed successfully",
    });
  });

export {
  createResultDetail,
  getResultDetails,
  getResultDetailById,
  getResultDetailsByResult,
  getResultDetailByAssessmentQuestion,
  getResultDetailsByStudent,
  getResultDetailsByQuestion,
  getResultDetailsBySubject,
  getMyResultDetailEvaluations,
  getPendingResultDetails,
  updateResultDetail,
  updateResultDetailStatus,
  deleteResultDetail,
};
