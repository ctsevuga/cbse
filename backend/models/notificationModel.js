import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "ASSESSMENT_ASSIGNED",
        "ASSESSMENT_REMINDER",
        "ASSESSMENT_SUBMITTED",
        "EVALUATION_ASSIGNED",
        "EVALUATION_COMPLETED",
        "RESULT_PUBLISHED",
        "GENERAL",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    referenceType: {
      type: String,
      enum: [
        "ASSESSMENT",
        "STUDENT_ATTEMPT",
        "STUDENT_ANSWER",
        "ANSWER_EVALUATION",
        "RESULT",
        "GENERAL",
      ],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

notificationSchema.index({
  referenceType: 1,
  referenceId: 1,
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema,
);

export default Notification;