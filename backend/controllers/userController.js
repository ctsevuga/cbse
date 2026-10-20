import asyncHandler from "../middleware/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

import User from "../models/userModel.js";
import School from "../models/schoolModel.js";

// ======================================================
// HELPERS
// ======================================================

const normalizePhone = (phone) =>
  typeof phone === "string" ? phone.trim() : "";

const getSuperAdminSchool = async () => {
  const schoolSlug = process.env.SUPER_ADMIN_SCHOOL_SLUG;

  const query = schoolSlug
    ? { slug: schoolSlug, isActive: true }
    : { name: "Super Admin School", isActive: true };

  const school = await School.findOne(query);

  if (!school) {
    const error = new Error(
      "Super Admin School could not be found",
    );
    error.statusCode = 500;
    throw error;
  }

  return school;
};

const getAuthorizedSchoolId = (req, res) => {
  const userSchoolId =
    req.user?.school?._id ?? req.user?.school;

  if (!userSchoolId) {
    res.status(403);
    throw new Error(
      "Your account is not assigned to a school",
    );
  }

  // Prevent a school administrator from using a
  // different school's slug in the request URL.
  if (
    req.schoolId &&
    String(req.schoolId) !== String(userSchoolId)
  ) {
    res.status(403);
    throw new Error(
      "You are not authorized to access this school",
    );
  }

  return userSchoolId;
};

const validateSchool = async (schoolId) => {
  if (!schoolId) {
    return null;
  }

  if (!schoolId.toString().match(/^[0-9a-fA-F]{24}$/)) {
    return null;
  }

  return School.findOne({
    _id: schoolId,
    isActive: true,
  });
};

const sendUserResponse = (user) => ({
  _id: user._id,
  school: user.school,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  mustChangePassword: user.mustChangePassword,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const handleDuplicatePhone = (error, res) => {
  if (error?.code === 11000) {
    res.status(409);
    throw new Error(
      "A user with this phone number already exists in this school",
    );
  }

  throw error;
};

// ======================================================
// LOGIN USER
// POST /api/users/auth
// ======================================================

const authUser = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const { password } = req.body;

  if (!phone || !password) {
    res.status(400);
    throw new Error(
      "Phone number and password are required",
    );
  }

  // School must be resolved by slug or domain.
  if (!req.schoolId) {
    res.status(400);
    throw new Error(
      "School could not be identified",
    );
  }

  // SUPER_ADMIN is also found within its assigned
  // Super Admin School. No global phone lookup.
  const user = await User.findOne({
    school: req.schoolId,
    phone,
    isActive: true,
  }).populate("school", "name code slug");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error(
      "Invalid phone number or password",
    );
  }

  user.lastLogin = new Date();
  await user.save();

  generateToken(res, user._id);

  res.json(sendUserResponse(user));
});

// ======================================================
// REGISTER USER
// POST /api/users
// ======================================================

const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    role,
    school,
  } = req.body;

  const DEFAULT_PASSWORD = "123456";

  if (!req.user) {
    res.status(401);
    throw new Error("Authentication required");
  }

  if (!["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(req.user.role)) {
    res.status(403);
    throw new Error(
      "Only administrators can create users",
    );
  }

  if (!name?.trim()) {
    res.status(400);
    throw new Error("Name is required");
  }

  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    res.status(400);
    throw new Error("Phone number is required");
  }

  if (!role) {
    res.status(400);
    throw new Error("Role is required");
  }

  const creatableRoles = [
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "HM",
    "TEACHER",
    "STUDENT",
    "PARENT",
  ];

  if (!creatableRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid user role");
  }

  let userSchool;

  // SUPER_ADMIN must always belong to Super Admin School.
  if (role === "SUPER_ADMIN") {
    if (req.user.role !== "SUPER_ADMIN") {
      res.status(403);
      throw new Error(
        "Only SUPER_ADMIN can create another SUPER_ADMIN",
      );
    }

    const superAdminSchool = await getSuperAdminSchool();
    userSchool = superAdminSchool._id;
  } else if (req.user.role === "SUPER_ADMIN") {
    // Super admins can assign other users to any
    // existing active school.
    if (!school) {
      res.status(400);
      throw new Error(
        "School is required when creating this user",
      );
    }

    const selectedSchool = await validateSchool(school);

    if (!selectedSchool) {
      res.status(400);
      throw new Error(
        "The selected school does not exist or is inactive",
      );
    }

    userSchool = selectedSchool._id;
  } else {
    // SCHOOL_ADMIN can only create users in their
    // own school.
    userSchool = getAuthorizedSchoolId(req, res);
  }

  try {
    const user = await User.create({
      school: userSchool,
      name: name.trim(),
      email: email?.trim().toLowerCase() || undefined,
      phone: normalizedPhone,
      password: DEFAULT_PASSWORD,
      role,
      isActive: true,
      mustChangePassword: true,
    });

    await user.populate("school", "name code slug");

    res.status(201).json({
      success: true,
      user: sendUserResponse(user),
      defaultPassword: DEFAULT_PASSWORD,
    });
  } catch (error) {
    handleDuplicatePhone(error, res);
  }
});

