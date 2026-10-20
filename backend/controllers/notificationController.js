import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

const NOTIFICATION_TYPES = [
  "ASSESSMENT_ASSIGNED",
  "ASSESSMENT_REMINDER",
  "ASSESSMENT_SUBMITTED",
  "EVALUATION_ASSIGNED",
  "EVALUATION_COMPLETED",
  "RESULT_PUBLISHED",
  "GENERAL",
];

const REFERENCE_TYPES = [
  "ASSESSMENT",
  "STUDENT_ATTEMPT",
  "STUDENT_ANSWER",
  "ANSWER_EVALUATION",
  "RESULT",
  "GENERAL",
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

const validateNotificationType = (type) => {
  if (!NOTIFICATION_TYPES.includes(type)) {
    const error = new Error("Invalid notification type");
    error.statusCode = 400;
    throw error;
  }
};

const validateReferenceType = (referenceType) => {
  if (
    referenceType !== undefined &&
    referenceType !== null &&
    !REFERENCE_TYPES.includes(referenceType)
  ) {
    const error = new Error("Invalid reference type");
    error.statusCode = 400;
    throw error;
  }
};

const validateSchoolAccess = (userSchool, targetSchool) => {
  if (
    userSchool &&
    targetSchool &&
    userSchool.toString() !== targetSchool.toString()
  ) {
    const error = new Error(
      "Not authorized to access this notification",
    );
    error.statusCode = 403;
    throw error;
  }
};

const getRecipient = async (recipientId, userSchool) => {
  validateObjectId(recipientId, "recipient ID");

  const recipient = await User.findById(recipientId).select(
    "name email phone role school isActive",
  );

  if (!recipient) {
    const error = new Error("Recipient not found");
    error.statusCode = 404;
    throw error;
  }

  if (userSchool) {
    if (
      !recipient.school ||
      recipient.school.toString() !== userSchool.toString()
    ) {
      const error = new Error(
        "Recipient does not belong to your school",
      );
      error.statusCode = 403;
      throw error;
    }
  }

  if (!recipient.isActive) {
    const error = new Error("Recipient user is inactive");
    error.statusCode = 400;
    throw error;
  }

  return recipient;
};

const getNotificationForUser = async (notificationId, req) => {
  validateObjectId(notificationId, "notification ID");

  const notification = await Notification.findById(
    notificationId,
  ).populate(
    "recipient",
    "name email phone role school isActive",
  );

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  const userSchool = getUserSchool(req);

  validateSchoolAccess(
    userSchool,
    notification.recipient?.school,
  );

  if (
    req.user.role !== "SUPER_ADMIN" &&
    notification.recipient?._id.toString() !==
      req.user._id.toString()
  ) {
    const error = new Error(
      "Not authorized to access this notification",
    );
    error.statusCode = 403;
    throw error;
  }

  return notification;
};

const populateNotification = (query) =>
  query.populate(
    "recipient",
    "name email phone role school isActive",
  );

/*
 * @desc    Create notification
 * @route   POST /api/notifications
 * @access  SUPER_ADMIN, SCHOOL_ADMIN, HM, TEACHER
 */
const createNotification = asyncHandler(async (req, res) => {
  const {
    recipient,
    type,
    title,
    message,
    referenceType,
    referenceId,
  } = req.body;

  const userSchool = getUserSchool(req);

  if (!recipient || !type || !title || !message) {
    res.status(400);
    throw new Error(
      "recipient, type, title and message are required",
    );
  }

  validateNotificationType(type);
  validateReferenceType(referenceType);

  if (referenceType && referenceType !== "GENERAL") {
    if (!referenceId) {
      res.status(400);
      throw new Error(
        "referenceId is required when referenceType is provided",
      );
    }

    validateObjectId(referenceId, "reference ID");
  }

  if (referenceType === "GENERAL" && referenceId) {
    res.status(400);
    throw new Error(
      "referenceId should not be provided for GENERAL reference type",
    );
  }

  const recipientUser = await getRecipient(
    recipient,
    userSchool,
  );

  const notification = await Notification.create({
    recipient: recipientUser._id,
    type,
    title,
    message,
    referenceType,
    referenceId,
    isRead: false,
    readAt: null,
  });

  const populated = await populateNotification(
    Notification.findById(notification._id),
  );

  res.status(201).json(await populated);
});

/*
 * @desc    Get notifications
 * @route   GET /api/notifications
 * @access  Protected
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userSchool = getUserSchool(req);
  const filter = {};

  if (req.user.role !== "SUPER_ADMIN") {
    filter.recipient = req.user._id;
  } else if (req.query.recipient) {
    validateObjectId(
      req.query.recipient,
      "recipient ID",
    );

    const recipient = await getRecipient(
      req.query.recipient,
      userSchool,
    );

    filter.recipient = recipient._id;
  }

  if (req.query.type) {
    validateNotificationType(req.query.type);
    filter.type = req.query.type;
  }

  if (req.query.referenceType) {
    validateReferenceType(req.query.referenceType);
    filter.referenceType = req.query.referenceType;
  }

  if (req.query.referenceId) {
    validateObjectId(
      req.query.referenceId,
      "reference ID",
    );

    filter.referenceId = req.query.referenceId;
  }

  if (req.query.isRead !== undefined) {
    if (
      req.query.isRead !== "true" &&
      req.query.isRead !== "false"
    ) {
      res.status(400);
      throw new Error("isRead must be true or false");
    }

    filter.isRead = req.query.isRead === "true";
  }

  const notifications = await populateNotification(
    Notification.find(filter).sort({
      createdAt: -1,
    }),
  );

  res.json(await notifications);
});

/*
 * @desc    Get notification by ID
 * @route   GET /api/notifications/:id
 * @access  Protected
 */
const getNotificationById = asyncHandler(
  async (req, res) => {
    const notification = await getNotificationForUser(
      req.params.id,
      req,
    );

    res.json(notification);
  },
);

/*
 * @desc    Get my notifications
 * @route   GET /api/notifications/my
 * @access  Protected
 */
const getMyNotifications = asyncHandler(
  async (req, res) => {
    const filter = {
      recipient: req.user._id,
    };

    if (req.query.type) {
      validateNotificationType(req.query.type);
      filter.type = req.query.type;
    }

    if (req.query.isRead !== undefined) {
      if (
        req.query.isRead !== "true" &&
        req.query.isRead !== "false"
      ) {
        res.status(400);
        throw new Error("isRead must be true or false");
      }

      filter.isRead = req.query.isRead === "true";
    }

    const notifications = await populateNotification(
      Notification.find(filter).sort({
        createdAt: -1,
      }),
    );

    res.json(await notifications);
  },
);

/*
 * @desc    Get unread notifications
 * @route   GET /api/notifications/unread
 * @access  Protected
 */
const getUnreadNotifications = asyncHandler(
  async (req, res) => {
    const notifications = await populateNotification(
      Notification.find({
        recipient: req.user._id,
        isRead: false,
      }).sort({
        createdAt: -1,
      }),
    );

    res.json(await notifications);
  },
);

/*
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Protected
 */
const getUnreadNotificationCount = asyncHandler(
  async (req, res) => {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      count,
    });
  },
);

