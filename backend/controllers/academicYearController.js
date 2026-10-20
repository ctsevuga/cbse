import asyncHandler from "../middleware/asyncHandler.js";

import AcademicYear from "../models/academicYearModel.js";
import School from "../models/schoolModel.js";

/**
 * ======================================================
 * @desc    Create Academic Year
 * @route   POST /api/academic-years
 * @access  Admin
 * ======================================================
 */
const createAcademicYear = asyncHandler(async (req, res) => {
  const {
    school,
    name,
    startDate,
    endDate,
    isCurrent,
    isActive,
  } = req.body;

  /*
   * SUPER_ADMIN can specify the school.
   *
   * Other school users MUST use the school attached
   * to their authenticated user.
   *
   * Never trust req.body.school for school users.
   */
  const schoolId =
    req.user.role === "SUPER_ADMIN"
      ? school
      : req.schoolId;

  if (!schoolId) {
    res.status(400);
    throw new Error("School is required");
  }

  if (!name || !startDate || !endDate) {
    res.status(400);
    throw new Error(
      "Name, start date and end date are required",
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime())) {
    res.status(400);
    throw new Error("Invalid start date");
  }

  if (Number.isNaN(end.getTime())) {
    res.status(400);
    throw new Error("Invalid end date");
  }

  if (start >= end) {
    res.status(400);
    throw new Error(
      "End date must be after start date",
    );
  }

  /*
   * Verify that the selected school exists and is active.
   *
   * This is especially important for SUPER_ADMIN because
   * the school comes from the request body.
   */
  const schoolExists = await School.findById(schoolId);

  if (!schoolExists) {
    res.status(404);
    throw new Error("School not found");
  }

  if (!schoolExists.isActive) {
    res.status(400);
    throw new Error(
      "Cannot create academic year for an inactive school",
    );
  }

  /*
   * Prevent duplicate academic year names
   * within the same school.
   */
  const existingAcademicYear =
    await AcademicYear.findOne({
      school: schoolId,
      name: name.trim(),
    });

  if (existingAcademicYear) {
    res.status(400);
    throw new Error(
      "Academic year already exists for this school",
    );
  }

  /*
   * If this academic year is current, remove the
   * current status from all other academic years
   * belonging to the same school.
   */
  if (isCurrent === true) {
    await AcademicYear.updateMany(
      {
        school: schoolId,
        isCurrent: true,
      },
      {
        $set: {
          isCurrent: false,
        },
      },
    );
  }

  const academicYear =
    await AcademicYear.create({
      school: schoolId,
      name: name.trim(),
      startDate: start,
      endDate: end,
      isCurrent: isCurrent === true,
      isActive:
        isActive !== undefined
          ? isActive
          : true,
    });

  const createdAcademicYear =
    await AcademicYear.findById(
      academicYear._id,
    ).populate("school", "name code");

  res.status(201).json(createdAcademicYear);
});

/**
 * ======================================================
 * @desc    Get All Academic Years
 * @route   GET /api/academic-years
 * @access  Private
 * ======================================================
 */
const getAcademicYears = asyncHandler(async (req, res) => {
  const query = {};

  /*
   * SUPER_ADMIN can view academic years across
   * all schools.
   *
   * Other users can ONLY view academic years
   * belonging to their authenticated school.
   */
  if (req.user.role !== "SUPER_ADMIN") {
    if (!req.schoolId) {
      res.status(400);
      throw new Error(
        "User is not associated with a school",
      );
    }

    query.school = req.schoolId;
  }

  /*
   * Optional school filter for SUPER_ADMIN.
   */
  if (
    req.user.role === "SUPER_ADMIN" &&
    req.query.school
  ) {
    query.school = req.query.school;
  }

  /*
   * Optional active filter.
   */
  if (req.query.isActive !== undefined) {
    query.isActive =
      req.query.isActive === "true";
  }

  /*
   * Optional current filter.
   */
  if (req.query.isCurrent !== undefined) {
    query.isCurrent =
      req.query.isCurrent === "true";
  }

  const academicYears =
    await AcademicYear.find(query)
      .populate("school", "name code")
      .sort({
        startDate: -1,
        name: 1,
      })
      .lean();

  res.json(academicYears);
});

/**
 * ======================================================
 * @desc    Get Current Academic Year
 * @route   GET /api/academic-years/current
 * @access  Private
 * ======================================================
 *
 * This endpoint is school-context based.
 *
 * SUPER_ADMIN has no default school context, so
 * req.schoolId will be null for SUPER_ADMIN.
 *
 * If SUPER_ADMIN needs to use this endpoint later,
 * it should accept a school query parameter.
 */
