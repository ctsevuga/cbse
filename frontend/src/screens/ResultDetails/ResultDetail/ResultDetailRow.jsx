// ResultDetailRow.jsx

import React from "react";

import QuestionTypeBadge from "../Common/QuestionTypeBadge";
import EvaluationStatusBadge from "../Common/EvaluationStatusBadge";
import MarksDisplay from "../Common/MarksDisplay";
import ResultDetailActions from "../ResultDetail/ResultDetailActions";

const ResultDetailRow = ({
  resultDetail,
  onView,
  onDelete,
}) => {
  if (!resultDetail) {
    return null;
  }

  const {
    _id,
    question,
    result,
    subject,
    chapter,
    topic,
    questionType,
    maximumMarks,
    obtainedMarks,
    evaluationStatus,
  } = resultDetail;

  return (
    <tr
      className="border-b transition-colors hover:bg-gray-50"
      data-result-detail-id={_id}
    >
      {/* Question */}
      <td className="max-w-[280px] px-4 py-4">
        <QuestionInfo question={question} />
      </td>

      {/* Student */}
      <td className="px-4 py-4">
        <StudentInfo result={result} />
      </td>

      {/* Subject */}
      <td className="px-4 py-4">
        <SubjectInfo subject={subject} />
      </td>

      {/* Chapter */}
      <td className="px-4 py-4">
        <AcademicName
          value={chapter}
          fallback="—"
        />
      </td>

      {/* Topic */}
      <td className="px-4 py-4">
        <AcademicName
          value={topic}
          fallback="—"
        />
      </td>

      {/* Question Type */}
      <td className="px-4 py-4">
        <QuestionTypeBadge type={questionType} />
      </td>

      {/* Maximum Marks */}
      <td className="px-4 py-4 text-center">
        <MarksDisplay
          maximumMarks={maximumMarks}
          obtainedMarks={null}
        />
      </td>

      {/* Obtained Marks */}
      <td className="px-4 py-4 text-center">
        <MarksDisplay
          maximumMarks={maximumMarks}
          obtainedMarks={obtainedMarks}
        />
      </td>

      {/* Evaluation Status */}
      <td className="px-4 py-4 text-center">
        <EvaluationStatusBadge status={evaluationStatus} />
      </td>

      {/* Actions */}
      <td className="px-4 py-4 text-right">
        <ResultDetailActions
          resultDetail={resultDetail}
          onView={onView}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
};

/**
 * Question information
 *
 * `question` may be either:
 *
 * 1. An ObjectId string
 * 2. A populated Question object
 */
const QuestionInfo = ({ question }) => {
  if (!question) {
    return (
      <span className="text-gray-400">
        Question unavailable
      </span>
    );
  }

  if (typeof question === "string") {
    return (
      <span
        className="block truncate font-medium text-gray-900"
        title={question}
      >
        {question}
      </span>
    );
  }

  const questionText =
    question.questionText ||
    question.text ||
    question.title ||
    question.name;

  return (
    <div className="min-w-0">
      {question.questionNumber && (
        <span className="mr-2 text-xs font-medium text-gray-500">
          Q{question.questionNumber}
        </span>
      )}

      <span
        className="font-medium text-gray-900"
        title={questionText || "Question"}
      >
        {questionText || "Question"}
      </span>
    </div>
  );
};

/**
 * Student information
 *
 * The Result reference may be populated with a student.
 *
 * Depending on your Result model, adjust the student field
 * names if necessary.
 */
const StudentInfo = ({ result }) => {
  if (!result) {
    return (
      <span className="text-gray-400">
        —
      </span>
    );
  }

  if (typeof result === "string") {
    return (
      <span
        className="text-gray-700"
        title={result}
      >
        {result}
      </span>
    );
  }

  const student =
    result.student ||
    result.user;

  if (!student) {
    return (
      <span className="text-gray-700">
        —
      </span>
    );
  }

  const studentName =
    student.name ||
    student.fullName ||
    [
      student.firstName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div>
      <p className="font-medium text-gray-900">
        {studentName || "Unknown student"}
      </p>

      {student.email && (
        <p className="mt-0.5 text-xs text-gray-500">
          {student.email}
        </p>
      )}
    </div>
  );
};

/**
 * Subject information
 */
const SubjectInfo = ({ subject }) => {
  if (!subject) {
    return (
      <span className="text-gray-400">
        —
      </span>
    );
  }

  if (typeof subject === "string") {
    return (
      <span className="text-gray-700">
        {subject}
      </span>
    );
  }

  return (
    <span className="font-medium text-gray-700">
      {subject.name ||
        subject.title ||
        "Unnamed subject"}
    </span>
  );
};

/**
 * Generic Chapter / Topic display
 */
const AcademicName = ({
  value,
  fallback = "—",
}) => {
  if (!value) {
    return (
      <span className="text-gray-400">
        {fallback}
      </span>
    );
  }

  if (typeof value === "string") {
    return (
      <span className="text-gray-700">
        {value}
      </span>
    );
  }

  return (
    <span className="text-gray-700">
      {value.name ||
        value.title ||
        fallback}
    </span>
  );
};

export default ResultDetailRow;
