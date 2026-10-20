import asyncHandler from "../middleware/asyncHandler.js";

import QuestionGroup from "../models/questionGroupModel.js";
import Question from "../models/questionModel.js";
import Subject from "../models/subjectModel.js";
import Chapter from "../models/chapterModel.js";
import User from "../models/userModel.js";

const GROUP_TYPES = [
  "PASSAGE",
  "CASE_STUDY",
  "DATA_INTERPRETATION",
  "SOURCE_BASED",
  "COMMON_DIRECTIONS",
];

const SELECTION_MODES = [
  "ALL",
  "ANY",
  "RANDOM",
];

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

const validateChapter = async (chapterId, subjectId) => {
  if (!chapterId) {
    return null;
  }

  const chapter = await Chapter.findById(chapterId).populate(
    "subject",
    "_id",
  );

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  if (
    chapter.subject._id.toString() !==
    subjectId.toString()
  ) {
    throw new Error(
      "Chapter does not belong to the selected subject",
    );
  }

  if (!chapter.isActive) {
    throw new Error("Chapter is inactive");
  }

  return chapter;
};

const validateGroupType = (groupType) => {
  if (!GROUP_TYPES.includes(groupType)) {
    throw new Error("Invalid question group type");
  }
};

const validateSelectionMode = (selectionMode) => {
  if (!SELECTION_MODES.includes(selectionMode)) {
    throw new Error("Invalid selection mode");
  }
};

const validateCreator = async (userId) => {
  const user = await User.findById(userId).select(
    "_id name role isActive",
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("User is inactive");
  }

  if (user.role !== "SUPER_ADMIN") {
    throw new Error(
      "Only SUPER_ADMIN can manage question groups",
    );
  }

  return user;
};

const populateQuestionGroup = (query) =>
  query
    .populate(
      "subject",
      "name code shortName subjectType",
    )
    .populate(
      "chapter",
      "chapterNumber title description",
    )
    .populate(
      "createdBy",
      "name email phone role",
    );

const updateGroupStatistics = async (groupId) => {
  const result = await Question.aggregate([
    {
      $match: {
        questionGroup: groupId,
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$questionGroup",
        questionCount: { $sum: 1 },
        totalMarks: { $sum: "$marks" },
      },
    },
  ]);

  const statistics = result[0] || {
    questionCount: 0,
    totalMarks: 0,
  };

  await QuestionGroup.findByIdAndUpdate(
    groupId,
    {
      questionCount: statistics.questionCount,
      totalMarks: statistics.totalMarks,
    },
  );

  return statistics;
};

export const createQuestionGroup = asyncHandler(
  async (req, res) => {
    await validateCreator(req.user._id);

    const {
      subject,
      chapter,
      title,
      groupType,
      directions,
      sharedContent,
      selectionMode = "ALL",
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error("Title is required");
    }

    validateGroupType(groupType);
    validateSelectionMode(selectionMode);

    await validateSubject(subject);
    await validateChapter(chapter, subject);

    const existingGroup =
      await QuestionGroup.findOne({
        subject,
        chapter: chapter || null,
        title: title.trim(),
        isActive: true,
      });

    if (existingGroup) {
      res.status(400);
      throw new Error(
        "An active question group with this title already exists",
      );
    }

    const questionGroup =
      await QuestionGroup.create({
        subject,
        chapter: chapter || undefined,
        title: title.trim(),
        groupType,
        directions,
        sharedContent,
        selectionMode,
        questionCount: 0,
        totalMarks: 0,
        createdBy: req.user._id,
        isActive: true,
      });

    const populatedGroup =
      await populateQuestionGroup(
        QuestionGroup.findById(
          questionGroup._id,
        ),
      );

    res.status(201).json(populatedGroup);
  },
);

