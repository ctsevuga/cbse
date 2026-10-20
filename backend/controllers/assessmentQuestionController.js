import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import AssessmentQuestion from "../models/assessmentQuestionModel.js";
import Assessment from "../models/assessmentModel.js";
import AssessmentSection from "../models/assessmentSectionModel.js";
import AssessmentChoiceGroup from "../models/assessmentChoiceGroupModel.js";
import Question from "../models/questionModel.js";
import QuestionGroup from "../models/questionGroupModel.js";

/**
 * ======================================================
 * Authorized Roles
 * ======================================================
 */
const AUTHORIZED_ROLES = [
  "SCHOOL_ADMIN",
  "HM",
  "TEACHER",
];

/**
 * ======================================================
 * Validate User Authorization
 * ======================================================
 *
 * AssessmentQuestion is a school-level resource.
 *
 * Only:
 *   SCHOOL_ADMIN
 *   HM
 *   TEACHER
 *
 * are allowed to access it.
 *
 * req.schoolId must come from authentication middleware.
 * The client must NOT be allowed to override the school.
 */
const validateUserSchoolAccess = (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Authentication required");
  }

  if (!AUTHORIZED_ROLES.includes(req.user.role)) {
    res.status(403);
    throw new Error(
      "You are not authorized to access assessment questions",
    );
  }

  if (!req.schoolId) {
    res.status(403);
    throw new Error(
      "School context is required",
    );
  }

  return req.schoolId;
};

/**
 * ======================================================
 * Validate ObjectId
 * ======================================================
 */
const validateObjectId = (
  value,
  fieldName,
) => {
  if (
    !value ||
    !mongoose.Types.ObjectId.isValid(value)
  ) {
    throw new Error(
      `Invalid ${fieldName}`,
    );
  }
};

/**
 * ======================================================
 * Validate Assessment
 * ======================================================
 *
 * Assessment must belong to the
 * authenticated user's school.
 */
const validateAssessment = async (
  assessmentId,
  schoolId,
) => {
  if (!assessmentId) {
    throw new Error(
      "Assessment is required",
    );
  }

  validateObjectId(
    assessmentId,
    "assessment ID",
  );

  const assessment =
    await Assessment.findOne({
      _id: assessmentId,
      school: schoolId,
    });

  if (!assessment) {
    throw new Error(
      "Assessment not found for this school",
    );
  }

  return assessment;
};

/**
 * ======================================================
 * Validate Assessment Section
 * ======================================================
 *
 * Section must belong to:
 *
 * 1. The authenticated school
 * 2. The specified assessment
 */
const validateAssessmentSection =
  async (
    sectionId,
    assessmentId,
    schoolId,
  ) => {
    if (!sectionId) {
      throw new Error(
        "Assessment section is required",
      );
    }

    validateObjectId(
      sectionId,
      "assessment section ID",
    );

    const section =
      await AssessmentSection.findOne({
        _id: sectionId,
        assessment: assessmentId,
        school: schoolId,
      });

    if (!section) {
      throw new Error(
        "Assessment section does not belong to this school and assessment",
      );
    }

    return section;
  };

/**
 * ======================================================
 * Validate Question
 * ======================================================
 *
 * Question must belong to the same school
 * as the assessment.
 */
const validateQuestion = async (
  questionId,
  assessment,
) => {
  if (!questionId) {
    throw new Error(
      "Question is required",
    );
  }

  validateObjectId(
    questionId,
    "question ID",
  );

  const question =
    await Question.findOne({
      _id: questionId,
      school: assessment.school,
    });

  if (!question) {
    throw new Error(
      "Question not found for this school",
    );
  }

  if (!question.isActive) {
    throw new Error(
      "Question is inactive",
    );
  }

  if (question.status !== "APPROVED") {
    throw new Error(
      "Only approved questions can be added to an assessment",
    );
  }

  if (
    question.academicYear &&
    assessment.academicYear &&
    question.academicYear.toString() !==
      assessment.academicYear.toString()
  ) {
    throw new Error(
      "Question does not belong to the assessment academic year",
    );
  }

  if (
    question.class &&
    assessment.class &&
    question.class.toString() !==
      assessment.class.toString()
  ) {
    throw new Error(
      "Question does not belong to the assessment class",
    );
  }

  if (
    question.subject &&
    assessment.subject &&
    question.subject.toString() !==
      assessment.subject.toString()
  ) {
    throw new Error(
      "Question does not belong to the assessment subject",
    );
  }

  return question;
};

