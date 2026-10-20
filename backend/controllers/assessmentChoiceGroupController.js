import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

import AssessmentChoiceGroup from "../models/assessmentChoiceGroupModel.js";
import AssessmentQuestion from "../models/assessmentQuestionModel.js";
import Assessment from "../models/assessmentModel.js";
import AssessmentSection from "../models/assessmentSectionModel.js";

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
 * Validate User School Access
 * ======================================================
 *
 * AssessmentChoiceGroup is a school-level entity.
 *
 * The school must always come from req.schoolId.
 *
 * The client must NOT be allowed to provide a
 * school ID to select another school.
 */
const validateUserSchoolAccess = (
  req,
  res,
) => {
  if (!req.user) {
    res.status(401);
    throw new Error(
      "Authentication required",
    );
  }

  if (
    !AUTHORIZED_ROLES.includes(
      req.user.role,
    )
  ) {
    res.status(403);
    throw new Error(
      "You are not authorized to access assessment choice groups",
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
    !mongoose.Types.ObjectId.isValid(
      value,
    )
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
 * Assessment must belong to the authenticated
 * user's school.
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
 * Validate Assessment Status
 * ======================================================
 *
 * Choice groups cannot be modified after an assessment
 * has been completed or cancelled.
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
      `Cannot modify choice groups for an assessment with status ${assessment.status}`,
    );
  }
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
      return null;
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
 * Validate Name
 * ======================================================
 */
const validateName = (name) => {
  if (
    !name ||
    typeof name !== "string" ||
    !name.trim()
  ) {
    throw new Error(
      "Choice group name is required",
    );
  }

  if (name.trim().length > 150) {
    throw new Error(
      "Choice group name cannot exceed 150 characters",
    );
  }
};

/**
 * ======================================================
 * Validate Code
 * ======================================================
 */
const normalizeCode = (code) => {
  if (
    code === undefined ||
    code === null ||
    code === ""
  ) {
    return undefined;
  }

  if (
    typeof code !== "string"
  ) {
    throw new Error(
      "Choice group code must be a string",
    );
  }

  const normalizedCode =
    code.trim().toUpperCase();

  if (
    normalizedCode.length > 50
  ) {
    throw new Error(
      "Choice group code cannot exceed 50 characters",
    );
  }

  return normalizedCode;
};

/**
 * ======================================================
 * Validate Selection Mode
 * ======================================================
 */
const VALID_SELECTION_MODES = [
  "ANY",
  "EXACT",
  "AT_LEAST",
  "AT_MOST",
];

const validateSelectionMode = (
  selectionMode,
) => {
  if (
    !VALID_SELECTION_MODES.includes(
      selectionMode,
    )
  ) {
    throw new Error(
      `Invalid selectionMode. Allowed values: ${VALID_SELECTION_MODES.join(
        ", ",
      )}`,
    );
  }
};

/**
 * ======================================================
 * Validate Question Counts
 * ======================================================
 */
const validateQuestionCounts = (
  requiredQuestions,
  maxQuestions,
) => {
  if (
    requiredQuestions ===
      undefined ||
    requiredQuestions === null ||
    !Number.isInteger(
      Number(requiredQuestions),
    ) ||
    Number(requiredQuestions) < 1
  ) {
    throw new Error(
      "requiredQuestions must be a positive integer",
    );
  }

  if (
    maxQuestions !== undefined &&
    maxQuestions !== null
  ) {
    if (
      !Number.isInteger(
        Number(maxQuestions),
      ) ||
      Number(maxQuestions) < 1
    ) {
      throw new Error(
        "maxQuestions must be a positive integer",
      );
    }

    if (
      Number(requiredQuestions) >
      Number(maxQuestions)
    ) {
      throw new Error(
        "requiredQuestions cannot be greater than maxQuestions",
      );
    }
  }
};

/**
 * ======================================================
 * Validate Total Marks
 * ======================================================
 */
const validateTotalMarks = (
  totalMarks,
) => {
  if (
    totalMarks === undefined ||
    totalMarks === null
  ) {
    return;
  }

  if (
    Number(totalMarks) < 0 ||
    !Number.isFinite(
      Number(totalMarks),
    )
  ) {
    throw new Error(
      "totalMarks must be greater than or equal to 0",
    );
  }
};

/**
 * ======================================================
 * Validate Order
 * ======================================================
 */
const validateOrder = (order) => {
  if (
    order === undefined ||
    order === null
  ) {
    return;
  }

  if (
    !Number.isInteger(
      Number(order),
    ) ||
    Number(order) < 1
  ) {
    throw new Error(
      "order must be a positive integer",
    );
  }
};

/**
 * ======================================================
 * Validate Choice Group Usage
 * ======================================================
 *
 * This is useful when updating/deleting a group.
 */
const getChoiceGroupQuestionCount =
  async (
    choiceGroupId,
    schoolId,
  ) => {
    return AssessmentQuestion.countDocuments(
      {
        school: schoolId,
        choiceGroup:
          choiceGroupId,
      },
    );
  };

/**
 * ======================================================
 * Validate Choice Group Capacity
 * ======================================================
 *
 * If maxQuestions is defined, the number of
 * AssessmentQuestion records assigned to the group
 * cannot exceed it.
 */
const validateChoiceGroupCapacity =
  async ({
    choiceGroupId,
    schoolId,
    maxQuestions,
  }) => {
    if (
      maxQuestions === undefined ||
      maxQuestions === null
    ) {
      return;
    }

    const questionCount =
      await getChoiceGroupQuestionCount(
        choiceGroupId,
        schoolId,
      );

    if (
      questionCount >
      Number(maxQuestions)
    ) {
      throw new Error(
        `Choice group already contains ${questionCount} questions, which exceeds maxQuestions ${maxQuestions}`,
      );
    }
  };

/**
 * ======================================================
 * Validate Choice Group Order
 * ======================================================
 *
 * Order is scoped to:
 *
 * school + assessment + section
 *
 * Because section can be null, we handle it
 * explicitly in the query.
 */
const validateUniqueOrder =
  async ({
    schoolId,
    assessmentId,
    sectionId,
    order,
    excludeId,
  }) => {
    if (
      order === undefined ||
      order === null
    ) {
      return;
    }

    const filter = {
      school: schoolId,
      assessment: assessmentId,
      order,
    };

    if (sectionId) {
      filter.section = sectionId;
    } else {
      filter.section = null;
    }

    if (excludeId) {
      filter._id = {
        $ne: excludeId,
      };
    }

    const existing =
      await AssessmentChoiceGroup.findOne(
        filter,
      );

    if (existing) {
      throw new Error(
        "Choice group order already exists in this assessment section",
      );
    }
  };

/**
 * ======================================================
 * Validate Choice Group Code
 * ======================================================
 */
const validateUniqueCode =
  async ({
    schoolId,
    assessmentId,
    code,
    excludeId,
  }) => {
    if (!code) {
      return;
    }

    const filter = {
      school: schoolId,
      assessment: assessmentId,
      code,
    };

    if (excludeId) {
      filter._id = {
        $ne: excludeId,
      };
    }

    const existing =
      await AssessmentChoiceGroup.findOne(
        filter,
      );

    if (existing) {
      throw new Error(
        "Choice group code already exists in this assessment",
      );
    }
  };

/**
 * ======================================================
 * Populate Assessment Choice Group
 * ======================================================
 */
const populateAssessmentChoiceGroup =
  (query) =>
    query
      .populate({
        path: "school",
        select: "name code",
      })
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
      );

