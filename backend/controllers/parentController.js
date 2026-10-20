import asyncHandler from "../middleware/asyncHandler.js";

import Parent from "../models/parentModel.js";
import User from "../models/userModel.js";
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
  Create Parent
*/
export const createParent = asyncHandler(async (req, res) => {
  const {
    user,
    school: requestedSchool,
  } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User is required");
  }

  const school = getUserSchool(req, requestedSchool);

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

  const parentUser = await User.findById(user);

  if (!parentUser) {
    res.status(404);
    throw new Error("User not found");
  }

  if (parentUser.role !== "PARENT") {
    res.status(400);
    throw new Error("Selected user must have PARENT role");
  }

  if (!parentUser.school) {
    res.status(400);
    throw new Error("Parent user must belong to a school");
  }

  if (
    parentUser.school.toString() !== school.toString()
  ) {
    res.status(400);
    throw new Error(
      "User does not belong to the selected school",
    );
  }

  const existingParent = await Parent.findOne({
    user,
  });

  if (existingParent) {
    res.status(400);
    throw new Error(
      "Parent profile already exists for this user",
    );
  }

  const parent = await Parent.create({
    user,
    school,
  });

  const populatedParent = await Parent.findById(parent._id)
    .populate(
      "user",
      "name email phone role isActive",
    )
    .populate(
      "school",
      "name code",
    );

  res.status(201).json(populatedParent);
});


/*
  Get Parents
*/
export const getParents = asyncHandler(async (req, res) => {
  const {
    school: requestedSchool,
    isActive,
  } = req.query;

  const school = getUserSchool(req, requestedSchool);

  const filter = {};

  if (school) {
    filter.school = school;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const parents = await Parent.find(filter)
    .populate(
      "user",
      "name email phone role isActive",
    )
    .populate(
      "school",
      "name code",
    )
    .sort({
      createdAt: -1,
    });

  res.status(200).json(parents);
});


/*
  Get Parent by ID
*/
export const getParentById = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id)
    .populate(
      "user",
      "name email phone role isActive",
    )
    .populate(
      "school",
      "name code",
    );

  if (!parent) {
    res.status(404);
    throw new Error("Parent not found");
  }

  const userSchool = getUserSchool(req);

  if (
    userSchool &&
    parent.school._id.toString() !==
      userSchool.toString()
  ) {
    res.status(403);
    throw new Error(
      "Not authorized to access this parent",
    );
  }

  res.status(200).json(parent);
});


/*
  Get Parent by User ID
*/
export const getParentByUser = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({
    user: req.params.userId,
  })
    .populate(
      "user",
      "name email phone role isActive",
    )
    .populate(
      "school",
      "name code",
    );

  if (!parent) {
    res.status(404);
    throw new Error("Parent not found");
  }

  const userSchool = getUserSchool(req);

  if (
    userSchool &&
    parent.school._id.toString() !==
      userSchool.toString()
  ) {
    res.status(403);
    throw new Error(
      "Not authorized to access this parent",
    );
  }

  res.status(200).json(parent);
});


/*
  Get My Parent Profile
*/
export const getMyParentProfile = asyncHandler(async (req, res) => {
  const userSchool = getUserSchool(req);

  const filter = {
    user: req.user._id,
  };

  if (userSchool) {
    filter.school = userSchool;
  }

  const parent = await Parent.findOne(filter)
    .populate(
      "user",
      "name email phone role isActive",
    )
    .populate(
      "school",
      "name code",
    );

  if (!parent) {
    res.status(404);
    throw new Error("Parent profile not found");
  }

  res.status(200).json(parent);
});


/*
  Update Parent
*/
export const updateParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id);

  if (!parent) {
    res.status(404);
    throw new Error("Parent not found");
  }

  const userSchool = getUserSchool(req);

  if (
    userSchool &&
    parent.school.toString() !==
      userSchool.toString()
  ) {
    res.status(403);
    throw new Error(
      "Not authorized to update this parent",
    );
  }

  const {
    user,
    isActive,
  } = req.body;

  /*
    Update associated User if requested.
  */
  if (user !== undefined) {
    const parentUser = await User.findById(user);

    if (!parentUser) {
      res.status(404);
      throw new Error("User not found");
    }

    if (parentUser.role !== "PARENT") {
      res.status(400);
      throw new Error(
        "Selected user must have PARENT role",
      );
    }

    if (!parentUser.school) {
      res.status(400);
      throw new Error(
        "Parent user must belong to a school",
      );
    }

    if (
      parentUser.school.toString() !==
      parent.school.toString()
    ) {
      res.status(400);
      throw new Error(
        "User does not belong to this school",
      );
    }

    if (
      parentUser._id.toString() !==
      parent.user.toString()
    ) {
      const existingParent = await Parent.findOne({
        user,
        _id: {
          $ne: parent._id,
        },
      });

      if (existingParent) {
        res.status(400);
        throw new Error(
          "Parent profile already exists for this user",
        );
      }
    }

    parent.user = user;
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be true or false",
      );
    }

    parent.isActive = isActive;
  }

  const updatedParent = await parent.save();

  const populatedParent = await Parent.findById(
    updatedParent._id,
  )
    .populate(
      "user",
      "name email phone role isActive",
    )
    .populate(
      "school",
      "name code",
    );

  res.status(200).json(populatedParent);
});


/*
  Update Parent Status
*/
export const updateParentStatus = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id);

  if (!parent) {
    res.status(404);
    throw new Error("Parent not found");
  }

  const userSchool = getUserSchool(req);

  if (
    userSchool &&
    parent.school.toString() !==
      userSchool.toString()
  ) {
    res.status(403);
    throw new Error(
      "Not authorized to update this parent",
    );
  }

  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    res.status(400);
    throw new Error(
      "isActive must be true or false",
    );
  }

  parent.isActive = isActive;

  await parent.save();

  const populatedParent = await Parent.findById(
    parent._id,
  )
    .populate(
      "user",
      "name email phone role isActive",
    )
    .populate(
      "school",
      "name code",
    );

  res.status(200).json(populatedParent);
});


/*
  Delete Parent
*/
export const deleteParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id);

  if (!parent) {
    res.status(404);
    throw new Error("Parent not found");
  }

  const userSchool = getUserSchool(req);

  if (
    userSchool &&
    parent.school.toString() !==
      userSchool.toString()
  ) {
    res.status(403);
    throw new Error(
      "Not authorized to delete this parent",
    );
  }

  await parent.deleteOne();

  res.status(200).json({
    message: "Parent profile deleted successfully",
  });
});