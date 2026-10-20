import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import QuestionBlueprint from "../models/questionBlueprintModel.js";
import School from "../models/schoolModel.js";
import AcademicYear from "../models/academicYearModel.js";
import Class from "../models/classModel.js";
import Subject from "../models/subjectModel.js";
import Stream from "../models/streamModel.js";
import User from "../models/userModel.js";
import TeacherAssignment from "../models/teacherAssignmentModel.js";

const AUTHORIZED_ROLES = [
  "SCHOOL_ADMIN",
  "HM",
  "TEACHER",
];

const getUserSchool = (req) => {
  return req.schoolId || req.user?.school || null;
};

const validateObjectId = (id, message) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }

  return id;
};

const validateSchool = async (schoolId) => {
  if (!schoolId) {
    throw new Error("School is required");
  }

  const school = await School.findById(schoolId);

  if (!school) {
    throw new Error("School not found");
  }

  if (!school.isActive) {
    throw new Error("School is inactive");
  }

  return school;
};

const validateAcademicYear = async (
  academicYearId,
  schoolId,
) => {
  if (!academicYearId) {
    throw new Error("Academic year is required");
  }

  const academicYear = await AcademicYear.findOne({
    _id: academicYearId,
    school: schoolId,
  });

  if (!academicYear) {
    throw new Error(
      "Academic year not found for this school",
    );
  }

  if (!academicYear.isActive) {
    throw new Error("Academic year is inactive");
  }

  return academicYear;
};

const validateClass = async (
  classId,
  schoolId,
) => {
  if (!classId) {
    throw new Error("Class is required");
  }

  const classData = await Class.findOne({
    _id: classId,
    school: schoolId,
  });

  if (!classData) {
    throw new Error(
      "Class not found for this school",
    );
  }

  if (!classData.isActive) {
    throw new Error("Class is inactive");
  }

  return classData;
};