const getCurrentAcademicYear = asyncHandler(
  async (req, res) => {
    if (!req.schoolId) {
      res.status(400);
      throw new Error(
        "User is not associated with a school",
      );
    }

    const academicYear =
      await AcademicYear.findOne({
        school: req.schoolId,
        isCurrent: true,
        isActive: true,
      })
        .populate("school", "name code")
        .lean();

    if (!academicYear) {
      res.status(404);
      throw new Error(
        "Current academic year not found",
      );
    }

    res.json(academicYear);
  },
);

/**
 * ======================================================
 * @desc    Get Academic Year By Id
 * @route   GET /api/academic-years/:id
 * @access  Private
 * ======================================================
 */
const getAcademicYearById = asyncHandler(
  async (req, res) => {
    const query = {
      _id: req.params.id,
    };

    /*
     * SUPER_ADMIN can access any school.
     *
     * Other users are restricted to their own school.
     */
    if (req.user.role !== "SUPER_ADMIN") {
      if (!req.schoolId) {
        res.status(400);
        throw new Error(
          "User is not associated with a school",
        );
      }

      query.school = req.schoolId;
    }

    const academicYear =
      await AcademicYear.findOne(query)
        .populate("school", "name code")
        .lean();

    if (!academicYear) {
      res.status(404);
      throw new Error(
        "Academic year not found",
      );
    }

    res.json(academicYear);
  },
);

/**
 * ======================================================
 * @desc    Update Academic Year
 * @route   PUT /api/academic-years/:id
 * @access  Admin
 * ======================================================
 */
const updateAcademicYear = asyncHandler(
  async (req, res) => {
    const query = {
      _id: req.params.id,
    };

    /*
     * SUPER_ADMIN can update across schools.
     *
     * Other users can only update their own school's
     * academic years.
     */
    if (req.user.role !== "SUPER_ADMIN") {
      if (!req.schoolId) {
        res.status(400);
        throw new Error(
          "User is not associated with a school",
        );
      }

      query.school = req.schoolId;
    }

    const academicYear =
      await AcademicYear.findOne(query);

    if (!academicYear) {
      res.status(404);
      throw new Error(
        "Academic year not found",
      );
    }

    const newName =
      req.body.name !== undefined
        ? req.body.name.trim()
        : academicYear.name;

    const newStartDate =
      req.body.startDate !== undefined
        ? new Date(req.body.startDate)
        : academicYear.startDate;

    const newEndDate =
      req.body.endDate !== undefined
        ? new Date(req.body.endDate)
        : academicYear.endDate;

    if (!newName) {
      res.status(400);
      throw new Error(
        "Academic year name is required",
      );
    }

    if (Number.isNaN(newStartDate.getTime())) {
      res.status(400);
      throw new Error("Invalid start date");
    }

    if (Number.isNaN(newEndDate.getTime())) {
      res.status(400);
      throw new Error("Invalid end date");
    }

    if (newStartDate >= newEndDate) {
      res.status(400);
      throw new Error(
        "End date must be after start date",
      );
    }

    /*
     * Check duplicate name within the same school.
     */
    if (newName !== academicYear.name) {
      const nameExists =
        await AcademicYear.findOne({
          school: academicYear.school,
          name: newName,
          _id: {
            $ne: academicYear._id,
          },
        });

      if (nameExists) {
        res.status(400);
        throw new Error(
          "Academic year already exists for this school",
        );
      }
    }

    academicYear.name = newName;
    academicYear.startDate = newStartDate;
    academicYear.endDate = newEndDate;

    /*
     * If isCurrent is explicitly supplied, update it.
     */
    if (req.body.isCurrent !== undefined) {
      academicYear.isCurrent =
        req.body.isCurrent === true;
    }

    /*
     * If isActive is explicitly supplied, update it.
     */
    if (req.body.isActive !== undefined) {
      academicYear.isActive =
        req.body.isActive === true;
    }

    /*
     * A current academic year must be active.
     */
    if (
      academicYear.isCurrent &&
      !academicYear.isActive
    ) {
      res.status(400);
      throw new Error(
        "An inactive academic year cannot be current",
      );
    }

    /*
     * If this academic year is being made current,
     * remove current status from all other years
     * belonging to the same school.
     */
    if (academicYear.isCurrent) {
      await AcademicYear.updateMany(
        {
          school: academicYear.school,
          _id: {
            $ne: academicYear._id,
          },
          isCurrent: true,
        },
        {
          $set: {
            isCurrent: false,
          },
        },
      );
    }

    const updatedAcademicYear =
      await academicYear.save();

    await updatedAcademicYear.populate(
      "school",
      "name code",
    );

    res.json(updatedAcademicYear);
  },
);