export const getQuestionGroups = asyncHandler(
  async (req, res) => {
    const {
      subject,
      chapter,
      groupType,
      selectionMode,
      createdBy,
      isActive,
    } = req.query;

    const filter = {};

    if (subject) {
      filter.subject = subject;
    }

    if (chapter) {
      filter.chapter = chapter;
    }

    if (groupType) {
      validateGroupType(groupType);
      filter.groupType = groupType;
    }

    if (selectionMode) {
      validateSelectionMode(selectionMode);
      filter.selectionMode = selectionMode;
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const groups = await populateQuestionGroup(
      QuestionGroup.find(filter).sort({
        subject: 1,
        chapter: 1,
        title: 1,
      }),
    );

    for (const group of groups) {
      const statistics =
        await updateGroupStatistics(
          group._id,
        );

      group.questionCount =
        statistics.questionCount;

      group.totalMarks =
        statistics.totalMarks;
    }

    res.json(groups);
  },
);

export const getQuestionGroupById =
  asyncHandler(async (req, res) => {
    const group = await populateQuestionGroup(
      QuestionGroup.findById(req.params.id),
    );

    if (!group) {
      res.status(404);
      throw new Error("Question group not found");
    }

    const statistics =
      await updateGroupStatistics(group._id);

    group.questionCount =
      statistics.questionCount;

    group.totalMarks =
      statistics.totalMarks;

    res.json(group);
  });

export const getQuestionGroupsBySubject =
  asyncHandler(async (req, res) => {
    const { subjectId } = req.params;

    await validateSubject(subjectId);

    const groups =
      await populateQuestionGroup(
        QuestionGroup.find({
          subject: subjectId,
          isActive: true,
        }).sort({
          chapter: 1,
          title: 1,
        }),
      );

    for (const group of groups) {
      const statistics =
        await updateGroupStatistics(
          group._id,
        );

      group.questionCount =
        statistics.questionCount;

      group.totalMarks =
        statistics.totalMarks;
    }

    res.json(groups);
  });

export const getQuestionGroupsByChapter =
  asyncHandler(async (req, res) => {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(
      chapterId,
    ).populate("subject", "_id");

    if (!chapter) {
      res.status(404);
      throw new Error("Chapter not found");
    }

    if (!chapter.isActive) {
      res.status(400);
      throw new Error("Chapter is inactive");
    }

    const groups =
      await populateQuestionGroup(
        QuestionGroup.find({
          subject: chapter.subject._id,
          chapter: chapterId,
          isActive: true,
        }).sort({
          title: 1,
        }),
      );

    for (const group of groups) {
      const statistics =
        await updateGroupStatistics(
          group._id,
        );

      group.questionCount =
        statistics.questionCount;

      group.totalMarks =
        statistics.totalMarks;
    }

    res.json(groups);
  });

export const getMyQuestionGroups =
  asyncHandler(async (req, res) => {
    const groups =
      await populateQuestionGroup(
        QuestionGroup.find({
          createdBy: req.user._id,
        }).sort({
          createdAt: -1,
        }),
      );

    for (const group of groups) {
      const statistics =
        await updateGroupStatistics(
          group._id,
        );

      group.questionCount =
        statistics.questionCount;

      group.totalMarks =
        statistics.totalMarks;
    }

    res.json(groups);
  });

export const getQuestionsInGroup =
  asyncHandler(async (req, res) => {
    const group =
      await QuestionGroup.findById(
        req.params.id,
      );

    if (!group) {
      res.status(404);
      throw new Error("Question group not found");
    }

    const questions = await Question.find({
      questionGroup: group._id,
    })
      .populate(
        "academicYear",
        "name startDate endDate",
      )
      .populate(
        "class",
        "name code",
      )
      .populate(
        "subject",
        "name code shortName subjectType",
      )
      .populate(
        "chapter",
        "chapterNumber title",
      )
      .populate(
        "topic",
        "name",
      )
      .populate(
        "createdBy",
        "name email phone role",
      )
      .populate(
        "approvedBy",
        "name email phone role",
      )
      .sort({
        createdAt: 1,
      });

    res.json(questions);
  });

export const updateQuestionGroup =
  asyncHandler(async (req, res) => {
    await validateCreator(req.user._id);

    const group =
      await QuestionGroup.findById(
        req.params.id,
      );

    if (!group) {
      res.status(404);
      throw new Error("Question group not found");
    }

    const {
      subject,
      chapter,
      title,
      groupType,
      directions,
      sharedContent,
      selectionMode,
    } = req.body;

    const subjectId =
      subject || group.subject.toString();

    const chapterId =
      chapter !== undefined
        ? chapter
        : group.chapter?.toString();

    const selectedTitle =
      title !== undefined
        ? title.trim()
        : group.title;

    const selectedGroupType =
      groupType || group.groupType;

    const selectedSelectionMode =
      selectionMode || group.selectionMode;

    if (!selectedTitle) {
      res.status(400);
      throw new Error("Title is required");
    }

    validateGroupType(
      selectedGroupType,
    );

    validateSelectionMode(
      selectedSelectionMode,
    );

    await validateSubject(subjectId);

    await validateChapter(
      chapterId,
      subjectId,
    );

    const duplicate =
      await QuestionGroup.findOne({
        _id: { $ne: group._id },
        subject: subjectId,
        chapter: chapterId || null,
        title: selectedTitle,
        isActive: true,
      });

    if (duplicate) {
      res.status(400);
      throw new Error(
        "An active question group with this title already exists",
      );
    }

    group.subject = subjectId;

    group.chapter =
      chapterId || undefined;

    group.title = selectedTitle;

    group.groupType =
      selectedGroupType;

    group.selectionMode =
      selectedSelectionMode;

    if (directions !== undefined) {
      group.directions = directions;
    }

    if (sharedContent !== undefined) {
      group.sharedContent =
        sharedContent;
    }

    const updatedGroup =
      await group.save();

    await updateGroupStatistics(
      updatedGroup._id,
    );

    const populatedGroup =
      await populateQuestionGroup(
        QuestionGroup.findById(
          updatedGroup._id,
        ),
      );

    res.json(populatedGroup);
  });

export const updateQuestionGroupStatus =
  asyncHandler(async (req, res) => {
    await validateCreator(req.user._id);

    const group =
      await QuestionGroup.findById(
        req.params.id,
      );

    if (!group) {
      res.status(404);
      throw new Error("Question group not found");
    }

    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error(
        "isActive must be a boolean",
      );
    }

    group.isActive = isActive;

    const updatedGroup =
      await group.save();

    await updateGroupStatistics(
      updatedGroup._id,
    );

    const populatedGroup =
      await populateQuestionGroup(
        QuestionGroup.findById(
          updatedGroup._id,
        ),
      );

    res.json(populatedGroup);
  });

export const refreshQuestionGroupStatistics =
  asyncHandler(async (req, res) => {
    const group =
      await QuestionGroup.findById(
        req.params.id,
      );

    if (!group) {
      res.status(404);
      throw new Error("Question group not found");
    }

    const statistics =
      await updateGroupStatistics(
        group._id,
      );

    const updatedGroup =
      await populateQuestionGroup(
        QuestionGroup.findById(
          group._id,
        ),
      );

    updatedGroup.questionCount =
      statistics.questionCount;

    updatedGroup.totalMarks =
      statistics.totalMarks;

    res.json(updatedGroup);
  });

export const deleteQuestionGroup =
  asyncHandler(async (req, res) => {
    await validateCreator(req.user._id);

    const group =
      await QuestionGroup.findById(
        req.params.id,
      );

    if (!group) {
      res.status(404);
      throw new Error("Question group not found");
    }

    const questionCount =
      await Question.countDocuments({
        questionGroup: group._id,
      });

    if (questionCount > 0) {
      res.status(400);
      throw new Error(
        "Question group cannot be deleted because it contains questions. Deactivate it instead.",
      );
    }

    await group.deleteOne();

    res.json({
      message:
        "Question group deleted successfully",
    });
  });