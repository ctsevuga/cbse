import mongoose from "mongoose";

const studentParentSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },

    relationship: {
      type: String,
      enum: [
        "FATHER",
        "MOTHER",
        "GUARDIAN",
        "GRANDFATHER",
        "GRANDMOTHER",
        "OTHER",
      ],
      required: true,
      trim: true,
    },

    isPrimary: {
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

studentParentSchema.index(
  {
    student: 1,
    parent: 1,
  },
  {
    unique: true,
  },
);

studentParentSchema.index({
  student: 1,
  isActive: 1,
});

studentParentSchema.index({
  parent: 1,
  isActive: 1,
});

const StudentParent = mongoose.model(
  "StudentParent",
  studentParentSchema,
);

export default StudentParent;