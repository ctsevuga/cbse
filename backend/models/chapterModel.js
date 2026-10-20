import mongoose from "mongoose";

const chapterSchema = mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    chapterNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
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

chapterSchema.index(
  {
    subject: 1,
    chapterNumber: 1,
  },
  {
    unique: true,
  },
);

chapterSchema.index({
  subject: 1,
  isActive: 1,
});

chapterSchema.index({
  subject: 1,
  title: 1,
});

const Chapter = mongoose.model("Chapter", chapterSchema);

export default Chapter;