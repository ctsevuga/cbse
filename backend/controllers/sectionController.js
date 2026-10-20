import asyncHandler from "../middleware/asyncHandler.js";

import Section from "../models/sectionModel.js";
import School from "../models/schoolModel.js";
import AcademicYear from "../models/academicYearModel.js";
import Class from "../models/classModel.js";
import Teacher from "../models/teacherModel.js";


const getUserSchool = (req, requestedSchool) => {
  if (req.user.role === "SUPER_ADMIN") {
    return requestedSchool || null;
  }

  return req.schoolId;
};


const validateSchool = async (schoolId) => {
  const school = await School.findById(schoolId);

  if (!school) {
    return {
      error: "School not found",
    };
  }

  if (!school.isActive) {
    return {
      error: "School is inactive",
    };
  }

  return {
    school,
  };
};


const validateAcademicYear = async (
  academicYearId,
  schoolId,
) => {
  const academicYear =
    await AcademicYear.findById(academicYearId);

  if (!academicYear) {
    return {
      error: "Academic year not found",
    };
  }

  if (
    !schoolId ||
    academicYear.school.toString() !==
      schoolId.toString()
  ) {
    return {
      error:
        "Academic year does not belong to the selected school",
    };
  }

  if (!academicYear.isActive) {
    return {
      error: "Academic year is inactive",
    };
  }

  return {
    academicYear,
  };
};


const validateClass = async (
  classId,
  schoolId,
) => {
  const classRecord =
    await Class.findById(classId);

  if (!classRecord) {
    return {
      error: "Class not found",
    };
  }

  if (
    !schoolId ||
    classRecord.school.toString() !==
      schoolId.toString()
  ) {
    return {
      error:
        "Class does not belong to the selected school",
    };
  }

  if (!classRecord.isActive) {
    return {
      error: "Class is inactive",
    };
  }

  return {
    classRecord,
  };
};


const validateClassTeacher = async (
  teacherId,
  schoolId,
) => {
  if (!teacherId) {
    return {
      teacher: null,
    };
  }

  const teacher =
    await Teacher.findById(teacherId);

  if (!teacher) {
    return {
      error: "Teacher not found",
    };
  }

  if (
    !schoolId ||
    teacher.school.toString() !==
      schoolId.toString()
  ) {
    return {
      error:
        "Teacher does not belong to the selected school",
    };
  }

  if (!teacher.isActive) {
    return {
      error: "Teacher is inactive",
    };
  }

  return {
    teacher,
  };
};


const validateSectionAccess = (
  req,
  section,
  message,
) => {
  if (req.user.role === "SUPER_ADMIN") {
    return;
  }

  if (
    !req.schoolId ||
    section.school.toString() !==
      req.schoolId.toString()
  ) {
    const error = new Error(
      message || "Not authorized to access this section",
    );

    error.statusCode = 403;
    throw error;
  }
};


const populateSection = (query) =>
  query
    .populate(
      "school",
      "name code",
    )
    .populate(
      "academicYear",
      "name startDate endDate isCurrent",
    )
    .populate(
      "class",
      "name code",
    )
    .populate({
      path: "classTeacher",
      populate: {
        path: "user",
        select:
          "name email phone role isActive",
      },
    });


/*
  Create Section
*/

export const createSection = asyncHandler(
  async (req, res) => {
    const {
      academicYear,
      class: classId,
      name,
      classTeacher,
    } = req.body;

    if (
      !academicYear ||
      !classId ||
      !name
    ) {
      res.status(400);
      throw new Error(
        "Academic year, class and section name are required",
      );
    }

    const school = req.schoolId;

    if (!school) {
      res.status(400);
      throw new Error(
        "School could not be determined for this user",
      );
    }

    const schoolValidation =
      await validateSchool(school);

    if (schoolValidation.error) {
      res.status(400);
      throw new Error(
        schoolValidation.error,
      );
    }

    const academicYearValidation =
      await validateAcademicYear(
        academicYear,
        school,
      );

    if (academicYearValidation.error) {
      res.status(400);
      throw new Error(
        academicYearValidation.error,
      );
    }

    const classValidation =
      await validateClass(
        classId,
        school,
      );

    if (classValidation.error) {
      res.status(400);
      throw new Error(
        classValidation.error,
      );
    }

    const teacherValidation =
      await validateClassTeacher(
        classTeacher,
        school,
      );

    if (teacherValidation.error) {
      res.status(400);
      throw new Error(
        teacherValidation.error,
      );
    }

    const normalizedName =
      name.trim();

    if (!normalizedName) {
      res.status(400);
      throw new Error(
        "Section name cannot be empty",
      );
    }

    const existingSection =
      await Section.findOne({
        school,
        academicYear,
        class: classId,
        name: normalizedName,
      });

    if (existingSection) {
      res.status(400);
      throw new Error(
        "Section already exists for this class and academic year",
      );
    }

    const section =
      await Section.create({
        school,
        academicYear,
        class: classId,
        name: normalizedName,
        classTeacher:
          classTeacher || undefined,
      });

    const populatedSection =
      await populateSection(
        Section.findById(section._id),
      );

    res.status(201).json(
      await populatedSection,
    );
  },
);



