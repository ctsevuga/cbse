import asyncHandler from "../middleware/asyncHandler.js";

import Class from "../models/classModel.js";
import School from "../models/schoolModel.js";


/*
  Get school for the request.

  SUPER_ADMIN can specify a school.
  Other users can only work with their own school.
*/
const getUserSchool = (req, requestedSchool) => {
  if (req.user.role === "SUPER_ADMIN") {
    return requestedSchool || null;
  }

  return req.schoolId;
};


/*
  Create Class
*/
export const createClass = asyncHandler(async (req, res) => {
  const {
    school: requestedSchool,
    name,
    code,
  } = req.body;

  if (!name || !name.trim() || !code || !code.trim()) {
    res.status(400);
    throw new Error("Class name and code are required");
  }

  const school = getUserSchool(
    req,
    requestedSchool,
  );

  if (!school) {
    res.status(400);
    throw new Error("School is required");
  }

  const schoolExists = await School.findById(school);

  if (!schoolExists) {
    res.status(404);
    throw new Error("School not found");
  }

  if (!schoolExists.isActive) {
    res.status(400);
    throw new Error("School is inactive");
  }

  const normalizedCode = code.trim().toUpperCase();

  const existingClass = await Class.findOne({
    school: schoolExists._id,
    code: normalizedCode,
  });

  if (existingClass) {
    res.status(400);
    throw new Error(
      "Class code already exists in this school",
    );
  }

  const newClass = await Class.create({
    school: schoolExists._id,
    name: name.trim(),
    code: normalizedCode,
  });

  const populatedClass = await Class.findById(
    newClass._id,
  ).populate(
    "school",
    "name code",
  );

  res.status(201).json(populatedClass);
});


/*
  Get Classes
*/
export const getClasses = asyncHandler(async (req, res) => {
  const {
    school: requestedSchool,
    isActive,
  } = req.query;

  const school = getUserSchool(
    req,
    requestedSchool,
  );

  const filter = {};

  if (school) {
    filter.school = school;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const classes = await Class.find(filter)
    .populate(
      "school",
      "name code",
    )
    .sort({
      code: 1,
    });

  res.status(200).json(classes);
});


/*
  Get Class by ID
*/
export const getClassById = asyncHandler(async (req, res) => {
  const classRecord = await Class.findById(
    req.params.id,
  ).populate(
    "school",
    "name code",
  );

  if (!classRecord) {
    res.status(404);
    throw new Error("Class not found");
  }

  const schoolId = getUserSchool(req);

  if (
    schoolId &&
    classRecord.school._id.toString() !==
      schoolId.toString()
  ) {
    res.status(403);
    throw new Error(
      "Not authorized to access this class",
    );
  }

  res.status(200).json(classRecord);
});


/*
  Get Classes by School
*/
export const getClassesBySchool = asyncHandler(
  async (req, res) => {
    const { schoolId } = req.params;

    const school = await School.findById(schoolId);

    if (!school) {
      res.status(404);
      throw new Error("School not found");
    }

    const userSchool = getUserSchool(req);

    if (
      userSchool &&
      userSchool.toString() !== schoolId.toString()
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this school",
      );
    }

    const classes = await Class.find({
      school: school._id,
    })
      .populate(
        "school",
        "name code",
      )
      .sort({
        code: 1,
      });

    res.status(200).json(classes);
  },
);


/*
  Update Class
*/
export const updateClass = asyncHandler(async (req, res) => {
  const classRecord = await Class.findById(
    req.params.id,
  );

  if (!classRecord) {
    res.status(404);
    throw new Error("Class not found");
  }

  const schoolId = getUserSchool(req);

  if (
    schoolId &&
    classRecord.school.toString() !==
      schoolId.toString()
  ) {
    res.status(403);
    throw new Error(
      "Not authorized to update this class",
    );
  }

  const {
    name,
    code,
    isActive,
  } = req.body;

  if (name !== undefined) {
    const normalizedName = name.trim();

    if (!normalizedName) {
      res.status(400);
      throw new Error("Class name cannot be empty");
    }

    classRecord.name = normalizedName;
  }

  if (code !== undefined) {
    const normalizedCode =
      code.trim().toUpperCase();

    if (!normalizedCode) {
      res.status(400);
      throw new Error("Class code cannot be empty");
    }

    const existingClass = await Class.findOne({
      school: classRecord.school,
      code: normalizedCode,
      _id: {
        $ne: classRecord._id,
      },
    });

    if (existingClass) {
      res.status(400);
      throw new Error(
        "Class code already exists in this school",
      );
    }

    classRecord.code = normalizedCode;
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be true or false",
      );
    }

    classRecord.isActive = isActive;
  }

  const updatedClass = await classRecord.save();

  const populatedClass = await Class.findById(
    updatedClass._id,
  ).populate(
    "school",
    "name code",
  );

  res.status(200).json(populatedClass);
});


/*
  Update Class Status
*/
export const updateClassStatus = asyncHandler(
  async (req, res) => {
    const classRecord = await Class.findById(
      req.params.id,
    );

    if (!classRecord) {
      res.status(404);
      throw new Error("Class not found");
    }

    const schoolId = getUserSchool(req);

    if (
      schoolId &&
      classRecord.school.toString() !==
        schoolId.toString()
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to update this class",
      );
    }

    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be true or false",
      );
    }

    classRecord.isActive = isActive;

    await classRecord.save();

    const populatedClass = await Class.findById(
      classRecord._id,
    ).populate(
      "school",
      "name code",
    );

    res.status(200).json(populatedClass);
  },
);


/*
  Delete Class
*/
export const deleteClass = asyncHandler(async (req, res) => {
  const classRecord = await Class.findById(
    req.params.id,
  );

  if (!classRecord) {
    res.status(404);
    throw new Error("Class not found");
  }

  const schoolId = getUserSchool(req);

  if (
    schoolId &&
    classRecord.school.toString() !==
      schoolId.toString()
  ) {
    res.status(403);
    throw new Error(
      "Not authorized to delete this class",
    );
  }

  await classRecord.deleteOne();

  res.status(200).json({
    message: "Class deleted successfully",
  });
});