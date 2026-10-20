import asyncHandler from "../middleware/asyncHandler.js";

import Teacher from "../models/teacherModel.js";
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
  Create Teacher
*/
export const createTeacher = asyncHandler(
  async (req, res) => {
    const {
      user,
      school: requestedSchool,
      employeeCode,
      qualification,
    } = req.body;

    if (!user || !employeeCode) {
      res.status(400);
      throw new Error(
        "User and employee code are required",
      );
    }

    const school = getUserSchool(
      req,
      requestedSchool,
    );

    if (!school) {
      res.status(400);
      throw new Error("School is required");
    }

    const schoolExists =
      await School.findById(school);

    if (!schoolExists) {
      res.status(404);
      throw new Error("School not found");
    }

    if (!schoolExists.isActive) {
      res.status(400);
      throw new Error("School is inactive");
    }

    const teacherUser =
      await User.findById(user);

    if (!teacherUser) {
      res.status(404);
      throw new Error("User not found");
    }

    if (teacherUser.role !== "TEACHER") {
      res.status(400);
      throw new Error(
        "Selected user must have TEACHER role",
      );
    }

    if (
      !teacherUser.school ||
      String(teacherUser.school) !==
        String(school)
    ) {
      res.status(400);
      throw new Error(
        "User does not belong to the selected school",
      );
    }

    const existingTeacher =
      await Teacher.findOne({
        user,
      });

    if (existingTeacher) {
      res.status(400);
      throw new Error(
        "Teacher profile already exists for this user",
      );
    }

    const normalizedEmployeeCode =
      employeeCode
        .trim()
        .toUpperCase();

    if (!normalizedEmployeeCode) {
      res.status(400);
      throw new Error(
        "Employee code cannot be empty",
      );
    }

    const existingEmployeeCode =
      await Teacher.findOne({
        school,
        employeeCode:
          normalizedEmployeeCode,
      });

    if (existingEmployeeCode) {
      res.status(400);
      throw new Error(
        "Employee code already exists in this school",
      );
    }

    const teacher =
      await Teacher.create({
        user,
        school,
        employeeCode:
          normalizedEmployeeCode,
        qualification,
      });

    const populatedTeacher =
      await Teacher.findById(
        teacher._id,
      )
        .populate(
          "user",
          "name email phone role isActive",
        )
        .populate(
          "school",
          "name code",
        );

    res
      .status(201)
      .json(populatedTeacher);
  },
);


/*
  Get Teachers
*/
export const getTeachers =
  asyncHandler(async (req, res) => {
    const {
      school: requestedSchool,
      isActive,
      employeeCode,
    } = req.query;

    const school = getUserSchool(
      req,
      requestedSchool,
    );

    const filter = {};

    if (
      req.user.role ===
      "SUPER_ADMIN"
    ) {
      if (school) {
        filter.school = school;
      }
    } else {
      filter.school = req.schoolId;
    }

    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    if (employeeCode) {
      filter.employeeCode =
        employeeCode
          .trim()
          .toUpperCase();
    }

    const teachers =
      await Teacher.find(filter)
        .populate(
          "user",
          "name email phone role isActive",
        )
        .populate(
          "school",
          "name code",
        )
        .sort({
          employeeCode: 1,
        });

    res.status(200).json(teachers);
  });


/*
  Get Teacher by ID
*/
export const getTeacherById =
  asyncHandler(async (req, res) => {
    const teacher =
      await Teacher.findById(
        req.params.id,
      )
        .populate(
          "user",
          "name email phone role isActive",
        )
        .populate(
          "school",
          "name code",
        );

    if (!teacher) {
      res.status(404);
      throw new Error(
        "Teacher not found",
      );
    }

    if (
      req.user.role !==
        "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        String(teacher.school?._id) !==
          String(req.schoolId)
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this teacher",
      );
    }

    res.status(200).json(teacher);
  });


