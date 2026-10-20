import mongoose from "mongoose";

const questionBlueprintSchema = mongoose.Schema(
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

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    blueprintType: {
      type: String,
      enum: [
        "MONTHLY_TEST",
        "UNIT_TEST",
        "HALF_YEARLY",
        "ANNUAL_EXAM",
        "MOCK_EXAM",
        "CUSTOM",
      ],
      default: "CUSTOM",
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

    rules: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    difficultyDistribution: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    questionTypeDistribution: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate names for blueprints without a stream.
questionBlueprintSchema.index(
  {
    school: 1,
    academicYear: 1,
    class: 1,
    subject: 1,
    name: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      stream: { $exists: false },
    },
    collation: { locale: "en", strength: 2 },
  },
);

// Prevent duplicate names for blueprints with a stream.
questionBlueprintSchema.index(
  {
    school: 1,
    academicYear: 1,
    class: 1,
    subject: 1,
    stream: 1,
    name: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      stream: { $type: "objectId" },
    },
    collation: { locale: "en", strength: 2 },
  },
);

questionBlueprintSchema.index({
  school: 1,
  academicYear: 1,
  class: 1,
  isActive: 1,
});

questionBlueprintSchema.index({
  school: 1,
  academicYear: 1,
  subject: 1,
  isActive: 1,
});

questionBlueprintSchema.index({
  createdBy: 1,
});

const QuestionBlueprint = mongoose.model(
  "QuestionBlueprint",
  questionBlueprintSchema,
);

export default QuestionBlueprint;