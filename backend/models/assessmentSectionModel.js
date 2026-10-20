import mongoose from "mongoose";

const ASSESSMENT_SECTION_QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const assessmentSectionSchema = mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },

    sectionCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    questionType: {
      type: String,
      enum: ASSESSMENT_SECTION_QUESTION_TYPES,
      required: true,
    },

    marksPerQuestion: {
      type: Number,
      required: true,
      min: 0,
    },

    numberOfQuestions: {
      type: Number,
      required: true,
      min: 1,
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    instructions: {
      type: String,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

assessmentSectionSchema.index(
  {
    assessment: 1,
    sectionCode: 1,
  },
  {
    unique: true,
  },
);

assessmentSectionSchema.index(
  {
    assessment: 1,
    order: 1,
  },
  {
    unique: true,
  },
);

assessmentSectionSchema.index({
  assessment: 1,
  questionType: 1,
});

const AssessmentSection = mongoose.model(
  "AssessmentSection",
  assessmentSectionSchema,
);

export {
  ASSESSMENT_SECTION_QUESTION_TYPES,
};

export default AssessmentSection;
