import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";
import Teacher from "../models/teacherModel.js";
import TeacherAssignment from "../models/teacherAssignmentModel.js";
import AnswerEvaluation from "../models/answerEvaluationModel.js";

import StudentParent from "../models/studentParentModel.js";
import StudentAttempt from "../models/studentAttemptModel.js";
import Student from "../models/studentModel.js";
import Parent from "../models/parentModel.js";
import Assessment from "../models/assessmentModel.js";
import Question from "../models/questionModel.js";
import StudentAnswer from "../models/studentAnswerModel.js";
import AssessmentQuestion from "../models/assessmentQuestionModel.js";

const STUDENT_ROLE = "STUDENT";

const ACTIVE_ATTEMPT_STATUSES = [
  "IN_PROGRESS",
  "EVALUATING",
];

const FINAL_ATTEMPT_STATUSES = [
  "SUBMITTED",
  "EVALUATED",
  "ABANDONED",
  "EXPIRED",
];

/*
 * ---------------------------------------------------------
 * BASIC HELPERS
 * ---------------------------------------------------------
 */

const createError = (
  message,
  statusCode = 400,
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};


const validateObjectId = (
  value,
  fieldName,
) => {
  if (
    !value ||
    !mongoose.Types.ObjectId.isValid(value)
  ) {
    throw createError(
      `Invalid ${fieldName}`,
      400,
    );
  }
};


/*
 * School is ALWAYS derived from the
 * authenticated user's middleware context.
 *
 * There is no SUPER_ADMIN bypass here.
 */
const getUserSchool = (req) => {
  if (!req.schoolId) {
    throw createError(
      "User is not associated with a school",
      403,
    );
  }

  return req.schoolId;
};


/*
 * This controller follows a strict student-only
 * attempt-starting model.
 */
const requireStudentUser = (req) => {
  if (
    req.user.role !== STUDENT_ROLE
  ) {
    throw createError(
      "Only students can start or modify their own assessment attempts",
      403,
    );
  }
};


/*
 * ---------------------------------------------------------
 * STUDENT VALIDATION
 * ---------------------------------------------------------
 */

