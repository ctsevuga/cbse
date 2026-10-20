import mongoose from "mongoose";

const answerEvaluationSchema = new mongoose.Schema(
  {
    studentAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentAnswer",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },

    maximumMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    marksAwarded: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.maximumMarks;
        },
        message: "Marks awarded cannot exceed maximum marks",
      },
    },

    feedback: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    evaluationStatus: {
      type: String,
      enum: [
        "PENDING",
        "EVALUATED",
        "REVIEW_REQUIRED",
        "REVISED",
      ],
      default: "PENDING",
      index: true,
    },

    evaluatedAt: {
      type: Date,
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// One current evaluation per submitted answer.
answerEvaluationSchema.index(
  { studentAnswer: 1 },
  { unique: true },
);

// Useful for student's result/evaluation history.
answerEvaluationSchema.index({
  student: 1,
  evaluationStatus: 1,
});

// Useful for teacher's pending/review queues.
answerEvaluationSchema.index({
  teacher: 1,
  evaluationStatus: 1,
});

// Useful for teacher evaluation reports.
answerEvaluationSchema.index({
  teacher: 1,
  evaluatedAt: -1,
});

const AnswerEvaluation = mongoose.model(
  "AnswerEvaluation",
  answerEvaluationSchema,
);

export default AnswerEvaluation;
