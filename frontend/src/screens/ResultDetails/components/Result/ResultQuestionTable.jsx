// ResultQuestionTable.jsx

import React from "react";

import ResultDetailRow from "./../../ResultDetail/ResultDetailRow";

const ResultQuestionTable = ({
  resultDetails = [],

  isLoading = false,
  isFetching = false,

  onView,
  onEdit,
  onEvaluate,
  onDelete,

  selectedId = null,
  onSelect,

  selectable = false,
  showActions = true,

  emptyMessage = "No questions found for this result.",
}) => {
  const hasData =
    Array.isArray(resultDetails) &&
    resultDetails.length > 0;

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      {/* Table Header */}
      <div className="flex flex-col gap-1 border-b bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Questions
          </h2>

          <p className="text-xs text-gray-500">
            Question-level marks and evaluation details.
          </p>
        </div>

        {!isLoading && (
          <span className="text-xs font-medium text-gray-500">
            {resultDetails.length}{" "}
            {resultDetails.length === 1
              ? "question"
              : "questions"}
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading ? (
        <ResultQuestionTableSkeleton />
      ) : !hasData ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <>
          {/* Mobile View */}
          <div className="divide-y md:hidden">
            {resultDetails.map(
              (resultDetail) => (
                <ResultQuestionMobileCard
                  key={resultDetail._id}
                  resultDetail={resultDetail}
                  onView={onView}
                  onEdit={onEdit}
                  onEvaluate={onEvaluate}
                  onDelete={onDelete}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  selectable={selectable}
                  showActions={showActions}
                />
              ),
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <TableHead
                selectable={selectable}
                showActions={showActions}
              />

              <tbody className="divide-y divide-gray-100 bg-white">
                {resultDetails.map(
                  (resultDetail) => (
                    <ResultDetailRow
                      key={resultDetail._id}
                      resultDetail={resultDetail}
                      onView={onView}
                      onEdit={onEdit}
                      onEvaluate={onEvaluate}
                      onDelete={onDelete}
                      selectedId={selectedId}
                      onSelect={onSelect}
                      selectable={selectable}
                      showActions={showActions}
                    />
                  ),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Background Refetch Indicator */}
      {isFetching && !isLoading && (
        <div className="border-t bg-blue-50 px-5 py-2 text-xs font-medium text-blue-600">
          Updating questions...
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Table Head                                                                 */
/* -------------------------------------------------------------------------- */

const TableHead = ({
  selectable,
  showActions,
}) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {selectable && (
          <th
            scope="col"
            className="w-10 px-4 py-3"
          >
            <span className="sr-only">
              Select
            </span>
          </th>
        )}

        <th
          scope="col"
          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Question
        </th>

        <th
          scope="col"
          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Subject
        </th>

        <th
          scope="col"
          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Chapter
        </th>

        <th
          scope="col"
          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Topic
        </th>

        <th
          scope="col"
          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Type
        </th>

        <th
          scope="col"
          className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Marks
        </th>

        <th
          scope="col"
          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Evaluation
        </th>

        {showActions && (
          <th
            scope="col"
            className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Actions
          </th>
        )}
      </tr>
    </thead>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile Card                                                                */
/* -------------------------------------------------------------------------- */

const ResultQuestionMobileCard = ({
  resultDetail,

  onView,
  onEdit,
  onEvaluate,
  onDelete,

  selectedId,
  onSelect,

  selectable,
  showActions,
}) => {
  const {
    _id,
    question,
    subject,
    chapter,
    topic,
    questionType,
    maximumMarks,
    obtainedMarks,
    evaluationStatus,
  } = resultDetail;

  const isSelected =
    selectedId === _id;

  return (
    <div
      className={[
        "p-4 transition-colors",
        isSelected
          ? "bg-blue-50"
          : "bg-white",
      ].join(" ")}
    >
      {/* Top */}
      <div className="flex items-start gap-3">
        {selectable && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() =>
              onSelect?.(resultDetail)
            }
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <QuestionInfo
              question={question}
            />

            <QuestionTypeBadge
              type={questionType}
            />
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MobileInfo
          label="Subject"
          value={getDisplayName(subject)}
        />

        <MobileInfo
          label="Chapter"
          value={getDisplayName(chapter)}
        />

        <MobileInfo
          label="Topic"
          value={getDisplayName(topic)}
        />

        <MobileInfo
          label="Marks"
          value={`${formatMarks(
            obtainedMarks,
          )} / ${formatMarks(
            maximumMarks,
          )}`}
        />
      </div>

      {/* Evaluation */}
      <div className="mt-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
          Evaluation
        </p>

        <EvaluationStatusBadge
          status={evaluationStatus}
        />
      </div>

      {/* Actions */}
      {showActions && (
        <div className="mt-4 border-t pt-3">
          <MobileActions
            resultDetail={resultDetail}
            onView={onView}
            onEdit={onEdit}
            onEvaluate={onEvaluate}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile Actions                                                             */
/* -------------------------------------------------------------------------- */

const MobileActions = ({
  resultDetail,
  onView,
  onEdit,
  onEvaluate,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-end gap-2">
      {onView && (
        <button
          type="button"
          onClick={() =>
            onView(resultDetail)
          }
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          View
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={() =>
            onEdit(resultDetail)
          }
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit
        </button>
      )}

      {onEvaluate &&
        isEvaluatable(resultDetail) && (
          <button
            type="button"
            onClick={() =>
              onEvaluate(resultDetail)
            }
            className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            Evaluate
          </button>
        )}

      {onDelete && (
        <button
          type="button"
          onClick={() =>
            onDelete(resultDetail)
          }
          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Info                                                              */
/* -------------------------------------------------------------------------- */

const QuestionInfo = ({
  question,
}) => {
  if (!question) {
    return (
      <div>
        <p className="text-sm font-medium text-gray-900">
          Question unavailable
        </p>
      </div>
    );
  }

  if (typeof question === "string") {
    return (
      <p className="break-all text-sm font-medium text-gray-900">
        {question}
      </p>
    );
  }

  const text =
    question.questionText ||
    question.text ||
    question.title ||
    question.name ||
    "Question unavailable";

  const questionNumber =
    question.questionNumber ||
    question.number;

  return (
    <div className="min-w-0">
      {questionNumber && (
        <p className="mb-0.5 text-xs font-medium text-gray-400">
          Question {questionNumber}
        </p>
      )}

      <p className="line-clamp-2 text-sm font-medium leading-5 text-gray-900">
        {text}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Type Badge                                                        */
/* -------------------------------------------------------------------------- */

const QuestionTypeBadge = ({
  type,
}) => {
  if (!type) {
    return (
      <span className="text-xs text-gray-400">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
      {formatEnumLabel(type)}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Evaluation Status Badge                                                    */
/* -------------------------------------------------------------------------- */

const EvaluationStatusBadge = ({
  status,
}) => {
  if (!status) {
    return (
      <span className="text-xs text-gray-400">
        —
      </span>
    );
  }

  const config = {
    NOT_ATTEMPTED: {
      label: "Not Attempted",
      className:
        "bg-gray-100 text-gray-600",
    },

    AUTO_EVALUATED: {
      label: "Auto Evaluated",
      className:
        "bg-blue-50 text-blue-700",
    },

    PENDING: {
      label: "Pending",
      className:
        "bg-yellow-50 text-yellow-700",
    },

    EVALUATED: {
      label: "Evaluated",
      className:
        "bg-green-50 text-green-700",
    },

    REVIEW_REQUIRED: {
      label: "Review Required",
      className:
        "bg-orange-50 text-orange-700",
    },
  };

  const current =
    config[status] || {
      label: formatEnumLabel(status),
      className:
        "bg-gray-100 text-gray-600",
    };

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1",
        "text-xs font-medium",
        current.className,
      ].join(" ")}
    >
      {current.label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Marks                                                                      */
/* -------------------------------------------------------------------------- */

const MarksDisplay = ({
  obtainedMarks,
  maximumMarks,
}) => {
  const obtained =
    Number(obtainedMarks || 0);

  const maximum =
    Number(maximumMarks || 0);

  const isFull =
    maximum > 0 &&
    obtained >= maximum;

  const isZero =
    obtained <= 0 && maximum > 0;

  return (
    <div className="text-right">
      <span
        className={[
          "font-semibold",
          isFull
            ? "text-green-600"
            : isZero
              ? "text-red-600"
              : "text-gray-900",
        ].join(" ")}
      >
        {formatMarks(obtained)}
      </span>

      <span className="text-gray-400">
        {" "}
        / {formatMarks(maximum)}
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyState = ({
  message,
}) => {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-5 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5h6M9 9h6M9 13h3"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
          />
        </svg>
      </div>

      <p className="text-sm font-medium text-gray-700">
        {message}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Try changing the filters or selecting
        another result.
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

const ResultQuestionTableSkeleton = () => {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4 px-5 py-4"
          >
            <div className="h-4 w-4 rounded bg-gray-200" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
            </div>

            <div className="h-6 w-20 rounded-full bg-gray-200" />

            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
        ),
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile Info                                                                */
/* -------------------------------------------------------------------------- */

const MobileInfo = ({
  label,
  value,
}) => {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-sm text-gray-700">
        {value || "—"}
      </p>
    </div>
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

const formatEnumLabel = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
};

const isEvaluatable = (
  resultDetail,
) => {
  return [
    "PENDING",
    "REVIEW_REQUIRED",
  ].includes(
    resultDetail?.evaluationStatus,
  );
};

export default ResultQuestionTable;
