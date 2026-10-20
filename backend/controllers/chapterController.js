import asyncHandler from "../middleware/asyncHandler.js";

import Chapter from "../models/chapterModel.js";
import Subject from "../models/subjectModel.js";


// Validate subject
const validateSubject = async (subjectId) => {
  const subject = await Subject.findById(subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  if (!subject.isActive) {
    throw new Error("Subject is inactive");
  }

  return subject;
};


// @desc    Create chapter
// @route   POST /api/chapters
// @access  Private - SUPER_ADMIN
const createChapter = asyncHandler(async (req, res) => {
  const {
    subject,
    chapterNumber,
    title,
    description,
  } = req.body;

  if (!subject) {
    res.status(400);
    throw new Error("Subject is required");
  }

  if (chapterNumber === undefined) {
    res.status(400);
    throw new Error("Chapter number is required");
  }

  if (!title || !title.trim()) {
    res.status(400);
    throw new Error("Chapter title is required");
  }

  const chapterNo = Number(chapterNumber);

  if (!Number.isInteger(chapterNo) || chapterNo < 1) {
    res.status(400);
    throw new Error(
      "Chapter number must be a positive integer",
    );
  }

  const subjectData = await validateSubject(subject);

  const existingChapter = await Chapter.findOne({
    subject: subjectData._id,
    chapterNumber: chapterNo,
  });

  if (existingChapter) {
    res.status(400);
    throw new Error(
      "Chapter number already exists for this subject",
    );
  }

  const chapter = await Chapter.create({
    subject: subjectData._id,
    chapterNumber: chapterNo,
    title: title.trim(),
    description: description
      ? description.trim()
      : undefined,
  });

  const createdChapter = await Chapter.findById(
    chapter._id,
  ).populate(
    "subject",
    "name code shortName subjectType cbseSubjectCode",
  );

  res.status(201).json(createdChapter);
});


// @desc    Get chapters
// @route   GET /api/chapters
// @access  Private
const getChapters = asyncHandler(async (req, res) => {
  const {
    subject,
    chapterNumber,
    title,
    isActive,
  } = req.query;

  const filter = {};

  if (subject) {
    filter.subject = subject;
  }

  if (chapterNumber !== undefined) {
    const chapterNo = Number(chapterNumber);

    if (!Number.isInteger(chapterNo) || chapterNo < 1) {
      res.status(400);
      throw new Error(
        "chapterNumber must be a positive integer",
      );
    }

    filter.chapterNumber = chapterNo;
  }

  if (title) {
    filter.title = {
      $regex: title.trim(),
      $options: "i",
    };
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const chapters = await Chapter.find(filter)
    .populate(
      "subject",
      "name code shortName subjectType cbseSubjectCode",
    )
    .sort({
      subject: 1,
      chapterNumber: 1,
    });

  res.json(chapters);
});


// @desc    Get chapters by subject
// @route   GET /api/chapters/subject/:subjectId
// @access  Private
const getChaptersBySubject = asyncHandler(
  async (req, res) => {
    const { subjectId } = req.params;

    const subject = await validateSubject(subjectId);

    const filter = {
      subject: subject._id,
    };

    if (req.query.isActive !== undefined) {
      filter.isActive =
        req.query.isActive === "true";
    }

    const chapters = await Chapter.find(filter)
      .populate(
        "subject",
        "name code shortName subjectType cbseSubjectCode",
      )
      .sort({
        chapterNumber: 1,
      });

    res.json(chapters);
  },
);


// @desc    Get chapter by ID
// @route   GET /api/chapters/:id
// @access  Private
const getChapterById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chapter = await Chapter.findById(id).populate(
    "subject",
    "name code shortName subjectType cbseSubjectCode",
  );

  if (!chapter) {
    res.status(404);
    throw new Error("Chapter not found");
  }

  res.json(chapter);
});


// @desc    Update chapter
// @route   PUT /api/chapters/:id
// @access  Private - SUPER_ADMIN
const updateChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chapter = await Chapter.findById(id);

  if (!chapter) {
    res.status(404);
    throw new Error("Chapter not found");
  }

  const {
    subject,
    chapterNumber,
    title,
    description,
  } = req.body;

  const newSubject =
    subject || chapter.subject;

  const newChapterNumber =
    chapterNumber !== undefined
      ? Number(chapterNumber)
      : chapter.chapterNumber;

  const newTitle =
    title !== undefined
      ? title.trim()
      : chapter.title;

  const newDescription =
    description !== undefined
      ? description.trim()
      : chapter.description;

  if (
    !Number.isInteger(newChapterNumber) ||
    newChapterNumber < 1
  ) {
    res.status(400);
    throw new Error(
      "Chapter number must be a positive integer",
    );
  }

  if (!newTitle) {
    res.status(400);
    throw new Error("Chapter title is required");
  }

  const subjectData = await validateSubject(
    newSubject,
  );

  const duplicateChapter = await Chapter.findOne({
    _id: { $ne: id },
    subject: subjectData._id,
    chapterNumber: newChapterNumber,
  });

  if (duplicateChapter) {
    res.status(400);
    throw new Error(
      "Chapter number already exists for this subject",
    );
  }

  chapter.subject = subjectData._id;
  chapter.chapterNumber = newChapterNumber;
  chapter.title = newTitle;
  chapter.description = newDescription;

  const updatedChapter = await chapter.save();

  const result = await Chapter.findById(
    updatedChapter._id,
  ).populate(
    "subject",
    "name code shortName subjectType cbseSubjectCode",
  );

  res.json(result);
});


// @desc    Update chapter status
// @route   PATCH /api/chapters/:id/status
// @access  Private - SUPER_ADMIN
const updateChapterStatus = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error("isActive must be a boolean");
    }

    const chapter = await Chapter.findById(id);

    if (!chapter) {
      res.status(404);
      throw new Error("Chapter not found");
    }

    if (isActive) {
      await validateSubject(chapter.subject);
    }

    chapter.isActive = isActive;

    const updatedChapter = await chapter.save();

    const result = await Chapter.findById(
      updatedChapter._id,
    ).populate(
      "subject",
      "name code shortName subjectType cbseSubjectCode",
    );

    res.json(result);
  },
);


// @desc    Delete chapter
// @route   DELETE /api/chapters/:id
// @access  Private - SUPER_ADMIN
const deleteChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chapter = await Chapter.findById(id);

  if (!chapter) {
    res.status(404);
    throw new Error("Chapter not found");
  }

  await chapter.deleteOne();

  res.json({
    message: "Chapter deleted successfully",
  });
});


export {
  createChapter,
  getChapters,
  getChaptersBySubject,
  getChapterById,
  updateChapter,
  updateChapterStatus,
  deleteChapter,
};