const validateSubject = async (subjectId) => {
  if (!subjectId) {
    throw new Error("Subject is required");
  }

  const subject = await Subject.findById(subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  if (!subject.isActive) {
    throw new Error("Subject is inactive");
  }

  return subject;
};

const validateStream = async (streamId) => {
  if (!streamId) {
    return null;
  }

  const stream = await Stream.findById(streamId);

  if (!stream) {
    throw new Error("Stream not found");
  }

  if (!stream.isActive) {
    throw new Error("Stream is inactive");
  }

  return stream;
};

const validateUser = async (req) => {
  if (!req.user?._id) {
    throw new Error("Authentication required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("User is inactive");
  }

  if (!AUTHORIZED_ROLES.includes(user.role)) {
    throw new Error(
      "User is not authorized to configure question blueprints",
    );
  }

  return user;
};

const validateCreator = async (
  userId,
  schoolId,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Creator not found");
  }

  if (!user.isActive) {
    throw new Error("Creator is inactive");
  }

  if (!AUTHORIZED_ROLES.includes(user.role)) {
    throw new Error(
      "User is not authorized to create question blueprints",
    );
  }

  if (
    !user.school ||
    user.school.toString() !== schoolId.toString()
  ) {
    throw new Error(
      "Creator does not belong to this school",
    );
  }

  return user;
};

const validateTeacherSubjectAssignment =
  async (
    userId,
    subjectId,
    academicYearId,
    schoolId,
  ) => {
    const assignment =
      await TeacherAssignment.findOne({
        school: schoolId,
        academicYear: academicYearId,
        teacher: userId,
        subject: subjectId,
        assignmentType: "SUBJECT_TEACHER",
        isActive: true,
      });

    if (!assignment) {
      throw new Error(
        "You are not assigned to this subject for this academic year",
      );
    }

    return assignment;
  };

const validateBlueprintSubjectAccess =
  async (
    user,
    subjectId,
    academicYearId,
    schoolId,
  ) => {
    if (!subjectId) {
      throw new Error("Subject is required");
    }

    await validateSubject(subjectId);

    if (
      user.role === "SCHOOL_ADMIN" ||
      user.role === "HM"
    ) {
      return true;
    }

    if (user.role === "TEACHER") {
      await validateTeacherSubjectAssignment(
        user._id,
        subjectId,
        academicYearId,
        schoolId,
      );

      return true;
    }

    throw new Error(
      "You are not authorized to configure this subject's question blueprint",
    );
  };

const validateNumbers = (
  totalQuestions,
  totalMarks,
) => {
  if (
    totalQuestions === undefined ||
    totalQuestions === null ||
    Number(totalQuestions) < 1 ||
    !Number.isInteger(Number(totalQuestions))
  ) {
    throw new Error(
      "totalQuestions must be a positive integer",
    );
  }

  if (
    totalMarks === undefined ||
    totalMarks === null ||
    Number(totalMarks) < 1
  ) {
    throw new Error(
      "totalMarks must be greater than 0",
    );
  }
};

const findDuplicateBlueprint = async ({
  blueprintId,
  school,
  academicYear,
  classId,
  subject,
  stream,
  name,
}) => {
  const query = {
    school,
    academicYear,
    class: classId,
    subject,
    name: name.trim(),
  };

  if (blueprintId) {
    query._id = { $ne: blueprintId };
  }

  if (stream) {
    query.stream = stream;
  } else {
    query.stream = { $exists: false };
  }

  return QuestionBlueprint.findOne(query).collation({
    locale: "en",
    strength: 2,
  });
};

const populateQuestionBlueprint = (query) =>
  query
    .populate("school", "name code")
    .populate(
      "academicYear",
      "name startDate endDate isCurrent",
    )
    .populate("class", "name code")
    .populate(
      "subject",
      "name code shortName subjectType cbseSubjectCode",
    )
    .populate("stream", "name code")
    .populate(
      "createdBy",
      "name email phone role",
    );

const getTeacherAssignedSubjectIds =
  async (
    teacherId,
    schoolId,
    academicYearId,
  ) => {
    return TeacherAssignment.find({
      school: schoolId,
      teacher: teacherId,
      academicYear: academicYearId,
      assignmentType: "SUBJECT_TEACHER",
      isActive: true,
      subject: {
        $ne: null,
      },
    }).distinct("subject");
  };

const getTeacherBlueprintFilter =
  async (
    user,
    schoolId,
    academicYearId,
  ) => {
    if (user.role !== "TEACHER") {
      return null;
    }

    if (academicYearId) {
      const subjectIds =
        await getTeacherAssignedSubjectIds(
          user._id,
          schoolId,
          academicYearId,
        );

      return {
        academicYear: academicYearId,
        subject: {
          $in: subjectIds,
        },
      };
    }

    const assignments =
      await TeacherAssignment.find({
        school: schoolId,
        teacher: user._id,
        assignmentType: "SUBJECT_TEACHER",
        isActive: true,
        subject: {
          $ne: null,
        },
      }).select(
        "academicYear subject",
      );

    if (!assignments.length) {
      return {
        _id: {
          $in: [],
        },
      };
    }

    return {
      $or: assignments.map(
        (assignment) => ({
          academicYear:
            assignment.academicYear,
          subject: assignment.subject,
        }),
      ),
    };
  };

const createQuestionBlueprint =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    const {
  name,
  blueprintType = "CUSTOM",
  academicYear,
  class: classId,
  subject,
  stream,
  totalQuestions,
  totalMarks,
  rules,
  difficultyDistribution,
  questionTypeDistribution,
} = req.body;

    validateObjectId(
      academicYear,
      "Invalid academic year ID",
    );

    validateObjectId(
      classId,
      "Invalid class ID",
    );

    validateObjectId(
      subject,
      "Invalid subject ID",
    );

    if (stream) {
      validateObjectId(
        stream,
        "Invalid stream ID",
      );
    }

    await validateSchool(schoolId);

    await validateAcademicYear(
      academicYear,
      schoolId,
    );

    await validateClass(
      classId,
      schoolId,
    );

    await validateBlueprintSubjectAccess(
      user,
      subject,
      academicYear,
      schoolId,
    );

    await validateStream(stream);

    await validateCreator(
      user._id,
      schoolId,
    );

    validateNumbers(
      totalQuestions,
      totalMarks,
    );

    const existingBlueprint = await findDuplicateBlueprint({
  school: schoolId,
  academicYear,
  classId,
  subject,
  stream,
  name,
});

if (existingBlueprint) {
  res.status(409);
  throw new Error(
    "A blueprint with this name already exists for this class, subject, academic year, and stream",
  );
}

    if (
  typeof name !== "string" ||
  !name.trim()
) {
  res.status(400);
  throw new Error("Blueprint name is required");
}

const allowedBlueprintTypes = [
  "MONTHLY_TEST",
  "UNIT_TEST",
  "HALF_YEARLY",
  "ANNUAL_EXAM",
  "MOCK_EXAM",
  "CUSTOM",
];

if (!allowedBlueprintTypes.includes(blueprintType)) {
  res.status(400);
  throw new Error("Invalid blueprint type");
}

    const blueprint = await QuestionBlueprint.create({
  school: schoolId,
  academicYear,
  class: classId,
  subject,
  ...(stream ? { stream } : {}),
  name: name.trim(),
  blueprintType,
  totalQuestions: Number(totalQuestions),
  totalMarks: Number(totalMarks),
  rules: rules ?? {},
  difficultyDistribution: difficultyDistribution ?? {},
  questionTypeDistribution: questionTypeDistribution ?? {},
  createdBy: user._id,
});

    const result =
      await populateQuestionBlueprint(
        QuestionBlueprint.findById(
          blueprint._id,
        ),
      );

    res.status(201).json(result);
  });