// ======================================================
// LOGOUT USER
// POST /api/users/logout
// ======================================================

const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({
    message: "Logged out successfully",
  });
};

// ======================================================
// GET LOGGED-IN USER PROFILE
// GET /api/users/profile
// ======================================================

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("school", "name code slug")
    .select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(sendUserResponse(user));
});

// ======================================================
// UPDATE LOGGED-IN USER PROFILE
// PUT /api/users/profile
// ======================================================

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Users cannot change their own role or school
  // through the profile endpoint.
  if (
    req.body.role !== undefined ||
    req.body.school !== undefined
  ) {
    res.status(403);
    throw new Error(
      "Role and school cannot be changed through profile",
    );
  }

  if (req.body.phone !== undefined) {
    const phone = normalizePhone(req.body.phone);

    if (!phone) {
      res.status(400);
      throw new Error("Phone number is required");
    }

    if (phone !== user.phone) {
      const existing = await User.findOne({
        school: user.school,
        phone,
        _id: { $ne: user._id },
      });

      if (existing) {
        res.status(409);
        throw new Error(
          "Phone number already exists in this school",
        );
      }

      user.phone = phone;
    }
  }

  if (req.body.name !== undefined) {
    if (!req.body.name.trim()) {
      res.status(400);
      throw new Error("Name cannot be empty");
    }

    user.name = req.body.name.trim();
  }

  if (req.body.email !== undefined) {
    user.email =
      req.body.email?.trim().toLowerCase() || undefined;
  }

  if (req.body.password) {
    user.password = req.body.password;
    user.mustChangePassword = false;
  }

  try {
    await user.save();
  } catch (error) {
    handleDuplicatePhone(error, res);
  }

  await user.populate("school", "name code slug");

  res.json(sendUserResponse(user));
});

// ======================================================
// GET ALL USERS
// GET /api/users
// ======================================================

const getUsers = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role !== "SUPER_ADMIN") {
    query.school = getAuthorizedSchoolId(req, res);
  }

  const users = await User.find(query)
    .populate("school", "name code slug")
    .select("-password")
    .sort({ name: 1 });

  res.json(users);
});

// ======================================================
// GET USER BY ID
// GET /api/users/:id
// ======================================================

const getUserById = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };

  if (req.user.role !== "SUPER_ADMIN") {
    query.school = getAuthorizedSchoolId(req, res);
  }

  const user = await User.findOne(query)
    .populate("school", "name code slug")
    .select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// ======================================================
// UPDATE USER
// PUT /api/users/:id
// ======================================================