/**
 * ======================================================
 * Create Assessment Choice Group
 * ======================================================
 *
 * @route POST /api/assessment-choice-groups
 */
const createAssessmentChoiceGroup =
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
        name,
        code,
        selectionMode = "ANY",
        requiredQuestions,
        maxQuestions,
        directions,
        totalMarks,
        order,
      } = req.body;

      /**
       * Client cannot supply school.
       */
      const assessmentData =
        await validateAssessment(
          assessment,
          schoolId,
        );

      validateAssessmentStatus(
        assessmentData,
      );

      /**
       * Section, if supplied, must belong to
       * the same school and assessment.
       */
      const sectionData =
        await validateAssessmentSection(
          section,
          assessmentData._id,
          schoolId,
        );

      validateName(name);

      const normalizedCode =
        normalizeCode(code);

      validateSelectionMode(
        selectionMode,
      );

      validateQuestionCounts(
        requiredQuestions,
        maxQuestions,
      );

      validateTotalMarks(
        totalMarks,
      );

      validateOrder(order);

      await validateUniqueCode({
        schoolId,
        assessmentId:
          assessmentData._id,
        code: normalizedCode,
      });

      await validateUniqueOrder({
        schoolId,
        assessmentId:
          assessmentData._id,
        sectionId:
          sectionData?._id,
        order,
      });

      const choiceGroup =
        await AssessmentChoiceGroup.create({
          school: schoolId,
          assessment:
            assessmentData._id,
          section:
            sectionData?._id ||
            undefined,
          name: name.trim(),
          code: normalizedCode,
          selectionMode,
          requiredQuestions,
          maxQuestions:
            maxQuestions !== undefined
              ? maxQuestions
              : undefined,
          directions:
            directions?.trim() ||
            undefined,
          totalMarks:
            totalMarks !== undefined
              ? totalMarks
              : undefined,
          order:
            order !== undefined
              ? order
              : undefined,
          isActive: true,
        });

      const result =
        await populateAssessmentChoiceGroup(
          AssessmentChoiceGroup.findOne({
            _id: choiceGroup._id,
            school: schoolId,
          }),
        );

      res.status(201).json(result);
    },
  );

