import mongoose from "mongoose";

const subjectCombinationSchema = mongoose.Schema(
  {
    // ------------------------------------------------------
    // Stream
    // ------------------------------------------------------

    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
      unique: true,
    },

    // ------------------------------------------------------
    // Basic Information
    // ------------------------------------------------------

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
      unique: true,
    },

    // ------------------------------------------------------
    // Subjects
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
    // Elective Selection Rules
    // ------------------------------------------------------

    minimumElectives: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    maximumElectives: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

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

subjectCombinationSchema.index({
  stream: 1,
  isActive: 1,
});


// ------------------------------------------------------
// Validation
// ------------------------------------------------------

subjectCombinationSchema.pre("validate", function (next) {
  // ----------------------------------------------------
  // Validate elective limits
  // ----------------------------------------------------

  if (
    this.minimumElectives > this.maximumElectives
  ) {
    return next(
      new Error(
        "minimumElectives cannot be greater than maximumElectives",
      ),
    );
  }

  // ----------------------------------------------------
  // Separate core and elective subjects
  // ----------------------------------------------------

  const coreSubjects = this.subjects.filter(
    (item) => item.type === "CORE",
  );

  const electiveSubjects = this.subjects.filter(
    (item) => item.type === "ELECTIVE",
  );

  // ----------------------------------------------------
  // At least one core subject
  // ----------------------------------------------------

  if (coreSubjects.length === 0) {
    return next(
      new Error(
        "Subject combination must contain at least one core subject",
      ),
    );
  }

  // ----------------------------------------------------
  // Validate elective limits against available electives
  // ----------------------------------------------------

  if (
    this.maximumElectives > electiveSubjects.length
  ) {
    return next(
      new Error(
        "maximumElectives cannot be greater than the number of available elective subjects",
      ),
    );
  }

  if (
    this.minimumElectives > electiveSubjects.length
  ) {
    return next(
      new Error(
        "minimumElectives cannot be greater than the number of available elective subjects",
      ),
    );
  }

  // ----------------------------------------------------
  // Prevent duplicate subjects
  // ----------------------------------------------------

  const subjectIds = this.subjects.map(
    (item) => item.subject.toString(),
  );

  const uniqueSubjectIds = new Set(subjectIds);

  if (
    uniqueSubjectIds.size !== subjectIds.length
  ) {
    return next(
      new Error(
        "A subject cannot be added more than once to a subject combination",
      ),
    );
  }

  next();
});


const SubjectCombination = mongoose.model(
  "SubjectCombination",
  subjectCombinationSchema,
);

export default SubjectCombination;