/*
  Get Sections
*/
export const getSections = asyncHandler(
  async (req, res) => {
    const {
      school: requestedSchool,
      academicYear,
      class: classId,
      classTeacher,
      isActive,
    } = req.query;

    const school = getUserSchool(
      req,
      requestedSchool,
    );

    const filter = {};

    if (req.user.role === "SUPER_ADMIN") {
      if (school) {
        filter.school = school;
      }
    } else {
      filter.school = req.schoolId;
    }

    if (academicYear) {
      filter.academicYear =
        academicYear;
    }

    if (classId) {
      filter.class = classId;
    }

    if (classTeacher) {
      filter.classTeacher =
        classTeacher;
    }

    if (isActive !== undefined) {
      if (
        isActive !== "true" &&
        isActive !== "false"
      ) {
        res.status(400);
        throw new Error(
          "isActive must be true or false",
        );
      }

      filter.isActive =
        isActive === "true";
    }

    const sections =
      await populateSection(
        Section.find(filter).sort({
          academicYear: 1,
          class: 1,
          name: 1,
        }),
      );

    res.status(200).json(
      await sections,
    );
  },
);


/*
  Get Section by ID
*/
export const getSectionById =
  asyncHandler(async (req, res) => {
    const section =
      await populateSection(
        Section.findById(req.params.id),
      );

    if (!section) {
      res.status(404);
      throw new Error(
        "Section not found",
      );
    }

    validateSectionAccess(
      req,
      section,
      "Not authorized to access this section",
    );

    res.status(200).json(
      section,
    );
  });


/*
  Get Sections by Class
*/
export const getSectionsByClass =
  asyncHandler(async (req, res) => {
    const {
      classId,
    } = req.params;

    const classRecord =
      await Class.findById(
        classId,
      );

    if (!classRecord) {
      res.status(404);
      throw new Error(
        "Class not found",
      );
    }

    if (
      req.user.role !== "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        classRecord.school.toString() !==
          req.schoolId.toString()
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this class",
      );
    }

    const {
      academicYear,
      isActive,
    } = req.query;

    const filter = {
      school: classRecord.school,
      class: classId,
    };

    if (academicYear) {
      const academicYearValidation =
        await validateAcademicYear(
          academicYear,
          classRecord.school,
        );

      if (academicYearValidation.error) {
        res.status(400);
        throw new Error(
          academicYearValidation.error,
        );
      }

      filter.academicYear =
        academicYear;
    }

    if (isActive !== undefined) {
      if (
        isActive !== "true" &&
        isActive !== "false"
      ) {
        res.status(400);
        throw new Error(
          "isActive must be true or false",
        );
      }

      filter.isActive =
        isActive === "true";
    }

    const sections =
      await populateSection(
        Section.find(filter).sort({
          name: 1,
        }),
      );

    res.status(200).json(
      await sections,
    );
  });


/*
  Get Sections by Academic Year
*/
export const getSectionsByAcademicYear =
  asyncHandler(async (req, res) => {
    const {
      academicYearId,
    } = req.params;

    const academicYear =
      await AcademicYear.findById(
        academicYearId,
      );

    if (!academicYear) {
      res.status(404);
      throw new Error(
        "Academic year not found",
      );
    }

    if (
      req.user.role !== "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        academicYear.school.toString() !==
          req.schoolId.toString()
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this academic year",
      );
    }

    const {
      class: classId,
      isActive,
    } = req.query;

    const filter = {
      school: academicYear.school,
      academicYear:
        academicYearId,
    };

    if (classId) {
      const classValidation =
        await validateClass(
          classId,
          academicYear.school,
        );

      if (classValidation.error) {
        res.status(400);
        throw new Error(
          classValidation.error,
        );
      }

      filter.class = classId;
    }

    if (isActive !== undefined) {
      if (
        isActive !== "true" &&
        isActive !== "false"
      ) {
        res.status(400);
        throw new Error(
          "isActive must be true or false",
        );
      }

      filter.isActive =
        isActive === "true";
    }

    const sections =
      await populateSection(
        Section.find(filter).sort({
          class: 1,
          name: 1,
        }),
      );

    res.status(200).json(
      await sections,
    );
  });


