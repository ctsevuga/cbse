import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import connectDB from "./config/db.js";

import academicYearRoutes from "./routes/academicYearRoutes.js";
import answerEditorConfigurationRoutes from "./routes/answerEditorConfigurationRoutes.js";
import answerEvaluationRoutes from "./routes/answerEvaluationRoutes.js";
import assessmentQuestionRoutes from "./routes/assessmentQuestionRoutes.js";
import assessmentChoiceGroupRoutes from "./routes/assessmentChoiceGroupRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import assessmentSectionRoutes from "./routes/assessmentSectionRoutes.js";


import auditLogRoutes from "./routes/auditLogRoutes.js";
import chapterRoutes from "./routes/chapterRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import questionBlueprintRoutes from "./routes/questionBlueprintRoutes.js";

import questionGroupRoutes from "./routes/questionGroupRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import resultDetailRoutes from "./routes/resultDetailRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";

import streamRoutes from "./routes/streamRoutes.js";
import studentAnswerRoutes from "./routes/studentAnswerRoutes.js";
import studentAttemptRoutes from "./routes/studentAttemptRoutes.js";
import studentParentRoutes from "./routes/studentParentRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import studentSubjectRoutes from "./routes/studentSubjectRoutes.js";

import subjectCombinationRoutes from "./routes/subjectCombinationRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import teacherAssignmentRoutes from "./routes/teacherAssignmentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";


import userRoutes from "./routes/userRoutes.js";


import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/academic-year", academicYearRoutes);
app.use("/api/answer-editor-configutations", answerEditorConfigurationRoutes);
app.use("/api/answer-evaluation", answerEvaluationRoutes);
app.use("/api/assessment-quetions", assessmentQuestionRoutes);
app.use("/api/assessment-choice-groups", assessmentChoiceGroupRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/answer-section", assessmentSectionRoutes);

app.use("/api/auditlog", auditLogRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/question-blueprints", questionBlueprintRoutes);

app.use("/api/question-groups", questionGroupRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/result-details", resultDetailRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/sections", sectionRoutes);

app.use("/api/streams", streamRoutes);
app.use("/api/student-answers", studentAnswerRoutes);
app.use("/api/student-attempts", studentAttemptRoutes);
app.use("/api/student-parents", studentParentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/student-subjects", studentSubjectRoutes);

app.use("/api/subject-combinations", subjectCombinationRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/teacher-assignments", teacherAssignmentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/topics", topicRoutes);


app.use("/api/users", userRoutes);



const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);
