import asyncHandler from "../middleware/asyncHandler.js";
import crypto from "crypto";

import School from "../models/schoolModel.js";
import User from "../models/userModel.js";

/**
 * ======================================================
 * Helper: Generate URL-friendly slug
 * ======================================================
 */
const generateSlug = (value) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Helper: Escape user input before using it in a RegExp.
 */
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * ======================================================
 * @desc    Create School
 * @route   POST /api/schools
 * @access  SUPER_ADMIN
 * ======================================================
 */
const createSchool = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    slug,
    address,
    state,
    city,
    contactDetails,
    configuration,
    isActive,
    adminName,
    adminEmail,
    adminPhone,
  } = req.body;

  // Validate school
  if (!name?.trim() || !code?.trim()) {
    res.status(400);
    throw new Error("School name and code are required");
  }

  if (!adminName?.trim() || !adminPhone?.trim()) {
    res.status(400);
    throw new Error(
      "School administrator name and phone number are required",
    );
  }

  const normalizedName = name.trim();
  const normalizedCode = code.trim().toUpperCase();
  const normalizedPhone = adminPhone.trim();

  const generatedSlug = generateSlug(
    slug || normalizedName,
  );

  if (!generatedSlug) {
    res.status(400);
    throw new Error(
      "A valid school slug could not be generated",
    );
  }

  // Check duplicate school code
  const existingSchoolByCode = await School.findOne({
    code: normalizedCode,
  });

  if (existingSchoolByCode) {
    res.status(400);
    throw new Error("School code already exists");
  }

  // Check duplicate school slug
  const existingSchoolBySlug = await School.findOne({
    slug: generatedSlug,
  });

  if (existingSchoolBySlug) {
    res.status(400);
    throw new Error("School slug already exists");
  }

  // Generate temporary password for initial administrator
  const temporaryPassword = crypto
    .randomBytes(6)
    .toString("base64url");

  /*
   * Create the school and its initial administrator together
   * in a transaction so that a failed administrator creation
   * does not leave an incomplete school record.
   *
   * This requires MongoDB to run as a replica set.
   */
  const session = await School.startSession();

  let school;
  let schoolAdmin;

  try {
    await session.withTransaction(async () => {
      [school] = await School.create(
        [
          {
            name: normalizedName,
            code: normalizedCode,
            slug: generatedSlug,
            address: address?.trim() || undefined,
            state: state?.trim() || undefined,
            city: city?.trim() || undefined,
            contactDetails,
            configuration,
            isActive:
              isActive !== undefined ? isActive : true,
            createdBy: req.user._id,
          },
        ],
        { session },
      );

      const existingAdmin = await User.findOne({
        school: school._id,
        phone: normalizedPhone,
      }).session(session);

      if (existingAdmin) {
        const error = new Error(
          "A user with this phone number already exists in this school",
        );
        error.statusCode = 400;
        throw error;
      }

      [schoolAdmin] = await User.create(
        [
          {
            school: school._id,
            name: adminName.trim(),
            email:
              adminEmail?.trim().toLowerCase() ||
              undefined,
            phone: normalizedPhone,
            password: temporaryPassword,
            role: "SCHOOL_ADMIN",
            isActive: true,
            mustChangePassword: true,
          },
        ],
        { session },
      );
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
      throw error;
    }

    if (error.code === 11000) {
      res.status(400);
      throw new Error(
        "School code, slug, or administrator phone number already exists",
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }

  const createdSchool = await School.findById(school._id)
    .populate("createdBy", "name email phone role")
    .lean();

  res.status(201).json({
    school: createdSchool,
    schoolAdmin: {
      _id: schoolAdmin._id,
      school: schoolAdmin.school,
      name: schoolAdmin.name,
      email: schoolAdmin.email,
      phone: schoolAdmin.phone,
      role: schoolAdmin.role,
      isActive: schoolAdmin.isActive,
      mustChangePassword:
        schoolAdmin.mustChangePassword,
    },
    temporaryPassword,
  });
});

/**
 * ======================================================
 * @desc    Get All Schools
 * @route   GET /api/schools
 * @access  SUPER_ADMIN
 * ======================================================
 */
const getSchools = asyncHandler(async (req, res) => {
  const schools = await School.find()
    .populate("createdBy", "name email phone role")
    .sort({
      state: 1,
      city: 1,
      name: 1,
    })
    .lean();

  res.json(schools);
});

/**
 * ======================================================
 * @desc    Get Active Schools
 * @route   GET /api/schools/active
 * @access  Public
 *
 * Optional query parameters:
 *   ?state=Tamil Nadu
 *   ?city=Coimbatore
 * ======================================================
 */
const getActiveSchools = asyncHandler(async (req, res) => {
  const { state, city } = req.query;

  const query = {
    isActive: true,
  };

  if (typeof state === "string" && state.trim()) {
    query.state = new RegExp(
      `^${escapeRegex(state.trim())}$`,
      "i",
    );
  }

  if (typeof city === "string" && city.trim()) {
    query.city = new RegExp(
      `^${escapeRegex(city.trim())}$`,
      "i",
    );
  }

  const schools = await School.find(query)
    .select("name code slug state city")
    .collation({
      locale: "en",
      strength: 2,
    })
    .sort({
      state: 1,
      city: 1,
      name: 1,
    })
    .lean();

  res.json(schools);
});

/**
 * ======================================================
 * @desc    Get School By Id
 * @route   GET /api/schools/:id
 * @access  SUPER_ADMIN / School Users
 * ======================================================
 */
const getSchoolById = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id)
    .populate("createdBy", "name email phone role")
    .lean();

  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }

  if (req.user.role !== "SUPER_ADMIN") {
    if (
      !req.schoolId ||
      req.schoolId.toString() !== school._id.toString()
    ) {
      res.status(403);
      throw new Error(
        "You are not authorized to access this school",
      );
    }
  }

  res.json(school);
});

