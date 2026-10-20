import asyncHandler from "../middleware/asyncHandler.js";

import Topic from "../models/topicModel.js";
import Chapter from "../models/chapterModel.js";
import Subject from "../models/subjectModel.js";

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

const validateChapter = async (chapterId, subjectId) => {
  const chapter = await Chapter.findById(chapterId);

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  if (String(chapter.subject) !== String(subjectId)) {
    throw new Error(
      "Chapter does not belong to the selected subject",
    );
  }

  if (!chapter.isActive) {
    throw new Error("Chapter is inactive");
  }

  return chapter;
};


// @desc    Create topic
// @route   POST /api/topics
// @access  Private
const createTopic = asyncHandler(async (req, res) => {
  const {
    subject,
    chapter,
    name,
    description,
  } = req.body;

  if (!subject) {
    res.status(400);
    throw new Error("Subject is required");
  }

  if (!chapter) {
    res.status(400);
    throw new Error("Chapter is required");
  }

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Topic name is required");
  }

  const subjectData = await validateSubject(subject);

  await validateChapter(
    chapter,
    subjectData._id,
  );

  const topicName = name.trim();

  const existingTopic = await Topic.findOne({
    chapter,
    name: topicName,
  });

  if (existingTopic) {
    res.status(400);
    throw new Error(
      "Topic name already exists for this chapter",
    );
  }

  const topic = await Topic.create({
    subject: subjectData._id,
    chapter,
    name: topicName,
    description: description
      ? description.trim()
      : undefined,
  });

  const createdTopic = await Topic.findById(topic._id)
    .populate(
      "subject",
      "name code shortName subjectType cbseSubjectCode",
    )
    .populate(
      "chapter",
      "chapterNumber title description",
    );

  res.status(201).json(createdTopic);
});


// @desc    Get topics
// @route   GET /api/topics
// @access  Private
const getTopics = asyncHandler(async (req, res) => {
  const {
    subject,
    chapter,
    name,
    isActive,
  } = req.query;

  const filter = {};

  if (subject) {
    filter.subject = subject;
  }

  if (chapter) {
    filter.chapter = chapter;
  }

  if (name) {
    filter.name = {
      $regex: name.trim(),
      $options: "i",
    };
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const topics = await Topic.find(filter)
    .populate(
      "subject",
      "name code shortName subjectType cbseSubjectCode",
    )
    .populate(
      "chapter",
      "chapterNumber title description",
    )
    .sort({
      subject: 1,
      chapter: 1,
      name: 1,
    });

  res.json(topics);
});


// @desc    Get topics by subject
// @route   GET /api/topics/subject/:subjectId
// @access  Private
const getTopicsBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;

  const subject = await validateSubject(subjectId);

  const filter = {
    subject: subject._id,
  };

  if (req.query.chapter) {
    filter.chapter = req.query.chapter;
  }

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true";
  }

  const topics = await Topic.find(filter)
    .populate(
      "chapter",
      "chapterNumber title description",
    )
    .sort({
      chapter: 1,
      name: 1,
    });

  res.json(topics);
});


// @desc    Get topics by chapter
// @route   GET /api/topics/chapter/:chapterId
// @access  Private
const getTopicsByChapter = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;

  const chapter = await Chapter.findById(chapterId);

  if (!chapter) {
    res.status(404);
    throw new Error("Chapter not found");
  }

  if (!chapter.isActive) {
    res.status(400);
    throw new Error("Chapter is inactive");
  }

  const filter = {
    chapter: chapter._id,
    subject: chapter.subject,
  };

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true";
  }

  const topics = await Topic.find(filter)
    .populate(
      "subject",
      "name code shortName subjectType cbseSubjectCode",
    )
    .sort({
      name: 1,
    });

  res.json(topics);
});


// @desc    Get topic by ID
// @route   GET /api/topics/:id
// @access  Private
const getTopicById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topic = await Topic.findById(id)
    .populate(
      "subject",
      "name code shortName subjectType cbseSubjectCode",
    )
    .populate(
      "chapter",
      "chapterNumber title description subject",
    );

  if (!topic) {
    res.status(404);
    throw new Error("Topic not found");
  }

  res.json(topic);
});


// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private
const updateTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topic = await Topic.findById(id);

  if (!topic) {
    res.status(404);
    throw new Error("Topic not found");
  }

  const {
    subject,
    chapter,
    name,
    description,
  } = req.body;

  const newSubject =
    subject || topic.subject;

  const newChapter =
    chapter || topic.chapter;

  const newName =
    name !== undefined
      ? name.trim()
      : topic.name;

  const newDescription =
    description !== undefined
      ? description.trim()
      : topic.description;

  if (!newName) {
    res.status(400);
    throw new Error("Topic name is required");
  }

  const subjectData = await validateSubject(
    newSubject,
  );

  await validateChapter(
    newChapter,
    subjectData._id,
  );

  const duplicateTopic = await Topic.findOne({
    _id: { $ne: id },
    chapter: newChapter,
    name: newName,
  });

  if (duplicateTopic) {
    res.status(400);
    throw new Error(
      "Topic name already exists for this chapter",
    );
  }

  topic.subject = subjectData._id;
  topic.chapter = newChapter;
  topic.name = newName;
  topic.description = newDescription;

  const updatedTopic = await topic.save();

  const result = await Topic.findById(
    updatedTopic._id,
  )
    .populate(
      "subject",
      "name code shortName subjectType cbseSubjectCode",
    )
    .populate(
      "chapter",
      "chapterNumber title description",
    );

  res.json(result);
});


// @desc    Update topic status
// @route   PATCH /api/topics/:id/status
// @access  Private
const updateTopicStatus = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error("isActive must be a boolean");
    }

    const topic = await Topic.findById(id);

    if (!topic) {
      res.status(404);
      throw new Error("Topic not found");
    }

    if (isActive) {
      const subjectData = await validateSubject(
        topic.subject,
      );

      await validateChapter(
        topic.chapter,
        subjectData._id,
      );
    }

    topic.isActive = isActive;

    const updatedTopic = await topic.save();

    const result = await Topic.findById(
      updatedTopic._id,
    )
      .populate(
        "subject",
        "name code shortName subjectType cbseSubjectCode",
      )
      .populate(
        "chapter",
        "chapterNumber title description",
      );

    res.json(result);
  },
);


// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private
const deleteTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topic = await Topic.findById(id);

  if (!topic) {
    res.status(404);
    throw new Error("Topic not found");
  }

  await topic.deleteOne();

  res.json({
    message: "Topic deleted successfully",
  });
});


export {
  createTopic,
  getTopics,
  getTopicsBySubject,
  getTopicsByChapter,
  getTopicById,
  updateTopic,
  updateTopicStatus,
  deleteTopic,
};