import mongoose from "mongoose";

const classSchema = mongoose.Schema(
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

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
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

classSchema.index(
  {
    school: 1,
    code: 1,
  },
  {
    unique: true,
  },
);

classSchema.index({
  school: 1,
  isActive: 1,
});

const Class = mongoose.model("Class", classSchema);

export default Class;