const updateUser = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };

  if (req.user.role !== "SUPER_ADMIN") {
    query.school = getAuthorizedSchoolId(req, res);
  }

  const user = await User.findOne(query);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Validate requested role.
  const allowedRoles = [
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "HM",
    "TEACHER",
    "STUDENT",
    "PARENT",
  ];

  if (
    req.body.role !== undefined &&
    !allowedRoles.includes(req.body.role)
  ) {
    res.status(400);
    throw new Error("Invalid user role");
  }

  // Non-super-admin users cannot modify role or school.
  if (
    req.user.role !== "SUPER_ADMIN" &&
    (
      req.body.role !== undefined ||
      req.body.school !== undefined
    )
  ) {
    res.status(403);
    throw new Error(
      "Only SUPER_ADMIN can change a user's role or school",
    );
  }

  if (req.body.name !== undefined) {
    if (!req.body.name.trim()) {
      res.status(400);
      throw new Error("Name cannot be empty");
    }

    user.name = req.body.name.trim();
  }

  if (req.body.email !== undefined) {
    user.email =
      req.body.email?.trim().toLowerCase() || undefined;
  }

  // Determine the final role before assigning school.
  const finalRole = req.body.role ?? user.role;

  if (req.user.role === "SUPER_ADMIN") {
    if (finalRole === "SUPER_ADMIN") {
      // SUPER_ADMIN must always use Super Admin School.
      const superAdminSchool = await getSuperAdminSchool();
      user.school = superAdminSchool._id;
    } else if (req.body.school !== undefined) {
      // Explicit school reassignment.
      const selectedSchool = await validateSchool(
        req.body.school,
      );

      if (!selectedSchool) {
        res.status(400);
        throw new Error(
          "The selected school does not exist or is inactive",
        );
      }

      user.school = selectedSchool._id;
    } else if (user.role === "SUPER_ADMIN") {
      // Demoting a SUPER_ADMIN requires an explicit
      // destination school.
      res.status(400);
      throw new Error(
        "A school must be specified when changing SUPER_ADMIN to another role",
      );
    }
  }

  if (req.body.phone !== undefined) {
    const phone = normalizePhone(req.body.phone);

    if (!phone) {
      res.status(400);
      throw new Error("Phone number is required");
    }

    if (phone !== user.phone) {
      const existing = await User.findOne({
        school: user.school,
        phone,
        _id: { $ne: user._id },
      });

      if (existing) {
        res.status(409);
        throw new Error(
          "Phone number already exists in this school",
        );
      }

      user.phone = phone;
    }
  }

  if (req.body.isActive !== undefined) {
    user.isActive = req.body.isActive;
  }

  if (req.body.password) {
    user.password = req.body.password;
    user.mustChangePassword = false;
  }

  try {
    await user.save();
  } catch (error) {
    handleDuplicatePhone(error, res);
  }

  await user.populate("school", "name code slug");

  res.json(sendUserResponse(user));
});

// ======================================================
// DELETE USER
// DELETE /api/users/:id
// ======================================================

const deleteUser = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };

  if (req.user.role !== "SUPER_ADMIN") {
    query.school = getAuthorizedSchoolId(req, res);
  }

  const user = await User.findOne(query);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error(
      "You cannot delete your own account",
    );
  }

  if (
    user.role === "SUPER_ADMIN" &&
    req.user.role !== "SUPER_ADMIN"
  ) {
    res.status(403);
    throw new Error(
      "You are not authorized to delete a SUPER_ADMIN",
    );
  }

  await user.deleteOne();

  res.json({
    message: "User deleted successfully",
  });
});

// ======================================================
// FORGOT PASSWORD REQUEST
// POST /api/users/forgot-password
// ======================================================

const forgotPassword = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);

  if (!phone) {
    res.status(400);
    throw new Error("Phone number is required");
  }

  if (!req.schoolId) {
    res.status(400);
    throw new Error(
      "School could not be identified",
    );
  }

  const user = await User.findOne({
    school: req.schoolId,
    phone,
    isActive: true,
  });

  // Avoid revealing whether a phone number exists.
  const genericResponse = {
    success: true,
    message:
      "If the account exists, the password reset request has been recorded.",
  };

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  user.passwordResetRequested = true;
  await user.save();

  return res.status(200).json(genericResponse);
});

// ======================================================
// CHANGE PASSWORD
// POST /api/users/change-password
// ======================================================

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error(
      "Current password and new password are required",
    );
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error(
      "New password must be at least 6 characters",
    );
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error(
      "Current password is incorrect",
    );
  }

  user.password = newPassword;
  user.mustChangePassword = false;
  user.passwordResetRequested = false;

  await user.save();

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});

// ======================================================
// GET PASSWORD RESET REQUESTS
// GET /api/users/forgot-password-users
// ======================================================

const getForgotPasswordUsers = asyncHandler(
  async (req, res) => {
    if (
      !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(
        req.user.role,
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to view password reset requests",
      );
    }

    const query = {
      passwordResetRequested: true,
    };

    if (req.user.role !== "SUPER_ADMIN") {
      query.school = getAuthorizedSchoolId(req, res);
    }

    const users = await User.find(query)
      .populate("school", "name code slug")
      .select("-password")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  },
);

// ======================================================
// EXPORTS
// ======================================================

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  forgotPassword,
  changePassword,
  getForgotPasswordUsers,
  updateUser,
  deleteUser,
};