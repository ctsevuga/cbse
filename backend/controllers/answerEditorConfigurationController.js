import asyncHandler from "../middleware/asyncHandler.js";

import AnswerEditorConfiguration from "../models/answerEditorConfigurationModel.js";
import Subject from "../models/subjectModel.js";

/**
 * ======================================================
 * Validate Subject
 * ======================================================
 *
 * Subject is a global CBSE master.
 * It is maintained by SUPER_ADMIN and is not
 * associated with a school.
 */
const validateSubject = async (subjectId) => {
  if (!subjectId) {
    const error = new Error("Subject is required");
    error.statusCode = 400;
    throw error;
  }

  const subject = await Subject.findById(subjectId);

  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }

  if (!subject.isActive) {
    const error = new Error("Subject is inactive");
    error.statusCode = 400;
    throw error;
  }

  return subject;
};

/**
 * ======================================================
 * Validate Answer Mode
 * ======================================================
 */
const validateAnswerMode = (answerMode) => {
  const validModes = [
    "MCQ",
    "TEXT",
    "RICH_TEXT",
    "MATH",
    "TABLE",
    "CODE",
    "IMAGE",
    "DRAWING",
    "MATH_TEXT",
    "RICH_TEXT_IMAGE",
    "MATH_TABLE",
    "COMBINED",
  ];

  if (!validModes.includes(answerMode)) {
    const error = new Error("Invalid answer mode");
    error.statusCode = 400;
    throw error;
  }
};

/**
 * ======================================================
 * Validate SUPER_ADMIN
 * ======================================================
 *
 * Answer editor configurations are global standard
 * master data and can only be maintained by
 * SUPER_ADMIN.
 */
const validateSuperAdmin = (req) => {
  if (req.user.role !== "SUPER_ADMIN") {
    const error = new Error(
      "Only SUPER_ADMIN can manage answer editor configurations",
    );
    error.statusCode = 403;
    throw error;
  }
};

/**
 * ======================================================
 * Create Answer Editor Configuration
 * ======================================================
 *
 * SUPER_ADMIN only.
 */
export const createAnswerEditorConfiguration =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const {
      subject,
      name,
      code,
      answerMode,
      configuration,
    } = req.body;

    await validateSubject(subject);

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error("Name is required");
    }

    if (!code || !code.trim()) {
      res.status(400);
      throw new Error("Code is required");
    }

    if (!answerMode) {
      res.status(400);
      throw new Error("Answer mode is required");
    }

    validateAnswerMode(answerMode);

    const normalizedCode = code
      .trim()
      .toUpperCase();

    const existingConfiguration =
      await AnswerEditorConfiguration.findOne({
        subject,
        code: normalizedCode,
      });

    if (existingConfiguration) {
      res.status(400);
      throw new Error(
        "Answer editor configuration with this code already exists for the subject",
      );
    }

    const answerEditorConfiguration =
      await AnswerEditorConfiguration.create({
        subject,
        name: name.trim(),
        code: normalizedCode,
        answerMode,
        configuration: configuration || {},
        isActive: true,
      });

    const populatedConfiguration =
      await AnswerEditorConfiguration.findById(
        answerEditorConfiguration._id,
      ).populate(
        "subject",
        "name code shortName subjectType",
      );

    res.status(201).json(
      populatedConfiguration,
    );
  });

/**
 * ======================================================
 * Get Answer Editor Configurations
 * ======================================================
 *
 * All authenticated users can read the standard
 * configurations available in the system.
 *
 * Supported filters:
 *   subject
 *   answerMode
 *   code
 *   isActive
 */
export const getAnswerEditorConfigurations =
  asyncHandler(async (req, res) => {
    const {
      subject,
      answerMode,
      code,
      isActive,
    } = req.query;

    const filter = {};

    if (subject) {
      await validateSubject(subject);

      filter.subject = subject;
    }

    if (answerMode) {
      validateAnswerMode(answerMode);

      filter.answerMode = answerMode;
    }

    if (code) {
      filter.code = code
        .trim()
        .toUpperCase();
    }

    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    const configurations =
      await AnswerEditorConfiguration.find(
        filter,
      )
        .populate(
          "subject",
          "name code shortName subjectType",
        )
        .sort({
          subject: 1,
          name: 1,
        });

    res.json(configurations);
  });

/**
 * ======================================================
 * Get Configurations By Subject
 * ======================================================
 *
 * Subject is global, so there is no school
 * authorization/filtering.
 */
