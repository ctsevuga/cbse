import mongoose from "mongoose";

const assessmentSchema = mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },

    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
assessmentType: {
  type: String,
  enum: [
    "CHAPTER_TEST",
    "UNIT_TEST",
    "MONTHLY_TEST",
    "REVISION_TEST",
    "MOCK_EXAM",
    "PRE_BOARD",
    "BOARD_PRACTICE",
  ],
  required: true,
},

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },

    randomizeQuestions: {
      type: Boolean,
      default: false,
    },

    randomizeOptions: {
      type: Boolean,
      default: false,
    },

    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SCHEDULED",
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "DRAFT",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    questionBlueprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionBlueprint",
    },
  },
  { timestamps: true },
);

assessmentSchema.index({
  school: 1,
  academicYear: 1,
  class: 1,
  section: 1,
  subject: 1,
});

assessmentSchema.index({
  school: 1,
  academicYear: 1,
  subject: 1,
  assessmentType: 1,
});

assessmentSchema.index({
  school: 1,
  startDate: 1,
  endDate: 1,
  status: 1,
});

assessmentSchema.index({
  school: 1,
  questionBlueprint: 1,
});

assessmentSchema.index({
  createdBy: 1,
});

const Assessment = mongoose.model(
  "Assessment",
  assessmentSchema,
);

export default Assessment;