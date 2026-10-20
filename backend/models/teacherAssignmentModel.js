import mongoose from "mongoose";

const teacherAssignmentSchema = mongoose.Schema(
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

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },

    assignmentType: {
      type: String,
      enum: [
        "CLASS_TEACHER",
        "SUBJECT_TEACHER",
      ],
      required: true,
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

teacherAssignmentSchema.index({
  school: 1,
  academicYear: 1,
  teacher: 1,
});

teacherAssignmentSchema.index({
  school: 1,
  academicYear: 1,
  class: 1,
  section: 1,
});

teacherAssignmentSchema.index({
  school: 1,
  academicYear: 1,
  class: 1,
  section: 1,
  subject: 1,
  assignmentType: 1,
});

const TeacherAssignment = mongoose.model(
  "TeacherAssignment",
  teacherAssignmentSchema,
);

export default TeacherAssignment;