export const getAnswerEditorConfigurationsBySubject =
  asyncHandler(async (req, res) => {
    const { subjectId } = req.params;

    await validateSubject(subjectId);

    const configurations =
      await AnswerEditorConfiguration.find({
        subject: subjectId,
      })
        .populate(
          "subject",
          "name code shortName subjectType",
        )
        .sort({
          name: 1,
        });

    res.json(configurations);
  });

/**
 * ======================================================
 * Get Configuration By ID
 * ======================================================
 *
 * All authenticated users can read a standard
 * configuration.
 */
export const getAnswerEditorConfigurationById =
  asyncHandler(async (req, res) => {
    const answerEditorConfiguration =
      await AnswerEditorConfiguration.findById(
        req.params.id,
      ).populate(
        "subject",
        "name code shortName subjectType",
      );

    if (!answerEditorConfiguration) {
      res.status(404);
      throw new Error(
        "Answer editor configuration not found",
      );
    }

    res.json(
      answerEditorConfiguration,
    );
  });

/**
 * ======================================================
 * Update Answer Editor Configuration
 * ======================================================
 *
 * SUPER_ADMIN only.
 */
export const updateAnswerEditorConfiguration =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const answerEditorConfiguration =
      await AnswerEditorConfiguration.findById(
        req.params.id,
      );

    if (!answerEditorConfiguration) {
      res.status(404);
      throw new Error(
        "Answer editor configuration not found",
      );
    }

    const {
      subject,
      name,
      code,
      answerMode,
      configuration,
    } = req.body;

    const subjectId =
      subject ||
      answerEditorConfiguration.subject;

    const selectedCode =
      code !== undefined
        ? code.trim().toUpperCase()
        : answerEditorConfiguration.code;

    const selectedAnswerMode =
      answerMode ||
      answerEditorConfiguration.answerMode;

    await validateSubject(subjectId);

    validateAnswerMode(
      selectedAnswerMode,
    );

    if (
      name !== undefined &&
      !name.trim()
    ) {
      res.status(400);
      throw new Error(
        "Name cannot be empty",
      );
    }

    const duplicate =
      await AnswerEditorConfiguration.findOne(
        {
          _id: {
            $ne:
              answerEditorConfiguration._id,
          },
          subject: subjectId,
          code: selectedCode,
        },
      );

    if (duplicate) {
      res.status(400);
      throw new Error(
        "Answer editor configuration with this code already exists for the subject",
      );
    }

    answerEditorConfiguration.subject =
      subjectId;

    if (name !== undefined) {
      answerEditorConfiguration.name =
        name.trim();
    }

    answerEditorConfiguration.code =
      selectedCode;

    answerEditorConfiguration.answerMode =
      selectedAnswerMode;

    if (configuration !== undefined) {
      answerEditorConfiguration.configuration =
        configuration;
    }

    const updatedConfiguration =
      await answerEditorConfiguration.save();

    const populatedConfiguration =
      await AnswerEditorConfiguration.findById(
        updatedConfiguration._id,
      ).populate(
        "subject",
        "name code shortName subjectType",
      );

    res.json(
      populatedConfiguration,
    );
  });

/**
 * ======================================================
 * Update Configuration Status
 * ======================================================
 *
 * SUPER_ADMIN only.
 */
export const updateAnswerEditorConfigurationStatus =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const answerEditorConfiguration =
      await AnswerEditorConfiguration.findById(
        req.params.id,
      );

    if (!answerEditorConfiguration) {
      res.status(404);
      throw new Error(
        "Answer editor configuration not found",
      );
    }

    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be a boolean",
      );
    }

    answerEditorConfiguration.isActive =
      isActive;

    const updatedConfiguration =
      await answerEditorConfiguration.save();

    const populatedConfiguration =
      await AnswerEditorConfiguration.findById(
        updatedConfiguration._id,
      ).populate(
        "subject",
        "name code shortName subjectType",
      );

    res.json(
      populatedConfiguration,
    );
  });

/**
 * ======================================================
 * Delete Answer Editor Configuration
 * ======================================================
 *
 * SUPER_ADMIN only.
 */
export const deleteAnswerEditorConfiguration =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const answerEditorConfiguration =
      await AnswerEditorConfiguration.findById(
        req.params.id,
      );

    if (!answerEditorConfiguration) {
      res.status(404);
      throw new Error(
        "Answer editor configuration not found",
      );
    }

    await answerEditorConfiguration.deleteOne();

    res.json({
      message:
        "Answer editor configuration deleted successfully",
    });
  });