/**
 * ======================================================
 * Get Assessment Choice Groups
 * ======================================================
 *
 * @route GET /api/assessment-choice-groups
 *
 * Supported filters:
 *
 * ?assessment=<assessmentId>
 * ?section=<sectionId>
 * ?isActive=true
 *
 * school is NEVER accepted from the client.
 */
const getAssessmentChoiceGroups =
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
        isActive,
      } = req.query;

      const filter = {
        school: schoolId,
      };

      if (assessment) {
        await validateAssessment(
          assessment,
          schoolId,
        );

        filter.assessment =
          assessment;
      }

      if (section) {
        const sectionData =
          await validateAssessmentSectionById(
            section,
            schoolId,
          );

        /**
         * If assessment was supplied, ensure
         * section belongs to that assessment.
         */
        if (
          assessment &&
          sectionData.assessment.toString() !==
            assessment.toString()
        ) {
          res.status(400);
          throw new Error(
            "Assessment section does not belong to the specified assessment",
          );
        }

        filter.section = section;
      }

      if (
        isActive !== undefined
      ) {
        if (
          !["true", "false"].includes(
            isActive,
          )
        ) {
          res.status(400);
          throw new Error(
            "isActive must be true or false",
          );
        }

        filter.isActive =
          isActive === "true";
      }

      const choiceGroups =
        await populateAssessmentChoiceGroup(
          AssessmentChoiceGroup.find(
            filter,
          ).sort({
            assessment: 1,
            section: 1,
            order: 1,
            createdAt: 1,
          }),
        );

      res.json(choiceGroups);
    },
  );

/**
 * ======================================================
 * Validate Section By ID
 * ======================================================
 */
