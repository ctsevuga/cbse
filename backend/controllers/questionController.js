import asyncHandler from "../middleware/asyncHandler.js";

import Question from "../models/questionModel.js";
import Class from "../models/classModel.js";
import Subject from "../models/subjectModel.js";
import Chapter from "../models/chapterModel.js";
import Topic from "../models/topicModel.js";
import AnswerEditorConfiguration from "../models/answerEditorConfigurationModel.js";

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

const QUESTION_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
];

const validateSuperAdmin = (req) => {
  if (req.user.role !== "SUPER_ADMIN") {
    throw new Error(
      "Only SUPER_ADMIN can manage the global question bank",
    );
  }
};

const validateClass = async (classId) => {
  if (!classId) {
    throw new Error("Class is required");
  }

  const classData = await Class.findById(classId);

  if (!classData) {
    throw new Error("Class not found");
  }

  if (!classData.isActive) {
    throw new Error("Class is inactive");
  }

  return classData;
};

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

const validateChapter = async (
  chapterId,
  subjectId,
) => {
  if (!chapterId) {
    return null;
  }

  const chapter = await Chapter.findById(chapterId);

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  if (
    chapter.subject.toString() !==
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

const validateTopic = async (
  topicId,
  chapterId,
  subjectId,
) => {
  if (!topicId) {
    return null;
  }

  if (!chapterId) {
    throw new Error(
      "Chapter is required when topic is specified",
    );
  }

  const topic = await Topic.findById(topicId);

  if (!topic) {
    throw new Error("Topic not found");
  }

  if (
    topic.subject.toString() !==
    subjectId.toString()
  ) {
    throw new Error(
      "Topic does not belong to the selected subject",
    );
  }

  if (
    topic.chapter.toString() !==
    chapterId.toString()
  ) {
    throw new Error(
      "Topic does not belong to the selected chapter",
    );
  }

  if (!topic.isActive) {
    throw new Error("Topic is inactive");
  }

  return topic;
};

const validateAnswerEditorConfiguration =
  async (
    configurationId,
    subjectId,
  ) => {
    if (!configurationId) {
      throw new Error(
        "Answer editor configuration is required",
      );
    }

    const configuration =
      await AnswerEditorConfiguration.findById(
        configurationId,
      ).populate(
        "subject",
        "name code shortName subjectType",
      );

    if (!configuration) {
      throw new Error(
        "Answer editor configuration not found",
      );
    }

    if (!configuration.isActive) {
      throw new Error(
        "Answer editor configuration is inactive",
      );
    }

    if (
      configuration.subject._id.toString() !==
      subjectId.toString()
    ) {
      throw new Error(
        "Answer editor configuration does not belong to the selected subject",
      );
    }

    return configuration;
  };

const validateQuestionType = (
  questionType,
) => {
  if (!QUESTION_TYPES.includes(questionType)) {
    throw new Error("Invalid question type");
  }
};

const validateDifficulty = (
  difficulty,
) => {
  if (!DIFFICULTIES.includes(difficulty)) {
    throw new Error("Invalid difficulty");
  }
};

const validateMarks = (
  marks,
  negativeMarks,
) => {
  if (
    marks === undefined ||
    marks === null
  ) {
    throw new Error("Marks are required");
  }

  if (Number.isNaN(Number(marks))) {
    throw new Error("Marks must be a number");
  }

  if (Number(marks) < 0) {
    throw new Error(
      "Marks cannot be negative",
    );
  }

  if (
    negativeMarks !== undefined &&
    negativeMarks !== null
  ) {
    if (
      Number.isNaN(Number(negativeMarks))
    ) {
      throw new Error(
        "Negative marks must be a number",
      );
    }

    if (Number(negativeMarks) < 0) {
      throw new Error(
        "Negative marks cannot be negative",
      );
    }
  }
};

const validateQuestionContent = ({
  questionType,
  options,
  correctAnswer,
}) => {
  validateQuestionType(questionType);

  if (
    questionType === "MCQ" ||
    questionType === "ASSERTION_REASON"
  ) {
    if (
      !Array.isArray(options) ||
      options.length < 2
    ) {
      throw new Error(
        "Question must contain at least two options",
      );
    }

    if (
      correctAnswer === undefined ||
      correctAnswer === null ||
      correctAnswer === ""
    ) {
      throw new Error(
        "Correct answer is required",
      );
    }
  }
};

const populateQuestion = (query) =>
  query
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
      "chapterNumber title description",
    )
    .populate(
      "topic",
      "name description",
    )
    .populate(
      "answerEditorConfiguration",
      "name code answerMode configuration subject isActive",
    )
    .populate(
      "questionGroup",
      "name code questionType",
    )
    .populate(
      "createdBy",
      "name email phone role",
    )
    .populate(
      "approvedBy",
      "name email phone role",
    );

export const createQuestion = asyncHandler(
  async (req, res) => {
    validateSuperAdmin(req);

    const {
      class: classId,
      subject,
      chapter,
      topic,
      questionType,
      marks,
      questionText,
      answerEditorConfiguration,
      options,
      correctAnswer,
      difficulty = "MEDIUM",
      negativeMarks = 0,
      questionGroup,
    } = req.body;

    await validateClass(classId);

    await validateSubject(subject);

    await validateChapter(
      chapter,
      subject,
    );

    await validateTopic(
      topic,
      chapter,
      subject,
    );

    await validateAnswerEditorConfiguration(
      answerEditorConfiguration,
      subject,
    );

    if (
      !questionText ||
      !questionText.trim()
    ) {
      res.status(400);
      throw new Error(
        "Question text is required",
      );
    }

    validateMarks(
      marks,
      negativeMarks,
    );

    validateDifficulty(
      difficulty,
    );

    validateQuestionContent({
      questionType,
      options,
      correctAnswer,
    });

    const question =
      await Question.create({
        class: classId,
        subject,
        chapter:
          chapter || undefined,
        topic:
          topic || undefined,
        questionType,
        marks,
        questionText:
          questionText.trim(),
        answerEditorConfiguration,
        options:
          options !== undefined
            ? options
            : [],
        correctAnswer:
          correctAnswer !== undefined
            ? correctAnswer
            : null,
        difficulty,
        negativeMarks,
        questionGroup:
          questionGroup || undefined,
        status: "DRAFT",
        createdBy: req.user._id,
        isActive: true,
      });

    const populatedQuestion =
      await populateQuestion(
        Question.findById(
          question._id,
        ),
      );

    res.status(201).json(
      populatedQuestion,
    );
  },
);

export const getQuestions = asyncHandler(
  async (req, res) => {
    const {
      class: classId,
      subject,
      chapter,
      topic,
      questionType,
      marks,
      answerEditorConfiguration,
      difficulty,
      questionGroup,
      status,
      createdBy,
      approvedBy,
      isActive,
    } = req.query;

    const filter = {};

    if (classId) {
      filter.class = classId;
    }

    if (subject) {
      filter.subject = subject;
    }

    if (chapter) {
      filter.chapter = chapter;
    }

    if (topic) {
      filter.topic = topic;
    }

    if (questionType) {
      validateQuestionType(
        questionType,
      );

      filter.questionType =
        questionType;
    }

    if (marks !== undefined) {
      if (
        Number.isNaN(Number(marks))
      ) {
        res.status(400);
        throw new Error(
          "Marks must be a number",
        );
      }

      filter.marks = Number(marks);
    }

    if (
      answerEditorConfiguration
    ) {
      filter.answerEditorConfiguration =
        answerEditorConfiguration;
    }

    if (difficulty) {
      validateDifficulty(
        difficulty,
      );

      filter.difficulty =
        difficulty;
    }

    if (questionGroup) {
      filter.questionGroup =
        questionGroup;
    }

    if (status) {
      if (
        !QUESTION_STATUSES.includes(
          status,
        )
      ) {
        res.status(400);
        throw new Error(
          "Invalid question status",
        );
      }

      filter.status = status;
    }

    if (createdBy) {
      filter.createdBy =
        createdBy;
    }

    if (approvedBy) {
      filter.approvedBy =
        approvedBy;
    }

    if (isActive !== undefined) {
      if (
        isActive !== "true" &&
        isActive !== "false"
      ) {
        res.status(400);
        throw new Error(
          "isActive must be true or false",
        );
      }

      filter.isActive =
        isActive === "true";
    }

    const questions =
      await populateQuestion(
        Question.find(filter).sort({
          subject: 1,
          chapter: 1,
          topic: 1,
          createdAt: -1,
        }),
      );

    res.json(questions);
  },
);

export const getQuestionById =
  asyncHandler(async (req, res) => {
    const question =
      await populateQuestion(
        Question.findById(
          req.params.id,
        ),
      );

    if (!question) {
      res.status(404);
      throw new Error(
        "Question not found",
      );
    }

    res.json(question);
  });

export const getQuestionsBySubject =
  asyncHandler(async (req, res) => {
    const { subjectId } =
      req.params;

    await validateSubject(
      subjectId,
    );

    const questions =
      await populateQuestion(
        Question.find({
          subject: subjectId,
        }).sort({
          chapter: 1,
          topic: 1,
          createdAt: -1,
        }),
      );

    res.json(questions);
  });

export const getQuestionsByChapter =
  asyncHandler(async (req, res) => {
    const { chapterId } =
      req.params;

    const chapter =
      await Chapter.findById(
        chapterId,
      );

    if (!chapter) {
      res.status(404);
      throw new Error(
        "Chapter not found",
      );
    }

    if (!chapter.isActive) {
      res.status(400);
      throw new Error(
        "Chapter is inactive",
      );
    }

    const questions =
      await populateQuestion(
        Question.find({
          subject:
            chapter.subject,
          chapter: chapterId,
        }).sort({
          topic: 1,
          createdAt: -1,
        }),
      );

    res.json(questions);
  });

export const getQuestionsByTopic =
  asyncHandler(async (req, res) => {
    const { topicId } =
      req.params;

    const topic =
      await Topic.findById(
        topicId,
      );

    if (!topic) {
      res.status(404);
      throw new Error(
        "Topic not found",
      );
    }

    if (!topic.isActive) {
      res.status(400);
      throw new Error(
        "Topic is inactive",
      );
    }

    const questions =
      await populateQuestion(
        Question.find({
          subject: topic.subject,
          chapter: topic.chapter,
          topic: topicId,
        }).sort({
          createdAt: -1,
        }),
      );

    res.json(questions);
  });

export const getQuestionsByGroup =
  asyncHandler(async (req, res) => {
    const {
      questionGroupId,
    } = req.params;

    const questions =
      await populateQuestion(
        Question.find({
          questionGroup:
            questionGroupId,
        }).sort({
          createdAt: 1,
        }),
      );

    res.json(questions);
  });

export const getMyQuestions =
  asyncHandler(async (req, res) => {
    const questions =
      await populateQuestion(
        Question.find({
          createdBy: req.user._id,
        }).sort({
          createdAt: -1,
        }),
      );

    res.json(questions);
  });

export const updateQuestion =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const question =
      await Question.findById(
        req.params.id,
      );

    if (!question) {
      res.status(404);
      throw new Error(
        "Question not found",
      );
    }

    const {
      class: classId,
      subject,
      chapter,
      topic,
      questionType,
      marks,
      questionText,
      answerEditorConfiguration,
      options,
      correctAnswer,
      difficulty,
      negativeMarks,
      questionGroup,
    } = req.body;

    const selectedClass =
      classId ||
      question.class.toString();

    const selectedSubject =
      subject ||
      question.subject.toString();

    const selectedChapter =
      chapter !== undefined
        ? chapter
        : question.chapter?.toString();

    const selectedTopic =
      topic !== undefined
        ? topic
        : question.topic?.toString();

    const selectedType =
      questionType ||
      question.questionType;

    const selectedMarks =
      marks !== undefined
        ? marks
        : question.marks;

    const selectedDifficulty =
      difficulty ||
      question.difficulty;

    const selectedNegativeMarks =
      negativeMarks !== undefined
        ? negativeMarks
        : question.negativeMarks;

    const selectedOptions =
      options !== undefined
        ? options
        : question.options;

    const selectedCorrectAnswer =
      correctAnswer !== undefined
        ? correctAnswer
        : question.correctAnswer;

    const selectedEditorConfiguration =
      answerEditorConfiguration ||
      question.answerEditorConfiguration.toString();

    await validateClass(
      selectedClass,
    );

    await validateSubject(
      selectedSubject,
    );

    await validateChapter(
      selectedChapter,
      selectedSubject,
    );

    await validateTopic(
      selectedTopic,
      selectedChapter,
      selectedSubject,
    );

    await validateAnswerEditorConfiguration(
      selectedEditorConfiguration,
      selectedSubject,
    );

    validateMarks(
      selectedMarks,
      selectedNegativeMarks,
    );

    validateDifficulty(
      selectedDifficulty,
    );

    validateQuestionContent({
      questionType:
        selectedType,
      options:
        selectedOptions,
      correctAnswer:
        selectedCorrectAnswer,
    });

    question.class =
      selectedClass;

    question.subject =
      selectedSubject;

    question.chapter =
      selectedChapter || undefined;

    question.topic =
      selectedTopic || undefined;

    question.questionType =
      selectedType;

    question.marks =
      selectedMarks;

    if (
      questionText !== undefined
    ) {
      if (
        !questionText.trim()
      ) {
        res.status(400);
        throw new Error(
          "Question text cannot be empty",
        );
      }

      question.questionText =
        questionText.trim();
    }

    question.answerEditorConfiguration =
      selectedEditorConfiguration;

    question.options =
      selectedOptions;

    question.correctAnswer =
      selectedCorrectAnswer;

    question.difficulty =
      selectedDifficulty;

    question.negativeMarks =
      selectedNegativeMarks;

    if (
      questionGroup !== undefined
    ) {
      question.questionGroup =
        questionGroup ||
        undefined;
    }

    if (
      question.status ===
      "APPROVED"
    ) {
      question.status = "DRAFT";
      question.approvedBy =
        undefined;
    }

    const updatedQuestion =
      await question.save();

    const populatedQuestion =
      await populateQuestion(
        Question.findById(
          updatedQuestion._id,
        ),
      );

    res.json(
      populatedQuestion,
    );
  });

