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
      employeeCode,
      qualification,
    } = req.body;

    // ============================================
    // 1. VALIDATE REQUIRED FIELDS
    // ============================================

    if (!user || !employeeCode) {
      res.status(400);
      throw new Error(
        "User and employee code are required",
      );
    }

    // ============================================
    // 2. GET SCHOOL FROM RESOLVE SCHOOL MIDDLEWARE
    // ============================================

    const school = req.schoolId;

    if (!school || !req.school) {
      res.status(400);
      throw new Error(
        "School context is missing. Please authenticate and resolve school.",
      );
    }

    if (!req.school.isActive) {
      res.status(400);
      throw new Error("School is inactive");
    }

    // ============================================
    // 3. VALIDATE TEACHER USER
    // ============================================

    const teacherUser = await User.findById(user);

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

    // ============================================
    // 4. VALIDATE USER SCHOOL
    // ============================================

    const teacherUserSchool =
      teacherUser.school?._id ??
      teacherUser.school ??
      teacherUser.schoolId;

    if (
      !teacherUserSchool ||
      String(teacherUserSchool) !== String(school)
    ) {
      res.status(400);
      throw new Error(
        "User does not belong to the logged-in user's school",
      );
    }

    // ============================================
    // 5. CHECK EXISTING TEACHER PROFILE
    // ============================================

    const existingTeacher = await Teacher.findOne({
      user,
    });

    if (existingTeacher) {
      res.status(400);
      throw new Error(
        "Teacher profile already exists for this user",
      );
    }

    // ============================================
    // 6. NORMALIZE EMPLOYEE CODE
    // ============================================

    const normalizedEmployeeCode =
      employeeCode.trim().toUpperCase();

    if (!normalizedEmployeeCode) {
      res.status(400);
      throw new Error(
        "Employee code cannot be empty",
      );
    }

    // ============================================
    // 7. CHECK EMPLOYEE CODE DUPLICATION
    // ============================================

    const existingEmployeeCode =
      await Teacher.findOne({
        school,
        employeeCode: normalizedEmployeeCode,
      });

    if (existingEmployeeCode) {
      res.status(400);
      throw new Error(
        "Employee code already exists in this school",
      );
    }

    // ============================================
    // 8. CREATE TEACHER
    // ============================================

    const teacher = await Teacher.create({
      user,
      school,
      employeeCode: normalizedEmployeeCode,
      qualification,
    });

    // ============================================
    // 9. POPULATE RESPONSE
    // ============================================

    const populatedTeacher =
      await Teacher.findById(teacher._id)
        .populate(
          "user",
          "name email phone role isActive",
        )
        .populate(
          "school",
          "name code",
        );

    res.status(201).json(populatedTeacher);
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