/**
 * ======================================================
 * @desc    Get School By Slug
 * @route   GET /api/schools/slug/:slug
 * @access  Public
 * ======================================================
 */
const getSchoolBySlug = asyncHandler(async (req, res) => {
  const normalizedSlug = req.params.slug
    ?.trim()
    .toLowerCase();

  if (!normalizedSlug) {
    res.status(400);
    throw new Error("School slug is required");
  }

  const school = await School.findOne({
    slug: normalizedSlug,
    isActive: true,
  })
    .select(
      "name code slug address state city contactDetails configuration isActive",
    )
    .lean();

  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }

  res.json(school);
});

/**
 * ======================================================
 * @desc    Get Logged-in User's School
 * @route   GET /api/schools/my-school
 * @access  Authenticated Users
 * ======================================================
 */
const getMySchool = asyncHandler(async (req, res) => {
  if (!req.schoolId) {
    res.status(400);
    throw new Error(
      "User is not associated with a school",
    );
  }

  const school = await School.findById(req.schoolId)
    .populate("createdBy", "name email phone role")
    .lean();

  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }

  res.json(school);
});

/**
 * ======================================================
 * @desc    Update School
 * @route   PUT /api/schools/:id
 * @access  SUPER_ADMIN
 * ======================================================
 */
const updateSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }

  // Update school code
  if (req.body.code !== undefined) {
    if (typeof req.body.code !== "string") {
      res.status(400);
      throw new Error("School code must be a string");
    }

    const normalizedCode = req.body.code
      .trim()
      .toUpperCase();

    if (!normalizedCode) {
      res.status(400);
      throw new Error("School code cannot be empty");
    }

    if (normalizedCode !== school.code) {
      const codeExists = await School.findOne({
        code: normalizedCode,
        _id: { $ne: school._id },
      });

      if (codeExists) {
        res.status(400);
        throw new Error("School code already exists");
      }

      school.code = normalizedCode;
    }
  }

  // Update school name
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== "string") {
      res.status(400);
      throw new Error("School name must be a string");
    }

    const normalizedName = req.body.name.trim();

    if (!normalizedName) {
      res.status(400);
      throw new Error("School name cannot be empty");
    }

    school.name = normalizedName;
  }

  // Update school slug
  if (req.body.slug !== undefined) {
    if (typeof req.body.slug !== "string") {
      res.status(400);
      throw new Error("School slug must be a string");
    }

    const normalizedSlug = generateSlug(req.body.slug);

    if (!normalizedSlug) {
      res.status(400);
      throw new Error("School slug cannot be empty");
    }

    if (normalizedSlug !== school.slug) {
      const slugExists = await School.findOne({
        slug: normalizedSlug,
        _id: { $ne: school._id },
      });

      if (slugExists) {
        res.status(400);
        throw new Error("School slug already exists");
      }

      school.slug = normalizedSlug;
    }
  }

  // Update address
  if (req.body.address !== undefined) {
    school.address =
      typeof req.body.address === "string"
        ? req.body.address.trim()
        : req.body.address;
  }

  // Update state
  if (req.body.state !== undefined) {
    if (typeof req.body.state !== "string") {
      res.status(400);
      throw new Error("State must be a string");
    }

    school.state = req.body.state.trim() || undefined;
  }

  // Update city
  if (req.body.city !== undefined) {
    if (typeof req.body.city !== "string") {
      res.status(400);
      throw new Error("City must be a string");
    }

    school.city = req.body.city.trim() || undefined;
  }

  // Update contact details
  if (req.body.contactDetails !== undefined) {
    if (
      !req.body.contactDetails ||
      typeof req.body.contactDetails !== "object" ||
      Array.isArray(req.body.contactDetails)
    ) {
      res.status(400);
      throw new Error("Contact details must be an object");
    }

    const current = school.contactDetails?.toObject?.() || {};

    school.contactDetails = {
      ...current,
      ...req.body.contactDetails,
    };
  }

  // Update configuration
  if (req.body.configuration !== undefined) {
    if (
      !req.body.configuration ||
      typeof req.body.configuration !== "object" ||
      Array.isArray(req.body.configuration)
    ) {
      res.status(400);
      throw new Error("Configuration must be an object");
    }

    const current = school.configuration?.toObject?.() || {};

    school.configuration = {
      ...current,
      ...req.body.configuration,
    };
  }

  // Update status
  if (req.body.isActive !== undefined) {
    if (typeof req.body.isActive !== "boolean") {
      res.status(400);
      throw new Error("isActive must be a boolean value");
    }

    school.isActive = req.body.isActive;
  }

  try {
    const updatedSchool = await school.save();

    await updatedSchool.populate(
      "createdBy",
      "name email phone role",
    );

    res.json(updatedSchool);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("School code or slug already exists");
    }

    throw error;
  }
});

