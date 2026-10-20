import mongoose from "mongoose";

const questionSchema = mongoose.Schema(
  {
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

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
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
    },

    marks: {
      type: Number,
      required: true,
      min: 0,
    },

    questionText: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      trim: true,
    },

    answerEditorConfiguration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnswerEditorConfiguration",
      required: true,
    },

    options: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM",
    },

    negativeMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    questionGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionGroup",
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_APPROVAL",
        "APPROVED",
        "REJECTED",
        "ARCHIVED",
      ],
      default: "APPROVED",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

questionSchema.index({
  class: 1,
  subject: 1,
});

questionSchema.index({
  class: 1,
  subject: 1,
  chapter: 1,
});

questionSchema.index({
  class: 1,
  subject: 1,
  topic: 1,
});

questionSchema.index({
  subject: 1,
  questionType: 1,
});

questionSchema.index({
  subject: 1,
  marks: 1,
});

questionSchema.index({
  subject: 1,
  difficulty: 1,
  isActive: 1,
});

questionSchema.index({
  status: 1,
});

questionSchema.index({
  questionGroup: 1,
});

questionSchema.index({
  answerEditorConfiguration: 1,
});

questionSchema.index({
  createdBy: 1,
});

questionSchema.index({
  approvedBy: 1,
});

const Question = mongoose.model("Question", questionSchema);

export default Question;