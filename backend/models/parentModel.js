import mongoose from "mongoose";

const parentSchema = mongoose.Schema(
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

parentSchema.index(
  {
    user: 1,
  },
  {
    unique: true,
  },
);

parentSchema.index({
  school: 1,
  isActive: 1,
});

const Parent = mongoose.model("Parent", parentSchema);

export default Parent;