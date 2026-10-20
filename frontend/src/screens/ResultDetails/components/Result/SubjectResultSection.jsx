// SubjectResultSection.jsx

import React, { useMemo } from "react";

import ResultQuestionTable from "./ResultQuestionTable";

const SubjectResultSection = ({
  subject,
  resultDetails = [],

  onView,
  onEdit,
  onEvaluate,
  onDelete,

  selectedId = null,
  onSelect,

  selectable = false,
  showActions = true,

  defaultExpanded = true,
}) => {
  const subjectDetails = useMemo(() => {
    if (!Array.isArray(resultDetails)) {
      return [];
    }

    return resultDetails.filter((detail) =>
      matchesSubject(detail, subject),
    );
  }, [resultDetails, subject]);

  const summary = useMemo(
    () => calculateSubjectSummary(subjectDetails),
    [subjectDetails],
  );

  const subjectName = getSubjectName(subject);

  return (
    <section className="overflow-hidden rounded-lg border bg-white">
      {/* Subject Header */}
      <details open={defaultExpanded}>
        <summary className="cursor-pointer list-none">
          <div className="flex flex-col gap-4 border-b bg-gray-50 px-5 py-4 transition-colors hover:bg-gray-100 sm:flex-row sm:items-center sm:justify-between">
            {/* Subject Identity */}
            <div className="flex min-w-0 items-center gap-3">
              <SubjectIcon />

              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-gray-900">
                  {subjectName || "Subject"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  {summary.totalQuestions}{" "}
                  {summary.totalQuestions === 1
                    ? "question"
                    : "questions"}
                </p>
              </div>
            </div>

            {/* Score */}
            <div className="flex flex-wrap items-center gap-4">
              <SummaryMetric
                label="Score"
                value={`${formatMarks(
                  summary.obtainedMarks,
                )} / ${formatMarks(
                  summary.maximumMarks,
                )}`}
              />

              <SummaryMetric
                label="Percentage"
                value={
                  summary.percentage !== null
                    ? `${summary.percentage.toFixed(
                        2,
                      )}%`
                    : "—"
                }
              />

              <SummaryMetric
                label="Evaluated"
                value={`${summary.evaluatedQuestions}/${summary.totalQuestions}`}
              />

              <ChevronIcon />
            </div>
          </div>
        </summary>

        {/* Subject Content */}
        <div className="p-4 sm:p-5">
          <SubjectProgress
            percentage={summary.percentage}
          />

          <div className="mt-5">
            <ResultQuestionTable
              resultDetails={subjectDetails}
              onView={onView}
              onEdit={onEdit}
              onEvaluate={onEvaluate}
              onDelete={onDelete}
              selectedId={selectedId}
              onSelect={onSelect}
              selectable={selectable}
              showActions={showActions}
              emptyMessage="No questions found for this subject."
            />
          </div>
        </div>
      </details>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Subject Progress                                                           */
/* -------------------------------------------------------------------------- */

const SubjectProgress = ({
  percentage,
}) => {
  if (percentage === null) {
    return null;
  }

  const normalized = Math.min(
    Math.max(Number(percentage), 0),
    100,
  );

  const color =
    normalized >= 75
      ? "bg-green-500"
      : normalized >= 40
        ? "bg-blue-500"
        : "bg-red-500";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Subject Performance
        </span>

        <span className="text-xs font-semibold text-gray-700">
          {normalized.toFixed(2)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{
            width: `${normalized}%`,
          }}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Summary Metric                                                             */
/* -------------------------------------------------------------------------- */

const SummaryMetric = ({
  label,
  value,
}) => {
  return (
    <div className="text-right">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Subject Icon                                                               */
/* -------------------------------------------------------------------------- */

const SubjectIcon = () => {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"
        />
      </svg>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Chevron                                                                    */
/* -------------------------------------------------------------------------- */

const ChevronIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5 shrink-0 text-gray-400"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6 9 6 6 6-6"
      />
    </svg>
  );
};

/* -------------------------------------------------------------------------- */
/* Subject Matching                                                           */
/* -------------------------------------------------------------------------- */

const matchesSubject = (
  detail,
  subject,
) => {
  if (!detail || !subject) {
    return false;
  }

  const detailSubject = detail.subject;

  if (!detailSubject) {
    return false;
  }

  const subjectId =
    typeof subject === "object"
      ? subject._id
      : subject;

  const detailSubjectId =
    typeof detailSubject === "object"
      ? detailSubject._id
      : detailSubject;

  return (
    String(detailSubjectId) ===
    String(subjectId)
  );
};

/* -------------------------------------------------------------------------- */
/* Subject Name                                                               */
/* -------------------------------------------------------------------------- */

const getSubjectName = (subject) => {
  if (!subject) {
    return "";
  }

  if (typeof subject === "string") {
    return subject;
  }

  return (
    subject.name ||
    subject.title ||
    subject.subjectName ||
    subject.label ||
    subject.code ||
    subject._id ||
    ""
  );
};

/* -------------------------------------------------------------------------- */
/* Summary Calculation                                                        */
/* -------------------------------------------------------------------------- */

const calculateSubjectSummary = (
  details,
) => {
  const totalQuestions =
    details.length;

  const maximumMarks = details.reduce(
    (total, detail) =>
      total +
      Number(detail.maximumMarks || 0),
    0,
  );

  const obtainedMarks = details.reduce(
    (total, detail) =>
      total +
      Number(detail.obtainedMarks || 0),
    0,
  );

  const percentage =
    maximumMarks > 0
      ? (obtainedMarks /
          maximumMarks) *
        100
      : null;

  const attemptedQuestions =
    details.filter(
      (detail) =>
        detail.evaluationStatus !==
        "NOT_ATTEMPTED",
    ).length;

  const evaluatedQuestions =
    details.filter((detail) =>
      [
        "AUTO_EVALUATED",
        "EVALUATED",
      ].includes(
        detail.evaluationStatus,
      ),
    ).length;

  const pendingQuestions =
    details.filter((detail) =>
      [
        "PENDING",
        "REVIEW_REQUIRED",
      ].includes(
        detail.evaluationStatus,
      ),
    ).length;

  return {
    totalQuestions,
    maximumMarks,
    obtainedMarks,
    percentage,
    attemptedQuestions,
    evaluatedQuestions,
    pendingQuestions,
  };
};

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

const formatMarks = (marks) => {
  if (
    marks === null ||
    marks === undefined
  ) {
    return "0";
  }

  const number = Number(marks);

  if (Number.isNaN(number)) {
    return "0";
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);
};

export default SubjectResultSection;
