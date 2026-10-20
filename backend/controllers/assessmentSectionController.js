import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import AssessmentSection from "../models/assessmentSectionModel.js";
import Assessment from "../models/assessmentModel.js";

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const getSchoolId = (req) => {
  if (!req.schoolId) {
    throw new Error(
      "School could not be determined from the logged-in user",
    );
  }

  if (!mongoose.Types.ObjectId.isValid(req.schoolId)) {
    throw new Error("Invalid school ID");
  }

  return req.schoolId;
};

const validateQuestionType = (questionType) => {
  if (!QUESTION_TYPES.includes(questionType)) {
    throw new Error("Invalid question type");
  }
};

const validateAssessmentId = (assessmentId) => {
  if (!assessmentId) {
    throw new Error("Assessment is required");
  }

  if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
    throw new Error("Invalid assessment ID");
  }
};

const validateSectionId = (sectionId) => {
  if (!sectionId) {
    throw new Error("Assessment section ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(sectionId)) {
    throw new Error("Invalid assessment section ID");
  }
};

const validateAssessment = async (
  assessmentId,
  schoolId,
) => {
  validateAssessmentId(assessmentId);

  const assessment =
    await Assessment.findOne({
      _id: assessmentId,
      school: schoolId,
    });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  return assessment;
};

const validateSectionValues = (
  marksPerQuestion,
  numberOfQuestions,
  totalMarks,
) => {
  if (
    marksPerQuestion === undefined ||
    marksPerQuestion === null ||
    Number.isNaN(Number(marksPerQuestion)) ||
    Number(marksPerQuestion) < 0
  ) {
    throw new Error(
      "marksPerQuestion must be greater than or equal to 0",
    );
  }

  if (
    numberOfQuestions === undefined ||
    numberOfQuestions === null ||
    Number.isNaN(Number(numberOfQuestions)) ||
    Number(numberOfQuestions) < 1 ||
    !Number.isInteger(Number(numberOfQuestions))
  ) {
    throw new Error(
      "numberOfQuestions must be a positive integer",
    );
  }

  if (
    totalMarks === undefined ||
    totalMarks === null ||
    Number.isNaN(Number(totalMarks)) ||
    Number(totalMarks) < 0
  ) {
    throw new Error(
      "totalMarks must be greater than or equal to 0",
    );
  }

  const calculatedMarks =
    Number(marksPerQuestion) *
    Number(numberOfQuestions);

  if (
    calculatedMarks !== Number(totalMarks)
  ) {
    throw new Error(
      "totalMarks must equal marksPerQuestion multiplied by numberOfQuestions",
    );
  }
};

const validateOrder = (order) => {
  if (
    order === undefined ||
    order === null ||
    Number.isNaN(Number(order)) ||
    Number(order) < 1 ||
    !Number.isInteger(Number(order))
  ) {
    throw new Error(
      "order must be a positive integer",
    );
  }
};

const populateAssessmentSection = (
  query,
) =>
  query.populate({
    path: "assessment",
    populate: [
      {
        path: "school",
        select: "name code",
      },
      {
        path: "academicYear",
        select:
          "name startDate endDate isCurrent",
      },
      {
        path: "class",
        select: "name code",
      },
      {
        path: "section",
        select: "name classTeacher",
      },
      {
        path: "stream",
        select: "name code",
      },
      {
        path: "subject",
        select:
          "name code shortName subjectType cbseSubjectCode",
      },
      {
        path: "createdBy",
        select:
          "name email phone role",
      },
    ],
  });

const validateAssessmentCanCreateOrUpdateSection = (
  assessment,
) => {
  if (
    ["COMPLETED", "CANCELLED"].includes(
      assessment.status,
    )
  ) {
    throw new Error(
      `Cannot modify sections of an assessment with status ${assessment.status}`,
    );
  }
};

const validateAssessmentCanDeleteSection = (
  assessment,
) => {
  if (
    [
      "ACTIVE",
      "COMPLETED",
      "CANCELLED",
    ].includes(assessment.status)
  ) {
    throw new Error(
      `Cannot delete sections from an assessment with status ${assessment.status}`,
    );
  }
};

const createAssessmentSection =
  asyncHandler(async (req, res) => {
    const {
      assessment,
      sectionCode,
      title,
      questionType,
      marksPerQuestion,
      numberOfQuestions,
      totalMarks,
      instructions,
      order,
    } = req.body;

    const schoolId = getSchoolId(req);

    if (
      !sectionCode ||
      !sectionCode.trim()
    ) {
      res.status(400);
      throw new Error(
        "sectionCode is required",
      );
    }

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error("title is required");
    }

    validateOrder(order);
    validateQuestionType(questionType);

    const assessmentData =
      await validateAssessment(
        assessment,
        schoolId,
      );

    validateAssessmentCanCreateOrUpdateSection(
      assessmentData,
    );

    validateSectionValues(
      marksPerQuestion,
      numberOfQuestions,
      totalMarks,
    );

    const normalizedCode =
      sectionCode
        .trim()
        .toUpperCase();

    const existingCode =
      await AssessmentSection.findOne({
        assessment:
          assessmentData._id,
        sectionCode:
          normalizedCode,
      });

    if (existingCode) {
      res.status(400);
      throw new Error(
        "Section code already exists for this assessment",
      );
    }

    const normalizedOrder =
      Number(order);

    const existingOrder =
      await AssessmentSection.findOne({
        assessment:
          assessmentData._id,
        order: normalizedOrder,
      });

    if (existingOrder) {
      res.status(400);
      throw new Error(
        "Section order already exists for this assessment",
      );
    }

    const assessmentSection =
      await AssessmentSection.create({
        assessment:
          assessmentData._id,
        sectionCode:
          normalizedCode,
        title: title.trim(),
        questionType,
        marksPerQuestion:
          Number(marksPerQuestion),
        numberOfQuestions:
          Number(numberOfQuestions),
        totalMarks:
          Number(totalMarks),
        instructions:
          instructions !== undefined
            ? instructions.trim()
            : undefined,
        order: normalizedOrder,
      });

    const result =
      await populateAssessmentSection(
        AssessmentSection.findById(
          assessmentSection._id,
        ),
      );

    res.status(201).json(result);
  });

