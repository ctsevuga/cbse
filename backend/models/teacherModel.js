import mongoose from "mongoose";

const teacherSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    employeeCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    qualification: {
      type: String,
      trim: true,
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

teacherSchema.index(
  {
    school: 1,
    employeeCode: 1,
  },
  {
    unique: true,
  },
);

teacherSchema.index(
  {
    user: 1,
  },
  {
    unique: true,
  },
);

teacherSchema.index({
  school: 1,
  isActive: 1,
});

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;