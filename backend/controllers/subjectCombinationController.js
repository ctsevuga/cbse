import asyncHandler from "../middleware/asyncHandler.js";

import SubjectCombination from "../models/subjectCombinationModel.js";
import Stream from "../models/streamModel.js";
import Subject from "../models/subjectModel.js";


// ------------------------------------------------------
// Validate stream
// ------------------------------------------------------

const validateStream = async (streamId) => {
  if (!streamId) {
    throw new Error("Stream is required");
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


// ------------------------------------------------------
// Validate subjects
// ------------------------------------------------------
//
// Input:
// [
//   {
//     subject: ObjectId,
//     type: "CORE"
//   },
//   {
//     subject: ObjectId,
//     type: "ELECTIVE"
//   }
// ]
//
// Returns:
// {
//   subjects: [Subject documents],
//   subjectRules: [
//     {
//       subject: ObjectId,
//       type: "CORE"
//     }
//   ],
//   coreCount: Number,
//   electiveCount: Number
// }
// ------------------------------------------------------

const validateSubjects = async (subjects) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new Error("At least one subject is required");
  }

  // ----------------------------------------------------
  // Validate structure
  // ----------------------------------------------------

  for (const item of subjects) {
    if (!item || typeof item !== "object") {
      throw new Error(
        "Each subject must be an object containing subject and type",
      );
    }

    if (!item.subject) {
      throw new Error(
        "Subject ID is required for every subject",
      );
    }

    if (!item.type) {
      throw new Error(
        "Subject type is required for every subject",
      );
    }

    if (
      !["CORE", "ELECTIVE"].includes(
        item.type,
      )
    ) {
      throw new Error(
        "Subject type must be either CORE or ELECTIVE",
      );
    }
  }

  // ----------------------------------------------------
  // Extract subject IDs
  // ----------------------------------------------------

  const subjectIds = subjects.map(
    (item) => item.subject,
  );

  // ----------------------------------------------------
  // Prevent duplicate subjects
  // ----------------------------------------------------

  const uniqueSubjectIds = [
    ...new Set(
      subjectIds.map(
        (id) => id.toString(),
      ),
    ),
  ];

  if (
    uniqueSubjectIds.length !== subjectIds.length
  ) {
    throw new Error(
      "Duplicate subjects are not allowed",
    );
  }

  // ----------------------------------------------------
  // Validate subjects exist
  // ----------------------------------------------------

  const subjectDocuments = await Subject.find({
    _id: {
      $in: uniqueSubjectIds,
    },
  });

  if (
    subjectDocuments.length !==
    uniqueSubjectIds.length
  ) {
    throw new Error(
      "One or more subjects not found",
    );
  }

  // ----------------------------------------------------
  // Validate active subjects
  // ----------------------------------------------------

  const inactiveSubjects =
    subjectDocuments.filter(
      (subject) => !subject.isActive,
    );

  if (inactiveSubjects.length > 0) {
    throw new Error(
      "One or more selected subjects are inactive",
    );
  }

  // ----------------------------------------------------
  // Count core/elective subjects
  // ----------------------------------------------------

  const coreSubjects = subjects.filter(
    (item) => item.type === "CORE",
  );

  const electiveSubjects = subjects.filter(
    (item) => item.type === "ELECTIVE",
  );

  // ----------------------------------------------------
  // At least one core subject
  // ----------------------------------------------------

  if (coreSubjects.length === 0) {
    throw new Error(
      "At least one core subject is required",
    );
  }

  // ----------------------------------------------------
  // Return normalized data
  // ----------------------------------------------------

  return {
    subjects: subjectDocuments,

    subjectRules: subjects.map(
      (item) => ({
        subject: item.subject,
        type: item.type,
      }),
    ),

    coreCount: coreSubjects.length,

    electiveCount:
      electiveSubjects.length,
  };
};


// ------------------------------------------------------
// Validate elective rules
// ------------------------------------------------------

const validateElectiveRules = ({
  minimumElectives,
  maximumElectives,
  availableElectives,
}) => {
  const min = Number(minimumElectives);
  const max = Number(maximumElectives);

  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max)
  ) {
    throw new Error(
      "Minimum electives and maximum electives must be integers",
    );
  }

  if (min < 0 || max < 0) {
    throw new Error(
      "Minimum electives and maximum electives cannot be negative",
    );
  }

  if (min > max) {
    throw new Error(
      "Minimum electives cannot be greater than maximum electives",
    );
  }

  if (max > availableElectives) {
    throw new Error(
      "Maximum electives cannot be greater than the number of available elective subjects",
    );
  }

  if (min > availableElectives) {
    throw new Error(
      "Minimum electives cannot be greater than the number of available elective subjects",
    );
  }

  return {
    minimumElectives: min,
    maximumElectives: max,
  };
};