export const submitQuestionForApproval =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const question =
      await Question.findById(
        req.params.id,
      );

    if (!question) {
      res.status(404);
      throw new Error(
        "Question not found",
      );
    }

    if (
      ![
        "DRAFT",
        "REJECTED",
      ].includes(
        question.status,
      )
    ) {
      res.status(400);
      throw new Error(
        "Only draft or rejected questions can be submitted for approval",
      );
    }

    question.status =
      "PENDING_APPROVAL";

    question.approvedBy =
      undefined;

    const updatedQuestion =
      await question.save();

    const populatedQuestion =
      await populateQuestion(
        Question.findById(
          updatedQuestion._id,
        ),
      );

    res.json(
      populatedQuestion,
    );
  });

export const approveQuestion =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const question =
      await Question.findById(
        req.params.id,
      );

    if (!question) {
      res.status(404);
      throw new Error(
        "Question not found",
      );
    }

    if (
      question.status !==
      "PENDING_APPROVAL"
    ) {
      res.status(400);
      throw new Error(
        "Only questions pending approval can be approved",
      );
    }

    question.status =
      "APPROVED";

    question.approvedBy =
      req.user._id;

    const updatedQuestion =
      await question.save();

    const populatedQuestion =
      await populateQuestion(
        Question.findById(
          updatedQuestion._id,
        ),
      );

    res.json(
      populatedQuestion,
    );
  });

