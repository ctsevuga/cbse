import mongoose from "mongoose";

const topicSchema = mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    name: {
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

topicSchema.index(
  {
    chapter: 1,
    name: 1,
  },
  {
    unique: true,
  },
);

topicSchema.index({
  subject: 1,
  chapter: 1,
  isActive: 1,
});

topicSchema.index({
  subject: 1,
  name: 1,
});

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;