/*
  Get Teacher by User ID
*/
export const getTeacherByUser =
  asyncHandler(async (req, res) => {
    const teacher =
      await Teacher.findOne({
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

    if (!teacher) {
      res.status(404);
      throw new Error(
        "Teacher not found",
      );
    }

    if (
      req.user.role !==
        "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        String(teacher.school?._id) !==
          String(req.schoolId)
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this teacher",
      );
    }

    res.status(200).json(teacher);
  });


/*
  Get My Teacher Profile
*/
export const getMyTeacherProfile =
  asyncHandler(async (req, res) => {
    if (!req.schoolId) {
      res.status(403);
      throw new Error(
        "Teacher does not belong to a school",
      );
    }

    const teacher =
      await Teacher.findOne({
        user: req.user._id,
        school: req.schoolId,
      })
        .populate(
          "user",
          "name email phone role isActive",
        )
        .populate(
          "school",
          "name code",
        );

    if (!teacher) {
      res.status(404);
      throw new Error(
        "Teacher profile not found",
      );
    }

    res.status(200).json(teacher);
  });


/*
  Update Teacher
*/
export const updateTeacher =
  asyncHandler(async (req, res) => {
    const teacher =
      await Teacher.findById(
        req.params.id,
      );

    if (!teacher) {
      res.status(404);
      throw new Error(
        "Teacher not found",
      );
    }

    if (
      req.user.role !==
        "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        String(teacher.school) !==
          String(req.schoolId)
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to update this teacher",
      );
    }

    const {
      user,
      employeeCode,
      qualification,
      isActive,
    } = req.body;

    /*
      Update associated User if requested.
    */
    if (user !== undefined) {
      const teacherUser =
        await User.findById(user);

      if (!teacherUser) {
        res.status(404);
        throw new Error(
          "User not found",
        );
      }

      if (
        teacherUser.role !==
        "TEACHER"
      ) {
        res.status(400);
        throw new Error(
          "Selected user must have TEACHER role",
        );
      }

      if (
        !teacherUser.school ||
        String(teacherUser.school) !==
          String(teacher.school)
      ) {
        res.status(400);
        throw new Error(
          "User does not belong to this school",
        );
      }

      if (
        String(teacherUser._id) !==
        String(teacher.user)
      ) {
        const existingTeacher =
          await Teacher.findOne({
            user,
            _id: {
              $ne: teacher._id,
            },
          });

        if (existingTeacher) {
          res.status(400);
          throw new Error(
            "Teacher profile already exists for this user",
          );
        }
      }

      teacher.user = user;
    }

    /*
      Update employee code.
    */
    if (
      employeeCode !== undefined
    ) {
      const normalizedEmployeeCode =
        employeeCode
          .trim()
          .toUpperCase();

      if (!normalizedEmployeeCode) {
        res.status(400);
        throw new Error(
          "Employee code cannot be empty",
        );
      }

      const existingEmployeeCode =
        await Teacher.findOne({
          school: teacher.school,
          employeeCode:
            normalizedEmployeeCode,
          _id: {
            $ne: teacher._id,
          },
        });

      if (existingEmployeeCode) {
        res.status(400);
        throw new Error(
          "Employee code already exists in this school",
        );
      }

      teacher.employeeCode =
        normalizedEmployeeCode;
    }

    if (
      qualification !== undefined
    ) {
      teacher.qualification =
        qualification;
    }

    if (isActive !== undefined) {
      teacher.isActive =
        isActive;
    }

    const updatedTeacher =
      await teacher.save();

    const populatedTeacher =
      await Teacher.findById(
        updatedTeacher._id,
      )
        .populate(
          "user",
          "name email phone role isActive",
        )
        .populate(
          "school",
          "name code",
        );

    res
      .status(200)
      .json(populatedTeacher);
  });


/*
  Update Teacher Status
*/
export const updateTeacherStatus =
  asyncHandler(async (req, res) => {
    const teacher =
      await Teacher.findById(
        req.params.id,
      );

    if (!teacher) {
      res.status(404);
      throw new Error(
        "Teacher not found",
      );
    }

    if (
      req.user.role !==
        "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        String(teacher.school) !==
          String(req.schoolId)
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to update this teacher",
      );
    }

    const { isActive } =
      req.body;

    if (
      typeof isActive !==
      "boolean"
    ) {
      res.status(400);
      throw new Error(
        "isActive must be true or false",
      );
    }

    teacher.isActive =
      isActive;

    await teacher.save();

    const populatedTeacher =
      await Teacher.findById(
        teacher._id,
      )
        .populate(
          "user",
          "name email phone role isActive",
        )
        .populate(
          "school",
          "name code",
        );

    res
      .status(200)
      .json(populatedTeacher);
  });


/*
  Delete Teacher
*/
export const deleteTeacher =
  asyncHandler(async (req, res) => {
    const teacher =
      await Teacher.findById(
        req.params.id,
      );

    if (!teacher) {
      res.status(404);
      throw new Error(
        "Teacher not found",
      );
    }

    if (
      req.user.role !==
        "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        String(teacher.school) !==
          String(req.schoolId)
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to delete this teacher",
      );
    }

    await teacher.deleteOne();

    res.status(200).json({
      message:
        "Teacher profile deleted successfully",
    });
  });