const getStudentFromUser = async (
  req,
) => {
  requireStudentUser(req);

  const schoolId =
    getUserSchool(req);

  const student =
    await Student.findOne({
      user: req.user._id,
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
        "name startDate endDate isCurrent",
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
    throw createError(
      "Student profile not found",
      404,
    );
  }

  if (
    String(student.school?._id) !==
    String(schoolId)
  ) {
    throw createError(
      "Student does not belong to your school",
      403,
    );
  }

  if (!student.isActive) {
    throw createError(
      "Student is inactive",
      400,
    );
  }

  return student;
};


/*
 * ---------------------------------------------------------
 * ASSESSMENT VALIDATION
 * ---------------------------------------------------------
 */

const validateAssessment = async (
  assessmentId,
  schoolId,
) => {
  validateObjectId(
    assessmentId,
    "assessment ID",
  );

  const assessment =
    await Assessment.findById(
      assessmentId,
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
      )
      .populate(
        "subject",
        "name code",
      )
      .populate(
        "questionBlueprint",
      );

  if (!assessment) {
    throw createError(
      "Assessment not found",
      404,
    );
  }

  if (
    String(assessment.school?._id) !==
    String(schoolId)
  ) {
    throw createError(
      "Assessment does not belong to your school",
      403,
    );
  }

  return assessment;
};


/*
 * ---------------------------------------------------------
 * STUDENT ↔ ASSESSMENT ELIGIBILITY
 * ---------------------------------------------------------
 */

const validateStudentForAssessment = (
  student,
  assessment,
) => {
  if (
    String(student.school?._id) !==
    String(assessment.school?._id)
  ) {
    throw createError(
      "Student and assessment must belong to the same school",
      400,
    );
  }

  if (
    assessment.academicYear &&
    String(student.academicYear?._id) !==
      String(assessment.academicYear._id)
  ) {
    throw createError(
      "Student does not belong to the assessment academic year",
      400,
    );
  }

  if (
    assessment.class &&
    String(student.class?._id) !==
      String(assessment.class._id)
  ) {
    throw createError(
      "Student does not belong to the assessment class",
      400,
    );
  }

  if (
    assessment.section &&
    String(student.section?._id) !==
      String(assessment.section._id)
  ) {
    throw createError(
      "Student does not belong to the assessment section",
      400,
    );
  }

  if (
    assessment.stream &&
    String(student.stream?._id) !==
      String(assessment.stream._id)
  ) {
    throw createError(
      "Student does not belong to the assessment stream",
      400,
    );
  }
};


/*
 * ---------------------------------------------------------
 * ASSESSMENT START WINDOW
 * ---------------------------------------------------------
 */

const validateAssessmentWindow = (
  assessment,
) => {
  const now = new Date();

  if (
    assessment.status !==
    "ACTIVE"
  ) {
    throw createError(
      "The assessment is not currently active",
      400,
    );
  }

  if (
    assessment.startDate &&
    now <
      new Date(
        assessment.startDate,
      )
  ) {
    throw createError(
      "The assessment has not started yet",
      400,
    );
  }

  if (
    assessment.endDate &&
    now >
      new Date(
        assessment.endDate,
      )
  ) {
    throw createError(
      "The assessment has already ended",
      400,
    );
  }

  if (
    !assessment.durationMinutes ||
    assessment.durationMinutes <= 0
  ) {
    throw createError(
      "Assessment duration is not configured correctly",
      400,
    );
  }
};


/*
 * ---------------------------------------------------------
 * QUESTION HELPERS
 * ---------------------------------------------------------
 */


const getAssessmentQuestions = async (assessmentId) => {

 
  return AssessmentQuestion.find({
    assessment: assessmentId,
  })
    .sort({ order: 1 })
    .select(
      "_id assessment section question order marks negativeMarks questionGroup choiceGroup"
    )
    .populate({
      path: "question",
      select: "questionText text title content marks",
    });
};



const shuffleArray = (
  items,
) => {
  const array = [...items];

  for (
    let i = array.length - 1;
    i > 0;
    i -= 1
  ) {
    const j =
      Math.floor(
        Math.random() *
          (i + 1),
      );

    [
      array[i],
      array[j],
    ] = [
      array[j],
      array[i],
    ];
  }

  return array;
};


/*
 * Extract option IDs from the Question.
 *
 * This assumes AssessmentQuestion.question references
 * your Question document and that Question.options
 * contains objects with _id.
 *
 * If your actual option schema is different, adjust
 * this helper accordingly.
 */
const getQuestionOptionIds = (
  question,
) => {
  const options =
    question.question?.options;

  if (
    !Array.isArray(options)
  ) {
    return [];
  }

  return options
    .map(
      (option) =>
        option?._id,
    )
    .filter(Boolean);
};


/*
 * Create the complete question/option order
 * for this particular attempt.
 */
const createQuestionOrder =
  async (
    assessment,
  ) => {
    let questions =
      await getAssessmentQuestions(
        assessment._id,
      );

    if (
      questions.length === 0
    ) {
      throw createError(
        "No questions have been assigned to this assessment",
        400,
      );
    }

    /*
     * Ensure the assessment configuration and
     * actual assigned questions agree.
     */
    if (
      assessment.totalQuestions !==
        undefined &&
      assessment.totalQuestions !==
        questions.length
    ) {
      throw createError(
        `Assessment question count is inconsistent. Expected ${assessment.totalQuestions}, found ${questions.length}`,
        400,
      );
    }

    if (
      assessment.randomizeQuestions
    ) {
      questions =
        shuffleArray(
          questions,
        );
    }

    return questions.map(
      (
        item,
        index,
      ) => {
        /*
         * We need the actual Question document
         * to generate optionOrder.
         *
         * The AssessmentQuestion query above only
         * contains the "question" ObjectId.
         */
        return {
          question:
            item._id,
          order:
            index + 1,
          optionOrder: [],
        };
      },
    );
  };


/*
 * Create question order including randomized
 * option order.
 *
 * This version loads the referenced questions
 * so option IDs can be persisted.
 */
const createAttemptQuestionOrder =
  async (
    assessment,
  ) => {
    let questions =
      await AssessmentQuestion.find({
        assessment:
          assessment._id,
      })
        .sort({
          order: 1,
        })
        .populate({
          path: "question",
          select:
            "options",
        })
        .select(
          "_id assessment section question order",
        );

    if (
      questions.length === 0
    ) {
      throw createError(
        "No questions have been assigned to this assessment",
        400,
      );
    }

    if (
      assessment.totalQuestions !==
        undefined &&
      assessment.totalQuestions !==
        questions.length
    ) {
      throw createError(
        `Assessment question count is inconsistent. Expected ${assessment.totalQuestions}, found ${questions.length}`,
        400,
      );
    }

    if (
      assessment.randomizeQuestions
    ) {
      questions =
        shuffleArray(
          questions,
        );
    }

    return questions.map(
      (
        item,
        index,
      ) => {
        let optionOrder =
          getQuestionOptionIds(
            item,
          );

        if (
          assessment.randomizeOptions
        ) {
          optionOrder =
            shuffleArray(
              optionOrder,
            );
        }

        return {
          question:
            item._id,
          order:
            index + 1,
          optionOrder,
        };
      },
    );
  };


/*
 * ---------------------------------------------------------
 * ATTEMPT POPULATION
 * ---------------------------------------------------------
 */

const populateStudentAttempt = (
  query,
) => {
  return query
    .populate({
      path: "assessment",
      select:
        "school academicYear class section stream subject title assessmentType durationMinutes totalQuestions totalMarks randomizeQuestions randomizeOptions maxAttempts startDate endDate status",
      populate: [
        {
          path: "school",
          select: "name code",
        },
        {
          path: "academicYear",
          select:
            "name startDate endDate",
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
          path: "subject",
          select:
            "name code",
        },
      ],
    })
    .populate({
      path: "student",
      select:
        "user school admissionNumber academicYear class section stream subjectCombination isActive",
      populate: [
        {
          path: "user",
          select:
            "name email phone role",
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
  path: "questionOrder.question",
  select: "question marks negativeMarks section order",
  populate: [
    {
      path: "section",
      select:
        "sectionCode title questionType marksPerQuestion numberOfQuestions totalMarks",
    },
    {
      path: "question",
      select:
        "questionText text title content options difficulty questionType answerMode marks answerEditorConfiguration",
      populate: [
        {
          path: "answerEditorConfiguration",
          select:
            "subject name code answerMode configuration isActive",
        },
      ],
    },
  ],
});
};


/*
 * ---------------------------------------------------------
 * ACCESS CONTROL
 * ---------------------------------------------------------
 */

const validateAttemptAccess = (
  attempt,
  req,
) => {
  const schoolId =
    getUserSchool(req);

  const assessmentSchool =
    attempt.assessment?.school?._id ||
    attempt.assessment?.school;

  if (
    String(assessmentSchool) !==
    String(schoolId)
  ) {
    throw createError(
      "You are not authorized to access this attempt",
      403,
    );
  }
};


const validateStudentAttemptOwner = (
  attempt,
  req,
) => {
  requireStudentUser(req);

  const studentUserId =
    attempt.student?.user?._id ||
    attempt.student?.user;

  if (
    String(studentUserId) !==
    String(req.user._id)
  ) {
    throw createError(
      "You are not authorized to access this attempt",
      403,
    );
  }
};


/*
 * ---------------------------------------------------------
 * ATTEMPT LIMITS
 * ---------------------------------------------------------
 */

const getNextAttemptNumber =
  async (
    assessmentId,
    studentId,
  ) => {
    const lastAttempt =
      await StudentAttempt.findOne({
        assessment:
          assessmentId,
        student:
          studentId,
      })
        .sort({
          attemptNumber:
            -1,
        })
        .select(
          "attemptNumber",
        );

    return lastAttempt
      ? lastAttempt.attemptNumber +
          1
      : 1;
  };


const validateMaxAttempts =
  async (
    assessment,
    studentId,
  ) => {
    if (
      !assessment.maxAttempts
    ) {
      return;
    }

    const attemptCount =
      await StudentAttempt.countDocuments(
        {
          assessment:
            assessment._id,
          student:
            studentId,
          status: {
            $in:
              FINAL_ATTEMPT_STATUSES,
          },
        },
      );

    if (
      attemptCount >=
      assessment.maxAttempts
    ) {
      throw createError(
        `Maximum attempt limit of ${assessment.maxAttempts} has been reached`,
        400,
      );
    }
  };


const findActiveAttempt =
  async (
    assessmentId,
    studentId,
  ) => {
    return StudentAttempt.findOne(
      {
        assessment:
          assessmentId,
        student:
          studentId,
        status: {
          $in:
            ACTIVE_ATTEMPT_STATUSES,
        },
      },
    ).select(
      "_id status attemptNumber",
    );
  };


const validateNoActiveAttempt =
  async (
    assessmentId,
    studentId,
  ) => {
    const activeAttempt =
      await findActiveAttempt(
        assessmentId,
        studentId,
      );

    if (activeAttempt) {
      const error =
        createError(
          "The student already has an active attempt for this assessment",
          400,
        );

      error.attemptId =
        activeAttempt._id;

      throw error;
    }
  };


/*
 * ---------------------------------------------------------
 * ATTEMPT TIME
 * ---------------------------------------------------------
 */

const getAttemptDeadline = (
  attempt,
) => {
  const durationDeadline =
    new Date(
      attempt.startedAt.getTime() +
        attempt.durationMinutes *
          60 *
          1000,
    );

  let deadline =
    durationDeadline;

  const assessmentEndDate =
    attempt.assessment?.endDate;

  if (
    assessmentEndDate
  ) {
    const assessmentDeadline =
      new Date(
        assessmentEndDate,
      );

    if (
      assessmentDeadline <
      deadline
    ) {
      deadline =
        assessmentDeadline;
    }
  }

  return deadline;
};


const isAttemptExpired = (
  attempt,
  now = new Date(),
) => {
  const deadline =
    getAttemptDeadline(
      attempt,
    );

  return now > deadline;
};


const expireAttemptIfNeeded = async (
  attempt,
  now = new Date(),
) => {
  if (
    !ACTIVE_ATTEMPT_STATUSES.includes(
      attempt.status,
    )
  ) {
    return false;
  }

  if (
    !isAttemptExpired(
      attempt,
      now,
    )
  ) {
    return false;
  }

  attempt.status =
    "EXPIRED";

  attempt.lastActivityAt =
    now;

  await attempt.save();

  return true;
};


/*
 * ---------------------------------------------------------
 * INPUT VALIDATION
 * ---------------------------------------------------------
 */

const parseTimeSpent = (
  value,
  attempt,
) => {
  if (
    value === undefined
  ) {
    return undefined;
  }

  const timeSpent =
    Number(value);

  const maximumSeconds =
    attempt.durationMinutes *
    60;

  if (
    !Number.isFinite(
      timeSpent,
    ) ||
    timeSpent < 0 ||
    timeSpent >
      maximumSeconds
  ) {
    throw createError(
      `Invalid timeSpent. Maximum allowed is ${maximumSeconds} seconds`,
      400,
    );
  }

  return timeSpent;
};


const parseAttemptedQuestions = (
  value,
  attempt,
) => {
  if (
    value === undefined
  ) {
    return undefined;
  }

  const attemptedQuestions =
    Number(value);

  if (
    !Number.isInteger(
      attemptedQuestions,
    ) ||
    attemptedQuestions < 0 ||
    attemptedQuestions >
      attempt.totalQuestions
  ) {
    throw createError(
      "Invalid attemptedQuestions",
      400,
    );
  }

  return attemptedQuestions;
};

const requireParentUser = (req) => {
  if (!req.user) {
    const error = new Error("Not authorized");
    error.statusCode = 401;
    throw error;
  }

  if (req.user.role !== "PARENT") {
    const error = new Error(
      "Access restricted to parents."
    );

    error.statusCode = 403;
    throw error;
  }

  return req.user;
};

const getParentFromUser = async (req) => {
  const schoolId = getUserSchool(req);

  const parent = await Parent.findOne({
    user: req.user._id,
    school: schoolId,
  });

  if (!parent) {
    const error = new Error(
      "Parent profile not found for this user."
    );

    error.statusCode = 404;
    throw error;
  }

  return parent;
};

/*
 * ---------------------------------------------------------
 * START STUDENT ATTEMPT
 * ---------------------------------------------------------
 *
 * Request:
 *
 * {
 *   "assessmentId": "..."
 * }
 *
 * No studentId.
 * No schoolId.
 *
 * Both are derived from authentication.
 */





export const startStudentAttempt =
  asyncHandler(async (req, res) => {
    requireStudentUser(req);

    const schoolId = getUserSchool(req);
    const { assessmentId } = req.body;

    validateObjectId(assessmentId, "assessment ID");

    const student = await getStudentFromUser(req);

    const assessment = await validateAssessment(
      assessmentId,
      schoolId,
    );

    validateAssessmentWindow(assessment);
    validateStudentForAssessment(student, assessment);

    const activeAttempt = await findActiveAttempt(
      assessment._id,
      student._id,
    );

    if (activeAttempt) {
      if (activeAttempt.status !== "IN_PROGRESS") {
        const conflictError = createError(
          "The student already has an active attempt for this assessment",
          409,
        );

        conflictError.attemptId = activeAttempt._id;
        throw conflictError;
      }

      // Delete answers belonging to the previous attempt.
      await StudentAnswer.deleteMany({
        attempt: activeAttempt._id,
      });

      // Delete the previous in-progress attempt.
      const deletion = await StudentAttempt.deleteOne({
        _id: activeAttempt._id,
        student: student._id,
        assessment: assessment._id,
        status: "IN_PROGRESS",
      });

      if (deletion.deletedCount !== 1) {
        throw createError(
          "The previous attempt could not be deleted. Please try again.",
          409,
        );
      }
    }

    await validateMaxAttempts(assessment, student._id);

    const questionOrder =
      await createAttemptQuestionOrder(assessment);

    if (!Array.isArray(questionOrder)) {
      throw createError(
        "Unable to create the attempt: invalid question order",
        500,
      );
    }

    const attemptNumber = await getNextAttemptNumber(
      assessment._id,
      student._id,
    );

    const now = new Date();

    try {
      const attempt = await StudentAttempt.create({
        assessment: assessment._id,
        student: student._id,
        attemptNumber,
        startedAt: now,
        activeSessionStartedAt: now,
        lastActivityAt: now,
        durationMinutes: assessment.durationMinutes,
        status: "IN_PROGRESS",
        questionOrder,
        totalQuestions: questionOrder.length,
        attemptedQuestions: 0,
        totalMarks: assessment.totalMarks,
        obtainedMarks: 0,
        timeSpent: 0,
      });

      const result = await populateStudentAttempt(
        StudentAttempt.findById(attempt._id),
      );

      return res.status(201).json({
        message:
          activeAttempt
            ? "Your previous attempt was deleted. A new assessment attempt has started."
            : "Your assessment attempt has started.",
        attempt: await result,
      });
    } catch (error) {
      if (error?.code === 11000) {
        throw createError(
          "Another attempt was created concurrently. Please refresh and try again.",
          409,
        );
      }

      throw error;
    }
  });







/*
 * ---------------------------------------------------------
 * GET ALL ATTEMPTS
 * ---------------------------------------------------------
 *
 * Student:
 *   Always receives only their own attempts.
 *
 * Staff:
 *   Can filter by assessmentId/studentId.
 */
export const getStudentAttempts =
  asyncHandler(
    async (req, res) => {
      const schoolId =
        getUserSchool(req);

      const filter = {};

      if (
        req.user.role ===
        STUDENT_ROLE
      ) {
        const student =
          await getStudentFromUser(
            req,
          );

        filter.student =
          student._id;
      } else {
        /*
         * Staff users are still restricted
         * to their own school.
         */
        const assessments =
          await Assessment.find({
            school:
              schoolId,
          }).select("_id");

        filter.assessment = {
          $in:
            assessments.map(
              (item) =>
                item._id,
            ),
        };

        if (
          req.query.assessmentId
        ) {
          const assessment =
            await validateAssessment(
              req.query
                .assessmentId,
              schoolId,
            );

          filter.assessment =
            assessment._id;
        }

        if (
          req.query.studentId
        ) {
          validateObjectId(
            req.query.studentId,
            "student ID",
          );

          const student =
            await Student.findOne({
              _id:
                req.query.studentId,
              school:
                schoolId,
              isActive: true,
            }).select("_id");

          if (!student) {
            throw createError(
              "Student not found or does not belong to your school",
              404,
            );
          }

          filter.student =
            student._id;
        }
      }

      if (
        req.query.status
      ) {
        filter.status =
          req.query.status;
      }

      const attempts =
        await populateStudentAttempt(
          StudentAttempt.find(
            filter,
          ).sort({
            createdAt: -1,
          }),
        );

      res.json(
        await attempts,
      );
    },
  );

  
export const getTeacherStudentAttempts = asyncHandler(
  async (req, res) => {
    const schoolId = getUserSchool(req);
    const { studentId } = req.params;

    // 1. Validate teacher access
    if (req.user.role !== "TEACHER") {
      res.status(403);
      throw new Error("Only teachers can access this resource.");
    }

    if (!schoolId) {
      res.status(403);
      throw new Error("Teacher does not belong to a school.");
    }

    validateObjectId(studentId, "Student ID");

    // 2. Find active student belonging to the teacher's school
    const student = await Student.findOne({
      _id: studentId,
      school: schoolId,
      isActive: true,
    }).select("_id academicYear class section");

    if (!student) {
      res.status(404);
      throw new Error("Student not found.");
    }

    // 3. Find teacher profile
    const teacher = await Teacher.findOne({
      user: req.user._id,
      school: schoolId,
      isActive: true,
    }).select("_id");

    if (!teacher) {
      res.status(404);
      throw new Error("Teacher profile not found.");
    }

    // 4. Find all active assignments for this
    // student's academic year, class and section.
    const assignments = await TeacherAssignment.find({
      school: schoolId,
      teacher: teacher._id,
      academicYear: student.academicYear,
      class: student.class,
      section: student.section,
      assignmentType: {
        $in: ["CLASS_TEACHER", "SUBJECT_TEACHER"],
      },
      isActive: true,
    }).select("assignmentType subject");

    if (!assignments.length) {
      res.status(403);
      throw new Error(
        "You are not authorized to view this student's assessment attempts."
      );
    }

    // 5. CLASS_TEACHER takes precedence over SUBJECT_TEACHER.
    const isClassTeacher = assignments.some(
      (assignment) =>
        assignment.assignmentType === "CLASS_TEACHER"
    );

    let subjectIds = [];

    if (!isClassTeacher) {
      // SUBJECT_TEACHER: collect all assigned subjects.
      subjectIds = [
        ...new Set(
          assignments
            .filter(
              (assignment) =>
                assignment.assignmentType === "SUBJECT_TEACHER"
            )
            .map((assignment) => assignment.subject?.toString())
            .filter(Boolean)
        ),
      ];

      if (!subjectIds.length) {
        res.status(403);
        throw new Error(
          "No subjects are assigned to this teacher for the student."
        );
      }
    }

    // 6. Retrieve assessments belonging to the school.
    // Subject teachers can access only their assigned subjects.
    const assessmentFilter = {
      school: schoolId,
    };

    if (!isClassTeacher) {
      assessmentFilter.subject = {
        $in: subjectIds,
      };
    }

    const assessments = await Assessment.find(
      assessmentFilter
    ).select("_id");

    const assessmentIds = assessments.map(
      (assessment) => assessment._id
    );

    // 7. Retrieve student attempts.
    const filter = {
      student: student._id,
      assessment: {
        $in: assessmentIds,
      },
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const attempts = await populateStudentAttempt(
      StudentAttempt.find(filter).sort({
        createdAt: -1,
      })
    );

    res.json(attempts);
  }
);


/*
 * ---------------------------------------------------------
 * GET SINGLE ATTEMPT
 * ---------------------------------------------------------
 */

export const getStudentAttemptById = asyncHandler(
  async (req, res) => {
    validateObjectId(req.params.id, "attempt ID");

    const attempt = await populateStudentAttempt(
      StudentAttempt.findById(req.params.id)
    );

    if (!attempt) {
      throw createError("Student attempt not found", 404);
    }

    validateAttemptAccess(attempt, req);

    /*
     * STUDENT ACCESS VALIDATION
     */
    if (req.user.role === STUDENT_ROLE) {
      validateStudentAttemptOwner(attempt, req);
    }

    /*
     * FETCH TEACHER EVALUATIONS
     *
     * Only for EVALUATED attempts.
     */
    if (attempt.status === "EVALUATED") {

      /*
       * STEP 1: FETCH STUDENT ANSWERS
       */
      const studentAnswers = await StudentAnswer.find({
        attempt: attempt._id,
      })
        .populate("question")
        .populate("assessmentQuestion")
        .lean();

      /*
       * STEP 2: FETCH ANSWER EVALUATIONS
       */
      const studentAnswerIds = studentAnswers.map(
        (answer) => answer._id
      );

      const evaluations = await AnswerEvaluation.find({
        studentAnswer: {
          $in: studentAnswerIds,
        },
      })
        .populate("teacher")
        .populate("updatedBy")
        .sort({
          evaluatedAt: -1,
          updatedAt: -1,
        })
        .lean();

      /*
       * STEP 3: CREATE EVALUATION LOOKUP
       *
       * Latest evaluation per student answer.
       */
      const evaluationMap = new Map();

      evaluations.forEach((evaluation) => {
        const answerId =
          evaluation.studentAnswer?.toString();

        if (
          answerId &&
          !evaluationMap.has(answerId)
        ) {
          evaluationMap.set(answerId, evaluation);
        }
      });

      /*
       * STEP 4: COMBINE STUDENT ANSWERS
       * WITH TEACHER EVALUATIONS
       */
      const evaluatedAnswers = studentAnswers.map(
        (answer) => {
          const evaluation = evaluationMap.get(
            answer._id.toString()
          );

          return {
            ...answer,

            evaluation: evaluation
              ? {
                  _id: evaluation._id,

                  maximumMarks:
                    evaluation.maximumMarks,

                  marksAwarded:
                    evaluation.marksAwarded,

                  feedback:
                    evaluation.feedback,

                  evaluationStatus:
                    evaluation.evaluationStatus,

                  evaluatedAt:
                    evaluation.evaluatedAt,

                  teacher:
                    evaluation.teacher,

                  updatedBy:
                    evaluation.updatedBy,
                }
              : null,
          };
        }
      );

      /*
       * STEP 5: ATTACH TO ATTEMPT
       */
      const response = attempt.toObject();

response.evaluatedAnswers = evaluatedAnswers;

return res.json(response);
    }

    
  }
);



/*
 * ---------------------------------------------------------
 * GET ATTEMPTS BY ASSESSMENT
 * ---------------------------------------------------------
 */
export const getAttemptsByAssessment =
  asyncHandler(
    async (req, res) => {
      validateObjectId(
        req.params.assessmentId,
        "assessment ID",
      );

      const schoolId =
        getUserSchool(req);

      const assessment =
        await validateAssessment(
          req.params.assessmentId,
          schoolId,
        );

      const filter = {
        assessment:
          assessment._id,
      };

      if (
        req.user.role ===
        STUDENT_ROLE
      ) {
        const student =
          await getStudentFromUser(
            req,
          );

        filter.student =
          student._id;
      } else if (
        req.query.studentId
      ) {
        validateObjectId(
          req.query.studentId,
          "student ID",
        );

        const student =
          await Student.findOne({
            _id:
              req.query.studentId,
            school:
              schoolId,
            isActive: true,
          }).select("_id");

        if (!student) {
          throw createError(
            "Student not found or does not belong to your school",
            404,
          );
        }

        filter.student =
          student._id;
      }

      if (
        req.query.status
      ) {
        filter.status =
          req.query.status;
      }

      const attempts =
        await populateStudentAttempt(
          StudentAttempt.find(
            filter,
          ).sort({
            attemptNumber: 1,
          }),
        );

      res.json(
        await attempts,
      );
    },
  );


/*
 * ---------------------------------------------------------
 * GET ATTEMPTS BY STUDENT
 * ---------------------------------------------------------
 */
export const getAttemptsByStudent =
  asyncHandler(
    async (req, res) => {
      validateObjectId(
        req.params.studentId,
        "student ID",
      );

      const schoolId =
        getUserSchool(req);

      const student =
        await Student.findOne({
          _id:
            req.params.studentId,
          school:
            schoolId,
          isActive: true,
        })
          .populate(
            "user",
            "_id name email role",
          );

      if (!student) {
        throw createError(
          "Student not found or does not belong to your school",
          404,
        );
      }

      /*
       * Students can only access their
       * own attempts.
       */
      if (
        req.user.role ===
        STUDENT_ROLE &&
        String(
          student.user?._id,
        ) !==
          String(
            req.user._id,
          )
      ) {
        throw createError(
          "You are not authorized to access these attempts",
          403,
        );
      }

      const filter = {
        student:
          student._id,
      };

      if (
        req.query.assessmentId
      ) {
        const assessment =
          await validateAssessment(
            req.query
              .assessmentId,
            schoolId,
          );

        filter.assessment =
          assessment._id;
      }

      if (
        req.query.status
      ) {
        filter.status =
          req.query.status;
      }

      const attempts =
        await populateStudentAttempt(
          StudentAttempt.find(
            filter,
          ).sort({
            createdAt: -1,
          }),
        );

      res.json(
        await attempts,
      );
    },
  );


/*
 * ---------------------------------------------------------
 * GET MY ATTEMPTS
 * ---------------------------------------------------------
 */
export const getMyStudentAttempts =
  asyncHandler(
    async (req, res) => {
      requireStudentUser(req);

      const student =
        await getStudentFromUser(
          req,
        );

      const schoolId =
        getUserSchool(req);

      const filter = {
        student:
          student._id,
      };

      if (
        req.query.assessmentId
      ) {
        const assessment =
          await validateAssessment(
            req.query
              .assessmentId,
            schoolId,
          );

        filter.assessment =
          assessment._id;
      }

      if (
        req.query.status
      ) {
        filter.status =
          req.query.status;
      }

      const attempts =
        await populateStudentAttempt(
          StudentAttempt.find(
            filter,
          ).sort({
            createdAt: -1,
          }),
        );

      res.json(
        await attempts,
      );
    },
  );


export const getMyChildrenAttempts =
  asyncHandler(async (req, res) => {
    requireParentUser(req);

    const parent =
      await getParentFromUser(req);

    const schoolId =
      getUserSchool(req);

    // Get all active children linked to this parent
    const studentParentRecords =
      await StudentParent.find({
        parent: parent._id,
        isActive: true,
      }).select("student");

    const studentIds =
      studentParentRecords.map(
        (record) => record.student
      );

    // No children linked to this parent
    if (!studentIds.length) {
      return res.json([]);
    }

    // Only allow attempts belonging to linked children
    const filter = {
      student: {
        $in: studentIds,
      },
    };

    // Optional child filter
    if (req.query.studentId) {
      const isLinkedChild =
        studentIds.some(
          (id) =>
            id.toString() ===
            req.query.studentId
        );

      if (!isLinkedChild) {
        return res.status(403).json({
          message:
            "You are not authorized to access this student's attempts.",
        });
      }

      filter.student =
        req.query.studentId;
    }

    // Optional assessment filter
    if (req.query.assessmentId) {
      const assessment =
        await validateAssessment(
          req.query.assessmentId,
          schoolId
        );

      filter.assessment =
        assessment._id;
    }

    // Optional status filter
    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    const attempts =
      await populateStudentAttempt(
        StudentAttempt.find(filter)
          .sort({
            createdAt: -1,
          })
      );

    res.json(attempts);
  });



/*
 * ---------------------------------------------------------
 * UPDATE STUDENT ACTIVITY
 * ---------------------------------------------------------
 *
 * Only the student can call this.
 *
 * Allowed status:
 *   IN_PROGRESS
 *
 * NOT_STARTED is no longer supported.
 */
export const updateStudentAttemptActivity =
  asyncHandler(
    async (req, res) => {
      requireStudentUser(req);

      validateObjectId(
        req.params.id,
        "attempt ID",
      );

      const attempt =
        await StudentAttempt.findById(
          req.params.id,
        )
          .populate(
            "assessment",
          )
          .populate({
            path: "student",
            populate: {
              path: "user",
              select:
                "name email phone role",
            },
          });

      if (!attempt) {
        throw createError(
          "Student attempt not found",
          404,
        );
      }

      validateAttemptAccess(
        attempt,
        req,
      );

      validateStudentAttemptOwner(
        attempt,
        req,
      );

      if (
        attempt.status !==
        "IN_PROGRESS"
      ) {
        throw createError(
          "Activity can only be updated for an in-progress attempt",
          400,
        );
      }

      const now =
        new Date();

      /*
       * Enforce both:
       *
       * 1. assessment.endDate
       * 2. startedAt + durationMinutes
       */
      if (
        isAttemptExpired(
          attempt,
          now,
        )
      ) {
        attempt.status =
          "EXPIRED";

        attempt.lastActivityAt =
          now;

        await attempt.save();

        throw createError(
          "The assessment attempt time has expired",
          400,
        );
      }

      const timeSpent =
        parseTimeSpent(
          req.body.timeSpent,
          attempt,
        );

      if (
        timeSpent !==
        undefined
      ) {
        attempt.timeSpent =
          timeSpent;
      }

      const attemptedQuestions =
        parseAttemptedQuestions(
          req.body
            .attemptedQuestions,
          attempt,
        );

      if (
        attemptedQuestions !==
        undefined
      ) {
        attempt.attemptedQuestions =
          attemptedQuestions;
      }

      attempt.lastActivityAt =
        now;

      const updatedAttempt =
        await attempt.save();

      const result =
        await populateStudentAttempt(
          StudentAttempt.findById(
            updatedAttempt._id,
          ),
        );

      res.json(
        await result,
      );
    },
  );


/*
 * ---------------------------------------------------------
 * SUBMIT STUDENT ATTEMPT
 * ---------------------------------------------------------
 *
 * Only the student can submit.
 */




export const submitStudentAttempt = asyncHandler(
  async (req, res) => {
    requireStudentUser(req);

   

    validateObjectId(req.params.id, "attempt ID");

    const session = await mongoose.startSession();

    try {
      let responseAttemptId;

      await session.withTransaction(async () => {
        console.log("[1] Loading attempt...");

        const attempt = await StudentAttempt.findById(
          req.params.id
        )
          .session(session)
          .populate("assessment")
          .populate({
            path: "student",
            populate: {
              path: "user",
              select: "name email phone role",
            },
          });

        if (!attempt) {
          throw createError("Student attempt not found", 404);
        }

        console.log("[1] Attempt found:", {
          id: attempt._id.toString(),
          status: attempt.status,
          assessment:
            attempt.assessment?._id?.toString() ||
            attempt.assessment?.toString(),
          student:
            attempt.student?._id?.toString() ||
            attempt.student?.toString(),
          school: attempt.school?.toString() || null,
        });

        validateAttemptAccess(attempt, req);
        validateStudentAttemptOwner(attempt, req);

        if (attempt.status !== "IN_PROGRESS") {
          throw createError(
            "Only an in-progress attempt can be submitted",
            400
          );
        }

        const now = new Date();

        if (isAttemptExpired(attempt, now)) {
          attempt.status = "EXPIRED";
          attempt.lastActivityAt = now;

          await attempt.save({ session });

          throw createError(
            "The assessment attempt time has expired",
            400
          );
        }

        const timeSpent = parseTimeSpent(
          req.body.timeSpent,
          attempt
        );

        if (timeSpent !== undefined) {
          attempt.timeSpent = timeSpent;
        }

        const attemptedQuestions = parseAttemptedQuestions(
          req.body.attemptedQuestions,
          attempt
        );

        if (attemptedQuestions !== undefined) {
          attempt.attemptedQuestions = attemptedQuestions;
        }

        const submittedAnswers = req.body.answers;

        if (!Array.isArray(submittedAnswers)) {
          throw createError(
            "Answers must be provided as an array",
            400
          );
        }

        /*
         * STEP 1: Extract AssessmentQuestion IDs from questionOrder.
         *
         * attempt.questionOrder[].question references
         * AssessmentQuestion._id, not Question._id.
         */

        const allowedAssessmentQuestionIds = new Set();

        for (const item of attempt.questionOrder || []) {
          const value = item?.question;

          const assessmentQuestionId =
            value && typeof value === "object"
              ? (value._id || value.id)?.toString()
              : value?.toString();

          if (
            assessmentQuestionId &&
            mongoose.isValidObjectId(assessmentQuestionId)
          ) {
            allowedAssessmentQuestionIds.add(
              assessmentQuestionId
            );
          }
        }

        console.log(
          "[2] Attempt questionOrder:",
          JSON.stringify(
            (attempt.questionOrder || []).map((item) => ({
              assessmentQuestion:
                item.question?._id?.toString?.() ||
                item.question?.toString?.(),
              order: item.order,
            })),
            null,
            2
          )
        );

        console.log(
          "[2] Allowed AssessmentQuestion IDs:",
          [...allowedAssessmentQuestionIds]
        );

        if (allowedAssessmentQuestionIds.size === 0) {
          throw createError(
            "No valid assessment questions were found in this attempt",
            400
          );
        }

        /*
         * STEP 2: Validate submitted answers.
         *
         * item.question contains AssessmentQuestion._id.
         */

        const seenAssessmentQuestionIds = new Set();

        const normalizedAnswers = submittedAnswers.map((item) => {
          if (
            !item ||
            typeof item !== "object" ||
            Array.isArray(item)
          ) {
            throw createError("Invalid answer entry", 400);
          }

          const assessmentQuestionId = String(
            item.question ?? ""
          );

          if (
            !mongoose.isValidObjectId(assessmentQuestionId)
          ) {
            throw createError(
              `Invalid assessment question ID: ${assessmentQuestionId}`,
              400
            );
          }

          if (
            !allowedAssessmentQuestionIds.has(
              assessmentQuestionId
            )
          ) {
            throw createError(
              `AssessmentQuestion ${assessmentQuestionId} does not belong to this attempt`,
              400
            );
          }

          if (
            seenAssessmentQuestionIds.has(
              assessmentQuestionId
            )
          ) {
            throw createError(
              `Duplicate answer for assessment question ${assessmentQuestionId}`,
              400
            );
          }

          if (typeof item.answer !== "string") {
            throw createError(
              `Answer for ${assessmentQuestionId} must be a string`,
              400
            );
          }

          seenAssessmentQuestionIds.add(
            assessmentQuestionId
          );

          return {
            assessmentQuestionId:
              new mongoose.Types.ObjectId(
                assessmentQuestionId
              ),
            answer: item.answer,
          };
        });

        console.log(
          "[3] Validated answers:",
          normalizedAnswers.map((item) => ({
            assessmentQuestionId:
              item.assessmentQuestionId.toString(),
            answerLength: item.answer.length,
            answerPreview: item.answer.slice(0, 100),
          }))
        );

        /*
         * STEP 3: Resolve student and assessment IDs.
         */

        const studentId =
          attempt.student?._id || attempt.student;

        const assessmentId =
          attempt.assessment?._id || attempt.assessment;

        if (
          !studentId ||
          !mongoose.isValidObjectId(studentId.toString())
        ) {
          throw createError(
            "Student reference is missing or invalid",
            400
          );
        }

        if (
          !assessmentId ||
          !mongoose.isValidObjectId(assessmentId.toString())
        ) {
          throw createError(
            "Assessment reference is missing or invalid",
            400
          );
        }

        console.log("[4] Resolved IDs:", {
          attemptId: attempt._id.toString(),
          assessmentId: assessmentId.toString(),
          studentId: studentId.toString(),
          database: mongoose.connection.name,
        });

        /*
         * STEP 4: Find AssessmentQuestion records by their _id.
         *
         * IMPORTANT:
         * Do not search AssessmentQuestion.question using
         * AssessmentQuestion._id values.
         */

        const assessmentQuestionIds = [
          ...allowedAssessmentQuestionIds,
        ].map(
          (id) => new mongoose.Types.ObjectId(id)
        );

        const schoolId =
          attempt.school?._id ||
          attempt.school ||
          attempt.assessment?.school?._id ||
          attempt.assessment?.school;

        const lookupFilter = {
          _id: {
            $in: assessmentQuestionIds,
          },
          assessment: assessmentId,
        };

        if (schoolId) {
          lookupFilter.school = schoolId;
        }

        console.log(
          "[5] AssessmentQuestion lookup filter:",
          JSON.stringify(lookupFilter, null, 2)
        );

        const assessmentQuestions =
          await AssessmentQuestion.find(lookupFilter)
            .session(session)
            .lean();

        console.log(
          "[5] Matching AssessmentQuestion count:",
          assessmentQuestions.length
        );

        console.log(
          "[5] Matching AssessmentQuestion records:",
          JSON.stringify(
            assessmentQuestions.map((item) => ({
              _id: item._id.toString(),
              assessment: item.assessment.toString(),
              question: item.question.toString(),
              school: item.school?.toString() || null,
              section: item.section?.toString() || null,
            })),
            null,
            2
          )
        );

        /*
         * STEP 5: Verify that every assessment question was found.
         */

        if (
          assessmentQuestions.length !==
          assessmentQuestionIds.length
        ) {
          const foundIds = new Set(
            assessmentQuestions.map(
              (item) => item._id.toString()
            )
          );

          const missingIds = [
            ...allowedAssessmentQuestionIds,
          ].filter((id) => !foundIds.has(id));

          const diagnosticRecords =
            await AssessmentQuestion.find({
              _id: {
                $in: missingIds.map(
                  (id) => new mongoose.Types.ObjectId(id)
                ),
              },
            })
              .select(
                "_id school assessment section question"
              )
              .session(session)
              .lean();

          console.error(
            "[DEBUG] AssessmentQuestion lookup mismatch:",
            {
              requestedAssessment: assessmentId.toString(),
              requestedSchool:
                schoolId?.toString?.() || null,
              requestedCount: assessmentQuestionIds.length,
              foundCount: assessmentQuestions.length,
              missingIds,
              diagnosticRecords: diagnosticRecords.map(
                (item) => ({
                  _id: item._id.toString(),
                  assessment:
                    item.assessment?.toString() || null,
                  question:
                    item.question?.toString() || null,
                  school: item.school?.toString() || null,
                  section: item.section?.toString() || null,
                })
              ),
            }
          );

          throw createError(
            `Could not find all AssessmentQuestion records for this attempt. Missing IDs: ${missingIds.join(", ")}`,
            400
          );
        }

        /*
         * STEP 6: Build AssessmentQuestion ID map.
         */

        const assessmentQuestionMap = new Map();

        for (const item of assessmentQuestions) {
          assessmentQuestionMap.set(
            item._id.toString(),
            item
          );
        }

        /*
         * STEP 7: Extract the underlying Question IDs.
         *
         * AssessmentQuestion._id and Question._id are different.
         */

        const underlyingQuestionIds = [
          ...new Set(
            assessmentQuestions.map(
              (item) => item.question.toString()
            )
          ),
        ].map(
          (id) => new mongoose.Types.ObjectId(id)
        );

        const questions = await Question.find({
          _id: {
            $in: underlyingQuestionIds,
          },
        })
          .select("_id answerEditorConfiguration")
          .session(session)
          .lean();

        const questionDataMap = new Map(
          questions.map((item) => [
            item._id.toString(),
            item,
          ])
        );

        const missingQuestionIds = underlyingQuestionIds
          .map((id) => id.toString())
          .filter((id) => !questionDataMap.has(id));

        console.log(
          "[6] Underlying Question configuration lookup:",
          {
            requested: underlyingQuestionIds.length,
            found: questions.length,
            missing: missingQuestionIds,
          }
        );

        if (missingQuestionIds.length > 0) {
          throw createError(
            `Underlying Question documents were not found: ${missingQuestionIds.join(", ")}`,
            400
          );
        }

        const validAnswerModes = [
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

        /*
         * STEP 8: Build StudentAnswer upserts.
         *
         * StudentAnswer.question references Question._id.
         * StudentAnswer.assessmentQuestion references
         * AssessmentQuestion._id.
         */

        const answerOperations = normalizedAnswers.map(
          ({ assessmentQuestionId, answer }) => {
            const assessmentQuestion =
              assessmentQuestionMap.get(
                assessmentQuestionId.toString()
              );

            if (!assessmentQuestion?._id) {
              throw createError(
                `No AssessmentQuestion found for ${assessmentQuestionId}`,
                400
              );
            }

            const questionId =
              assessmentQuestion.question.toString();

            const questionData =
              questionDataMap.get(questionId);

            if (!questionData) {
              throw createError(
                `Underlying Question ${questionId} was not found`,
                400
              );
            }

            const configuredAnswerMode =
              questionData.answerEditorConfiguration
                ?.answerMode || "TEXT";

            const answerMode = validAnswerModes.includes(
              configuredAnswerMode
            )
              ? configuredAnswerMode
              : "TEXT";

            console.log(
              "[7] Preparing StudentAnswer:",
              {
                questionId,
                assessmentQuestionId:
                  assessmentQuestion._id.toString(),
                answerMode,
                answerLength: answer.length,
              }
            );

            return {
              updateOne: {
                filter: {
                  attempt: attempt._id,
                  assessmentQuestion:
                    assessmentQuestion._id,
                },
                update: {
                  $set: {
                    question: assessmentQuestion.question,
                    student: studentId,
                    answerMode,
                    answer,
                    status: "SUBMITTED",
                    lastSavedAt: now,
                    submittedAt: now,
                  },
                  $setOnInsert: {
                    startedAt: attempt.startedAt || now,
                    selectedOption: null,
                    attachments: [],
                  },
                },
                upsert: true,
              },
            };
          }
        );

        /*
         * STEP 9: Save StudentAnswer documents.
         */

        if (answerOperations.length > 0) {
          console.log(
            "[8] Executing StudentAnswer.bulkWrite:",
            answerOperations.length
          );

          const bulkResult =
            await StudentAnswer.bulkWrite(
              answerOperations,
              {
                ordered: true,
                session,
              }
            );

          console.log(
            "[8] StudentAnswer bulkWrite result:",
            {
              insertedCount: bulkResult.insertedCount,
              matchedCount: bulkResult.matchedCount,
              modifiedCount: bulkResult.modifiedCount,
              upsertedCount: bulkResult.upsertedCount,
            }
          );

          const savedCount =
            await StudentAnswer.countDocuments({
              attempt: attempt._id,
            }).session(session);

          console.log(
            "[8] StudentAnswer count for attempt:",
            savedCount
          );
        }

        /*
         * STEP 10: Save attempt-level answer snapshot.
         *
         * Store underlying Question IDs in the snapshot,
         * matching the original controller's representation.
         */

        attempt.answers = normalizedAnswers.map(
          ({ assessmentQuestionId, answer }) => {
            const assessmentQuestion =
              assessmentQuestionMap.get(
                assessmentQuestionId.toString()
              );

            if (!assessmentQuestion) {
              throw createError(
                `AssessmentQuestion ${assessmentQuestionId} was not found`,
                400
              );
            }

            return {
              question: assessmentQuestion.question,
              answer,
            };
          }
        );

        attempt.status = "SUBMITTED";
        attempt.submittedAt = now;
        attempt.lastActivityAt = now;

        const savedAttempt = await attempt.save({
          session,
        });

        console.log(
          "[9] StudentAttempt saved:",
          {
            id: savedAttempt._id.toString(),
            status: savedAttempt.status,
            answersCount: normalizedAnswers.length,
          }
        );

        responseAttemptId = savedAttempt._id;
      });

      /*
       * STEP 11: Return the committed attempt.
       */

      console.log(
        "[10] Transaction committed:",
        responseAttemptId.toString()
      );

      const result = await populateStudentAttempt(
        StudentAttempt.findById(responseAttemptId)
      );

      res.json(await result);

      console.log(
        "========== SUBMIT ATTEMPT SUCCESS ==========\n"
      );
    } catch (error) {
      console.error(
        "========== SUBMIT ATTEMPT FAILED ==========",
        {
          message: error.message,
          statusCode: error.statusCode,
          stack: error.stack,
        }
      );

      throw error;
    } finally {
      await session.endSession();
    }
  }
);






/*
 * ---------------------------------------------------------
 * UPDATE ATTEMPT STATUS
 * ---------------------------------------------------------
 *
 * This endpoint is for school staff/evaluation
 * workflow, not for students.
 *
 * Route middleware should restrict this endpoint
 * to appropriate staff roles.
 */
export const updateStudentAttemptStatus =
  asyncHandler(
    async (req, res) => {
      validateObjectId(
        req.params.id,
        "attempt ID",
      );

      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "IN_PROGRESS",
        "SUBMITTED",
        "EVALUATING",
        "EVALUATED",
        "ABANDONED",
        "EXPIRED",
      ];

      if (
        !allowedStatuses.includes(
          status,
        )
      ) {
        throw createError(
          "Invalid attempt status",
          400,
        );
      }

      /*
       * Students should not use this endpoint.
       */
      if (
        req.user.role ===
        STUDENT_ROLE
      ) {
        throw createError(
          "Students cannot change attempt status directly",
          403,
        );
      }

      const attempt =
        await StudentAttempt.findById(
          req.params.id,
        )
          .populate(
            "assessment",
          )
          .populate({
            path: "student",
            populate: {
              path: "user",
              select:
                "name email phone role",
            },
          });

      if (!attempt) {
        throw createError(
          "Student attempt not found",
          404,
        );
      }

      validateAttemptAccess(
        attempt,
        req,
      );

      const currentStatus =
        attempt.status;

      /*
       * Prevent changes to finalized attempts
       * except evaluation progression.
       */
      if (
        currentStatus ===
          "EVALUATED" &&
        status !== "EVALUATED"
      ) {
        throw createError(
          "An evaluated attempt cannot be changed",
          400,
        );
      }

      /*
       * Evaluation workflow:
       *
       * SUBMITTED
       *     ↓
       * EVALUATING
       *     ↓
       * EVALUATED
       */
      if (
        status ===
        "EVALUATING"
      ) {
        if (
          currentStatus !==
          "SUBMITTED"
        ) {
          throw createError(
            "Only submitted attempts can enter evaluation",
            400,
          );
        }
      }

      if (
        status ===
        "EVALUATED"
      ) {
        if (
          ![
            "SUBMITTED",
            "EVALUATING",
          ].includes(
            currentStatus,
          )
        ) {
          throw createError(
            "Only submitted or evaluating attempts can be marked as evaluated",
            400,
          );
        }
      }

      if (
        status ===
        "SUBMITTED"
      ) {
        if (
          ![
            "IN_PROGRESS",
          ].includes(
            currentStatus,
          )
        ) {
          throw createError(
            "Only an in-progress attempt can be marked as submitted",
            400,
          );
        }
      }

      if (
        status ===
        "IN_PROGRESS"
      ) {
        /*
         * Staff should not restart an attempt that
         * has already been submitted/finalized.
         */
        if (
          ![
            "IN_PROGRESS",
          ].includes(
            currentStatus,
          )
        ) {
          throw createError(
            "A submitted or finalized attempt cannot be restarted",
            400,
          );
        }
      }

      if (
        [
          "ABANDONED",
          "EXPIRED",
        ].includes(status) &&
        FINAL_ATTEMPT_STATUSES.includes(
          currentStatus,
        )
      ) {
        throw createError(
          "A finalized attempt cannot be changed",
          400,
        );
      }

      const now =
        new Date();

      if (
        status ===
        "SUBMITTED"
      ) {
        attempt.submittedAt =
          attempt.submittedAt ||
          now;
      }

      attempt.status =
        status;

      attempt.lastActivityAt =
        now;

      const updatedAttempt =
        await attempt.save();

      const result =
        await populateStudentAttempt(
          StudentAttempt.findById(
            updatedAttempt._id,
          ),
        );

      res.json(
        await result,
      );
    },
  );


/*
 * ---------------------------------------------------------
 * UPDATE EVALUATION RESULT
 * ---------------------------------------------------------
 *
 * Staff/evaluation service only.
 */
export const updateStudentAttemptResult =
  asyncHandler(
    async (req, res) => {
      validateObjectId(
        req.params.id,
        "attempt ID",
      );

      /*
       * Students cannot modify evaluation results.
       */
      if (
        req.user.role ===
        STUDENT_ROLE
      ) {
        throw createError(
          "Students cannot modify evaluation results",
          403,
        );
      }

      const {
        attemptedQuestions,
        obtainedMarks,
        timeSpent,
      } = req.body;

      const attempt =
        await StudentAttempt.findById(
          req.params.id,
        );

      if (!attempt) {
        throw createError(
          "Student attempt not found",
          404,
        );
      }

      const schoolId =
        getUserSchool(req);

      await validateAssessment(
        attempt.assessment,
        schoolId,
      );

      if (
        ![
          "SUBMITTED",
          "EVALUATING",
          "EVALUATED",
        ].includes(
          attempt.status,
        )
      ) {
        throw createError(
          "Attempt must be submitted before evaluation",
          400,
        );
      }

      if (
        attemptedQuestions !==
        undefined
      ) {
        const value =
          Number(
            attemptedQuestions,
          );

        if (
          !Number.isInteger(
            value,
          ) ||
          value < 0 ||
          value >
            attempt.totalQuestions
        ) {
          throw createError(
            "Invalid attemptedQuestions",
            400,
          );
        }

        attempt.attemptedQuestions =
          value;
      }

      if (
        obtainedMarks !==
        undefined
      ) {
        const value =
          Number(
            obtainedMarks,
          );

        if (
          !Number.isFinite(
            value,
          ) ||
          value < 0 ||
          value >
            attempt.totalMarks
        ) {
          throw createError(
            "Invalid obtainedMarks",
            400,
          );
        }

        attempt.obtainedMarks =
          value;
      }

      if (
        timeSpent !==
        undefined
      ) {
        const value =
          Number(
            timeSpent,
          );

        if (
          !Number.isFinite(
            value,
          ) ||
          value < 0 ||
          value >
            attempt.durationMinutes *
              60
        ) {
          throw createError(
            "Invalid timeSpent",
            400,
          );
        }

        attempt.timeSpent =
          value;
      }

      attempt.status =
        "EVALUATED";

      attempt.lastActivityAt =
        new Date();

      await attempt.save();

      const result =
        await populateStudentAttempt(
          StudentAttempt.findById(
            attempt._id,
          ),
        );

      res.json(
        await result,
      );
    },
  );


/*
 * ---------------------------------------------------------
 * DELETE ATTEMPT
 * ---------------------------------------------------------
 *
 * Normally restricted by route middleware to
 * school administrators.
 */
export const deleteStudentAttempt =
  asyncHandler(
    async (req, res) => {
      validateObjectId(
        req.params.id,
        "attempt ID",
      );

      const attempt =
        await StudentAttempt.findById(
          req.params.id,
        );

      if (!attempt) {
        throw createError(
          "Student attempt not found",
          404,
        );
      }

      const assessment =
        await validateAssessment(
          attempt.assessment,
          getUserSchool(req),
        );

      if (
        ACTIVE_ATTEMPT_STATUSES.includes(
          attempt.status,
        )
      ) {
        throw createError(
          "An active attempt cannot be deleted",
          400,
        );
      }

      if (
        attempt.status ===
        "EVALUATED"
      ) {
        throw createError(
          "An evaluated attempt cannot be deleted",
          400,
        );
      }

      await attempt.deleteOne();

      res.json({
        message:
          "Student attempt deleted successfully",
        id:
          attempt._id,
        assessment:
          assessment._id,
      });
    },
  );