const getQuestionBlueprints =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    const {
      academicYear,
      class: classId,
      subject,
      stream,
      isActive,
    } = req.query;

    await validateSchool(schoolId);

    const filter = {
      school: schoolId,
    };

    if (academicYear) {
      validateObjectId(
        academicYear,
        "Invalid academic year ID",
      );

      await validateAcademicYear(
        academicYear,
        schoolId,
      );

      filter.academicYear = academicYear;
    }

    if (classId) {
      validateObjectId(
        classId,
        "Invalid class ID",
      );

      await validateClass(
        classId,
        schoolId,
      );

      filter.class = classId;
    }

    if (subject) {
      validateObjectId(
        subject,
        "Invalid subject ID",
      );

      await validateBlueprintSubjectAccess(
        user,
        subject,
        academicYear,
        schoolId,
      );

      filter.subject = subject;
    }

    if (stream) {
      validateObjectId(
        stream,
        "Invalid stream ID",
      );

      await validateStream(stream);

      filter.stream = stream;
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

    const teacherFilter =
      await getTeacherBlueprintFilter(
        user,
        schoolId,
        academicYear,
      );

    if (teacherFilter) {
      if (teacherFilter.$or) {
        filter.$or = teacherFilter.$or;
      } else {
        if (teacherFilter.academicYear) {
          filter.academicYear =
            teacherFilter.academicYear;
        }

        if (teacherFilter.subject) {
          filter.subject =
            teacherFilter.subject;
        }
      }
    }

    const blueprints =
      await populateQuestionBlueprint(
        QuestionBlueprint.find(
          filter,
        ).sort({
          academicYear: 1,
          class: 1,
          subject: 1,
          createdAt: -1,
        }),
      );

    res.json(blueprints);
  });

const getQuestionBlueprintById =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const { id } = req.params;

    validateObjectId(
      id,
      "Invalid question blueprint ID",
    );

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    const blueprint =
      await populateQuestionBlueprint(
        QuestionBlueprint.findOne({
          _id: id,
          school: schoolId,
        }),
      );

    if (!blueprint) {
      res.status(404);
      throw new Error(
        "Question blueprint not found",
      );
    }

    await validateBlueprintSubjectAccess(
      user,
      blueprint.subject._id ||
        blueprint.subject,
      blueprint.academicYear._id ||
        blueprint.academicYear,
      schoolId,
    );

    res.json(blueprint);
  });

