import asyncHandler from "../middleware/asyncHandler.js";

import Subject from "../models/subjectModel.js";


// @desc    Create subject
// @route   POST /api/subjects
// @access  Private - SUPER_ADMIN
const createSubject = asyncHandler(async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    res.status(403);
    throw new Error(
      "Only SUPER_ADMIN can create subjects",
    );
  }

  const {
    code,
    name,
    shortName,
    subjectType,
    cbseSubjectCode,
  } = req.body;

  if (!code) {
    res.status(400);
    throw new Error("Subject code is required");
  }

  if (!name) {
    res.status(400);
    throw new Error("Subject name is required");
  }

  if (!subjectType) {
    res.status(400);
    throw new Error("Subject type is required");
  }

  const normalizedCode = code.trim().toUpperCase();

  const existingSubject = await Subject.findOne({
    code: normalizedCode,
  });

  if (existingSubject) {
    res.status(400);
    throw new Error(
      "Subject code already exists",
    );
  }

  const normalizedCBSESubjectCode =
    cbseSubjectCode
      ? cbseSubjectCode.trim()
      : undefined;

  if (normalizedCBSESubjectCode) {
    const existingCBSESubject =
      await Subject.findOne({
        cbseSubjectCode:
          normalizedCBSESubjectCode,
      });

    if (existingCBSESubject) {
      res.status(400);
      throw new Error(
        "CBSE subject code already exists",
      );
    }
  }

  const subject = await Subject.create({
    code: normalizedCode,
    name: name.trim(),
    shortName: shortName
      ? shortName.trim().toUpperCase()
      : undefined,
    subjectType,
    cbseSubjectCode:
      normalizedCBSESubjectCode,
  });

  res.status(201).json(subject);
});


// @desc    Get subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    shortName,
    subjectType,
    cbseSubjectCode,
    isActive,
  } = req.query;

  const filter = {};

  if (code) {
    filter.code = code.trim().toUpperCase();
  }

  if (name) {
    filter.name = {
      $regex: name.trim(),
      $options: "i",
    };
  }

  if (shortName) {
    filter.shortName =
      shortName.trim().toUpperCase();
  }

  if (subjectType) {
    filter.subjectType = subjectType;
  }

  if (cbseSubjectCode) {
    filter.cbseSubjectCode =
      cbseSubjectCode.trim();
  }

  if (isActive !== undefined) {
    filter.isActive =
      isActive === "true";
  }

  const subjects = await Subject.find(filter)
    .sort({
      subjectType: 1,
      name: 1,
    });

  res.json(subjects);
});


// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = asyncHandler(async (req, res) => {
  const subject =
    await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  res.json(subject);
});


// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private - SUPER_ADMIN
const updateSubject = asyncHandler(async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    res.status(403);
    throw new Error(
      "Only SUPER_ADMIN can update subjects",
    );
  }

  const subject =
    await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  const {
    code,
    name,
    shortName,
    subjectType,
    cbseSubjectCode,
  } = req.body;

  const newCode =
    code !== undefined
      ? code.trim().toUpperCase()
      : subject.code;

  const newName =
    name !== undefined
      ? name.trim()
      : subject.name;

  const newShortName =
    shortName !== undefined
      ? shortName.trim().toUpperCase()
      : subject.shortName;

  const newSubjectType =
    subjectType !== undefined
      ? subjectType
      : subject.subjectType;

  const newCBSESubjectCode =
    cbseSubjectCode !== undefined
      ? cbseSubjectCode.trim()
      : subject.cbseSubjectCode;

  const duplicateCode =
    await Subject.findOne({
      _id: { $ne: subject._id },
      code: newCode,
    });

  if (duplicateCode) {
    res.status(400);
    throw new Error(
      "Subject code already exists",
    );
  }

  if (newCBSESubjectCode) {
    const duplicateCBSECode =
      await Subject.findOne({
        _id: { $ne: subject._id },
        cbseSubjectCode:
          newCBSESubjectCode,
      });

    if (duplicateCBSECode) {
      res.status(400);
      throw new Error(
        "CBSE subject code already exists",
      );
    }
  }

  subject.code = newCode;
  subject.name = newName;
  subject.shortName = newShortName;
  subject.subjectType = newSubjectType;
  subject.cbseSubjectCode =
    newCBSESubjectCode;

  const updatedSubject =
    await subject.save();

  res.json(updatedSubject);
});


// @desc    Update subject status
// @route   PATCH /api/subjects/:id/status
// @access  Private - SUPER_ADMIN
const updateSubjectStatus =
  asyncHandler(async (req, res) => {
    if (req.user.role !== "SUPER_ADMIN") {
      res.status(403);
      throw new Error(
        "Only SUPER_ADMIN can update subject status",
      );
    }

    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be a boolean",
      );
    }

    const subject =
      await Subject.findById(req.params.id);

    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }

    subject.isActive = isActive;

    const updatedSubject =
      await subject.save();

    res.json(updatedSubject);
  });


// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private - SUPER_ADMIN
const deleteSubject = asyncHandler(async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    res.status(403);
    throw new Error(
      "Only SUPER_ADMIN can delete subjects",
    );
  }

  const subject =
    await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  await subject.deleteOne();

  res.json({
    message: "Subject deleted successfully",
  });
});


export {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  updateSubjectStatus,
  deleteSubject,
};