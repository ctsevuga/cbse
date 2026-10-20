import mongoose from "mongoose";

const streamSchema = mongoose.Schema(
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

    description: {
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

streamSchema.index(
  {
    school: 1,
    code: 1,
  },
  {
    unique: true,
  },
);

streamSchema.index({
  school: 1,
  isActive: 1,
});

const Stream = mongoose.model("Stream", streamSchema);

export default Stream;