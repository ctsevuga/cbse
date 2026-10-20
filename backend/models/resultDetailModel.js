import mongoose from "mongoose";

const resultDetailSchema = new mongoose.Schema(
  {
    result: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Result",
      required: true,
      index: true,
    },

    // The specific question instance used in this assessment.
    assessmentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentQuestion",
      required: true,
      index: true,
    },

    // The original question-bank question.
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },

    // Snapshot/reference for result analysis.
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      index: true,
    },

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      index: true,
    },

    questionType: {
      type: String,
      enum: [
        "MCQ",
        "DESCRIPTIVE",
        "ASSERTION_REASON",
        "CASE_STUDY",
        "FILL_BLANK",
        "MATCHING",
        "TRUE_FALSE",
      ],
      required: true,
      index: true,
    },

    maximumMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    evaluationStatus: {
      type: String,
      enum: [
        "NOT_ATTEMPTED",
        "AUTO_EVALUATED",
        "PENDING",
        "EVALUATED",
        "REVIEW_REQUIRED",
      ],
      required: true,
      default: "PENDING",
      index: true,
    },

    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },

    evaluatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * A question can occur only once in a particular result.
 */
resultDetailSchema.index(
  {
    result: 1,
    assessmentQuestion: 1,
  },
  {
    unique: true,
  },
);

/**
 * Useful for retrieving all question-level details
 * belonging to a result.
 */
resultDetailSchema.index({
  result: 1,
  questionType: 1,
});

/**
 * Subject/chapter/topic based result analysis.
 */
resultDetailSchema.index({
  result: 1,
  subject: 1,
});

resultDetailSchema.index({
  result: 1,
  chapter: 1,
});

resultDetailSchema.index({
  result: 1,
  topic: 1,
});

/**
 * Teacher evaluation queues.
 *
 * Useful for:
 * - My evaluations
 * - Pending evaluations
 * - Review-required evaluations
 */
resultDetailSchema.index({
  evaluatedBy: 1,
  evaluationStatus: 1,
});

/**
 * Prevent obtained marks from exceeding maximum marks.
 */
resultDetailSchema.pre("validate", function (next) {
  if (this.obtainedMarks > this.maximumMarks) {
    return next(
      new Error("Obtained marks cannot exceed maximum marks."),
    );
  }

  next();
});

const ResultDetail = mongoose.model(
  "ResultDetail",
  resultDetailSchema,
);

export default ResultDetail;
