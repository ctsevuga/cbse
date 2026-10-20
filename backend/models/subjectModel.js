import mongoose from "mongoose";

const subjectSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    shortName: {
      type: String,
      trim: true,
      uppercase: true,
    },

    subjectType: {
      type: String,
      enum: [
        "LANGUAGE",
        "CORE",
        "ELECTIVE",
        "OPTIONAL",
        "ADDITIONAL",
      ],
      required: true,
    },

    cbseSubjectCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

subjectSchema.index({
  name: 1,
});

subjectSchema.index({
  subjectType: 1,
  isActive: 1,
});

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;