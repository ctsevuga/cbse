import mongoose from "mongoose";

const studentAnswerSchema = mongoose.Schema(
  {
    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentAttempt",
      required: true,
      index: true,
    },

    assessmentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentQuestion",
      required: true,
      index: true,
    },

    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    answerMode: {
      type: String,
      enum: [
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
      ],
      required: true,
    },

    answer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    selectedOption: {
      type: String,
      trim: true,
      default: null,
    },

    attachments: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "SAVED",
        "SUBMITTED",
      ],
      default: "NOT_STARTED",
    },

    startedAt: {
      type: Date,
    },

    lastSavedAt: {
      type: Date,
    },

    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

studentAnswerSchema.index(
  { attempt: 1, assessmentQuestion: 1 },
  { unique: true },
);

studentAnswerSchema.index({
  attempt: 1,
  student: 1,
});

studentAnswerSchema.index({
  student: 1,
  question: 1,
});

studentAnswerSchema.index({
  attempt: 1,
  status: 1,
});

const StudentAnswer = mongoose.model(
  "StudentAnswer",
  studentAnswerSchema,
);

export default StudentAnswer;