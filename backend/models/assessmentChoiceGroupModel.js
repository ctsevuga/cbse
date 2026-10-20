import mongoose from "mongoose";

const assessmentChoiceGroupSchema =
  mongoose.Schema(
    {
      /**
       * ==================================================
       * School
       * ==================================================
       *
       * AssessmentChoiceGroup is a school-level entity.
       */
      school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true,
        index: true,
      },

      /**
       * ==================================================
       * Assessment
       * ==================================================
       *
       * Choice group belongs to a specific assessment.
       */
      assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
        required: true,
        index: true,
      },

      /**
       * ==================================================
       * Section
       * ==================================================
       *
       * Optional.
       *
       * If a choice group is intended to be limited to
       * one assessment section, this allows the group
       * to be associated with that section.
       *
       * Example:
       *
       *   Section A:
       *     Answer any 2 of Questions 1-4
       *
       * If your choice group is assessment-wide, this
       * can remain null.
       */
      section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AssessmentSection",
        default: null,
        index: true,
      },

      /**
       * ==================================================
       * Name
       * ==================================================
       *
       * Human-readable name.
       *
       * Example:
       *   "Attempt Any 2"
       *   "Internal Choice"
       *   "Section A Choice"
       */
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
      },

      /**
       * ==================================================
       * Code
       * ==================================================
       *
       * Optional unique code within an assessment.
       *
       * Example:
       *   CG-01
       *   MCQ-CHOICE-01
       */
      code: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: 50,
      },

      /**
       * ==================================================
       * Selection Mode
       * ==================================================
       *
       * Defines how many questions can/should be selected.
       */
      selectionMode: {
        type: String,
        enum: [
          "ANY",
          "EXACT",
          "AT_LEAST",
          "AT_MOST",
        ],
        default: "ANY",
        required: true,
      },

      /**
       * ==================================================
       * Required Questions
       * ==================================================
       *
       * Number of questions that must be selected,
       * depending on selectionMode.
       *
       * Examples:
       *
       * ANY:
       *   Attempt any 2
       *
       * EXACT:
       *   Attempt exactly 2
       *
       * AT_LEAST:
       *   Attempt at least 2
       *
       * AT_MOST:
       *   Attempt at most 2
       */
      requiredQuestions: {
        type: Number,
        required: true,
        min: 1,
      },

      /**
       * ==================================================
       * Maximum Questions
       * ==================================================
       *
       * Optional maximum number of questions that may
       * participate in this choice group.
       *
       * Example:
       *
       *   4 questions are in the group
       *   Students must answer any 2
       *
       * maxQuestions = 4
       */
      maxQuestions: {
        type: Number,
        min: 1,
      },

      /**
       * ==================================================
       * Directions
       * ==================================================
       *
       * Optional instructions shown to students.
       *
       * Example:
       *   "Attempt any two questions."
       */
      directions: {
        type: String,
        trim: true,
        maxlength: 1000,
      },

      /**
       * ==================================================
       * Marks
       * ==================================================
       *
       * Optional total marks represented by the choice
       * group.
       *
       * For example:
       *
       *   4 questions × 5 marks
       *   Attempt any 2
       *
       * groupMarks = 10
       */
      totalMarks: {
        type: Number,
        min: 0,
      },

      /**
       * ==================================================
       * Order
       * ==================================================
       *
       * Display/order of the choice group within the
       * assessment or section.
       */
      order: {
        type: Number,
        min: 1,
      },

      /**
       * ==================================================
       * Active Status
       * ==================================================
       */
      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },
    },
    {
      timestamps: true,
    },
  );

/**
 * ======================================================
 * Indexes
 * ======================================================
 */

/**
 * Choice group code should be unique within an
 * assessment when a code is provided.
 */
assessmentChoiceGroupSchema.index(
  {
    school: 1,
    assessment: 1,
    code: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      code: {
        $exists: true,
        $ne: null,
        $ne: "",
      },
    },
  },
);

/**
 * Useful for listing choice groups for an assessment.
 */
assessmentChoiceGroupSchema.index({
  school: 1,
  assessment: 1,
  isActive: 1,
});

/**
 * Useful when choice groups are section-specific.
 */
assessmentChoiceGroupSchema.index({
  school: 1,
  assessment: 1,
  section: 1,
  order: 1,
});

/**
 * Useful for ordering choice groups.
 */
assessmentChoiceGroupSchema.index({
  school: 1,
  assessment: 1,
  order: 1,
});

/**
 * ======================================================
 * Validation
 * ======================================================
 */

/**
 * Validate selection limits.
 */
assessmentChoiceGroupSchema.pre(
  "validate",
  function (next) {
    if (
      this.maxQuestions !==
        undefined &&
      this.requiredQuestions >
        this.maxQuestions
    ) {
      return next(
        new Error(
          "requiredQuestions cannot be greater than maxQuestions",
        ),
      );
    }

    next();
  },
);

const AssessmentChoiceGroup =
  mongoose.model(
    "AssessmentChoiceGroup",
    assessmentChoiceGroupSchema,
  );

export default AssessmentChoiceGroup;
