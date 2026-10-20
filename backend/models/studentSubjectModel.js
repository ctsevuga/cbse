import mongoose from "mongoose";

const studentSubjectSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
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

    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },

    subjectCombination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectCombination",
      required: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
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

    isCompulsory: {
      type: Boolean,
      default: false,
    },

    isAdditional: {
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

studentSubjectSchema.index(
  {
    student: 1,
    academicYear: 1,
    subject: 1,
  },
  {
    unique: true,
  },
);

studentSubjectSchema.index({
  student: 1,
  academicYear: 1,
  isActive: 1,
});

studentSubjectSchema.index({
  academicYear: 1,
  class: 1,
  section: 1,
  subject: 1,
});

studentSubjectSchema.index({
  academicYear: 1,
  stream: 1,
  subject: 1,
});

const StudentSubject = mongoose.model(
  "StudentSubject",
  studentSubjectSchema,
);

export default StudentSubject;