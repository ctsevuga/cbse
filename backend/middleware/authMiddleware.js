import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

/**
 * ======================================================
 * Authenticate User
 * ======================================================
 *
 * Verifies the JWT and loads the current User document.
 *
 * After this middleware:
 *
 * req.user
 * req.user._id
 * req.user.role
 * req.user.school
 * req.user.isActive
 *
 * are available to controllers and role middleware.
 */
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    const user = await User.findById(decoded.userId)
      .populate({
        path: "school",
        select: "name code isActive",
      })
      .select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error("User account is inactive");
    }

    /**
     * SUPER_ADMIN does not require a school.
     *
     * All other users must have a school.
     */
    if (user.role !== "SUPER_ADMIN") {
      if (!user.school) {
        res.status(403);
        throw new Error(
          "User does not belong to a school",
        );
      }

      /**
       * Optional but recommended:
       * Make sure the school itself is active.
       */
      if (!user.school.isActive) {
        res.status(403);
        throw new Error(
          "School is inactive",
        );
      }
    }

    /**
     * Attach authenticated user.
     *
     * Controllers can now use:
     *
     * req.user._id
     * req.user.role
     * req.user.school
     */
    req.user = user;

    /**
     * Attach school/tenant context.
     *
     * SUPER_ADMIN:
     *   req.school = undefined
     *   req.schoolId = null
     *
     * Other users:
     *   req.school = populated school
     *   req.schoolId = school._id
     */
    if (user.school) {
      req.school = user.school;
      req.schoolId = user.school._id;
    } else {
      req.school = null;
      req.schoolId = null;
    }

    next();
  } catch (error) {
    console.error(error);

    /**
     * Preserve errors that we intentionally generated above.
     */
    if (
      error.name === "TokenExpiredError"
    ) {
      res.status(401);
      throw new Error("Token expired");
    }

    if (
      error.name === "JsonWebTokenError"
    ) {
      res.status(401);
      throw new Error("Invalid token");
    }

    throw error;
  }
});

/**
 * ======================================================
 * Role Middleware Generator
 * ======================================================
 *
 * Usage:
 *
 * allowRole("TEACHER")
 *
 * or:
 *
 * allowRole("TEACHER", "HM")
 */
const allowRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("Access denied");
    }

    next();
  };
};

/**
 * ======================================================
 * Role Middlewares
 * ======================================================
 */

const superAdmin = allowRole(
  "SUPER_ADMIN",
);

const schoolAdmin = allowRole(
  "SCHOOL_ADMIN",
);

const hm = allowRole(
  "HM",
);

const teacher = allowRole(
  "TEACHER",
);

const student = allowRole(
  "STUDENT",
);

const parent = allowRole(
  "PARENT",
);

/**
 * Multiple roles
 */

const adminOrSuperAdmin = allowRole(
  "SCHOOL_ADMIN",
  "SUPER_ADMIN",
);

const hmOrAdmin = allowRole(
  "HM",
  "SCHOOL_ADMIN",
);

const teacherOrHm = allowRole(
  "TEACHER",
  "HM",
);

const studentOnly = allowRole(
  "STUDENT",
);

const teacherOrHmOrAdmin = allowRole(
  "TEACHER",
  "HM",
  "SCHOOL_ADMIN",
);

export {
  protect,
  allowRole,

  superAdmin,
  schoolAdmin,
  hm,
  teacher,
  student,
  studentOnly,
  parent,

  adminOrSuperAdmin,
  hmOrAdmin,
  teacherOrHm,
  teacherOrHmOrAdmin,
};
