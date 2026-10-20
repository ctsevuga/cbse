import mongoose from "mongoose";

const auditLogSchema = mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "PUBLISH",
        "SUBMIT",
        "EVALUATE",
        "APPROVE",
        "REJECT",
        "ACTIVATE",
        "DEACTIVATE",
      ],
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    oldValues: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

auditLogSchema.index({
  school: 1,
  createdAt: -1,
});

auditLogSchema.index({
  school: 1,
  user: 1,
  createdAt: -1,
});

auditLogSchema.index({
  school: 1,
  entityType: 1,
  entityId: 1,
  createdAt: -1,
});

auditLogSchema.index({
  school: 1,
  action: 1,
  createdAt: -1,
});

const AuditLog = mongoose.model(
  "AuditLog",
  auditLogSchema,
);

export default AuditLog;