import mongoose from "mongoose";

const answerEditorConfigurationSchema = mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
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

    configuration: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

answerEditorConfigurationSchema.index(
  { subject: 1, code: 1 },
  { unique: true },
);

answerEditorConfigurationSchema.index({
  subject: 1,
  isActive: 1,
});

answerEditorConfigurationSchema.index({
  answerMode: 1,
  isActive: 1,
});

const AnswerEditorConfiguration = mongoose.model(
  "AnswerEditorConfiguration",
  answerEditorConfigurationSchema,
);

export default AnswerEditorConfiguration;