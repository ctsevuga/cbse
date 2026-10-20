import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentAttempt",
      required: true,
    },

    // Maximum marks for the assessment/attempt
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    // Final marks obtained from automatic + teacher evaluation
    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.totalMarks;
        },
        message: "Obtained marks cannot exceed total marks",
      },
    },

    // Calculated as (obtainedMarks / totalMarks) * 100
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_EVALUATION",
        "EVALUATED",
        "PUBLISHED",
        "WITHDRAWN",
      ],
      default: "DRAFT",
    },

    // Publication audit information
    publishedAt: {
      type: Date,
    },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Withdrawal audit information
    withdrawnAt: {
      type: Date,
    },

    withdrawnBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// One result per assessment + student + attempt
resultSchema.index(
  {
    assessment: 1,
    student: 1,
    attempt: 1,
  },
  {
    unique: true,
  },
);

// Find/filter results for an assessment
resultSchema.index({
  assessment: 1,
  status: 1,
});

// Student result history / published results
resultSchema.index({
  student: 1,
  status: 1,
  publishedAt: -1,
});

const Result = mongoose.model("Result", resultSchema);

export default Result;
