import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import AnswerEvaluation from "../models/answerEvaluationModel.js";
import StudentAnswer from "../models/studentAnswerModel.js";
import StudentAttempt from "../models/studentAttemptModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";

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

    const schoolId =
      getUserSchool(req);

    const attempt =
      await StudentAttempt.findById(
        req.params.attemptId,
      );

    if (!attempt) {
      res.status(404);
      throw new Error(
        "Student attempt not found",
      );
    }

    const student =
      await validateStudent(
        attempt.student,
        schoolId,
      );

    const answers =
      await StudentAnswer.find({
        attempt: attempt._id,
      }).select("_id");

    const evaluations =
      await populateAnswerEvaluation(
        AnswerEvaluation.find({
          studentAnswer: {
            $in: answers.map(
              (answer) => answer._id,
            ),
          },
        }).sort({
          createdAt: 1,
        }),
      );

    res.json({
      student,
      attempt,
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

export const updateAnswerEvaluation =
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

    /**
     * Make sure the answer belongs to this school.
     */
    const studentAnswer =
      await validateStudentAnswer(
        evaluation.studentAnswer,
        schoolId,
      );

    validateAnswerForEvaluation(
      studentAnswer,
    );

    /**
     * Make sure the student belongs to this school.
     */
    const student =
      await validateStudent(
        evaluation.student,
        schoolId,
      );

    /**
     * Teacher and student must belong to
     * the same school.
     */
    if (
      String(student.school?._id) !==
      String(teacher.school?._id)
    ) {
      res.status(403);
      throw new Error(
        "Teacher and student must belong to the same school",
      );
    }

    /**
     * ----------------------------------------------------
     * Teacher authorization
     * ----------------------------------------------------
     *
     * Recommended minimum rule:
     * only the teacher who originally evaluated
     * the answer can revise it.
     *
     * If your school later wants another teacher
     * to revise it, this can be changed to a
     * subject/class/permission check.
     */

    if (
      String(evaluation.teacher) !==
      String(teacher._id)
    ) {
      res.status(403);
      throw new Error(
        "Only the evaluating teacher can revise this evaluation",
      );
    }

    /**
     * Maximum marks always comes from the answer/question.
     */
    const maximumMarks =
      getMaximumMarks(studentAnswer);

    const marksAwarded =
      req.body.marksAwarded !== undefined
        ? validateMarksAwarded(
            req.body.marksAwarded,
            maximumMarks,
          )
        : evaluation.marksAwarded;

    /**
     * If the evaluation is being modified,
     * it becomes REVISED.
     *
     * We intentionally don't let the frontend
     * arbitrarily set PENDING here.
     */
    let evaluationStatus =
      evaluation.evaluationStatus;

    if (
      req.body.evaluationStatus !==
      undefined
    ) {
      validateEvaluationStatus(
        req.body.evaluationStatus,
      );

      /**
       * REVIEW_REQUIRED may be explicitly requested.
       *
       * Otherwise a changed evaluation becomes REVISED.
       */
      if (
        req.body.evaluationStatus ===
        "REVIEW_REQUIRED"
      ) {
        evaluationStatus =
          "REVIEW_REQUIRED";
      } else {
        evaluationStatus =
          "REVISED";
      }
    } else {
      evaluationStatus =
        "REVISED";
    }

    evaluation.maximumMarks =
      maximumMarks;

    evaluation.marksAwarded =
      marksAwarded;

    if (
      req.body.feedback !== undefined
    ) {
      evaluation.feedback =
        req.body.feedback?.trim() || undefined;
    }

    evaluation.evaluationStatus =
      evaluationStatus;

    /**
     * A revised evaluation has an evaluation timestamp.
     */
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
