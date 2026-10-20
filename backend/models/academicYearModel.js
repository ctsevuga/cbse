import mongoose from "mongoose";

const academicYearSchema = mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isCurrent: {
      type: Boolean,
      default: false,
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

academicYearSchema.index(
  {
    school: 1,
    name: 1,
  },
  {
    unique: true,
  },
);

academicYearSchema.index({
  school: 1,
  isCurrent: 1,
});

academicYearSchema.index({
  school: 1,
  isActive: 1,
});

const AcademicYear = mongoose.model(
  "AcademicYear",
  academicYearSchema,
);

export default AcademicYear;