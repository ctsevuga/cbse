import mongoose from "mongoose";

const assessmentQuestionSchema = mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentSection",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
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
    choiceGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentChoiceGroup",
    },
  },
  { timestamps: true },
);

assessmentQuestionSchema.index(
  { school: 1, assessment: 1, order: 1 },
  { unique: true },
);

assessmentQuestionSchema.index({
  school: 1,
  assessment: 1,
  section: 1,
  order: 1,
});

assessmentQuestionSchema.index({
  school: 1,
  assessment: 1,
  question: 1,
});

assessmentQuestionSchema.index({
  school: 1,
  section: 1,
  order: 1,
});

assessmentQuestionSchema.index({
  school: 1,
  questionGroup: 1,
});

assessmentQuestionSchema.index({
  school: 1,
  choiceGroup: 1,
});

const AssessmentQuestion = mongoose.model(
  "AssessmentQuestion",
  assessmentQuestionSchema,
);

export default AssessmentQuestion;