const getAssessmentSections =
  asyncHandler(async (req, res) => {
    const {
      assessment,
      questionType,
    } = req.query;

    const schoolId = getSchoolId(req);

    const filter = {};

    if (assessment) {
      const assessmentData =
        await validateAssessment(
          assessment,
          schoolId,
        );

      filter.assessment =
        assessmentData._id;
    } else {
      const assessments =
        await Assessment.find({
          school: schoolId,
        }).select("_id");

      filter.assessment = {
        $in: assessments.map(
          (item) => item._id,
        ),
      };
    }

    if (questionType) {
      validateQuestionType(
        questionType,
      );

      filter.questionType =
        questionType;
    }

    const sections =
      await populateAssessmentSection(
        AssessmentSection.find(
          filter,
        ).sort({
          assessment: 1,
          order: 1,
        }),
      );

    res.json(sections);
  });

const getAssessmentSectionById =
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateSectionId(id);

    const schoolId = getSchoolId(req);

    const section =
      await AssessmentSection.findById(
        id,
      );

    if (!section) {
      res.status(404);
      throw new Error(
        "Assessment section not found",
      );
    }

    await validateAssessment(
      section.assessment,
      schoolId,
    );

    const result =
      await populateAssessmentSection(
        AssessmentSection.findById(id),
      );

    res.json(result);
  });

const getAssessmentSectionsByAssessment =
  asyncHandler(async (req, res) => {
    const { assessmentId } =
      req.params;

    const schoolId = getSchoolId(req);

    const assessment =
      await validateAssessment(
        assessmentId,
        schoolId,
      );

    const sections =
      await populateAssessmentSection(
        AssessmentSection.find({
          assessment:
            assessment._id,
        }).sort({
          order: 1,
        }),
      );

    res.json(sections);
  });

const getAssessmentSectionsByQuestionType =
  asyncHandler(async (req, res) => {
    const { questionType } =
      req.params;

    validateQuestionType(
      questionType,
    );

    const schoolId = getSchoolId(req);

    const assessments =
      await Assessment.find({
        school: schoolId,
      }).select("_id");

    const filter = {
      assessment: {
        $in: assessments.map(
          (item) => item._id,
        ),
      },
      questionType,
    };

    const sections =
      await populateAssessmentSection(
        AssessmentSection.find(
          filter,
        ).sort({
          assessment: 1,
          order: 1,
        }),
      );

    res.json(sections);
  });