/**
 * ======================================================
 * Validate Question Group
 * ======================================================
 *
 * QuestionGroup must belong to the same school
 * and assessment context.
 */
const validateQuestionGroup =
  async (
    questionGroupId,
    assessment,
  ) => {
    if (!questionGroupId) {
      return null;
    }

    validateObjectId(
      questionGroupId,
      "question group ID",
    );

    const group =
      await QuestionGroup.findOne({
        _id: questionGroupId,
        school: assessment.school,
        academicYear:
          assessment.academicYear,
        subject:
          assessment.subject,
      });

    if (!group) {
      throw new Error(
        "Question group does not belong to this school and assessment",
      );
    }

    if (!group.isActive) {
      throw new Error(
        "Question group is inactive",
      );
    }

    return group;
  };

/**
 * ======================================================
 * Validate Choice Group
 * ======================================================
 *
 * ChoiceGroup is validated through its assessment.
 *
 * Since the assessment has already been validated
 * against the authenticated school, requiring the
 * choice group to belong to that assessment prevents
 * cross-school usage.
 */
const validateChoiceGroup =
  async (
    choiceGroupId,
    assessmentId,
  ) => {
    if (!choiceGroupId) {
      return null;
    }

    validateObjectId(
      choiceGroupId,
      "choice group ID",
    );

    const choiceGroup =
      await AssessmentChoiceGroup.findOne({
        _id: choiceGroupId,
        assessment: assessmentId,
      });

    if (!choiceGroup) {
      throw new Error(
        "Choice group does not belong to this assessment",
      );
    }

    return choiceGroup;
  };

/**
 * ======================================================
 * Validate Order
 * ======================================================
 */
const validateOrder = (order) => {
  if (
    order === undefined ||
    order === null ||
    Number(order) < 1 ||
    !Number.isInteger(Number(order))
  ) {
    throw new Error(
      "order must be a positive integer",
    );
  }
};

/**
 * ======================================================
 * Validate Marks
 * ======================================================
 */
const validateMarks = (
  marks,
  negativeMarks,
) => {
  if (
    marks === undefined ||
    marks === null ||
    Number(marks) < 0
  ) {
    throw new Error(
      "marks must be greater than or equal to 0",
    );
  }

  if (
    negativeMarks === undefined ||
    negativeMarks === null ||
    Number(negativeMarks) < 0
  ) {
    throw new Error(
      "negativeMarks must be greater than or equal to 0",
    );
  }

  if (
    Number(negativeMarks) >
    Number(marks)
  ) {
    throw new Error(
      "negativeMarks cannot be greater than marks",
    );
  }
};

/**
 * ======================================================
 * Validate Question / Section Compatibility
 * ======================================================
 */
const validateQuestionSectionCompatibility =
  (
    question,
    assessmentSection,
  ) => {
    const questionType =
      question.questionType;

    if (
      questionType !==
      assessmentSection.questionType
    ) {
      throw new Error(
        `Question type ${questionType} does not match assessment section question type ${assessmentSection.questionType}`,
      );
    }
  };

/**
 * ======================================================
 * Validate Assessment Status
 * ======================================================
 */
const validateAssessmentStatus = (
  assessment,
) => {
  if (
    [
      "COMPLETED",
      "CANCELLED",
    ].includes(assessment.status)
  ) {
    throw new Error(
      `Cannot modify questions for an assessment with status ${assessment.status}`,
    );
  }
};

/**
 * ======================================================
 * Populate Assessment Question
 * ======================================================
 */
const populateAssessmentQuestion = (
  query,
) =>
  query
    .populate({
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
          select:
            "name classTeacher",
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
      ],
    })
    .populate(
      "section",
      "sectionCode title questionType marksPerQuestion numberOfQuestions totalMarks order",
    )
    .populate(
      "question",
      "questionText questionType marks negativeMarks difficulty status answerMode subject chapter topic",
    )
    .populate(
      "questionGroup",
      "title groupType directions sharedContent selectionMode questionCount totalMarks",
    )
    .populate(
      "choiceGroup",
      "name code selectionMode requiredQuestions",
    );