/**
 * ======================================================
 * @desc    Set Current Academic Year
 * @route   PATCH /api/academic-years/:id/current
 * @access  Admin
 * ======================================================
 */
const setCurrentAcademicYear = asyncHandler(
  async (req, res) => {
    const query = {
      _id: req.params.id,
    };

    /*
     * SUPER_ADMIN can access any school.
     *
     * Other users are restricted to their own school.
     */
    if (req.user.role !== "SUPER_ADMIN") {
      if (!req.schoolId) {
        res.status(400);
        throw new Error(
          "User is not associated with a school",
        );
      }

      query.school = req.schoolId;
    }

    const academicYear =
      await AcademicYear.findOne(query);

    if (!academicYear) {
      res.status(404);
      throw new Error(
        "Academic year not found",
      );
    }

    if (!academicYear.isActive) {
      res.status(400);
      throw new Error(
        "An inactive academic year cannot be current",
      );
    }

    /*
     * Remove current status from all academic years
     * belonging to this school.
     */
    await AcademicYear.updateMany(
      {
        school: academicYear.school,
        _id: {
          $ne: academicYear._id,
        },
        isCurrent: true,
      },
      {
        $set: {
          isCurrent: false,
        },
      },
    );

    academicYear.isCurrent = true;

    const updatedAcademicYear =
      await academicYear.save();

    await updatedAcademicYear.populate(
      "school",
      "name code",
    );

    res.json(updatedAcademicYear);
  },
);

/**
 * ======================================================
 * @desc    Activate / Deactivate Academic Year
 * @route   PATCH /api/academic-years/:id/status
 * @access  Admin
 * ======================================================
 */
const updateAcademicYearStatus =
  asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be a boolean value",
      );
    }

    const query = {
      _id: req.params.id,
    };

    /*
     * SUPER_ADMIN can access any school.
     *
     * Other users are restricted to their own school.
     */
    if (req.user.role !== "SUPER_ADMIN") {
      if (!req.schoolId) {
        res.status(400);
        throw new Error(
          "User is not associated with a school",
        );
      }

      query.school = req.schoolId;
    }

    const academicYear =
      await AcademicYear.findOne(query);

    if (!academicYear) {
      res.status(404);
      throw new Error(
        "Academic year not found",
      );
    }

    /*
     * Do not allow the current academic year
     * to become inactive.
     */
    if (!isActive && academicYear.isCurrent) {
      res.status(400);
      throw new Error(
        "Current academic year cannot be deactivated. Set another academic year as current first.",
      );
    }

    academicYear.isActive = isActive;

    const updatedAcademicYear =
      await academicYear.save();

    await updatedAcademicYear.populate(
      "school",
      "name code",
    );

    res.json(updatedAcademicYear);
  });

/**
 * ======================================================
 * @desc    Delete Academic Year
 * @route   DELETE /api/academic-years/:id
 * @access  Admin
 * ======================================================
 */
const deleteAcademicYear = asyncHandler(
  async (req, res) => {
    const query = {
      _id: req.params.id,
    };

    /*
     * SUPER_ADMIN can access any school.
     *
     * Other users are restricted to their own school.
     */
    if (req.user.role !== "SUPER_ADMIN") {
      if (!req.schoolId) {
        res.status(400);
        throw new Error(
          "User is not associated with a school",
        );
      }

      query.school = req.schoolId;
    }

    const academicYear =
      await AcademicYear.findOne(query);

    if (!academicYear) {
      res.status(404);
      throw new Error(
        "Academic year not found",
      );
    }

    if (academicYear.isCurrent) {
      res.status(400);
      throw new Error(
        "Current academic year cannot be deleted. Set another academic year as current first.",
      );
    }

    await academicYear.deleteOne();

    res.json({
      message:
        "Academic year deleted successfully",
    });
  },
);

/**
 * ======================================================
 * EXPORTS
 * ======================================================
 */

export {
  createAcademicYear,
  getAcademicYears,
  getCurrentAcademicYear,
  getAcademicYearById,
  updateAcademicYear,
  setCurrentAcademicYear,
  updateAcademicYearStatus,
  deleteAcademicYear,
};