const getQuestionBlueprintsByAcademicYear =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const { academicYearId } = req.params;

    validateObjectId(
      academicYearId,
      "Invalid academic year ID",
    );

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    await validateSchool(schoolId);

    await validateAcademicYear(
      academicYearId,
      schoolId,
    );

    const filter = {
      school: schoolId,
      academicYear: academicYearId,
    };

    if (user.role === "TEACHER") {
      const subjectIds =
        await getTeacherAssignedSubjectIds(
          user._id,
          schoolId,
          academicYearId,
        );

      filter.subject = {
        $in: subjectIds,
      };
    }

    const blueprints =
      await populateQuestionBlueprint(
        QuestionBlueprint.find(
          filter,
        ).sort({
          class: 1,
          subject: 1,
          createdAt: -1,
        }),
      );

    res.json(blueprints);
  });

const getQuestionBlueprintsByClass =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const { classId } = req.params;

    validateObjectId(
      classId,
      "Invalid class ID",
    );

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    await validateSchool(schoolId);

    await validateClass(
      classId,
      schoolId,
    );

    const filter = {
      school: schoolId,
      class: classId,
    };

    const { academicYear } = req.query;

    if (academicYear) {
      validateObjectId(
        academicYear,
        "Invalid academic year ID",
      );

      await validateAcademicYear(
        academicYear,
        schoolId,
      );

      filter.academicYear = academicYear;
    }

    if (user.role === "TEACHER") {
      const teacherFilter =
        await getTeacherBlueprintFilter(
          user,
          schoolId,
          academicYear,
        );

      if (teacherFilter?.$or) {
        filter.$or =
          teacherFilter.$or;
      } else if (
        teacherFilter?.subject
      ) {
        filter.subject =
          teacherFilter.subject;
      }
    }

    const blueprints =
      await populateQuestionBlueprint(
        QuestionBlueprint.find(
          filter,
        ).sort({
          academicYear: 1,
          subject: 1,
          createdAt: -1,
        }),
      );

    res.json(blueprints);
  });

const getQuestionBlueprintsBySubject =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const { subjectId } = req.params;

    validateObjectId(
      subjectId,
      "Invalid subject ID",
    );

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    await validateSchool(schoolId);

    await validateSubject(subjectId);

    const { academicYear } = req.query;

    if (academicYear) {
      validateObjectId(
        academicYear,
        "Invalid academic year ID",
      );

      await validateAcademicYear(
        academicYear,
        schoolId,
      );

      await validateBlueprintSubjectAccess(
        user,
        subjectId,
        academicYear,
        schoolId,
      );
    }

    const filter = {
      school: schoolId,
      subject: subjectId,
    };

    if (academicYear) {
      filter.academicYear =
        academicYear;
    }

    if (user.role === "TEACHER") {
      const teacherFilter =
        await getTeacherBlueprintFilter(
          user,
          schoolId,
          academicYear,
        );

      if (teacherFilter?.$or) {
        filter.$or =
          teacherFilter.$or;
      } else if (
        teacherFilter?.subject
      ) {
        filter.subject =
          teacherFilter.subject;
      }
    }

    const blueprints =
      await populateQuestionBlueprint(
        QuestionBlueprint.find(
          filter,
        ).sort({
          academicYear: 1,
          class: 1,
          createdAt: -1,
        }),
      );

    res.json(blueprints);
  });