const updateAssessmentSection =
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateSectionId(id);

    const schoolId = getSchoolId(req);

    const assessmentSection =
      await AssessmentSection.findById(
        id,
      );

    if (!assessmentSection) {
      res.status(404);
      throw new Error(
        "Assessment section not found",
      );
    }

    const assessment =
      await validateAssessment(
        assessmentSection.assessment,
        schoolId,
      );

    validateAssessmentCanCreateOrUpdateSection(
      assessment,
    );

    const {
      sectionCode,
      title,
      questionType,
      marksPerQuestion,
      numberOfQuestions,
      totalMarks,
      instructions,
      order,
    } = req.body;

    const newSectionCode =
      sectionCode !== undefined
        ? sectionCode.trim().toUpperCase()
        : assessmentSection.sectionCode;

    const newTitle =
      title !== undefined
        ? title.trim()
        : assessmentSection.title;

    const newQuestionType =
      questionType ||
      assessmentSection.questionType;

    const newMarksPerQuestion =
      marksPerQuestion !== undefined
        ? marksPerQuestion
        : assessmentSection.marksPerQuestion;

    const newNumberOfQuestions =
      numberOfQuestions !== undefined
        ? numberOfQuestions
        : assessmentSection.numberOfQuestions;

    const newTotalMarks =
      totalMarks !== undefined
        ? totalMarks
        : assessmentSection.totalMarks;

    const newOrder =
      order !== undefined
        ? order
        : assessmentSection.order;

    if (!newSectionCode) {
      res.status(400);
      throw new Error(
        "sectionCode is required",
      );
    }

    if (!newTitle) {
      res.status(400);
      throw new Error(
        "title is required",
      );
    }

    validateQuestionType(
      newQuestionType,
    );

    validateOrder(newOrder);

    validateSectionValues(
      newMarksPerQuestion,
      newNumberOfQuestions,
      newTotalMarks,
    );

    const normalizedOrder =
      Number(newOrder);

    const duplicateCode =
      await AssessmentSection.findOne({
        _id: {
          $ne: id,
        },
        assessment:
          assessmentSection.assessment,
        sectionCode:
          newSectionCode,
      });

    if (duplicateCode) {
      res.status(400);
      throw new Error(
        "Section code already exists for this assessment",
      );
    }

    const duplicateOrder =
      await AssessmentSection.findOne({
        _id: {
          $ne: id,
        },
        assessment:
          assessmentSection.assessment,
        order: normalizedOrder,
      });

    if (duplicateOrder) {
      res.status(400);
      throw new Error(
        "Section order already exists for this assessment",
      );
    }

    assessmentSection.sectionCode =
      newSectionCode;

    assessmentSection.title =
      newTitle;

    assessmentSection.questionType =
      newQuestionType;

    assessmentSection.marksPerQuestion =
      Number(newMarksPerQuestion);

    assessmentSection.numberOfQuestions =
      Number(newNumberOfQuestions);

    assessmentSection.totalMarks =
      Number(newTotalMarks);

    if (
      instructions !== undefined
    ) {
      assessmentSection.instructions =
        instructions.trim();
    }

    assessmentSection.order =
      normalizedOrder;

    await assessmentSection.save();

    const result =
      await populateAssessmentSection(
        AssessmentSection.findById(id),
      );

    res.json(result);
  });

const deleteAssessmentSection =
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateSectionId(id);

    const schoolId = getSchoolId(req);

    const assessmentSection =
      await AssessmentSection.findById(
        id,
      );

    if (!assessmentSection) {
      res.status(404);
      throw new Error(
        "Assessment section not found",
      );
    }

    const assessment =
      await validateAssessment(
        assessmentSection.assessment,
        schoolId,
      );

    validateAssessmentCanDeleteSection(
      assessment,
    );

    await assessmentSection.deleteOne();

    res.json({
      message:
        "Assessment section deleted successfully",
    });
  });

export {
  createAssessmentSection,
  getAssessmentSections,
  getAssessmentSectionById,
  getAssessmentSectionsByAssessment,
  getAssessmentSectionsByQuestionType,
  updateAssessmentSection,
  deleteAssessmentSection,
};
