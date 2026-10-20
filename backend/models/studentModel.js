import mongoose from "mongoose";

const studentSchema = mongoose.Schema(
  {
    // ------------------------------------------------------
    // User
    // ------------------------------------------------------
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ------------------------------------------------------
    // School
    // ------------------------------------------------------
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    // ------------------------------------------------------
    // Admission Information
    // ------------------------------------------------------
    admissionNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    // ------------------------------------------------------
    // Personal Information
    // ------------------------------------------------------
    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: [
        "MALE",
        "FEMALE",
        "OTHER",
      ],
      required: true,
    },

    // ------------------------------------------------------
    // Academic Information
    // ------------------------------------------------------
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

    // ------------------------------------------------------
    // Stream
    //
    // Stream is a reference because streams are now
    // managed as entities rather than hard-coded values.
    // ------------------------------------------------------
    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },

    // ------------------------------------------------------
    // Student's Actual Subject Enrollment
    //
    // SubjectCombination is NOT stored here.
    //
    // SubjectCombination defines the available subjects
    // and selection rules.
    //
    // Student.subjects contains the subjects actually
    // selected/enrolled by this student.
    // ------------------------------------------------------
    subjects: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },

        type: {
          type: String,
          enum: [
            "CORE",
            "ELECTIVE",
          ],
          required: true,
        },
      },
    ],

    // ------------------------------------------------------
    // Status
    // ------------------------------------------------------
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ------------------------------------------------------
// Indexes
// ------------------------------------------------------

studentSchema.index(
  {
    school: 1,
    admissionNumber: 1,
  },
  {
    unique: true,
  },
);

studentSchema.index({
  school: 1,
  academicYear: 1,
  class: 1,
  section: 1,
});

studentSchema.index(
  {
    user: 1,
  },
  {
    unique: true,
  },
);

studentSchema.index({
  school: 1,
  academicYear: 1,
  stream: 1,
});

studentSchema.index({
  school: 1,
  academicYear: 1,
  isActive: 1,
});

// Useful when querying students enrolled in a particular subject.
studentSchema.index({
  school: 1,
  academicYear: 1,
  "subjects.subject": 1,
});

// Useful when querying students by subject type.
studentSchema.index({
  school: 1,
  academicYear: 1,
  "subjects.type": 1,
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