const validateAssessmentSectionById =
  async (
    sectionId,
    schoolId,
  ) => {
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
 * Get Assessment Choice Group By ID
 * ======================================================
 *
 * @route GET /api/assessment-choice-groups/:id
 */
const getAssessmentChoiceGroupById =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      validateObjectId(
        id,
        "assessment choice group ID",
      );

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      const choiceGroup =
        await AssessmentChoiceGroup.findOne({
          _id: id,
          school: schoolId,
        });

      if (!choiceGroup) {
        res.status(404);
        throw new Error(
          "Assessment choice group not found",
        );
      }

      /**
       * Validate parent assessment as an additional
       * consistency check.
       */
      await validateAssessment(
        choiceGroup.assessment,
        schoolId,
      );

      const result =
        await populateAssessmentChoiceGroup(
          AssessmentChoiceGroup.findOne({
            _id: id,
            school: schoolId,
          }),
        );

      res.json(result);
    },
  );

/**
 * ======================================================
 * Get Choice Groups By Assessment
 * ======================================================
 *
 * @route GET
 * /api/assessment-choice-groups/assessment/:assessmentId
 */
const getChoiceGroupsByAssessment =
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

      const choiceGroups =
        await populateAssessmentChoiceGroup(
          AssessmentChoiceGroup.find({
            school: schoolId,
            assessment:
              assessment._id,
          }).sort({
            section: 1,
            order: 1,
            createdAt: 1,
          }),
        );

      res.json(choiceGroups);
    },
  );

/**
 * ======================================================
 * Get Choice Groups By Section
 * ======================================================
 *
 * @route GET
 * /api/assessment-choice-groups/section/:sectionId
 */
const getChoiceGroupsBySection =
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

      await validateAssessment(
        section.assessment,
        schoolId,
      );

      const choiceGroups =
        await populateAssessmentChoiceGroup(
          AssessmentChoiceGroup.find({
            school: schoolId,
            assessment:
              section.assessment,
            section:
              section._id,
          }).sort({
            order: 1,
            createdAt: 1,
          }),
        );

      res.json(choiceGroups);
    },
  );

/**
 * ======================================================
 * Get Questions By Choice Group
 * ======================================================
 *
 * @route GET
 * /api/assessment-choice-groups/:id/questions
 *
 * Returns AssessmentQuestion records assigned
 * to the choice group.
 */
const getQuestionsByChoiceGroup =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      validateObjectId(
        id,
        "assessment choice group ID",
      );

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      const choiceGroup =
        await AssessmentChoiceGroup.findOne({
          _id: id,
          school: schoolId,
        });

      if (!choiceGroup) {
        res.status(404);
        throw new Error(
          "Assessment choice group not found",
        );
      }

      const questions =
        await AssessmentQuestion.find({
          school: schoolId,
          assessment:
            choiceGroup.assessment,
          choiceGroup:
            choiceGroup._id,
        })
          .sort({
            order: 1,
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
          );

      res.json(questions);
    },
  );

/**
 * ======================================================
 * Update Assessment Choice Group
 * ======================================================
 *
 * @route PUT /api/assessment-choice-groups/:id
 */