/**
 * ======================================================
 * Create Assessment Question
 * ======================================================
 *
 * @route POST /api/assessment-questions
 */
const createAssessmentQuestion =
  asyncHandler(
    async (req, res) => {
      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      const {
        assessment,
        section,
        question,
        order,
        marks,
        negativeMarks,
        questionGroup,
        choiceGroup,
      } = req.body;

      const assessmentData =
        await validateAssessment(
          assessment,
          schoolId,
        );

      validateAssessmentStatus(
        assessmentData,
      );

      const assessmentSection =
        await validateAssessmentSection(
          section,
          assessmentData._id,
          schoolId,
        );

      const questionData =
        await validateQuestion(
          question,
          assessmentData,
        );

      validateQuestionSectionCompatibility(
        questionData,
        assessmentSection,
      );

      validateOrder(order);

      validateMarks(
        marks,
        negativeMarks === undefined
          ? 0
          : negativeMarks,
      );

      await validateQuestionGroup(
        questionGroup,
        assessmentData,
      );

      await validateChoiceGroup(
        choiceGroup,
        assessmentData._id,
      );

      if (
        Number(marks) >
        Number(
          assessmentSection.marksPerQuestion,
        )
      ) {
        res.status(400);
        throw new Error(
          "Question marks cannot exceed the section marksPerQuestion",
        );
      }

      if (
        Number(marks) !==
        Number(
          assessmentSection.marksPerQuestion,
        )
      ) {
        res.status(400);
        throw new Error(
          "Question marks must match the section marksPerQuestion",
        );
      }

      /**
       * Order uniqueness is scoped to school + assessment
       * according to the AssessmentQuestion indexes.
       */
      const existingOrder =
        await AssessmentQuestion.findOne({
          school: schoolId,
          assessment: assessmentData._id,
          order,
        });

      if (existingOrder) {
        res.status(400);
        throw new Error(
          "Question order already exists in this assessment",
        );
      }

      /**
       * Question uniqueness is scoped to school + assessment.
       */
      const existingQuestion =
        await AssessmentQuestion.findOne({
          school: schoolId,
          assessment: assessmentData._id,
          question,
        });

      if (existingQuestion) {
        res.status(400);
        throw new Error(
          "Question is already assigned to this assessment",
        );
      }

      /**
       * Section question count is also scoped by school.
       */
      const sectionQuestionCount =
        await AssessmentQuestion.countDocuments({
          school: schoolId,
          assessment: assessmentData._id,
          section: assessmentSection._id,
        });

      if (
        sectionQuestionCount >=
        assessmentSection.numberOfQuestions
      ) {
        res.status(400);
        throw new Error(
          "The maximum number of questions for this section has been reached",
        );
      }

      /**
       * IMPORTANT:
       * school is now required by the model.
       */
      const assessmentQuestion =
        await AssessmentQuestion.create({
          school: schoolId,
          assessment:
            assessmentData._id,
          section:
            assessmentSection._id,
          question:
            questionData._id,
          order,
          marks,
          negativeMarks:
            negativeMarks !== undefined
              ? negativeMarks
              : 0,
          questionGroup:
            questionGroup || undefined,
          choiceGroup:
            choiceGroup || undefined,
        });

      const result =
        await populateAssessmentQuestion(
          AssessmentQuestion.findOne({
            _id:
              assessmentQuestion._id,
            school: schoolId,
          }),
        );

      res.status(201).json(result);
    },
  );

/**
 * ======================================================
 * Get Assessment Questions
 * ======================================================
 *
 * @route GET /api/assessment-questions
 */