/*
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Protected
 */
const markNotificationAsRead = asyncHandler(
  async (req, res) => {
    const notification = await getNotificationForUser(
      req.params.id,
      req,
    );

    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();

    const populated = await populateNotification(
      Notification.findById(notification._id),
    );

    res.json(await populated);
  },
);

/*
 * @desc    Mark notification as unread
 * @route   PATCH /api/notifications/:id/unread
 * @access  Protected
 */
const markNotificationAsUnread = asyncHandler(
  async (req, res) => {
    const notification = await getNotificationForUser(
      req.params.id,
      req,
    );

    notification.isRead = false;
    notification.readAt = null;

    await notification.save();

    const populated = await populateNotification(
      Notification.findById(notification._id),
    );

    res.json(await populated);
  },
);

/*
 * @desc    Mark all my notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Protected
 */
const markAllNotificationsAsRead = asyncHandler(
  async (req, res) => {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    res.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  },
);

/*
 * @desc    Update notification
 * @route   PUT /api/notifications/:id
 * @access  SUPER_ADMIN, SCHOOL_ADMIN, HM
 */
const updateNotification = asyncHandler(
  async (req, res) => {
    const userSchool = getUserSchool(req);

    validateObjectId(
      req.params.id,
      "notification ID",
    );

    const notification = await Notification.findById(
      req.params.id,
    ).populate(
      "recipient",
      "name email phone role school isActive",
    );

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    validateSchoolAccess(
      userSchool,
      notification.recipient?.school,
    );

    const {
      recipient,
      type,
      title,
      message,
      referenceType,
      referenceId,
    } = req.body;

    if (recipient !== undefined) {
      const recipientUser = await getRecipient(
        recipient,
        userSchool,
      );

      notification.recipient = recipientUser._id;
    }

    if (type !== undefined) {
      validateNotificationType(type);
      notification.type = type;
    }

    if (title !== undefined) {
      if (!title.trim()) {
        res.status(400);
        throw new Error("Title cannot be empty");
      }

      notification.title = title.trim();
    }

    if (message !== undefined) {
      if (!message.trim()) {
        res.status(400);
        throw new Error("Message cannot be empty");
      }

      notification.message = message.trim();
    }

    if (referenceType !== undefined) {
      validateReferenceType(referenceType);

      notification.referenceType =
        referenceType || undefined;

      if (
        referenceType === "GENERAL" ||
        !referenceType
      ) {
        notification.referenceId = undefined;
      }
    }

    if (referenceId !== undefined) {
      if (
        notification.referenceType &&
        notification.referenceType !== "GENERAL"
      ) {
        validateObjectId(
          referenceId,
          "reference ID",
        );

        notification.referenceId = referenceId;
      } else {
        res.status(400);
        throw new Error(
          "referenceId requires a non-GENERAL referenceType",
        );
      }
    }

    await notification.save();

    const populated = await populateNotification(
      Notification.findById(notification._id),
    );

    res.json(await populated);
  },
);

/*
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  SUPER_ADMIN, SCHOOL_ADMIN, HM
 */
const deleteNotification = asyncHandler(
  async (req, res) => {
    const userSchool = getUserSchool(req);

    validateObjectId(
      req.params.id,
      "notification ID",
    );

    const notification = await Notification.findById(
      req.params.id,
    ).populate(
      "recipient",
      "name email phone role school isActive",
    );

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    validateSchoolAccess(
      userSchool,
      notification.recipient?.school,
    );

    await Notification.findByIdAndDelete(
      req.params.id,
    );

    res.json({
      message: "Notification removed successfully",
    });
  },
);

export {
  createNotification,
  getNotifications,
  getNotificationById,
  getMyNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  updateNotification,
  deleteNotification,
};