const updateAssessmentChoiceGroup =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      validateObjectId(
        id,
        "assessment choice group ID",
      );

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      /**
       * Scope the choice group itself by school.
       */
      const choiceGroup =
        await AssessmentChoiceGroup.findOne({
          _id: id,
          school: schoolId,
        });

      if (!choiceGroup) {
        res.status(404);
        throw new Error(
          "Assessment choice group not found",
        );
      }

      const assessment =
        await validateAssessment(
          choiceGroup.assessment,
          schoolId,
        );

      validateAssessmentStatus(
        assessment,
      );

      const {
        section,
        name,
        code,
        selectionMode,
        requiredQuestions,
        maxQuestions,
        directions,
        totalMarks,
        order,
        isActive,
      } = req.body;

      /**
       * The assessment cannot be changed.
       *
       * AssessmentChoiceGroup is permanently associated
       * with its original assessment.
       */

      const newSection =
        section !== undefined
          ? section
          : choiceGroup.section;

      const newName =
        name !== undefined
          ? name
          : choiceGroup.name;

      const newCode =
        code !== undefined
          ? normalizeCode(code)
          : choiceGroup.code;

      const newSelectionMode =
        selectionMode !== undefined
          ? selectionMode
          : choiceGroup.selectionMode;

      const newRequiredQuestions =
        requiredQuestions !==
        undefined
          ? requiredQuestions
          : choiceGroup.requiredQuestions;

      const newMaxQuestions =
        maxQuestions !== undefined
          ? maxQuestions
          : choiceGroup.maxQuestions;

      const newDirections =
        directions !== undefined
          ? directions?.trim()
          : choiceGroup.directions;

      const newTotalMarks =
        totalMarks !== undefined
          ? totalMarks
          : choiceGroup.totalMarks;

      const newOrder =
        order !== undefined
          ? order
          : choiceGroup.order;

      const newIsActive =
        isActive !== undefined
          ? isActive
          : choiceGroup.isActive;

      /**
       * Validate name.
       */
      validateName(newName);

      /**
       * Validate selection mode.
       */
      validateSelectionMode(
        newSelectionMode,
      );

      /**
       * Validate question counts.
       */
      validateQuestionCounts(
        newRequiredQuestions,
        newMaxQuestions,
      );

      /**
       * Validate marks.
       */
      validateTotalMarks(
        newTotalMarks,
      );

      /**
       * Validate order.
       */
      validateOrder(newOrder);

      /**
       * Validate section.
       */
      const sectionData =
        await validateAssessmentSection(
          newSection,
          assessment._id,
          schoolId,
        );

      /**
       * A choice group can never have more assigned
       * questions than maxQuestions.
       */
      await validateChoiceGroupCapacity({
        choiceGroupId:
          choiceGroup._id,
        schoolId,
        maxQuestions:
          newMaxQuestions,
      });

      /**
       * Validate code uniqueness.
       */
      await validateUniqueCode({
        schoolId,
        assessmentId:
          assessment._id,
        code: newCode,
        excludeId: choiceGroup._id,
      });

      /**
       * Validate order uniqueness.
       */
      await validateUniqueOrder({
        schoolId,
        assessmentId:
          assessment._id,
        sectionId:
          sectionData?._id,
        order: newOrder,
        excludeId:
          choiceGroup._id,
      });

      /**
       * If deactivating the group, make sure it is not
       * currently being used by AssessmentQuestion.
       *
       * This prevents questions from referencing an
       * inactive choice group.
       */
      if (
        newIsActive === false &&
        choiceGroup.isActive === true
      ) {
        const questionCount =
          await getChoiceGroupQuestionCount(
            choiceGroup._id,
            schoolId,
          );

        if (questionCount > 0) {
          res.status(400);
          throw new Error(
            "Cannot deactivate a choice group that is assigned to assessment questions",
          );
        }
      }

      /**
       * School and assessment remain immutable.
       */
      choiceGroup.school =
        schoolId;

      choiceGroup.assessment =
        assessment._id;

      choiceGroup.section =
        sectionData?._id ||
        null;

      choiceGroup.name =
        newName.trim();

      choiceGroup.code =
        newCode;

      choiceGroup.selectionMode =
        newSelectionMode;

      choiceGroup.requiredQuestions =
        newRequiredQuestions;

      choiceGroup.maxQuestions =
        newMaxQuestions;

      choiceGroup.directions =
        newDirections;

      choiceGroup.totalMarks =
        newTotalMarks;

      choiceGroup.order =
        newOrder;

      choiceGroup.isActive =
        newIsActive;

      await choiceGroup.save();

      const result =
        await populateAssessmentChoiceGroup(
          AssessmentChoiceGroup.findOne({
            _id: choiceGroup._id,
            school: schoolId,
          }),
        );

      res.json(result);
    },
  );

/**
 * ======================================================
 * Delete Assessment Choice Group
 * ======================================================
 *
 * @route DELETE /api/assessment-choice-groups/:id
 */
