import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import AuditLog from "../models/auditLogModel.js";
import User from "../models/userModel.js";
import School from "../models/schoolModel.js";

const AUDIT_ACTIONS = [
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
];

const getUserSchool = (req) => {
  if (req.user.role === "SUPER_ADMIN") {
    return null;
  }

  return req.schoolId;
};

const validateObjectId = (id, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

const validateAction = (action) => {
  if (!AUDIT_ACTIONS.includes(action)) {
    const error = new Error("Invalid audit action");
    error.statusCode = 400;
    throw error;
  }
};

const validateSchoolAccess = (schoolId, userSchool) => {
  if (
    userSchool &&
    schoolId &&
    schoolId.toString() !== userSchool.toString()
  ) {
    const error = new Error(
      "Not authorized to access audit logs for this school",
    );
    error.statusCode = 403;
    throw error;
  }
};

const getSchool = async (schoolId, userSchool) => {
  validateObjectId(schoolId, "school ID");

  validateSchoolAccess(schoolId, userSchool);

  const school = await School.findById(schoolId).select(
    "name code isActive",
  );

  if (!school) {
    const error = new Error("School not found");
    error.statusCode = 404;
    throw error;
  }

  return school;
};

const getAuditLog = async (id, userSchool) => {
  validateObjectId(id, "audit log ID");

  const auditLog = await AuditLog.findById(id)
    .populate(
      "school",
      "name code isActive",
    )
    .populate(
      "user",
      "name email phone role school isActive",
    );

  if (!auditLog) {
    const error = new Error("Audit log not found");
    error.statusCode = 404;
    throw error;
  }

  validateSchoolAccess(
    auditLog.school?._id,
    userSchool,
  );

  return auditLog;
};

const populateAuditLog = (query) =>
  query
    .populate(
      "school",
      "name code isActive",
    )
    .populate(
      "user",
      "name email phone role school isActive",
    );

/*
 * @desc    Create audit log
 * @route   POST /api/audit-logs
 * @access  SUPER_ADMIN, SCHOOL_ADMIN, HM
 */
const createAuditLog = asyncHandler(async (req, res) => {
  const {
    school,
    user,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    ipAddress,
  } = req.body;

  const userSchool = getUserSchool(req);

  if (
    !school ||
    !user ||
    !action ||
    !entityType ||
    !entityId
  ) {
    res.status(400);
    throw new Error(
      "school, user, action, entityType and entityId are required",
    );
  }

  validateObjectId(school, "school ID");
  validateObjectId(user, "user ID");
  validateObjectId(entityId, "entity ID");

  validateAction(action);

  if (!entityType.trim()) {
    res.status(400);
    throw new Error("entityType cannot be empty");
  }

  const schoolDoc = await getSchool(
    school,
    userSchool,
  );

  const auditUser = await User.findById(user).select(
    "name email phone role school isActive",
  );

  if (!auditUser) {
    res.status(404);
    throw new Error("Audit user not found");
  }

  if (
    !auditUser.school ||
    auditUser.school.toString() !==
      schoolDoc._id.toString()
  ) {
    res.status(400);
    throw new Error(
      "Audit user does not belong to the specified school",
    );
  }

  const auditLog = await AuditLog.create({
    school: schoolDoc._id,
    user: auditUser._id,
    action,
    entityType: entityType.trim(),
    entityId,
    oldValues:
      oldValues !== undefined ? oldValues : null,
    newValues:
      newValues !== undefined ? newValues : null,
    ipAddress:
      ipAddress || req.ip || undefined,
  });

  const populated = await populateAuditLog(
    AuditLog.findById(auditLog._id),
  );

  res.status(201).json(await populated);
});


/*
 * @desc    Get audit logs
 * @route   GET /api/audit-logs
 * @access  SUPER_ADMIN, SCHOOL_ADMIN, HM
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const userSchool = getUserSchool(req);
  const filter = {};

  if (req.query.school) {
    validateObjectId(
      req.query.school,
      "school ID",
    );

    await getSchool(
      req.query.school,
      userSchool,
    );

    filter.school = req.query.school;
  } else if (userSchool) {
    filter.school = userSchool;
  }

  if (req.query.user) {
    validateObjectId(
      req.query.user,
      "user ID",
    );

    filter.user = req.query.user;
  }

  if (req.query.action) {
    validateAction(req.query.action);
    filter.action = req.query.action;
  }

  if (req.query.entityType) {
    if (!req.query.entityType.trim()) {
      res.status(400);
      throw new Error(
        "entityType cannot be empty",
      );
    }

    filter.entityType =
      req.query.entityType.trim();
  }

  if (req.query.entityId) {
    validateObjectId(
      req.query.entityId,
      "entity ID",
    );

    filter.entityId = req.query.entityId;
  }

  if (req.query.fromDate || req.query.toDate) {
    filter.createdAt = {};

    if (req.query.fromDate) {
      const fromDate = new Date(
        req.query.fromDate,
      );

      if (Number.isNaN(fromDate.getTime())) {
        res.status(400);
        throw new Error("Invalid fromDate");
      }

      filter.createdAt.$gte = fromDate;
    }

    if (req.query.toDate) {
      const toDate = new Date(
        req.query.toDate,
      );

      if (Number.isNaN(toDate.getTime())) {
        res.status(400);
        throw new Error("Invalid toDate");
      }

      toDate.setHours(23, 59, 59, 999);

      filter.createdAt.$lte = toDate;
    }
  }

  const auditLogs = await populateAuditLog(
    AuditLog.find(filter).sort({
      createdAt: -1,
    }),
  );

  res.json(await auditLogs);
});


/*
 * @desc    Get audit log by ID
 * @route   GET /api/audit-logs/:id
 * @access  SUPER_ADMIN, SCHOOL_ADMIN, HM
 */
const getAuditLogById = asyncHandler(
  async (req, res) => {
    const userSchool = getUserSchool(req);

    const auditLog = await getAuditLog(
      req.params.id,
      userSchool,
    );

    res.json(auditLog);
  },
);


/*
 * @desc    Get audit logs by user
 * @route   GET /api/audit-logs/user/:userId
 * @access  SUPER_ADMIN, SCHOOL_ADMIN, HM
 */
const getAuditLogsByUser = asyncHandler(
  async (req, res) => {
    const userSchool = getUserSchool(req);

    validateObjectId(
      req.params.userId,
      "user ID",
    );

    const auditUser = await User.findById(
      req.params.userId,
    ).select(
      "name email phone role school isActive",
    );

    if (!auditUser) {
      res.status(404);
      throw new Error("User not found");
    }

    validateSchoolAccess(
      auditUser.school,
      userSchool,
    );

    const filter = {
      user: auditUser._id,
    };

    if (userSchool) {
      filter.school = userSchool;
    }

    const auditLogs = await populateAuditLog(
      AuditLog.find(filter).sort({
        createdAt: -1,
      }),
    );

    res.json(await auditLogs);
  },
);


/*
 * @desc    Get audit logs by entity
 * @route   GET /api/audit-logs/entity/:entityType/:entityId
 * @access  SUPER_ADMIN, SCHOOL_ADMIN, HM
 */
const getAuditLogsByEntity = asyncHandler(
  async (req, res) => {
    const userSchool = getUserSchool(req);

    const { entityType, entityId } = req.params;

    if (!entityType || !entityType.trim()) {
      res.status(400);
      throw new Error("entityType is required");
    }

    validateObjectId(
      entityId,
      "entity ID",
    );

    const filter = {
      entityType: entityType.trim(),
      entityId,
    };

    if (userSchool) {
      filter.school = userSchool;
    } else if (req.query.school) {
      validateObjectId(
        req.query.school,
        "school ID",
      );

      await getSchool(
        req.query.school,
        null,
      );

      filter.school = req.query.school;
    }

    const auditLogs = await populateAuditLog(
      AuditLog.find(filter).sort({
        createdAt: -1,
      }),
    );

    res.json(await auditLogs);
  },
);


/*
 * @desc    Get audit logs by action
 * @route   GET /api/audit-logs/action/:action
 * @access  SUPER_ADMIN, SCHOOL_ADMIN, HM
 */
const getAuditLogsByAction = asyncHandler(
  async (req, res) => {
    const userSchool = getUserSchool(req);

    const { action } = req.params;

    validateAction(action);

    const filter = {
      action,
    };

    if (userSchool) {
      filter.school = userSchool;
    } else if (req.query.school) {
      validateObjectId(
        req.query.school,
        "school ID",
      );

      await getSchool(
        req.query.school,
        null,
      );

      filter.school = req.query.school;
    }

    const auditLogs = await populateAuditLog(
      AuditLog.find(filter).sort({
        createdAt: -1,
      }),
    );

    res.json(await auditLogs);
  },
);


/*
 * @desc    Get my audit logs
 * @route   GET /api/audit-logs/my
 * @access  SUPER_ADMIN, SCHOOL_ADMIN, HM
 */
const getMyAuditLogs = asyncHandler(
  async (req, res) => {
    const userSchool = getUserSchool(req);

    const filter = {
      user: req.user._id,
    };

    if (userSchool) {
      filter.school = userSchool;
    }

    const auditLogs = await populateAuditLog(
      AuditLog.find(filter).sort({
        createdAt: -1,
      }),
    );

    res.json(await auditLogs);
  },
);


/*
 * @desc    Delete audit log
 * @route   DELETE /api/audit-logs/:id
 * @access  SUPER_ADMIN
 */
const deleteAuditLog = asyncHandler(
  async (req, res) => {
    const userSchool = getUserSchool(req);

    const auditLog = await getAuditLog(
      req.params.id,
      userSchool,
    );

    await AuditLog.findByIdAndDelete(
      auditLog._id,
    );

    res.json({
      message: "Audit log removed successfully",
    });
  },
);


export {
  createAuditLog,
  getAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  getAuditLogsByEntity,
  getAuditLogsByAction,
  getMyAuditLogs,
  deleteAuditLog,
};