import mongoose from "mongoose";

const sectionSchema = mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
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

    name: {
      type: String,
      required: true,
      trim: true,
    },

    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
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

sectionSchema.index(
  {
    school: 1,
    academicYear: 1,
    class: 1,
    name: 1,
  },
  {
    unique: true,
  },
);

sectionSchema.index({
  school: 1,
  academicYear: 1,
  class: 1,
  isActive: 1,
});

sectionSchema.index({
  classTeacher: 1,
});

const Section = mongoose.model("Section", sectionSchema);

export default Section;