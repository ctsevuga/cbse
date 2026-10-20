import mongoose from "mongoose";

const questionGroupSchema = mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    groupType: {
      type: String,
      enum: [
        "PASSAGE",
        "CASE_STUDY",
        "DATA_INTERPRETATION",
        "SOURCE_BASED",
        "COMMON_DIRECTIONS",
      ],
      required: true,
    },

    directions: {
      type: String,
      trim: true,
    },

    sharedContent: {
      type: String,
      trim: true,
    },

    selectionMode: {
      type: String,
      enum: ["ALL", "ANY", "RANDOM"],
      default: "ALL",
    },

    questionCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
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

questionGroupSchema.index({
  subject: 1,
  chapter: 1,
});

questionGroupSchema.index({
  subject: 1,
  groupType: 1,
  isActive: 1,
});

questionGroupSchema.index({
  subject: 1,
  title: 1,
});

questionGroupSchema.index({
  createdBy: 1,
});

const QuestionGroup = mongoose.model(
  "QuestionGroup",
  questionGroupSchema,
);

export default QuestionGroup;