const getQuestionBlueprintsByStream =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const { streamId } = req.params;

    validateObjectId(
      streamId,
      "Invalid stream ID",
    );

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    await validateSchool(schoolId);

    await validateStream(streamId);

    const { academicYear } = req.query;

    const filter = {
      school: schoolId,
      stream: streamId,
    };

    if (academicYear) {
      validateObjectId(
        academicYear,
        "Invalid academic year ID",
      );

      await validateAcademicYear(
        academicYear,
        schoolId,
      );

      filter.academicYear =
        academicYear;
    }

    if (user.role === "TEACHER") {
      const teacherFilter =
        await getTeacherBlueprintFilter(
          user,
          schoolId,
          academicYear,
        );

      if (teacherFilter?.$or) {
        filter.$or =
          teacherFilter.$or;
      } else if (
        teacherFilter?.subject
      ) {
        filter.subject =
          teacherFilter.subject;
      }
    }

    const blueprints =
      await populateQuestionBlueprint(
        QuestionBlueprint.find(
          filter,
        ).sort({
          academicYear: 1,
          class: 1,
          subject: 1,
          createdAt: -1,
        }),
      );

    res.json(blueprints);
  });

const getMyQuestionBlueprints =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    if (user.role !== "TEACHER") {
      const blueprints =
        await populateQuestionBlueprint(
          QuestionBlueprint.find({
            school: schoolId,
            createdBy: user._id,
          }).sort({
            createdAt: -1,
          }),
        );

      return res.json(blueprints);
    }

    const { academicYear } = req.query;

    const filter = {
      school: schoolId,
      createdBy: user._id,
    };

    if (academicYear) {
      validateObjectId(
        academicYear,
        "Invalid academic year ID",
      );

      await validateAcademicYear(
        academicYear,
        schoolId,
      );

      filter.academicYear =
        academicYear;

      const subjectIds =
        await getTeacherAssignedSubjectIds(
          user._id,
          schoolId,
          academicYear,
        );

      filter.subject = {
        $in: subjectIds,
      };
    } else {
      const teacherFilter =
        await getTeacherBlueprintFilter(
          user,
          schoolId,
        );

      if (teacherFilter?.$or) {
        filter.$or =
          teacherFilter.$or;
      }
    }

    const blueprints =
      await populateQuestionBlueprint(
        QuestionBlueprint.find(
          filter,
        ).sort({
          createdAt: -1,
        }),
      );

    res.json(blueprints);
  });

const updateQuestionBlueprint =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const { id } = req.params;

    validateObjectId(
      id,
      "Invalid question blueprint ID",
    );

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    const blueprint =
      await QuestionBlueprint.findOne({
        _id: id,
        school: schoolId,
      });

    if (!blueprint) {
      res.status(404);
      throw new Error(
        "Question blueprint not found",
      );
    }

    await validateBlueprintSubjectAccess(
      user,
      blueprint.subject,
      blueprint.academicYear,
      schoolId,
    );

    const {
  name,
  blueprintType,
  academicYear,
  class: classId,
  subject,
  stream,
  totalQuestions,
  totalMarks,
  rules,
  difficultyDistribution,
  questionTypeDistribution,
} = req.body;

    const newAcademicYear =
      academicYear ||
      blueprint.academicYear;

    const newClass =
      classId || blueprint.class;

    const newSubject =
      subject || blueprint.subject;

    let newStream;

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "stream",
      )
    ) {
      newStream = stream || null;
    } else {
      newStream =
        blueprint.stream || null;
    }

    validateObjectId(
      newAcademicYear,
      "Invalid academic year ID",
    );

    validateObjectId(
      newClass,
      "Invalid class ID",
    );

    validateObjectId(
      newSubject,
      "Invalid subject ID",
    );

    if (newStream) {
      validateObjectId(
        newStream,
        "Invalid stream ID",
      );
    }

    await validateAcademicYear(
      newAcademicYear,
      schoolId,
    );

    await validateClass(
      newClass,
      schoolId,
    );

    await validateBlueprintSubjectAccess(
      user,
      newSubject,
      newAcademicYear,
      schoolId,
    );

    await validateStream(newStream);

    const newTotalQuestions =
      totalQuestions !== undefined
        ? totalQuestions
        : blueprint.totalQuestions;

    const newTotalMarks =
      totalMarks !== undefined
        ? totalMarks
        : blueprint.totalMarks;

    validateNumbers(
      newTotalQuestions,
      newTotalMarks,
    );

    const newName =
  name !== undefined ? name.trim() : blueprint.name;