// ------------------------------------------------------
// Create subject combination
// @route   POST /api/subject-combinations
// @access  Private
// ------------------------------------------------------

const createSubjectCombination = asyncHandler(
  async (req, res) => {
    const {
      stream,
      name,
      code,
      subjects,
      minimumElectives,
      maximumElectives,
    } = req.body;

    // ----------------------------------------------------
    // Basic validation
    // ----------------------------------------------------

    if (!name || !code) {
      res.status(400);
      throw new Error(
        "Name and code are required",
      );
    }

    if (
      minimumElectives === undefined ||
      maximumElectives === undefined
    ) {
      res.status(400);
      throw new Error(
        "Minimum electives and maximum electives are required",
      );
    }

    // ----------------------------------------------------
    // Validate stream
    // ----------------------------------------------------

    const validatedStream =
      await validateStream(stream);

    // ----------------------------------------------------
    // Validate subjects
    // ----------------------------------------------------

    const validatedSubjects =
      await validateSubjects(subjects);

    // ----------------------------------------------------
    // Validate elective rules
    // ----------------------------------------------------

    const electiveRules =
      validateElectiveRules({
        minimumElectives,
        maximumElectives,
        availableElectives:
          validatedSubjects.electiveCount,
      });

    // ----------------------------------------------------
    // Normalize code
    // ----------------------------------------------------

    const normalizedCode =
      code.trim().toUpperCase();

    // ----------------------------------------------------
    // Check duplicate combination
    // ----------------------------------------------------

    const existingCombination =
      await SubjectCombination.findOne({
        $or: [
          {
            stream:
              validatedStream._id,
          },
          {
            code: normalizedCode,
          },
        ],
      });

    if (existingCombination) {
      res.status(400);

      if (
        existingCombination.stream.toString() ===
        validatedStream._id.toString()
      ) {
        throw new Error(
          "Subject combination already exists for this stream",
        );
      }

      throw new Error(
        "Subject combination code already exists",
      );
    }

    // ----------------------------------------------------
    // Create combination
    // ----------------------------------------------------

    const subjectCombination =
      await SubjectCombination.create({
        stream: validatedStream._id,

        name: name.trim(),

        code: normalizedCode,

        subjects:
          validatedSubjects.subjectRules,

        minimumElectives:
          electiveRules.minimumElectives,

        maximumElectives:
          electiveRules.maximumElectives,
      });

    // ----------------------------------------------------
    // Populate result
    // ----------------------------------------------------

    const result =
      await SubjectCombination.findById(
        subjectCombination._id,
      )
        .populate(
          "stream",
          "name code",
        )
        .populate(
          "subjects.subject",
          "name code",
        );

    res.status(201).json(result);
  },
);


// ------------------------------------------------------
// Get all subject combinations
// @route   GET /api/subject-combinations
// @access  Private
// ------------------------------------------------------

const getSubjectCombinations =
  asyncHandler(async (req, res) => {
    const {
      stream,
      isActive,
      code,
    } = req.query;

    const filter = {};

    if (stream) {
      filter.stream = stream;
    }

    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    if (code) {
      filter.code =
        code.trim().toUpperCase();
    }

    const subjectCombinations =
      await SubjectCombination.find(filter)
        .populate(
          "stream",
          "name code",
        )
        .populate(
          "subjects.subject",
          "name code",
        )
        .sort({
          code: 1,
        });

    res.json(subjectCombinations);
  });


// ------------------------------------------------------
// Get subject combination by ID
// @route   GET /api/subject-combinations/:id
// @access  Private
// ------------------------------------------------------

const getSubjectCombinationById =
  asyncHandler(async (req, res) => {
    const subjectCombination =
      await SubjectCombination.findById(
        req.params.id,
      )
        .populate(
          "stream",
          "name code",
        )
        .populate(
          "subjects.subject",
          "name code",
        );

    if (!subjectCombination) {
      res.status(404);
      throw new Error(
        "Subject combination not found",
      );
    }

    res.json(subjectCombination);
  });


// ------------------------------------------------------
// Get subject combination by stream
// @route   GET /api/subject-combinations/stream/:streamId
// @access  Private
// ------------------------------------------------------

const getSubjectCombinationByStream =
  asyncHandler(async (req, res) => {
    const { streamId } = req.params;

    await validateStream(streamId);

    const subjectCombination =
      await SubjectCombination.findOne({
        stream: streamId,
        isActive: true,
      })
        .populate(
          "stream",
          "name code",
        )
        .populate(
          "subjects.subject",
          "name code",
        );

    if (!subjectCombination) {
      res.status(404);
      throw new Error(
        "Subject combination not found for this stream",
      );
    }

    res.json(subjectCombination);
  });


// ------------------------------------------------------
// Update subject combination
// @route   PUT /api/subject-combinations/:id
// @access  Private
// ------------------------------------------------------