export const rejectQuestion =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const question =
      await Question.findById(
        req.params.id,
      );

    if (!question) {
      res.status(404);
      throw new Error(
        "Question not found",
      );
    }

    if (
      question.status !==
      "PENDING_APPROVAL"
    ) {
      res.status(400);
      throw new Error(
        "Only questions pending approval can be rejected",
      );
    }

    question.status =
      "REJECTED";

    question.approvedBy =
      undefined;

    const updatedQuestion =
      await question.save();

    const populatedQuestion =
      await populateQuestion(
        Question.findById(
          updatedQuestion._id,
        ),
      );

    res.json(
      populatedQuestion,
    );
  });

export const archiveQuestion =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const question =
      await Question.findById(
        req.params.id,
      );

    if (!question) {
      res.status(404);
      throw new Error(
        "Question not found",
      );
    }

    question.status =
      "ARCHIVED";

    question.isActive = false;

    const updatedQuestion =
      await question.save();

    const populatedQuestion =
      await populateQuestion(
        Question.findById(
          updatedQuestion._id,
        ),
      );

    res.json(
      populatedQuestion,
    );
  });

export const updateQuestionStatus =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const question =
      await Question.findById(
        req.params.id,
      );

    if (!question) {
      res.status(404);
      throw new Error(
        "Question not found",
      );
    }

    const { isActive } =
      req.body;

    if (
      typeof isActive !==
      "boolean"
    ) {
      res.status(400);
      throw new Error(
        "isActive must be a boolean",
      );
    }

    question.isActive =
      isActive;

    if (
      !isActive &&
      question.status !==
        "ARCHIVED"
    ) {
      question.status =
        "ARCHIVED";
    }

    if (
      isActive &&
      question.status ===
        "ARCHIVED"
    ) {
      question.status =
        "DRAFT";
    }

    const updatedQuestion =
      await question.save();

    const populatedQuestion =
      await populateQuestion(
        Question.findById(
          updatedQuestion._id,
        ),
      );

    res.json(
      populatedQuestion,
    );
  });

export const deleteQuestion =
  asyncHandler(async (req, res) => {
    validateSuperAdmin(req);

    const question =
      await Question.findById(
        req.params.id,
      );

    if (!question) {
      res.status(404);
      throw new Error(
        "Question not found",
      );
    }

    if (
      question.status ===
      "APPROVED"
    ) {
      res.status(400);
      throw new Error(
        "Approved questions should be archived instead of deleted",
      );
    }

    await question.deleteOne();

    res.json({
      message:
        "Question deleted successfully",
    });
  });