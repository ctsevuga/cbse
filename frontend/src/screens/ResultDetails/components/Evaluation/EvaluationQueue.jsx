// EvaluationQueue.jsx

import React from "react";

import ResultDetailActions from "./../../ResultDetail/ResultDetailActions";

const EvaluationQueue = ({
  resultDetails = [],

  isLoading = false,
  isFetching = false,

  onView,
  onEvaluate,
  onEdit,
  onDelete,

  title = "Evaluation Queue",
  subtitle = "Questions waiting for evaluation or review.",

  showOnlyPending = false,
  showReviewRequired = true,

  emptyMessage = "There are no questions waiting for evaluation.",

  maxItems,
}) => {
  const queueItems = filterQueueItems(
    resultDetails,
    {
      showOnlyPending,
      showReviewRequired,
    },
  );

  const displayedItems =
    maxItems && maxItems > 0
      ? queueItems.slice(0, maxItems)
      : queueItems;

  return (
    <section className="overflow-hidden rounded-lg border bg-white">
      {/* Header */}
      <div className="border-b bg-gray-50 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {title}
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              {subtitle}
            </p>
          </div>

          {!isLoading && (
            <QueueCount
              count={queueItems.length}
            />
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <EvaluationQueueSkeleton />
      ) : displayedItems.length === 0 ? (
        <EmptyQueue
          message={emptyMessage}
        />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <EvaluationQueueHead />

              <tbody className="divide-y divide-gray-100">
                {displayedItems.map(
                  (resultDetail) => (
                    <EvaluationQueueRow
                      key={resultDetail._id}
                      resultDetail={
                        resultDetail
                      }
                      onView={onView}
                      onEvaluate={
                        onEvaluate
                      }
                      onEdit={onEdit}
                      onDelete={
                        onDelete
                      }
                    />
                  ),
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-gray-100 md:hidden">
            {displayedItems.map(
              (resultDetail) => (
                <EvaluationQueueCard
                  key={resultDetail._id}
                  resultDetail={
                    resultDetail
                  }
                  onView={onView}
                  onEvaluate={
                    onEvaluate
                  }
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ),
            )}
          </div>

          {/* More Items */}
          {maxItems &&
            queueItems.length > maxItems && (
              <div className="border-t bg-gray-50 px-5 py-3 text-center">
                <p className="text-xs text-gray-500">
                  Showing {maxItems} of{" "}
                  {queueItems.length} pending
                  evaluations.
                </p>
              </div>
            )}
        </>
      )}

      {/* Fetching */}
      {isFetching && !isLoading && (
        <div className="border-t bg-blue-50 px-5 py-2 text-xs font-medium text-blue-600">
          Updating evaluation queue...
        </div>
      )}
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Queue Count                                                                */
/* -------------------------------------------------------------------------- */

const QueueCount = ({
  count,
}) => {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1",
        "text-xs font-semibold",
        count > 0
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700",
      ].join(" ")}
    >
      {count}{" "}
      {count === 1
        ? "evaluation"
        : "evaluations"}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Desktop Header                                                             */
/* -------------------------------------------------------------------------- */

const EvaluationQueueHead = () => {
  return (
    <thead className="bg-white">
      <tr>
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
          Student
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
          Status
        </th>

        <th
          scope="col"
          className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Action
        </th>
      </tr>
    </thead>
  );
};

/* -------------------------------------------------------------------------- */
/* Desktop Row                                                                */
/* -------------------------------------------------------------------------- */

const EvaluationQueueRow = ({
  resultDetail,

  onView,
  onEvaluate,
  onEdit,
  onDelete,
}) => {
  const student =
    resultDetail.result?.student ||
    resultDetail.student;

  const subject =
    resultDetail.subject;

  return (
    <tr className="transition-colors hover:bg-gray-50">
      {/* Question */}
      <td className="max-w-sm px-5 py-4">
        <QuestionCell
          question={
            resultDetail.question
          }
        />
      </td>

      {/* Student */}
      <td className="px-4 py-4">
        <StudentCell
          student={student}
        />
      </td>

      {/* Subject */}
      <td className="px-4 py-4">
        <p className="text-sm text-gray-700">
          {getDisplayName(subject) ||
            "—"}
        </p>
      </td>

      {/* Type */}
      <td className="px-4 py-4">
        <QuestionTypeBadge
          type={
            resultDetail.questionType
          }
        />
      </td>

      {/* Marks */}
      <td className="px-4 py-4 text-right">
        <MarksCell
          maximumMarks={
            resultDetail.maximumMarks
          }
          obtainedMarks={
            resultDetail.obtainedMarks
          }
        />
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <EvaluationStatusBadge
          status={
            resultDetail.evaluationStatus
          }
        />
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <ResultDetailActions
          resultDetail={
            resultDetail
          }
          onView={onView}
          onEdit={onEdit}
          onEvaluate={onEvaluate}
          onDelete={onDelete}
          canEvaluate={isEvaluatable(
            resultDetail,
          )}
        />
      </td>
    </tr>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile Card                                                                */
/* -------------------------------------------------------------------------- */

const EvaluationQueueCard = ({
  resultDetail,

  onView,
  onEvaluate,
  onEdit,
  onDelete,
}) => {
  const student =
    resultDetail.result?.student ||
    resultDetail.student;

  return (
    <div className="p-4">
      {/* Question */}
      <div className="flex items-start justify-between gap-3">
        <QuestionCell
          question={
            resultDetail.question
          }
        />

        <EvaluationStatusBadge
          status={
            resultDetail.evaluationStatus
          }
        />
      </div>

      {/* Student / Subject */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Student
          </p>

          <div className="mt-1">
            <StudentCell
              student={student}
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Subject
          </p>

          <p className="mt-1 text-sm text-gray-700">
            {getDisplayName(
              resultDetail.subject,
            ) || "—"}
          </p>
        </div>
      </div>

      {/* Question Type / Marks */}
      <div className="mt-4 flex items-center justify-between">
        <QuestionTypeBadge
          type={
            resultDetail.questionType
          }
        />

        <MarksCell
          maximumMarks={
            resultDetail.maximumMarks
          }
          obtainedMarks={
            resultDetail.obtainedMarks
          }
        />
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end border-t pt-3">
        <ResultDetailActions
          resultDetail={resultDetail}
          onView={onView}
          onEdit={onEdit}
          onEvaluate={onEvaluate}
          onDelete={onDelete}
          canEvaluate={isEvaluatable(
            resultDetail,
          )}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Cell                                                              */
/* -------------------------------------------------------------------------- */

const QuestionCell = ({
  question,
}) => {
  const text = getQuestionText(
    question,
  );

  return (
    <div className="min-w-0">
      <p className="line-clamp-2 text-sm font-medium leading-5 text-gray-900">
        {text}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Student Cell                                                               */
/* -------------------------------------------------------------------------- */

const StudentCell = ({
  student,
}) => {
  const name = getStudentName(
    student,
  );

  if (!name) {
    return (
      <span className="text-sm text-gray-400">
        —
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
        {getInitials(name)}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-800">
          {name}
        </p>

        {student?.email && (
          <p className="truncate text-xs text-gray-400">
            {student.email}
          </p>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Marks Cell                                                                 */
/* -------------------------------------------------------------------------- */

const MarksCell = ({
  maximumMarks,
  obtainedMarks,
}) => {
  return (
    <div>
      <span className="text-sm font-semibold text-gray-900">
        {formatMarks(obtainedMarks)}
      </span>

      <span className="text-xs text-gray-400">
        {" "}
        / {formatMarks(maximumMarks)}
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Type Badge                                                        */
/* -------------------------------------------------------------------------- */

const QuestionTypeBadge = ({
  type,
}) => {
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
      {type
        ? formatEnumLabel(type)
        : "Unknown"}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Evaluation Status Badge                                                    */
/* -------------------------------------------------------------------------- */

const EvaluationStatusBadge = ({
  status,
}) => {
  const config = {
    PENDING: {
      label: "Pending",
      className:
        "bg-yellow-50 text-yellow-700",
    },

    REVIEW_REQUIRED: {
      label: "Review Required",
      className:
        "bg-orange-50 text-orange-700",
    },

    AUTO_EVALUATED: {
      label: "Auto Evaluated",
      className:
        "bg-blue-50 text-blue-700",
    },

    EVALUATED: {
      label: "Evaluated",
      className:
        "bg-green-50 text-green-700",
    },

    NOT_ATTEMPTED: {
      label: "Not Attempted",
      className:
        "bg-gray-100 text-gray-600",
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
        "inline-flex whitespace-nowrap rounded-full",
        "px-2.5 py-1 text-xs font-medium",
        current.className,
      ].join(" ")}
    >
      {current.label || "Unknown"}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyQueue = ({
  message,
}) => {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-5 py-10 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5 text-green-600"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m5 12 4 4L19 6"
          />
        </svg>
      </div>

      <p className="text-sm font-medium text-gray-700">
        {message}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        All currently assigned questions have
        been evaluated.
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

const EvaluationQueueSkeleton = () => {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4 px-5 py-4"
          >
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
            </div>

            <div className="h-4 w-24 rounded bg-gray-200" />

            <div className="h-6 w-20 rounded-full bg-gray-200" />

            <div className="h-8 w-24 rounded bg-gray-200" />
          </div>
        ),
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Queue Filtering                                                            */
/* -------------------------------------------------------------------------- */

const filterQueueItems = (
  resultDetails,
  {
    showOnlyPending,
    showReviewRequired,
  },
) => {
  if (!Array.isArray(resultDetails)) {
    return [];
  }

  return resultDetails.filter(
    (detail) => {
      const status =
        detail?.evaluationStatus;

      if (
        showOnlyPending &&
        status !== "PENDING"
      ) {
        return false;
      }

      if (
        !showReviewRequired &&
        status === "REVIEW_REQUIRED"
      ) {
        return false;
      }

      /*
       * By default the queue only contains
       * records that actually require teacher
       * attention.
       */
      if (
        !showOnlyPending &&
        ![
          "PENDING",
          "REVIEW_REQUIRED",
        ].includes(status)
      ) {
        return false;
      }

      return true;
    },
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

const getQuestionText = (
  question,
) => {
  if (!question) {
    return "Question unavailable";
  }

  if (typeof question === "string") {
    return question;
  }

  return (
    question.questionText ||
    question.text ||
    question.title ||
    question.name ||
    "Question unavailable"
  );
};

const getStudentName = (
  student,
) => {
  if (!student) {
    return "";
  }

  if (typeof student === "string") {
    return student;
  }

  return (
    student.name ||
    student.fullName ||
    [
      student.firstName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    student.username ||
    student.email ||
    ""
  );
};

const getDisplayName = (
  value,
) => {
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

const getInitials = (name) => {
  if (!name) {
    return "";
  }

  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
};

const formatMarks = (marks) => {
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

export default EvaluationQueue;