const updateSubjectCombination =
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subjectCombination =
      await SubjectCombination.findById(id);

    if (!subjectCombination) {
      res.status(404);
      throw new Error(
        "Subject combination not found",
      );
    }

    const {
      stream,
      name,
      code,
      subjects,
      minimumElectives,
      maximumElectives,
    } = req.body;

    // ----------------------------------------------------
    // Resolve new values
    // ----------------------------------------------------

    const newStream =
      stream !== undefined
        ? stream
        : subjectCombination.stream;

    const newName =
      name !== undefined
        ? name.trim()
        : subjectCombination.name;

    const newCode =
      code !== undefined
        ? code.trim().toUpperCase()
        : subjectCombination.code;

    const newSubjects =
      subjects !== undefined
        ? subjects
        : subjectCombination.subjects;

    const newMinimumElectives =
      minimumElectives !== undefined
        ? Number(minimumElectives)
        : subjectCombination.minimumElectives;

    const newMaximumElectives =
      maximumElectives !== undefined
        ? Number(maximumElectives)
        : subjectCombination.maximumElectives;

    // ----------------------------------------------------
    // Validate stream
    // ----------------------------------------------------

    const validatedStream =
      await validateStream(newStream);

    // ----------------------------------------------------
    // Validate subjects
    // ----------------------------------------------------

    const validatedSubjects =
      await validateSubjects(newSubjects);

    // ----------------------------------------------------
    // Validate elective rules
    // ----------------------------------------------------

    const electiveRules =
      validateElectiveRules({
        minimumElectives:
          newMinimumElectives,

        maximumElectives:
          newMaximumElectives,

        availableElectives:
          validatedSubjects.electiveCount,
      });

    // ----------------------------------------------------
    // Check duplicate combination
    // ----------------------------------------------------

    const duplicateCombination =
      await SubjectCombination.findOne({
        _id: {
          $ne: id,
        },

        $or: [
          {
            stream:
              validatedStream._id,
          },
          {
            code: newCode,
          },
        ],
      });

    if (duplicateCombination) {
      res.status(400);

      if (
        duplicateCombination.stream.toString() ===
        validatedStream._id.toString()
      ) {
        throw new Error(
          "A subject combination already exists for this stream",
        );
      }

      throw new Error(
        "Subject combination code already exists",
      );
    }

    // ----------------------------------------------------
    // Update
    // ----------------------------------------------------

    subjectCombination.stream =
      validatedStream._id;

    subjectCombination.name =
      newName;

    subjectCombination.code =
      newCode;

    subjectCombination.subjects =
      validatedSubjects.subjectRules;

    subjectCombination.minimumElectives =
      electiveRules.minimumElectives;

    subjectCombination.maximumElectives =
      electiveRules.maximumElectives;

    // ----------------------------------------------------
    // Save
    // ----------------------------------------------------

    const updatedCombination =
      await subjectCombination.save();

    // ----------------------------------------------------
    // Populate result
    // ----------------------------------------------------

    const result =
      await SubjectCombination.findById(
        updatedCombination._id,
      )
        .populate(
          "stream",
          "name code",
        )
        .populate(
          "subjects.subject",
          "name code",
        );

    res.json(result);
  });


// ------------------------------------------------------
// Update subject combination status
// @route   PATCH /api/subject-combinations/:id/status
// @access  Private
// ------------------------------------------------------

const updateSubjectCombinationStatus =
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be a boolean",
      );
    }

    const subjectCombination =
      await SubjectCombination.findById(id);

    if (!subjectCombination) {
      res.status(404);
      throw new Error(
        "Subject combination not found",
      );
    }

    // ----------------------------------------------------
    // When activating, validate the configuration
    // ----------------------------------------------------

    if (isActive) {
      await validateStream(
        subjectCombination.stream,
      );

      const validatedSubjects =
        await validateSubjects(
          subjectCombination.subjects,
        );

      validateElectiveRules({
        minimumElectives:
          subjectCombination.minimumElectives,

        maximumElectives:
          subjectCombination.maximumElectives,

        availableElectives:
          validatedSubjects.electiveCount,
      });
    }

    // ----------------------------------------------------
    // Update status
    // ----------------------------------------------------

    subjectCombination.isActive =
      isActive;

    const updatedCombination =
      await subjectCombination.save();

    // ----------------------------------------------------
    // Populate result
    // ----------------------------------------------------

    const result =
      await SubjectCombination.findById(
        updatedCombination._id,
      )
        .populate(
          "stream",
          "name code",
        )
        .populate(
          "subjects.subject",
          "name code",
        );

    res.json(result);
  });


export {
  createSubjectCombination,
  getSubjectCombinations,
  getSubjectCombinationById,
  getSubjectCombinationByStream,
  updateSubjectCombination,
  updateSubjectCombinationStatus,
};