const getAssessmentQuestions =
  asyncHandler(
    async (req, res) => {
      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      const {
        assessment,
        section,
        question,
        questionGroup,
        choiceGroup,
      } = req.query;

      const filter = {
        school: schoolId,
      };

      /**
       * If assessment is supplied, validate that it
       * belongs to the authenticated school.
       */
      if (assessment) {
        await validateAssessment(
          assessment,
          schoolId,
        );

        filter.assessment =
          assessment;
      }

      /**
       * Section is a school-level entity and must belong
       * to the authenticated school.
       */
      if (section) {
        await validateAssessmentSectionById(
          section,
          schoolId,
        );

        filter.section = section;
      }

      if (question) {
        validateObjectId(
          question,
          "question ID",
        );

        filter.question = question;
      }

      if (questionGroup) {
        validateObjectId(
          questionGroup,
          "question group ID",
        );

        const group =
          await QuestionGroup.findOne({
            _id: questionGroup,
            school: schoolId,
          });

        if (!group) {
          res.status(404);
          throw new Error(
            "Question group not found for this school",
          );
        }

        filter.questionGroup =
          questionGroup;
      }

      if (choiceGroup) {
        validateObjectId(
          choiceGroup,
          "choice group ID",
        );

        const choiceGroupData =
          await AssessmentChoiceGroup.findById(
            choiceGroup,
          );

        if (!choiceGroupData) {
          res.status(404);
          throw new Error(
            "Assessment choice group not found",
          );
        }

        await validateAssessment(
          choiceGroupData.assessment,
          schoolId,
        );

        filter.choiceGroup =
          choiceGroup;
      }

      const assessmentQuestions =
        await populateAssessmentQuestion(
          AssessmentQuestion.find(
            filter,
          ).sort({
            assessment: 1,
            order: 1,
          }),
        );

      res.json(
        assessmentQuestions,
      );
    },
  );

/**
 * ======================================================
 * Validate Assessment Section By ID
 * ======================================================
 *
 * Used by list/filter endpoints where the assessment
 * may not have been supplied separately.
 */
const validateAssessmentSectionById =
  async (
    sectionId,
    schoolId,
  ) => {
    if (!sectionId) {
      throw new Error(
        "Assessment section is required",
      );
    }

    validateObjectId(
      sectionId,
      "assessment section ID",
    );

    const section =
      await AssessmentSection.findOne({
        _id: sectionId,
        school: schoolId,
      });

    if (!section) {
      throw new Error(
        "Assessment section not found for this school",
      );
    }

    return section;
  };

/**
 * ======================================================
 * Get Assessment Question By ID
 * ======================================================
 */
const getAssessmentQuestionById =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      validateObjectId(
        id,
        "assessment question ID",
      );

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      /**
       * IMPORTANT:
       * Scope the AssessmentQuestion itself by school.
       *
       * This prevents a user from accessing another
       * school's AssessmentQuestion by knowing its ID.
       */
      const assessmentQuestion =
        await AssessmentQuestion.findOne({
          _id: id,
          school: schoolId,
        });

      if (!assessmentQuestion) {
        res.status(404);
        throw new Error(
          "Assessment question not found",
        );
      }

      await validateAssessment(
        assessmentQuestion.assessment,
        schoolId,
      );

      const result =
        await populateAssessmentQuestion(
          AssessmentQuestion.findOne({
            _id: id,
            school: schoolId,
          }),
        );

      res.json(result);
    },
  );

/**
 * ======================================================
 * Get Questions By Assessment
 * ======================================================
 */
const getQuestionsByAssessment =
  asyncHandler(
    async (req, res) => {
      const {
        assessmentId,
      } = req.params;

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      const assessment =
        await validateAssessment(
          assessmentId,
          schoolId,
        );

      const questions =
        await populateAssessmentQuestion(
          AssessmentQuestion.find({
            school: schoolId,
            assessment:
              assessment._id,
          }).sort({
            order: 1,
          }),
        );

      res.json(questions);
    },
  );

/**
 * ======================================================
 * Get Questions By Section
 * ======================================================
 */
const getQuestionsBySection =
  asyncHandler(
    async (req, res) => {
      const {
        sectionId,
      } = req.params;

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      const section =
        await validateAssessmentSectionById(
          sectionId,
          schoolId,
        );

      /**
       * Validate the parent assessment as well.
       */
      await validateAssessment(
        section.assessment,
        schoolId,
      );

      const questions =
        await populateAssessmentQuestion(
          AssessmentQuestion.find({
            school: schoolId,
            assessment:
              section.assessment,
            section:
              section._id,
          }).sort({
            order: 1,
          }),
        );

      res.json(questions);
    },
  );

/**
 * ======================================================
 * Get Questions By Question Group
 * ======================================================
 */