const deleteAssessmentChoiceGroup =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      validateObjectId(
        id,
        "assessment choice group ID",
      );

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      const choiceGroup =
        await AssessmentChoiceGroup.findOne({
          _id: id,
          school: schoolId,
        });

      if (!choiceGroup) {
        res.status(404);
        throw new Error(
          "Assessment choice group not found",
        );
      }

      const assessment =
        await validateAssessment(
          choiceGroup.assessment,
          schoolId,
        );

      validateAssessmentStatus(
        assessment,
      );

      /**
       * Do not delete a choice group that is currently
       * referenced by AssessmentQuestion.
       *
       * This protects referential integrity.
       */
      const questionCount =
        await getChoiceGroupQuestionCount(
          choiceGroup._id,
          schoolId,
        );

      if (questionCount > 0) {
        res.status(400);
        throw new Error(
          "Cannot delete a choice group that is assigned to assessment questions",
        );
      }

      await choiceGroup.deleteOne();

      res.json({
        message:
          "Assessment choice group deleted successfully",
      });
    },
  );

/**
 * ======================================================
 * Activate Assessment Choice Group
 * ======================================================
 *
 * @route PATCH
 * /api/assessment-choice-groups/:id/activate
 */
const activateAssessmentChoiceGroup =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      validateObjectId(
        id,
        "assessment choice group ID",
      );

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      const choiceGroup =
        await AssessmentChoiceGroup.findOne({
          _id: id,
          school: schoolId,
        });

      if (!choiceGroup) {
        res.status(404);
        throw new Error(
          "Assessment choice group not found",
        );
      }

      const assessment =
        await validateAssessment(
          choiceGroup.assessment,
          schoolId,
        );

      validateAssessmentStatus(
        assessment,
      );

      choiceGroup.isActive =
        true;

      await choiceGroup.save();

      const result =
        await populateAssessmentChoiceGroup(
          AssessmentChoiceGroup.findOne({
            _id: choiceGroup._id,
            school: schoolId,
          }),
        );

      res.json(result);
    },
  );

/**
 * ======================================================
 * Deactivate Assessment Choice Group
 * ======================================================
 *
 * @route PATCH
 * /api/assessment-choice-groups/:id/deactivate
 */
const deactivateAssessmentChoiceGroup =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      validateObjectId(
        id,
        "assessment choice group ID",
      );

      const schoolId =
        validateUserSchoolAccess(
          req,
          res,
        );

      const choiceGroup =
        await AssessmentChoiceGroup.findOne({
          _id: id,
          school: schoolId,
        });

      if (!choiceGroup) {
        res.status(404);
        throw new Error(
          "Assessment choice group not found",
        );
      }

      const assessment =
        await validateAssessment(
          choiceGroup.assessment,
          schoolId,
        );

      validateAssessmentStatus(
        assessment,
      );

      /**
       * Don't deactivate a group that is already
       * assigned to assessment questions.
       */
      const questionCount =
        await getChoiceGroupQuestionCount(
          choiceGroup._id,
          schoolId,
        );

      if (questionCount > 0) {
        res.status(400);
        throw new Error(
          "Cannot deactivate a choice group that is assigned to assessment questions",
        );
      }

      choiceGroup.isActive =
        false;

      await choiceGroup.save();

      const result =
        await populateAssessmentChoiceGroup(
          AssessmentChoiceGroup.findOne({
            _id: choiceGroup._id,
            school: schoolId,
          }),
        );

      res.json(result);
    },
  );

export {
  createAssessmentChoiceGroup,
  getAssessmentChoiceGroups,
  getAssessmentChoiceGroupById,
  getChoiceGroupsByAssessment,
  getChoiceGroupsBySection,
  getQuestionsByChoiceGroup,
  updateAssessmentChoiceGroup,
  deleteAssessmentChoiceGroup,
  activateAssessmentChoiceGroup,
  deactivateAssessmentChoiceGroup,
};