if (!newName) {
  res.status(400);
  throw new Error("Blueprint name is required");
}

const allowedBlueprintTypes = [
  "MONTHLY_TEST",
  "UNIT_TEST",
  "HALF_YEARLY",
  "ANNUAL_EXAM",
  "MOCK_EXAM",
  "CUSTOM",
];

const newBlueprintType =
  blueprintType !== undefined
    ? blueprintType
    : blueprint.blueprintType;

if (!allowedBlueprintTypes.includes(newBlueprintType)) {
  res.status(400);
  throw new Error("Invalid blueprint type");
}

    const duplicate = await findDuplicateBlueprint({
  blueprintId: blueprint._id,
  school: schoolId,
  academicYear: newAcademicYear,
  classId: newClass,
  subject: newSubject,
  stream: newStream,
  name: newName,
});

if (duplicate) {
  res.status(409);
  throw new Error(
    "A blueprint with this name already exists for this class, subject, academic year, and stream",
  );
}

    blueprint.name = newName;
blueprint.blueprintType = newBlueprintType;

blueprint.academicYear = newAcademicYear;
blueprint.class = newClass;
blueprint.subject = newSubject;

blueprint.set("stream", newStream || undefined);

blueprint.totalQuestions = Number(newTotalQuestions);
blueprint.totalMarks = Number(newTotalMarks);

    if (rules !== undefined) {
      blueprint.rules = rules;
    }

    if (
      difficultyDistribution !==
      undefined
    ) {
      blueprint.difficultyDistribution =
        difficultyDistribution;
    }

    if (
      questionTypeDistribution !==
      undefined
    ) {
      blueprint.questionTypeDistribution =
        questionTypeDistribution;
    }

    await blueprint.save();

    const result =
      await populateQuestionBlueprint(
        QuestionBlueprint.findById(
          blueprint._id,
        ),
      );

    res.json(result);
  });

const updateQuestionBlueprintStatus =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const { id } = req.params;
    const { isActive } = req.body;

    validateObjectId(
      id,
      "Invalid question blueprint ID",
    );

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be a boolean",
      );
    }

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    const blueprint =
      await QuestionBlueprint.findOne({
        _id: id,
        school: schoolId,
      });

    if (!blueprint) {
      res.status(404);
      throw new Error(
        "Question blueprint not found",
      );
    }

    await validateBlueprintSubjectAccess(
      user,
      blueprint.subject,
      blueprint.academicYear,
      schoolId,
    );

    blueprint.isActive = isActive;

    await blueprint.save();

    const result =
      await populateQuestionBlueprint(
        QuestionBlueprint.findById(
          blueprint._id,
        ),
      );

    res.json(result);
  });

const deleteQuestionBlueprint =
  asyncHandler(async (req, res) => {
    const user = await validateUser(req);

    const { id } = req.params;

    validateObjectId(
      id,
      "Invalid question blueprint ID",
    );

    const schoolId = getUserSchool(req);

    if (!schoolId) {
      res.status(400);
      throw new Error("School is required");
    }

    const blueprint =
      await QuestionBlueprint.findOne({
        _id: id,
        school: schoolId,
      });

    if (!blueprint) {
      res.status(404);
      throw new Error(
        "Question blueprint not found",
      );
    }

    await validateBlueprintSubjectAccess(
      user,
      blueprint.subject,
      blueprint.academicYear,
      schoolId,
    );

    await blueprint.deleteOne();

    res.json({
      message:
        "Question blueprint deleted successfully",
    });
  });

export {
  createQuestionBlueprint,
  getQuestionBlueprints,
  getQuestionBlueprintById,
  getQuestionBlueprintsByAcademicYear,
  getQuestionBlueprintsByClass,
  getQuestionBlueprintsBySubject,
  getQuestionBlueprintsByStream,
  getMyQuestionBlueprints,
  updateQuestionBlueprint,
  updateQuestionBlueprintStatus,
  deleteQuestionBlueprint,
};