const getQuestionsByQuestionGroup =
  asyncHandler(
    async (req, res) => {
      const {
        questionGroupId,
      } = req.params;

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      validateObjectId(
        questionGroupId,
        "question group ID",
      );

      const questionGroup =
        await QuestionGroup.findOne({
          _id: questionGroupId,
          school: schoolId,
        });

      if (!questionGroup) {
        res.status(404);
        throw new Error(
          "Question group not found for this school",
        );
      }

      const questions =
        await populateAssessmentQuestion(
          AssessmentQuestion.find({
            school: schoolId,
            questionGroup:
              questionGroup._id,
          }).sort({
            assessment: 1,
            order: 1,
          }),
        );

      res.json(questions);
    },
  );

/**
 * ======================================================
 * Get Questions By Choice Group
 * ======================================================
 */
const getQuestionsByChoiceGroup =
  asyncHandler(
    async (req, res) => {
      const {
        choiceGroupId,
      } = req.params;

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      validateObjectId(
        choiceGroupId,
        "choice group ID",
      );

      const choiceGroup =
        await AssessmentChoiceGroup.findById(
          choiceGroupId,
        );

      if (!choiceGroup) {
        res.status(404);
        throw new Error(
          "Assessment choice group not found",
        );
      }

      /**
       * This validates the choice group's assessment
       * against the authenticated school.
       */
      const assessment =
        await validateAssessment(
          choiceGroup.assessment,
          schoolId,
        );

      const questions =
        await populateAssessmentQuestion(
          AssessmentQuestion.find({
            school: schoolId,
            assessment:
              assessment._id,
            choiceGroup:
              choiceGroup._id,
          }).sort({
            order: 1,
          }),
        );

      res.json(questions);
    },
  );

/**
 * ======================================================
 * Get Questions By Question Type
 * ======================================================
 */
const getQuestionsByQuestionType =
  asyncHandler(
    async (req, res) => {
      const {
        questionType,
      } = req.params;

      const validTypes = [
        "MCQ",
        "DESCRIPTIVE",
        "ASSERTION_REASON",
        "CASE_STUDY",
        "FILL_BLANK",
        "MATCHING",
        "TRUE_FALSE",
      ];

      if (
        !validTypes.includes(
          questionType,
        )
      ) {
        res.status(400);
        throw new Error(
          "Invalid question type",
        );
      }

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      /**
       * IMPORTANT:
       * Always filter AssessmentQuestion by school.
       *
       * No SUPER_ADMIN/all-school behavior exists anymore.
       */
      const questions =
        await populateAssessmentQuestion(
          AssessmentQuestion.find({
            school: schoolId,
            questionType,
          }).sort({
            assessment: 1,
            order: 1,
          }),
        );

      res.json(questions);
    },
  );

/**
 * ======================================================
 * Update Assessment Question
 * ======================================================
 */
