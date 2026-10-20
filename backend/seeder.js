import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

import ResultDetail from "./models/resultDetailModel.js";
import Result from "./models/resultModel.js";
import AssessmentQuestion from "./models/assessmentQuestionModel.js";
import StudentAnswer from "./models/studentAnswerModel.js";
import AnswerEvaluation from "./models/answerEvaluationModel.js";

dotenv.config();

const RESULT_ID = "6ad1d0dc40728e00ce3fa6bd";
const SUBJECT_ID = "6ac51a0dc2df4173eed59b95";
const TEACHER_ID = "6ac5105d06dc3444c376a6c0";

// Assessment-question, original-question, chapter and topic mappings.
const questionDetails = [
  {
    assessmentQuestion: "6acf736d049b8dc0606134d2",
    question: "6acc4524bdca2c15216a59bd",
    chapter: "6acb17457a5284edf75b74be",
    topic: "6acb1745e9ebf7bdeadc1c52",
  },
  {
    assessmentQuestion: "6acf736d049b8dc0606134d3",
    question: "6acc4524bdca2c15216a59ab",
    chapter: "6acb17457a5284edf75b74be",
    topic: "6acb1745e9ebf7bdeadc1c50",
  },
  {
    assessmentQuestion: "6acf736d049b8dc0606134d4",
    question: "6acc4524bdca2c15216a59f0",
    chapter: "6acb17457a5284edf75b74be",
    topic: "6acb1745e9ebf7bdeadc1c4c",
  },
  {
    assessmentQuestion: "6acf736d049b8dc0606134d5",
    question: "6acc4524bdca2c15216a59a2",
    chapter: "6acb17457a5284edf75b74be",
    topic: "6acb1745e9ebf7bdeadc1c46",
  },
  {
    assessmentQuestion: "6acf736d049b8dc0606134d6",
    question: "6acc4524bdca2c15216a5997",
    chapter: "6acb17457a5284edf75b74be",
    topic: "6acb1745e9ebf7bdeadc1c3e",
  },
  {
    assessmentQuestion: "6acf736d049b8dc0606134d7",
    question: "6acc4524bdca2c15216a59ae",
    chapter: "6acb17457a5284edf75b74be",
    topic: "6acb1745e9ebf7bdeadc1c54",
  },
  {
    assessmentQuestion: "6acf736d049b8dc0606134d8",
    question: "6acc4524bdca2c15216a59d5",
    chapter: "6acb17457a5284edf75b74be",
    topic: "6acb1745e9ebf7bdeadc1c48",
  },
  {
    assessmentQuestion: "6acf736d049b8dc0606134d9",
    question: "6acc4524bdca2c15216a59f3",
    chapter: "6acb17457a5284edf75b74be",
    topic: "6acb1745e9ebf7bdeadc1c50",
  },
  {
    assessmentQuestion: "6acf736d049b8dc0606134da",
    question: "6acc4524bdca2c15216a59e1",
    chapter: "6acb17457a5284edf75b74be",
    topic: "6acb1745e9ebf7bdeadc1c50",
  },
  {
    assessmentQuestion: "6acf736d049b8dc0606134db",
    question: "6acc4524bdca2c15216a59db",
    chapter: "6acb17457a5284edf75b74be",
    topic: "6acb1745e9ebf7bdeadc1c58",
  },
];

