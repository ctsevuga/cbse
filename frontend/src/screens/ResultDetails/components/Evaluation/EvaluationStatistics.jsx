import React, { useMemo } from "react";

const EvaluationStatistics = ({
  resultDetails = [],

  total,
  pending,
  evaluated,
  reviewRequired,
  autoEvaluated,
  notAttempted,

  maximumMarks,
  obtainedMarks,

  title = "Evaluation Statistics",

  showMarks = true,
  showNotAttempted = true,
  showAutoEvaluated = true,

  loading = false,

  className = "",
}) => {
  const statistics = useMemo(() => {
    /*
     * If explicit statistics are supplied by the parent,
     * use them. Otherwise calculate them from ResultDetail
     * records.
     */
    if (
      total !== undefined ||
      pending !== undefined ||
      evaluated !== undefined ||
      reviewRequired !== undefined
    ) {
      return {
        total: Number(total) || 0,
        pending: Number(pending) || 0,
        evaluated: Number(evaluated) || 0,
        reviewRequired:
          Number(reviewRequired) || 0,
        autoEvaluated:
          Number(autoEvaluated) || 0,
        notAttempted:
          Number(notAttempted) || 0,
        maximumMarks:
          Number(maximumMarks) || 0,
        obtainedMarks:
          Number(obtainedMarks) || 0,
      };
    }

    return calculateStatistics(
      resultDetails,
    );
  }, [
    resultDetails,
    total,
    pending,
    evaluated,
    reviewRequired,
    autoEvaluated,
    notAttempted,
    maximumMarks,
    obtainedMarks,
  ]);

  if (loading) {
    return (
      <EvaluationStatisticsSkeleton
        title={title}
      />
    );
  }

  return (
    <section
      className={[
        "w-full rounded-xl border bg-white shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header */}
      <StatisticsHeader
        title={title}
        statistics={statistics}
      />

      {/* Cards */}
      <div className="grid grid-cols-2 gap-px border-t bg-gray-200 sm:grid-cols-3 lg:grid-cols-4">
        <StatisticsCard
          label="Total"
          value={statistics.total}
          icon={<TotalIcon />}
          color="blue"
        />

        <StatisticsCard
          label="Pending"
          value={statistics.pending}
          icon={<PendingIcon />}
          color="yellow"
          emphasis={
            statistics.pending > 0
          }
        />

        <StatisticsCard
          label="Evaluated"
          value={statistics.evaluated}
          icon={<EvaluatedIcon />}
          color="green"
        />

        <StatisticsCard
          label="Review Required"
          value={
            statistics.reviewRequired
          }
          icon={<ReviewIcon />}
          color="orange"
          emphasis={
            statistics.reviewRequired >
            0
          }
        />

        {showAutoEvaluated && (
          <StatisticsCard
            label="Auto Evaluated"
            value={
              statistics.autoEvaluated
            }
            icon={<AutoEvaluatedIcon />}
            color="purple"
          />
        )}

        {showNotAttempted && (
          <StatisticsCard
            label="Not Attempted"
            value={
              statistics.notAttempted
            }
            icon={<NotAttemptedIcon />}
            color="gray"
          />
        )}

        {showMarks && (
          <StatisticsCard
            label="Marks Awarded"
            value={`${formatMarks(
              statistics.obtainedMarks,
            )} / ${formatMarks(
              statistics.maximumMarks,
            )}`}
            icon={<MarksIcon />}
            color="indigo"
          />
        )}

        {showMarks && (
          <StatisticsCard
            label="Score"
            value={`${calculatePercentage(
              statistics.obtainedMarks,
              statistics.maximumMarks,
            ).toFixed(1)}%`}
            icon={<PercentageIcon />}
            color="teal"
          />
        )}
      </div>

      {/* Progress */}
      <EvaluationProgress
        total={statistics.total}
        evaluated={
          statistics.evaluated
        }
        autoEvaluated={
          statistics.autoEvaluated
        }
        notAttempted={
          statistics.notAttempted
        }
        pending={
          statistics.pending
        }
        reviewRequired={
          statistics.reviewRequired
        }
      />
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

const StatisticsHeader = ({
  title,
  statistics,
}) => {
  const completionPercentage =
    calculateCompletionPercentage(
      statistics,
    );

  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-gray-500">
          Overview of question evaluation
          progress.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>

        <span className="text-xs font-medium text-gray-600">
          {completionPercentage.toFixed(
            0,
          )}
          % complete
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Statistics Card                                                            */
/* -------------------------------------------------------------------------- */

const StatisticsCard = ({
  label,
  value,
  icon,
  color = "blue",
  emphasis = false,
}) => {
  const colors =
    STATISTICS_COLORS[color] ||
    STATISTICS_COLORS.blue;

  return (
    <div
      className={[
        "min-w-0 bg-white px-4 py-4 sm:px-5",
        emphasis
          ? "ring-1 ring-inset ring-yellow-100"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            {label}
          </p>

          <p
            className={[
              "mt-1.5 truncate text-xl font-semibold",
              colors.value,
            ].join(" ")}
          >
            {value}
          </p>
        </div>

        <div
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            colors.iconBackground,
            colors.icon,
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

const EvaluationProgress = ({
  total,
  evaluated,
  autoEvaluated,
  notAttempted,
  pending,
  reviewRequired,
}) => {
  if (total <= 0) {
    return (
      <div className="border-t px-5 py-4">
        <p className="text-xs text-gray-400">
          No evaluation records available.
        </p>
      </div>
    );
  }

  const evaluatedPercentage =
    percentageOf(
      evaluated,
      total,
    );

  const autoEvaluatedPercentage =
    percentageOf(
      autoEvaluated,
      total,
    );

  const pendingPercentage =
    percentageOf(
      pending,
      total,
    );

  const reviewPercentage =
    percentageOf(
      reviewRequired,
      total,
    );

  const notAttemptedPercentage =
    percentageOf(
      notAttempted,
      total,
    );

  return (
    <div className="border-t px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-gray-600">
          Evaluation Progress
        </p>

        <p className="text-xs text-gray-400">
          {evaluated +
            autoEvaluated}{" "}
          of {total} processed
        </p>
      </div>

      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        {evaluatedPercentage > 0 && (
          <ProgressSegment
            percentage={
              evaluatedPercentage
            }
            color="bg-green-500"
          />
        )}

        {autoEvaluatedPercentage >
          0 && (
          <ProgressSegment
            percentage={
              autoEvaluatedPercentage
            }
            color="bg-blue-500"
          />
        )}

        {pendingPercentage > 0 && (
          <ProgressSegment
            percentage={
              pendingPercentage
            }
            color="bg-yellow-400"
          />
        )}

        {reviewPercentage > 0 && (
          <ProgressSegment
            percentage={
              reviewPercentage
            }
            color="bg-orange-500"
          />
        )}

        {notAttemptedPercentage >
          0 && (
          <ProgressSegment
            percentage={
              notAttemptedPercentage
            }
            color="bg-gray-300"
          />
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        <LegendItem
          color="bg-green-500"
          label="Evaluated"
          value={evaluated}
        />

        <LegendItem
          color="bg-blue-500"
          label="Auto"
          value={autoEvaluated}
        />

        <LegendItem
          color="bg-yellow-400"
          label="Pending"
          value={pending}
        />

        <LegendItem
          color="bg-orange-500"
          label="Review"
          value={reviewRequired}
        />

        <LegendItem
          color="bg-gray-300"
          label="Not Attempted"
          value={notAttempted}
        />
      </div>
    </div>
  );
};

const ProgressSegment = ({
  percentage,
  color,
}) => {
  return (
    <div
      className={[
        "h-full transition-all",
        color,
      ].join(" ")}
      style={{
        width: `${percentage}%`,
      }}
    />
  );
};

const LegendItem = ({
  color,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={[
          "h-2 w-2 rounded-full",
          color,
        ].join(" ")}
      />

      <span className="text-[11px] text-gray-500">
        {label}
      </span>

      <span className="text-[11px] font-semibold text-gray-700">
        {value}
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

const EvaluationStatisticsSkeleton = ({
  title,
}) => {
  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {title}
          </h2>

          <div className="mt-2 h-3 w-48 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="h-2 w-24 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-px border-t bg-gray-200 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="bg-white px-4 py-5"
          >
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />

            <div className="mt-3 h-6 w-12 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="border-t px-5 py-4">
        <div className="h-2.5 w-full animate-pulse rounded-full bg-gray-200" />
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

const TotalIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 5h16M4 9h16M4 13h10M4 17h7"
    />
  </svg>
);

const PendingIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <circle
      cx="12"
      cy="12"
      r="8.5"
    />

    <path
      strokeLinecap="round"
      d="M12 7v5l3 2"
    />
  </svg>
);

const EvaluatedIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m5 12 4 4L19 6"
    />
  </svg>
);

const ReviewIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3 2.8 19h18.4L12 3Z"
    />

    <path
      strokeLinecap="round"
      d="M12 9v4"
    />

    <path
      strokeLinecap="round"
      d="M12 16h.01"
    />
  </svg>
);

const AutoEvaluatedIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <rect
      x="4"
      y="5"
      width="16"
      height="14"
      rx="2"
    />

    <path
      strokeLinecap="round"
      d="M8 9h8M8 13h5"
    />
  </svg>
);

const NotAttemptedIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <circle
      cx="12"
      cy="12"
      r="8.5"
    />

    <path
      strokeLinecap="round"
      d="m9 9 6 6m0-6-6 6"
    />
  </svg>
);

const MarksIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 5h14v14H5z"
    />

    <path
      strokeLinecap="round"
      d="M8 15h8M8 11h5M8 8h2"
    />
  </svg>
);

const PercentageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <circle
      cx="7"
      cy="7"
      r="2"
    />

    <circle
      cx="17"
      cy="17"
      r="2"
    />

    <path
      strokeLinecap="round"
      d="m19 5-14 14"
    />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Colors                                                                     */
/* -------------------------------------------------------------------------- */

const STATISTICS_COLORS = {
  blue: {
    value: "text-blue-600",
    iconBackground: "bg-blue-50",
    icon: "text-blue-600",
  },

  yellow: {
    value: "text-yellow-600",
    iconBackground: "bg-yellow-50",
    icon: "text-yellow-600",
  },

  green: {
    value: "text-green-600",
    iconBackground: "bg-green-50",
    icon: "text-green-600",
  },

  orange: {
    value: "text-orange-600",
    iconBackground: "bg-orange-50",
    icon: "text-orange-600",
  },

  purple: {
    value: "text-purple-600",
    iconBackground: "bg-purple-50",
    icon: "text-purple-600",
  },

  gray: {
    value: "text-gray-600",
    iconBackground: "bg-gray-100",
    icon: "text-gray-500",
  },

  indigo: {
    value: "text-indigo-600",
    iconBackground: "bg-indigo-50",
    icon: "text-indigo-600",
  },

  teal: {
    value: "text-teal-600",
    iconBackground: "bg-teal-50",
    icon: "text-teal-600",
  },
};

/* -------------------------------------------------------------------------- */
/* Statistics Calculation                                                     */
/* -------------------------------------------------------------------------- */

const calculateStatistics = (
  resultDetails,
) => {
  const records = Array.isArray(
    resultDetails,
  )
    ? resultDetails
    : [];

  return records.reduce(
    (stats, item) => {
      const status =
        item?.evaluationStatus;

      stats.total += 1;

      switch (status) {
        case "PENDING":
          stats.pending += 1;
          break;

        case "EVALUATED":
          stats.evaluated += 1;
          break;

        case "REVIEW_REQUIRED":
          stats.reviewRequired += 1;
          break;

        case "AUTO_EVALUATED":
          stats.autoEvaluated += 1;
          break;

        case "NOT_ATTEMPTED":
          stats.notAttempted += 1;
          break;

        default:
          break;
      }

      stats.maximumMarks +=
        Number(
          item?.maximumMarks,
        ) || 0;

      stats.obtainedMarks +=
        Number(
          item?.obtainedMarks,
        ) || 0;

      return stats;
    },
    {
      total: 0,
      pending: 0,
      evaluated: 0,
      reviewRequired: 0,
      autoEvaluated: 0,
      notAttempted: 0,
      maximumMarks: 0,
      obtainedMarks: 0,
    },
  );
};

const calculateCompletionPercentage = (
  statistics,
) => {
  if (statistics.total <= 0) {
    return 0;
  }

  const completed =
    statistics.evaluated +
    statistics.autoEvaluated;

  return Math.min(
    100,
    (completed /
      statistics.total) *
      100,
  );
};

const calculatePercentage = (
  obtained,
  maximum,
) => {
  if (
    Number(maximum) <= 0
  ) {
    return 0;
  }

  return (
    (Number(obtained) /
      Number(maximum)) *
    100
  );
};

const percentageOf = (
  value,
  total,
) => {
  if (total <= 0) {
    return 0;
  }

  return Math.min(
    100,
    (Number(value) /
      Number(total)) *
      100,
  );
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

export default EvaluationStatistics;
