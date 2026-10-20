import React, { useMemo } from "react";

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const QuestionTypeBreakdown = ({
  resultDetails = [],

  questionTypes = QUESTION_TYPES,

  title = "Question Type Breakdown",

  loading = false,

  showProgress = true,
  showEvaluationStatus = true,

  onQuestionTypeClick,

  className = "",
}) => {
  const breakdown = useMemo(
    () =>
      buildBreakdown(
        resultDetails,
        questionTypes,
      ),
    [resultDetails, questionTypes],
  );

  const overall = useMemo(
    () => calculateOverall(breakdown),
    [breakdown],
  );

  if (loading) {
    return (
      <QuestionTypeBreakdownSkeleton
        title={title}
      />
    );
  }

  if (!breakdown.length) {
    return (
      <EmptyQuestionTypeBreakdown
        title={title}
      />
    );
  }

  return (
    <section
      className={[
        "overflow-hidden rounded-xl border bg-white shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <BreakdownHeader
        title={title}
        overall={overall}
      />

      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={tableHeaderClass}>
                Question Type
              </th>

              <th
                className={`${tableHeaderClass} text-center`}
              >
                Questions
              </th>

              <th
                className={`${tableHeaderClass} text-center`}
              >
                Maximum
              </th>

              <th
                className={`${tableHeaderClass} text-center`}
              >
                Obtained
              </th>

              <th
                className={`${tableHeaderClass} text-center`}
              >
                Performance
              </th>

              {showEvaluationStatus && (
                <th
                  className={`${tableHeaderClass} text-center`}
                >
                  Evaluation
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {breakdown.map((item) => (
              <QuestionTypeRow
                key={item.type}
                item={item}
                showProgress={showProgress}
                showEvaluationStatus={
                  showEvaluationStatus
                }
                onClick={
                  onQuestionTypeClick
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-gray-100 md:hidden">
        {breakdown.map((item) => (
          <QuestionTypeCard
            key={item.type}
            item={item}
            showProgress={showProgress}
            showEvaluationStatus={
              showEvaluationStatus
            }
            onClick={
              onQuestionTypeClick
            }
          />
        ))}
      </div>

      <BreakdownFooter
        overall={overall}
      />
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

const BreakdownHeader = ({
  title,
  overall,
}) => {
  return (
    <div className="border-b px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-600">
            Analysis
          </p>

          <h2 className="mt-1 text-base font-semibold text-gray-900">
            {title}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Performance grouped by question type.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <MiniStatistic
            label="Questions"
            value={overall.questions}
          />

          <MiniStatistic
            label="Types"
            value={overall.activeTypes}
            color="purple"
          />

          <MiniStatistic
            label="Average"
            value={`${overall.percentage.toFixed(
              1,
            )}%`}
            color={
              getPerformanceColor(
                overall.percentage,
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Desktop Row                                                                */
/* -------------------------------------------------------------------------- */

const QuestionTypeRow = ({
  item,
  showProgress,
  showEvaluationStatus,
  onClick,
}) => {
  const clickable =
    typeof onClick === "function";

  return (
    <tr
      onClick={
        clickable
          ? () => onClick(item.type, item)
          : undefined
      }
      className={[
        "transition",
        clickable
          ? "cursor-pointer hover:bg-gray-50"
          : "",
      ].join(" ")}
    >
      <td className="min-w-[190px] px-4 py-4">
        <QuestionTypeCell item={item} />
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-center">
        <span className="text-sm font-semibold text-gray-800">
          {item.questions}
        </span>
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-600">
        {formatMarks(item.maximumMarks)}
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-center">
        <span
          className={[
            "text-sm font-semibold",
            getPerformanceColor(
              item.percentage,
            ),
          ].join(" ")}
        >
          {formatMarks(item.obtainedMarks)}
        </span>
      </td>

      <td className="min-w-[190px] px-4 py-4">
        <PerformanceCell
          item={item}
          showProgress={showProgress}
        />
      </td>

      {showEvaluationStatus && (
        <td className="min-w-[220px] px-4 py-4">
          <EvaluationDistribution
            item={item}
          />
        </td>
      )}
    </tr>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile Card                                                                */
/* -------------------------------------------------------------------------- */

const QuestionTypeCard = ({
  item,
  showProgress,
  showEvaluationStatus,
  onClick,
}) => {
  const clickable =
    typeof onClick === "function";

  return (
    <article
      onClick={
        clickable
          ? () => onClick(item.type, item)
          : undefined
      }
      className={[
        "p-4",
        clickable
          ? "cursor-pointer active:bg-gray-50"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <QuestionTypeCell item={item} />

        <div className="text-right">
          <p
            className={[
              "text-base font-semibold",
              getPerformanceColor(
                item.percentage,
              ),
            ].join(" ")}
          >
            {item.percentage.toFixed(1)}%
          </p>

          <p className="mt-0.5 text-[10px] text-gray-400">
            performance
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MetricBox
          label="Questions"
          value={item.questions}
        />

        <MetricBox
          label="Maximum"
          value={formatMarks(
            item.maximumMarks,
          )}
        />

        <MetricBox
          label="Obtained"
          value={formatMarks(
            item.obtainedMarks,
          )}
        />
      </div>

      {showProgress && (
        <div className="mt-4">
          <PerformanceBar
            percentage={item.percentage}
          />
        </div>
      )}

      {showEvaluationStatus && (
        <div className="mt-4 border-t pt-3">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-wide text-gray-400">
            Evaluation Status
          </p>

          <EvaluationDistribution
            item={item}
          />
        </div>
      )}
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Type Cell                                                         */
/* -------------------------------------------------------------------------- */

const QuestionTypeCell = ({
  item,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center",
          "rounded-lg text-xs font-bold",
          item.colorClass,
        ].join(" ")}
      >
        {item.shortLabel}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">
          {item.label}
        </p>

        <p className="mt-0.5 text-[10px] text-gray-400">
          {item.questions}{" "}
          {item.questions === 1
            ? "question"
            : "questions"}
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Performance Cell                                                           */
/* -------------------------------------------------------------------------- */

const PerformanceCell = ({
  item,
  showProgress,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span
          className={[
            "text-sm font-semibold",
            getPerformanceColor(
              item.percentage,
            ),
          ].join(" ")}
        >
          {item.percentage.toFixed(1)}%
        </span>

        <span className="text-[10px] text-gray-400">
          {formatMarks(
            item.obtainedMarks,
          )}
          /
          {formatMarks(
            item.maximumMarks,
          )}
        </span>
      </div>

      {showProgress && (
        <div className="mt-2">
          <PerformanceBar
            percentage={item.percentage}
          />
        </div>
      )}
    </div>
  );
};

const PerformanceBar = ({
  percentage,
}) => {
  const safePercentage =
    Math.max(
      0,
      Math.min(100, percentage),
    );

  return (
    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
      <div
        className={[
          "h-full rounded-full transition-all",
          getProgressColor(
            percentage,
          ),
        ].join(" ")}
        style={{
          width: `${safePercentage}%`,
        }}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Evaluation Distribution                                                    */
/* -------------------------------------------------------------------------- */

const EvaluationDistribution = ({
  item,
}) => {
  if (!item.questions) {
    return (
      <span className="text-xs text-gray-400">
        —
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {item.evaluated > 0 && (
        <StatusCount
          label="Evaluated"
          count={item.evaluated}
          color="green"
        />
      )}

      {item.autoEvaluated > 0 && (
        <StatusCount
          label="Auto"
          count={item.autoEvaluated}
          color="blue"
        />
      )}

      {item.pending > 0 && (
        <StatusCount
          label="Pending"
          count={item.pending}
          color="yellow"
        />
      )}

      {item.reviewRequired > 0 && (
        <StatusCount
          label="Review"
          count={item.reviewRequired}
          color="orange"
        />
      )}

      {item.notAttempted > 0 && (
        <StatusCount
          label="Not Attempted"
          count={item.notAttempted}
          color="gray"
        />
      )}
    </div>
  );
};

const StatusCount = ({
  label,
  count,
  color,
}) => {
  const colors = {
    green:
      "border-green-200 bg-green-50 text-green-700",
    blue:
      "border-blue-200 bg-blue-50 text-blue-700",
    yellow:
      "border-yellow-200 bg-yellow-50 text-yellow-700",
    orange:
      "border-orange-200 bg-orange-50 text-orange-700",
    gray:
      "border-gray-200 bg-gray-50 text-gray-600",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1",
        "rounded-full border px-2 py-1",
        "text-[9px] font-medium",
        colors[color],
      ].join(" ")}
    >
      {label}
      <span className="font-bold">
        {count}
      </span>
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Metric Box                                                                 */
/* -------------------------------------------------------------------------- */

const MetricBox = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

const BreakdownFooter = ({
  overall,
}) => {
  const evaluated =
    overall.evaluated +
    overall.autoEvaluated;

  const completion =
    overall.questions > 0
      ? (evaluated /
          overall.questions) *
        100
      : 0;

  return (
    <div className="border-t bg-gray-50 px-5 py-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <FooterMetric
          label="Total Questions"
          value={overall.questions}
        />

        <FooterMetric
          label="Maximum Marks"
          value={formatMarks(
            overall.maximumMarks,
          )}
        />

        <FooterMetric
          label="Obtained Marks"
          value={formatMarks(
            overall.obtainedMarks,
          )}
          color={getPerformanceColor(
            overall.percentage,
          )}
        />

        <FooterMetric
          label="Evaluation Complete"
          value={`${completion.toFixed(
            0,
          )}%`}
          color={
            completion >= 100
              ? "text-green-600"
              : "text-blue-600"
          }
        />
      </div>
    </div>
  );
};

const FooterMetric = ({
  label,
  value,
  color = "text-gray-800",
}) => {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-sm font-semibold",
          color,
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

const buildBreakdown = (
  resultDetails,
  questionTypes,
) => {
  const records = Array.isArray(
    resultDetails,
  )
    ? resultDetails
    : [];

  const allowedTypes =
    Array.isArray(questionTypes)
      ? questionTypes
      : QUESTION_TYPES;

  const grouped = new Map();

  allowedTypes.forEach((type) => {
    grouped.set(type, createGroup(type));
  });

  records.forEach((detail) => {
    const type =
      detail?.questionType;

    if (!type) {
      return;
    }

    if (!grouped.has(type)) {
      grouped.set(
        type,
        createGroup(type),
      );
    }

    const group = grouped.get(type);

    const maximumMarks =
      Number(
        detail?.maximumMarks,
      ) || 0;

    const obtainedMarks =
      Number(
        detail?.obtainedMarks,
      ) || 0;

    group.questions += 1;
    group.maximumMarks +=
      maximumMarks;
    group.obtainedMarks +=
      obtainedMarks;

    switch (
      detail?.evaluationStatus
    ) {
      case "EVALUATED":
        group.evaluated += 1;
        break;

      case "AUTO_EVALUATED":
        group.autoEvaluated += 1;
        break;

      case "PENDING":
        group.pending += 1;
        break;

      case "REVIEW_REQUIRED":
        group.reviewRequired += 1;
        break;

      case "NOT_ATTEMPTED":
        group.notAttempted += 1;
        break;

      default:
        break;
    }
  });

  return Array.from(
    grouped.values(),
  )
    .filter(
      (item) => item.questions > 0,
    )
    .map((item) => ({
      ...item,

      percentage:
        item.maximumMarks > 0
          ? (item.obtainedMarks /
              item.maximumMarks) *
            100
          : 0,
    }));
};

const createGroup = (type) => {
  const config =
    TYPE_CONFIG[type] ||
    TYPE_CONFIG.DEFAULT;

  return {
    type,
    label: config.label,
    shortLabel:
      config.shortLabel,
    colorClass:
      config.colorClass,

    questions: 0,

    maximumMarks: 0,
    obtainedMarks: 0,

    evaluated: 0,
    autoEvaluated: 0,
    pending: 0,
    reviewRequired: 0,
    notAttempted: 0,
  };
};

const calculateOverall = (
  breakdown,
) => {
  const result = breakdown.reduce(
    (acc, item) => {
      acc.questions +=
        item.questions;

      acc.maximumMarks +=
        item.maximumMarks;

      acc.obtainedMarks +=
        item.obtainedMarks;

      acc.evaluated +=
        item.evaluated;

      acc.autoEvaluated +=
        item.autoEvaluated;

      acc.pending +=
        item.pending;

      acc.reviewRequired +=
        item.reviewRequired;

      acc.notAttempted +=
        item.notAttempted;

      return acc;
    },
    {
      questions: 0,
      maximumMarks: 0,
      obtainedMarks: 0,

      evaluated: 0,
      autoEvaluated: 0,
      pending: 0,
      reviewRequired: 0,
      notAttempted: 0,
    },
  );

  result.activeTypes =
    breakdown.length;

  result.percentage =
    result.maximumMarks > 0
      ? (result.obtainedMarks /
          result.maximumMarks) *
        100
      : 0;

  return result;
};

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

const QuestionTypeBreakdownSkeleton = ({
  title,
}) => {
  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>

        <div className="mt-2 h-3 w-48 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="space-y-3 p-4">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg bg-gray-100"
          />
        ))}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyQuestionTypeBreakdown = ({
  title,
}) => {
  return (
    <section className="rounded-xl border bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <ChartIcon />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-gray-800">
        No question type data
      </h2>

      <p className="mt-1 text-xs text-gray-400">
        There are no result details available
        to build {title.toLowerCase()}.
      </p>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatMarks = (marks) => {
  const number = Number(marks);

  if (Number.isNaN(number)) {
    return "0";
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);
};

const getPerformanceColor = (
  percentage,
) => {
  if (percentage >= 75) {
    return "text-green-600";
  }

  if (percentage >= 40) {
    return "text-blue-600";
  }

  return "text-red-600";
};

const getProgressColor = (
  percentage,
) => {
  if (percentage >= 75) {
    return "bg-green-500";
  }

  if (percentage >= 40) {
    return "bg-blue-500";
  }

  return "bg-red-500";
};

/* -------------------------------------------------------------------------- */
/* Type Configuration                                                         */
/* -------------------------------------------------------------------------- */

const TYPE_CONFIG = {
  MCQ: {
    label: "Multiple Choice",
    shortLabel: "MCQ",
    colorClass:
      "bg-blue-50 text-blue-700",
  },

  DESCRIPTIVE: {
    label: "Descriptive",
    shortLabel: "DS",
    colorClass:
      "bg-purple-50 text-purple-700",
  },

  ASSERTION_REASON: {
    label: "Assertion & Reason",
    shortLabel: "AR",
    colorClass:
      "bg-orange-50 text-orange-700",
  },

  CASE_STUDY: {
    label: "Case Study",
    shortLabel: "CS",
    colorClass:
      "bg-green-50 text-green-700",
  },

  FILL_BLANK: {
    label: "Fill in the Blank",
    shortLabel: "FB",
    colorClass:
      "bg-yellow-50 text-yellow-700",
  },

  MATCHING: {
    label: "Matching",
    shortLabel: "MT",
    colorClass:
      "bg-pink-50 text-pink-700",
  },

  TRUE_FALSE: {
    label: "True / False",
    shortLabel: "TF",
    colorClass:
      "bg-cyan-50 text-cyan-700",
  },

  DEFAULT: {
    label: "Other",
    shortLabel: "?",
    colorClass:
      "bg-gray-100 text-gray-600",
  },
};

/* -------------------------------------------------------------------------- */
/* Mini Statistic                                                             */
/* -------------------------------------------------------------------------- */

const MiniStatistic = ({
  label,
  value,
  color = "gray",
}) => {
  const colors = {
    gray: "text-gray-800",
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };

  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p
        className={[
          "mt-0.5 text-sm font-semibold",
          colors[color] ||
            colors.gray,
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Icon                                                                       */
/* -------------------------------------------------------------------------- */

const ChartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 19V5M4 19h16"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 15l3-4 3 2 5-7"
    />

    <circle
      cx="10"
      cy="11"
      r="1"
    />

    <circle
      cx="13"
      cy="13"
      r="1"
    />

    <circle
      cx="18"
      cy="6"
      r="1"
    />
  </svg>
);

const tableHeaderClass =
  "whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400";

export default QuestionTypeBreakdown;