/*
  Update Section
*/
export const updateSection =
  asyncHandler(async (req, res) => {
    const section =
      await Section.findById(
        req.params.id,
      );

    if (!section) {
      res.status(404);
      throw new Error(
        "Section not found",
      );
    }

    validateSectionAccess(
      req,
      section,
      "Not authorized to update this section",
    );

    const {
      academicYear,
      class: classId,
      name,
      classTeacher,
      isActive,
    } = req.body;

    if (
      academicYear !== undefined
    ) {
      const validation =
        await validateAcademicYear(
          academicYear,
          section.school,
        );

      if (validation.error) {
        res.status(400);
        throw new Error(
          validation.error,
        );
      }

      section.academicYear =
        academicYear;
    }

    if (classId !== undefined) {
      const validation =
        await validateClass(
          classId,
          section.school,
        );

      if (validation.error) {
        res.status(400);
        throw new Error(
          validation.error,
        );
      }

      section.class =
        classId;
    }

    if (name !== undefined) {
      if (
        typeof name !== "string"
      ) {
        res.status(400);
        throw new Error(
          "Section name must be a string",
        );
      }

      const normalizedName =
        name.trim();

      if (!normalizedName) {
        res.status(400);
        throw new Error(
          "Section name cannot be empty",
        );
      }

      section.name =
        normalizedName;
    }

    if (classTeacher !== undefined) {
      if (
        classTeacher === null ||
        classTeacher === ""
      ) {
        section.classTeacher =
          undefined;
      } else {
        const validation =
          await validateClassTeacher(
            classTeacher,
            section.school,
          );

        if (validation.error) {
          res.status(400);
          throw new Error(
            validation.error,
          );
        }

        section.classTeacher =
          classTeacher;
      }
    }

    if (isActive !== undefined) {
      if (
        typeof isActive !== "boolean"
      ) {
        res.status(400);
        throw new Error(
          "isActive must be true or false",
        );
      }

      section.isActive =
        isActive;
    }

    const existingSection =
      await Section.findOne({
        school: section.school,
        academicYear:
          section.academicYear,
        class: section.class,
        name: section.name,
        _id: {
          $ne: section._id,
        },
      });

    if (existingSection) {
      res.status(400);
      throw new Error(
        "Section already exists for this class and academic year",
      );
    }

    const updatedSection =
      await section.save();

    const populatedSection =
      await populateSection(
        Section.findById(
          updatedSection._id,
        ),
      );

    res.status(200).json(
      await populatedSection,
    );
  });


/*
  Update Section Status
*/
export const updateSectionStatus =
  asyncHandler(async (req, res) => {
    const section =
      await Section.findById(
        req.params.id,
      );

    if (!section) {
      res.status(404);
      throw new Error(
        "Section not found",
      );
    }

    validateSectionAccess(
      req,
      section,
      "Not authorized to update this section",
    );

    const {
      isActive,
    } = req.body;

    if (
      typeof isActive !== "boolean"
    ) {
      res.status(400);
      throw new Error(
        "isActive must be true or false",
      );
    }

    section.isActive =
      isActive;

    if (isActive) {
      const academicYear =
        await AcademicYear.findById(
          section.academicYear,
        );

      if (
        !academicYear ||
        !academicYear.isActive
      ) {
        res.status(400);
        throw new Error(
          "Cannot activate section because its academic year is inactive",
        );
      }

      const classRecord =
        await Class.findById(
          section.class,
        );

      if (
        !classRecord ||
        !classRecord.isActive
      ) {
        res.status(400);
        throw new Error(
          "Cannot activate section because its class is inactive",
        );
      }

      if (
        academicYear.school.toString() !==
        section.school.toString()
      ) {
        res.status(400);
        throw new Error(
          "Section academic year does not belong to the section school",
        );
      }

      if (
        classRecord.school.toString() !==
        section.school.toString()
      ) {
        res.status(400);
        throw new Error(
          "Section class does not belong to the section school",
        );
      }
    }

    await section.save();

    const populatedSection =
      await populateSection(
        Section.findById(
          section._id,
        ),
      );

    res.status(200).json(
      await populatedSection,
    );
  });


/*
  Delete Section
*/
export const deleteSection =
  asyncHandler(async (req, res) => {
    const section =
      await Section.findById(
        req.params.id,
      );

    if (!section) {
      res.status(404);
      throw new Error(
        "Section not found",
      );
    }

    validateSectionAccess(
      req,
      section,
      "Not authorized to delete this section",
    );

    await section.deleteOne();

    res.status(200).json({
      message:
        "Section deleted successfully",
    });
  });