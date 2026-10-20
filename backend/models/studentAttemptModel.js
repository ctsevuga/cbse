
import mongoose from "mongoose";

const attemptQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentQuestion",
      required: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    optionOrder: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
        },
      ],
      default: [],
    },
  },
  {
    _id: false,
  },
);

/*
 * ---------------------------------------------------------
 * STUDENT ANSWER SCHEMA
 * ---------------------------------------------------------
 *
 * Stores the student's answer for each question.
 *
 * Supports:
 * - Plain text answers
 * - Multiline answers
 * - Mathematical expressions
 * - LaTeX notation
 * - Empty answers
 */
const studentAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentQuestion",
      required: true,
    },

    answer: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const studentAttemptSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    submittedAt: {
      type: Date,
    },

    lastActivityAt: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: [
        "IN_PROGRESS",
        "SUBMITTED",
        "EVALUATING",
        "EVALUATED",
        "ABANDONED",
        "EXPIRED",
      ],
      default: "IN_PROGRESS",
      required: true,
    },

    /*
     * Snapshot of question order for this attempt.
     */
    questionOrder: {
      type: [attemptQuestionSchema],
      required: true,
      default: [],
    },

    /*
     * STUDENT ANSWERS
     *
     * Each answer is associated with its question ID.
     * Newline characters are preserved in the stored string.
     */
    answers: {
      type: [studentAnswerSchema],
      default: [],
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },

    attemptedQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    obtainedMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * ---------------------------------------------------------
 * UNIQUE ATTEMPT NUMBER
 * ---------------------------------------------------------
 */
studentAttemptSchema.index(
  {
    assessment: 1,
    student: 1,
    attemptNumber: 1,
  },
  {
    unique: true,
    name: "unique_student_assessment_attempt_number",
  },
);

/*
 * ---------------------------------------------------------
 * ONE ACTIVE ATTEMPT
 * ---------------------------------------------------------
 */
studentAttemptSchema.index(
  {
    assessment: 1,
    student: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          "IN_PROGRESS",
          "EVALUATING",
        ],
      },
    },
    name: "unique_active_student_assessment_attempt",
  },
);

/*
 * ---------------------------------------------------------
 * STUDENT ATTEMPT HISTORY
 * ---------------------------------------------------------
 */
studentAttemptSchema.index(
  {
    student: 1,
    assessment: 1,
    createdAt: -1,
  },
  {
    name: "student_assessment_attempt_history",
  },
);

/*
 * ---------------------------------------------------------
 * ASSESSMENT REPORTING
 * ---------------------------------------------------------
 */
studentAttemptSchema.index(
  {
    assessment: 1,
    status: 1,
    createdAt: -1,
  },
  {
    name: "assessment_status_attempts",
  },
);

/*
 * ---------------------------------------------------------
 * STUDENT STATUS SEARCH
 * ---------------------------------------------------------
 */
studentAttemptSchema.index(
  {
    student: 1,
    status: 1,
    createdAt: -1,
  },
  {
    name: "student_status_attempts",
  },
);

/*
 * ---------------------------------------------------------
 * VALIDATION
 * ---------------------------------------------------------
 */
studentAttemptSchema.pre(
  "validate",
  function (next) {
    if (
      this.attemptedQuestions >
      this.totalQuestions
    ) {
      return next(
        new Error(
          "Attempted questions cannot exceed total questions",
        ),
      );
    }

    if (
      this.obtainedMarks >
      this.totalMarks
    ) {
      return next(
        new Error(
          "Obtained marks cannot exceed total marks",
        ),
      );
    }

    if (
      this.questionOrder.length !==
      this.totalQuestions
    ) {
      return next(
        new Error(
          "Question order count must match total questions",
        ),
      );
    }

    next();
  },
);

const StudentAttempt = mongoose.model(
  "StudentAttempt",
  studentAttemptSchema,
);

export default StudentAttempt;