const seedResultDetails = async () => {
  try {
    await connectDB();

    console.log("Connected to database.");
    console.log("Starting Result Details seeder...\n");

    // Validate supplied ObjectIds.
    const idsToValidate = [
      RESULT_ID,
      SUBJECT_ID,
      TEACHER_ID,
      ...questionDetails.flatMap((item) => [
        item.assessmentQuestion,
        item.question,
        item.chapter,
        item.topic,
      ]),
    ];

    const invalidIds = idsToValidate.filter(
      (id) => !mongoose.isValidObjectId(id),
    );

    if (invalidIds.length > 0) {
      throw new Error(
        `Invalid ObjectIds: ${invalidIds.join(", ")}`,
      );
    }

    // Validate the parent result.
    const result = await Result.findById(RESULT_ID);

    if (!result) {
      throw new Error(`Result not found: ${RESULT_ID}`);
    }

    // Load assessment-question assignments and their maximum marks.
    const assessmentQuestionIds = questionDetails.map(
      (item) => item.assessmentQuestion,
    );

    const assessmentQuestions =
      await AssessmentQuestion.find({
        _id: { $in: assessmentQuestionIds },
      }).select("_id assessment question marks");

    const assessmentQuestionMap = new Map(
      assessmentQuestions.map((item) => [
        item._id.toString(),
        item,
      ]),
    );

    if (assessmentQuestionMap.size !== questionDetails.length) {
      throw new Error(
        "One or more assessment-question documents were not found.",
      );
    }

    // Verify each question mapping and assessment.
    for (const item of questionDetails) {
      const assignment = assessmentQuestionMap.get(
        item.assessmentQuestion,
      );

      if (assignment.question.toString() !== item.question) {
        throw new Error(
          `Question mapping mismatch for ${item.assessmentQuestion}`,
        );
      }

      if (
        assignment.assessment.toString() !==
        result.assessment.toString()
      ) {
        throw new Error(
          `Assessment question ${item.assessmentQuestion} does not belong to the result's assessment.`,
        );
      }

      if (
        !Number.isFinite(Number(assignment.marks)) ||
        Number(assignment.marks) < 0
      ) {
        throw new Error(
          `Invalid maximum marks for ${item.assessmentQuestion}`,
        );
      }
    }

    // Retrieve the submitted student answers for this attempt.
    const studentAnswers = await StudentAnswer.find({
      attempt: result.attempt,
      student: result.student,
      assessmentQuestion: { $in: assessmentQuestionIds },
    }).select("_id assessmentQuestion question student");

    const studentAnswerMap = new Map(
      studentAnswers.map((item) => [
        item.assessmentQuestion.toString(),
        item,
      ]),
    );

    // Retrieve the teacher's evaluations.
    const studentAnswerIds = studentAnswers.map(
      (item) => item._id,
    );

    const answerEvaluations = await AnswerEvaluation.find({
      studentAnswer: { $in: studentAnswerIds },
      student: result.student,
      evaluationStatus: "EVALUATED",
    }).select("studentAnswer marksAwarded maximumMarks");

    const evaluationMap = new Map(
      answerEvaluations.map((item) => [
        item.studentAnswer.toString(),
        item,
      ]),
    );

    // Prevent duplicate result-detail documents on reruns.
    const existingDetails = await ResultDetail.find({
      result: RESULT_ID,
      assessmentQuestion: { $in: assessmentQuestionIds },
    }).select("assessmentQuestion");

    const existingIds = new Set(
      existingDetails.map((item) =>
        item.assessmentQuestion.toString(),
      ),
    );

    const now = new Date();
    const documentsToInsert = [];

    for (const item of questionDetails) {
      if (existingIds.has(item.assessmentQuestion)) {
        console.log(
          `Skipping existing result detail: ${item.assessmentQuestion}`,
        );
        continue;
      }

      const studentAnswer = studentAnswerMap.get(
        item.assessmentQuestion,
      );

      if (!studentAnswer) {
        throw new Error(
          `Student answer not found for assessment question ${item.assessmentQuestion}`,
        );
      }

      if (
        studentAnswer.question.toString() !== item.question
      ) {
        throw new Error(
          `Student-answer question mismatch for ${item.assessmentQuestion}`,
        );
      }

      const evaluation = evaluationMap.get(
        studentAnswer._id.toString(),
      );

      if (!evaluation) {
        throw new Error(
          `Evaluated answer not found for ${item.assessmentQuestion}`,
        );
      }

      const assignment = assessmentQuestionMap.get(
        item.assessmentQuestion,
      );

      const maximumMarks = Number(assignment.marks);
      const obtainedMarks = Number(evaluation.marksAwarded);

      if (
        !Number.isFinite(obtainedMarks) ||
        obtainedMarks < 0 ||
        obtainedMarks > maximumMarks
      ) {
        throw new Error(
          `Invalid marks for ${item.assessmentQuestion}: obtained=${obtainedMarks}, maximum=${maximumMarks}`,
        );
      }

      // Ensure the evaluation's recorded maximum is consistent.
      if (
        Number(evaluation.maximumMarks) !== maximumMarks
      ) {
        throw new Error(
          `Maximum-marks mismatch for ${item.assessmentQuestion}: assessment=${maximumMarks}, evaluation=${evaluation.maximumMarks}`,
        );
      }

      documentsToInsert.push({
        result: RESULT_ID,
        assessmentQuestion: item.assessmentQuestion,
        question: item.question,

        subject: SUBJECT_ID,
        chapter: item.chapter,
        topic: item.topic,

        questionType: "DESCRIPTIVE",

        maximumMarks,
        obtainedMarks,

        evaluationStatus: "EVALUATED",
        evaluatedBy: TEACHER_ID,
        evaluatedAt: evaluation.evaluatedAt ?? now,
      });
    }

    if (documentsToInsert.length === 0) {
      console.log(
        "\nAll supplied result details already exist. Nothing to insert.",
      );
      return;
    }

    const insertedDetails = await ResultDetail.insertMany(
      documentsToInsert,
      { ordered: true },
    );

    console.log("\nResult Details seeded successfully.");
    console.log("Expected:", questionDetails.length);
    console.log("Already existed:", existingIds.size);
    console.log("Inserted:", insertedDetails.length);

    insertedDetails.forEach((item) => {
      console.log({
        id: item._id.toString(),
        result: item.result.toString(),
        assessmentQuestion: item.assessmentQuestion.toString(),
        question: item.question.toString(),
        subject: item.subject.toString(),
        chapter: item.chapter.toString(),
        topic: item.topic.toString(),
        questionType: item.questionType,
        maximumMarks: item.maximumMarks,
        obtainedMarks: item.obtainedMarks,
        evaluationStatus: item.evaluationStatus,
        evaluatedBy: item.evaluatedBy?.toString(),
      });
    });
  } catch (error) {
    console.error(
      "\nError seeding Result Details:",
      error.message,
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("\nDatabase connection closed.");
  }
};

seedResultDetails();
