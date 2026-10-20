// ResultDetailView.jsx

import React from "react";

import QuestionTypeBadge from "./QuestionTypeBadge";
import EvaluationStatusBadge from "./EvaluationStatusBadge";
import MarksDisplay from "./MarksDisplay";

const ResultDetailView = ({
  resultDetail,
  onEdit,
  onDelete,
}) => {
  if (!resultDetail) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center">
        <p className="text-sm text-gray-500">
          Result detail not found.
        </p>
      </div>
    );
  }

  const {
    question,
    assessmentQuestion,
    result,
    subject,
    chapter,
    topic,
    questionType,
    maximumMarks,
    obtainedMarks,
    evaluationStatus,
    evaluatedBy,
    evaluatedAt,
    createdAt,
    updatedAt,
  } = resultDetail;

  return (
    <div className="space-y-6">
      {/* Header */}
      <ResultDetailHeader
        questionType={questionType}
        evaluationStatus={evaluationStatus}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Question Information */}
      <QuestionSection
        question={question}
        assessmentQuestion={assessmentQuestion}
      />

      {/* Academic Classification */}
      <AcademicClassification
        subject={subject}
        chapter={chapter}
        topic={topic}
      />

      {/* Marks */}
      <MarksSection
        maximumMarks={maximumMarks}
        obtainedMarks={obtainedMarks}
      />

      {/* Evaluation */}
      <EvaluationSection
        evaluationStatus={evaluationStatus}
        evaluatedBy={evaluatedBy}
        evaluatedAt={evaluatedAt}
      />

      {/* Metadata */}
      <MetadataSection
        createdAt={createdAt}
        updatedAt={updatedAt}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

const ResultDetailHeader = ({
  questionType,
  evaluationStatus,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Result Detail
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <QuestionTypeBadge type={questionType} />

          <EvaluationStatusBadge
            status={evaluationStatus}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit()}
            className="rounded-md border px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Edit
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete()}
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Question                                                                   */
/* -------------------------------------------------------------------------- */

const QuestionSection = ({
  question,
  assessmentQuestion,
}) => {
  return (
    <section className="rounded-lg border bg-white">
      <SectionHeader title="Question Information" />

      <div className="space-y-5 p-5">
        <div>
          <Label>Question</Label>

          <QuestionText question={question} />
        </div>

        <div>
          <Label>Assessment Question</Label>

          <ReferenceValue value={assessmentQuestion} />
        </div>
      </div>
    </section>
  );
};

const QuestionText = ({ question }) => {
  if (!question) {
    return (
      <p className="text-sm text-gray-400">
        Question unavailable
      </p>
    );
  }

  if (typeof question === "string") {
    return (
      <p className="break-all text-sm text-gray-700">
        {question}
      </p>
    );
  }

  const questionText =
    question.questionText ||
    question.text ||
    question.title ||
    question.name;

  return (
    <div className="space-y-2">
      {question.questionNumber && (
        <p className="text-xs font-medium text-gray-500">
          Question {question.questionNumber}
        </p>
      )}

      <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
        {questionText || "Question text unavailable"}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Academic Classification                                                    */
/* -------------------------------------------------------------------------- */

const AcademicClassification = ({
  subject,
  chapter,
  topic,
}) => {
  return (
    <section className="rounded-lg border bg-white">
      <SectionHeader title="Academic Classification" />

      <div className="grid gap-5 p-5 sm:grid-cols-3">
        <InfoItem
          label="Subject"
          value={getDisplayName(subject)}
        />

        <InfoItem
          label="Chapter"
          value={getDisplayName(chapter)}
        />

        <InfoItem
          label="Topic"
          value={getDisplayName(topic)}
        />
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Marks                                                                      */
/* -------------------------------------------------------------------------- */

const MarksSection = ({
  maximumMarks,
  obtainedMarks,
}) => {
  const percentage =
    Number(maximumMarks) > 0
      ? (Number(obtainedMarks || 0) /
          Number(maximumMarks)) *
        100
      : 0;

  return (
    <section className="rounded-lg border bg-white">
      <SectionHeader title="Marks" />

      <div className="grid gap-5 p-5 sm:grid-cols-3">
        <div>
          <Label>Maximum Marks</Label>

          <p className="text-xl font-semibold text-gray-900">
            {formatMarks(maximumMarks)}
          </p>
        </div>

        <div>
          <Label>Obtained Marks</Label>

          <MarksDisplay
            maximumMarks={maximumMarks}
            obtainedMarks={obtainedMarks}
          />
        </div>

        <div>
          <Label>Percentage</Label>

          <p className="text-xl font-semibold text-gray-900">
            {percentage.toFixed(2)}%
          </p>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Evaluation                                                                 */
/* -------------------------------------------------------------------------- */

const EvaluationSection = ({
  evaluationStatus,
  evaluatedBy,
  evaluatedAt,
}) => {
  return (
    <section className="rounded-lg border bg-white">
      <SectionHeader title="Evaluation Information" />

      <div className="grid gap-5 p-5 sm:grid-cols-3">
        <div>
          <Label>Status</Label>

          <EvaluationStatusBadge
            status={evaluationStatus}
          />
        </div>

        <InfoItem
          label="Evaluated By"
          value={getEvaluatorName(evaluatedBy)}
        />

        <InfoItem
          label="Evaluated At"
          value={formatDateTime(evaluatedAt)}
        />
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

const MetadataSection = ({
  createdAt,
  updatedAt,
}) => {
  return (
    <section className="rounded-lg border bg-white">
      <SectionHeader title="Record Information" />

      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <InfoItem
          label="Created At"
          value={formatDateTime(createdAt)}
        />

        <InfoItem
          label="Last Updated"
          value={formatDateTime(updatedAt)}
        />
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Shared Components                                                          */
/* -------------------------------------------------------------------------- */

const SectionHeader = ({ title }) => {
  return (
    <div className="border-b bg-gray-50 px-5 py-3">
      <h3 className="text-sm font-semibold text-gray-900">
        {title}
      </h3>
    </div>
  );
};

const Label = ({ children }) => {
  return (
    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
      {children}
    </p>
  );
};

const InfoItem = ({ label, value }) => {
  return (
    <div>
      <Label>{label}</Label>

      <p className="text-sm font-medium text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
};

const ReferenceValue = ({ value }) => {
  return (
    <p className="break-all text-sm text-gray-700">
      {getDisplayName(value) || "—"}
    </p>
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getDisplayName = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return (
    value.name ||
    value.title ||
    value.fullName ||
    value.label ||
    value._id ||
    ""
  );
};

const getEvaluatorName = (evaluatedBy) => {
  if (!evaluatedBy) {
    return "Not evaluated";
  }

  if (typeof evaluatedBy === "string") {
    return evaluatedBy;
  }

  return (
    evaluatedBy.name ||
    evaluatedBy.fullName ||
    [
      evaluatedBy.firstName,
      evaluatedBy.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    evaluatedBy.email ||
    evaluatedBy._id ||
    "Unknown evaluator"
  );
};

const formatMarks = (marks) => {
  if (marks === null || marks === undefined) {
    return "0";
  }

  return Number.isInteger(Number(marks))
    ? Number(marks)
    : Number(marks).toFixed(2);
};

const formatDateTime = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString();
};

export default ResultDetailView;