const updateAssessmentQuestion =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      validateObjectId(
        id,
        "assessment question ID",
      );

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      /**
       * Scope the AssessmentQuestion itself by school.
       */
      const assessmentQuestion =
        await AssessmentQuestion.findOne({
          _id: id,
          school: schoolId,
        });

      if (!assessmentQuestion) {
        res.status(404);
        throw new Error(
          "Assessment question not found",
        );
      }

      /**
       * Validate parent assessment against same school.
       */
      const assessment =
        await validateAssessment(
          assessmentQuestion.assessment,
          schoolId,
        );

      validateAssessmentStatus(
        assessment,
      );

      const {
        section,
        question,
        order,
        marks,
        negativeMarks,
        questionGroup,
        choiceGroup,
      } = req.body;

      const newSection =
        section ||
        assessmentQuestion.section;

      const newQuestion =
        question ||
        assessmentQuestion.question;

      const newOrder =
        order !== undefined
          ? order
          : assessmentQuestion.order;

      const newMarks =
        marks !== undefined
          ? marks
          : assessmentQuestion.marks;

      const newNegativeMarks =
        negativeMarks !==
        undefined
          ? negativeMarks
          : assessmentQuestion.negativeMarks;

      const newQuestionGroup =
        Object.prototype.hasOwnProperty.call(
          req.body,
          "questionGroup",
        )
          ? questionGroup || null
          : assessmentQuestion.questionGroup;

      const newChoiceGroup =
        Object.prototype.hasOwnProperty.call(
          req.body,
          "choiceGroup",
        )
          ? choiceGroup || null
          : assessmentQuestion.choiceGroup;

      /**
       * Validate new section:
       * same school + same assessment.
       */
      const assessmentSection =
        await validateAssessmentSection(
          newSection,
          assessment._id,
          schoolId,
        );

      /**
       * Validate new question:
       * same school + compatible assessment.
       */
      const questionData =
        await validateQuestion(
          newQuestion,
          assessment,
        );

      validateQuestionSectionCompatibility(
        questionData,
        assessmentSection,
      );

      validateOrder(
        newOrder,
      );

      validateMarks(
        newMarks,
        newNegativeMarks,
      );

      if (
        Number(newMarks) !==
        Number(
          assessmentSection.marksPerQuestion,
        )
      ) {
        res.status(400);
        throw new Error(
          "Question marks must match the section marksPerQuestion",
        );
      }

      await validateQuestionGroup(
        newQuestionGroup,
        assessment,
      );

      await validateChoiceGroup(
        newChoiceGroup,
        assessment._id,
      );

      /**
       * Duplicate order is scoped by school + assessment.
       */
      const duplicateOrder =
        await AssessmentQuestion.findOne({
          _id: {
            $ne: id,
          },
          school: schoolId,
          assessment:
            assessment._id,
          order: newOrder,
        });

      if (duplicateOrder) {
        res.status(400);
        throw new Error(
          "Question order already exists in this assessment",
        );
      }

      /**
       * Duplicate question is scoped by school + assessment.
       */
      const duplicateQuestion =
        await AssessmentQuestion.findOne({
          _id: {
            $ne: id,
          },
          school: schoolId,
          assessment:
            assessment._id,
          question:
            newQuestion,
        });

      if (duplicateQuestion) {
        res.status(400);
        throw new Error(
          "Question is already assigned to this assessment",
        );
      }

      /**
       * If moving to another section, validate its capacity.
       */
      if (
        newSection.toString() !==
        assessmentQuestion.section.toString()
      ) {
        const sectionQuestionCount =
          await AssessmentQuestion.countDocuments(
            {
              school: schoolId,
              assessment:
                assessment._id,
              section:
                newSection,
              _id: {
                $ne: id,
              },
            },
          );

        if (
          sectionQuestionCount >=
          assessmentSection.numberOfQuestions
        ) {
          res.status(400);
          throw new Error(
            "The maximum number of questions for this section has been reached",
          );
        }
      }

      /**
       * School should remain authoritative.
       *
       * Even though clients cannot update school,
       * explicitly reassigning it here guarantees that
       * the persisted document retains the authenticated
       * school.
       */
      assessmentQuestion.school =
        schoolId;

      assessmentQuestion.section =
        newSection;

      assessmentQuestion.question =
        newQuestion;

      assessmentQuestion.order =
        newOrder;

      assessmentQuestion.marks =
        newMarks;

      assessmentQuestion.negativeMarks =
        newNegativeMarks;

      assessmentQuestion.questionGroup =
        newQuestionGroup || undefined;

      assessmentQuestion.choiceGroup =
        newChoiceGroup || undefined;

      await assessmentQuestion.save();

      const result =
        await populateAssessmentQuestion(
          AssessmentQuestion.findOne({
            _id: id,
            school: schoolId,
          }),
        );

      res.json(result);
    },
  );

/**
 * ======================================================
 * Delete Assessment Question
 * ======================================================
 */
const deleteAssessmentQuestion =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      validateObjectId(
        id,
        "assessment question ID",
      );

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      /**
       * Scope the AssessmentQuestion itself by school.
       */
      const assessmentQuestion =
        await AssessmentQuestion.findOne({
          _id: id,
          school: schoolId,
        });

      if (!assessmentQuestion) {
        res.status(404);
        throw new Error(
          "Assessment question not found",
        );
      }

      const assessment =
        await validateAssessment(
          assessmentQuestion.assessment,
          schoolId,
        );

      validateAssessmentStatus(
        assessment,
      );

      await assessmentQuestion.deleteOne();

      res.json({
        message:
          "Assessment question deleted successfully",
      });
    },
  );

export {
  createAssessmentQuestion,
  getAssessmentQuestions,
  getAssessmentQuestionById,
  getQuestionsByAssessment,
  getQuestionsBySection,
  getQuestionsByQuestionGroup,
  getQuestionsByChoiceGroup,
  getQuestionsByQuestionType,
  updateAssessmentQuestion,
  deleteAssessmentQuestion,
};
