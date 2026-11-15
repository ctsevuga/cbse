import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import StudentAttempt from "./models/studentAttemptModel.js";
import StudentAnswer from "./models/studentAnswerModel.js";
import AnswerEvaluation from "./models/answerEvaluationModel.js";
import Result from "./models/resultModel.js";
import ResultDetail from "./models/resultDetailModel.js";

dotenv.config();

// ======================================
// CONFIGURATION
// ======================================

const ASSESSMENT_ID = "6aeffd0553baab74eb008972";

const STUDENT_ATTEMPT_ID = "6af053032dba6c79dce1f27e";

const STUDENT_ID = "6ac634cf99aa5f50d90d9085";

// Keep true for the first run.
// Change to false after checking the preview.
const DRY_RUN = true;

// ======================================
// DELETE INCORRECT ASSESSMENT ATTEMPT DATA
// ======================================

const deleteIncorrectAssessmentAttemptData = async () => {
  try {
    await connectDB();

    console.log("\n======================================");
    console.log("ASSESSMENT ATTEMPT DATA DELETION");
    console.log("======================================");

    console.log("Assessment ID:", ASSESSMENT_ID);
    console.log("Student Attempt ID:", STUDENT_ATTEMPT_ID);
    console.log("Student ID:", STUDENT_ID);

    console.log(
      "Mode:",
      DRY_RUN
        ? "DRY RUN - NO DATABASE UPDATE"
        : "LIVE DELETE - DATABASE WILL BE MODIFIED",
    );

    // ======================================
    // VALIDATE OBJECT IDS
    // ======================================

    const assessmentId = new mongoose.Types.ObjectId(ASSESSMENT_ID);

    const studentAttemptId = new mongoose.Types.ObjectId(STUDENT_ATTEMPT_ID);

    const studentId = new mongoose.Types.ObjectId(STUDENT_ID);

    // ======================================
    // STEP 1: VALIDATE STUDENT ATTEMPT
    // ======================================

    const studentAttempt = await StudentAttempt.findOne({
      _id: studentAttemptId,
      assessment: assessmentId,
      student: studentId,
    }).select("_id assessment student status");

    if (!studentAttempt) {
      throw new Error(
        "StudentAttempt not found for the supplied Assessment ID, Student Attempt ID and Student ID. Deletion aborted.",
      );
    }

    console.log("\nStudent Attempt validated successfully.");

    console.log("Attempt Status:", studentAttempt.status);

    // ======================================
    // STEP 2: FIND STUDENT ANSWERS
    // ======================================

    const studentAnswers = await StudentAnswer.find({
      attempt: studentAttemptId,
      student: studentId,
    }).select("_id");

    const studentAnswerIds = studentAnswers.map((answer) => answer._id);

    // ======================================
    // STEP 3: FIND ANSWER EVALUATIONS
    // ======================================

    const answerEvaluations =
      studentAnswerIds.length > 0
        ? await AnswerEvaluation.find({
            studentAnswer: {
              $in: studentAnswerIds,
            },
          }).select("_id")
        : [];

    // ======================================
    // STEP 4: FIND RESULTS
    // ======================================

    const results = await Result.find({
      assessment: assessmentId,
      student: studentId,
      attempt: studentAttemptId,
    }).select("_id");

    const resultIds = results.map((result) => result._id);

    // ======================================
    // STEP 5: FIND RESULT DETAILS
    // ======================================

    const resultDetails =
      resultIds.length > 0
        ? await ResultDetail.find({
            result: {
              $in: resultIds,
            },
          }).select("_id")
        : [];

    // ======================================
    // STEP 6: DISPLAY DELETION PREVIEW
    // ======================================

    console.log("\n======================================");
    console.log("DELETION PREVIEW");
    console.log("======================================");

    console.log("AnswerEvaluation:", answerEvaluations.length);

    console.log("ResultDetail:", resultDetails.length);

    console.log("StudentAnswer:", studentAnswers.length);

    console.log("Result:", results.length);

    console.log("StudentAttempt:", 1);

    console.log("\n======================================");
    console.log("TOTAL DOCUMENTS");
    console.log("======================================");

    const totalDocuments =
      answerEvaluations.length +
      resultDetails.length +
      studentAnswers.length +
      results.length +
      1;

    console.log("Total:", totalDocuments);

    // ======================================
    // STEP 7: DRY RUN CHECK
    // ======================================

    if (DRY_RUN) {
      console.log("\nDRY RUN COMPLETED.");
      console.log("No documents were deleted.");

      console.log(
        "\nAfter checking the preview, set DRY_RUN = false and run again.",
      );

      return;
    }

    // ======================================
    // STEP 8: DELETE RELATED DOCUMENTS
    // ======================================

    console.log("\nStarting database deletion...");

    // 1. Delete AnswerEvaluation documents.

    const evaluationDeleteResult = await AnswerEvaluation.deleteMany({
      studentAnswer: {
        $in: studentAnswerIds,
      },
    });

    console.log(
      "AnswerEvaluation deleted:",
      evaluationDeleteResult.deletedCount,
    );

    // 2. Delete ResultDetail documents.

    const resultDetailDeleteResult = await ResultDetail.deleteMany({
      result: {
        $in: resultIds,
      },
    });

    console.log("ResultDetail deleted:", resultDetailDeleteResult.deletedCount);

    // 3. Delete StudentAnswer documents.

    const studentAnswerDeleteResult = await StudentAnswer.deleteMany({
      attempt: studentAttemptId,
      student: studentId,
    });

    console.log(
      "StudentAnswer deleted:",
      studentAnswerDeleteResult.deletedCount,
    );

    // 4. Delete Result documents.

    const resultDeleteResult = await Result.deleteMany({
      assessment: assessmentId,
      student: studentId,
      attempt: studentAttemptId,
    });

    console.log("Result deleted:", resultDeleteResult.deletedCount);

    // 5. Delete the specific StudentAttempt.

    const studentAttemptDeleteResult = await StudentAttempt.deleteOne({
      _id: studentAttemptId,
      assessment: assessmentId,
      student: studentId,
    });

    console.log(
      "StudentAttempt deleted:",
      studentAttemptDeleteResult.deletedCount,
    );

    // ======================================
    // STEP 9: FINAL SUMMARY
    // ======================================

    console.log("\n======================================");
    console.log("DELETION SUMMARY");
    console.log("======================================");

    console.log("AnswerEvaluation:", evaluationDeleteResult.deletedCount);

    console.log("ResultDetail:", resultDetailDeleteResult.deletedCount);

    console.log("StudentAnswer:", studentAnswerDeleteResult.deletedCount);

    console.log("Result:", resultDeleteResult.deletedCount);

    console.log("StudentAttempt:", studentAttemptDeleteResult.deletedCount);

    console.log(
      "\nTOTAL DELETED:",
      evaluationDeleteResult.deletedCount +
        resultDetailDeleteResult.deletedCount +
        studentAnswerDeleteResult.deletedCount +
        resultDeleteResult.deletedCount +
        studentAttemptDeleteResult.deletedCount,
    );

    console.log("\nDELETION COMPLETED SUCCESSFULLY.");
  } catch (error) {
    console.error("\nAssessment attempt deletion failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

deleteIncorrectAssessmentAttemptData();