/**
 * ======================================================
 * @desc    Delete School
 * @route   DELETE /api/schools/:id
 * @access  SUPER_ADMIN
 * ======================================================
 */
const deleteSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }

  // Do not delete the reserved Super Admin School.
  // Adjust this slug to match your actual reserved school slug.
  if (school.slug === "super-admin-school") {
    res.status(400);
    throw new Error(
      "The Super Admin School cannot be deleted",
    );
  }

  const userCount = await User.countDocuments({
    school: school._id,
  });

  if (userCount > 0) {
    res.status(400);
    throw new Error(
      "Cannot delete school because users are associated with it",
    );
  }

  await school.deleteOne();

  res.json({
    message: "School deleted successfully",
  });
});

/**
 * ======================================================
 * @desc    Activate / Deactivate School
 * @route   PATCH /api/schools/:id/status
 * @access  SUPER_ADMIN
 * ======================================================
 */
const updateSchoolStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    res.status(400);
    throw new Error("isActive must be a boolean value");
  }

  const school = await School.findById(req.params.id);

  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }

  // Do not deactivate the reserved Super Admin School.
  if (
    school.slug === "super-admin-school" &&
    !isActive
  ) {
    res.status(400);
    throw new Error(
      "The Super Admin School cannot be deactivated",
    );
  }

  school.isActive = isActive;

  const updatedSchool = await school.save();

  await updatedSchool.populate(
    "createdBy",
    "name email phone role",
  );

  res.json(updatedSchool);
});

/**
 * ======================================================
 * @desc    Get School Users
 * @route   GET /api/schools/:id/users
 * @access  SUPER_ADMIN / School Admin
 * ======================================================
 */
const getSchoolUsers = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }

  if (req.user.role !== "SUPER_ADMIN") {
    if (
      !req.schoolId ||
      req.schoolId.toString() !== school._id.toString()
    ) {
      res.status(403);
      throw new Error(
        "You are not authorized to access this school's users",
      );
    }
  }

  const users = await User.find({
    school: school._id,
  })
    .select("-password")
    .populate("school", "name code slug state city")
    .sort({ name: 1 })
    .lean();

  res.json(users);
});

/**
 * ======================================================
 * EXPORTS
 * ======================================================
 */
export {
  createSchool,
  getSchools,
  getActiveSchools,
  getSchoolById,
  getSchoolBySlug,
  getMySchool,
  updateSchool,
  deleteSchool,
  updateSchoolStatus,
  getSchoolUsers,
};