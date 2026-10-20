// ResultScoreSummary.jsx

import React from "react";

const ResultScoreSummary = ({
  result,

  // Optional values when summary is calculated
  // from ResultDetail records instead of Result.
  resultDetails = [],

  showQuestionStats = true,
  showEvaluationStats = true,
}) => {
  const summary = buildScoreSummary(
    result,
    resultDetails,
  );

  return (
    <div className="space-y-4">
      {/* Score Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          label="Obtained Marks"
          value={formatMarks(
            summary.obtainedMarks,
          )}
          description={
            summary.maximumMarks !== null
              ? `out of ${formatMarks(
                  summary.maximumMarks,
                )}`
              : undefined
          }
          variant="primary"
        />

        <ScoreCard
          label="Maximum Marks"
          value={formatMarks(
            summary.maximumMarks,
          )}
          description="Total possible marks"
          variant="default"
        />

        <ScoreCard
          label="Percentage"
          value={
            summary.percentage !== null
              ? `${summary.percentage.toFixed(2)}%`
              : "—"
          }
          description={getPercentageDescription(
            summary.percentage,
          )}
          variant={getPercentageVariant(
            summary.percentage,
          )}
        />

        <ScoreCard
          label="Questions"
          value={summary.totalQuestions}
          description={
            showEvaluationStats
              ? `${summary.evaluatedQuestions} evaluated`
              : "Total questions"
          }
          variant="default"
        />
      </div>

      {/* Progress */}
      {summary.percentage !== null && (
        <ScoreProgress
          percentage={summary.percentage}
        />
      )}

      {/* Question / Evaluation Statistics */}
      {(showQuestionStats ||
        showEvaluationStats) && (
        <QuestionStatistics
          summary={summary}
          showQuestionStats={
            showQuestionStats
          }
          showEvaluationStats={
            showEvaluationStats
          }
        />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Score Card                                                                 */
/* -------------------------------------------------------------------------- */

const ScoreCard = ({
  label,
  value,
  description,
  variant = "default",
}) => {
  const variantClasses = {
    default: {
      container:
        "border-gray-200 bg-white",
      value: "text-gray-900",
    },

    primary: {
      container:
        "border-blue-200 bg-blue-50/50",
      value: "text-blue-700",
    },

    success: {
      container:
        "border-green-200 bg-green-50/50",
      value: "text-green-700",
    },

    warning: {
      container:
        "border-yellow-200 bg-yellow-50/50",
      value: "text-yellow-700",
    },

    danger: {
      container:
        "border-red-200 bg-red-50/50",
      value: "text-red-700",
    },
  };

  const styles =
    variantClasses[variant] ||
    variantClasses.default;

  return (
    <div
      className={[
        "rounded-lg border p-5",
        styles.container,
      ].join(" ")}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className={[
          "mt-2 text-2xl font-bold",
          styles.value,
        ].join(" ")}
      >
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

const ScoreProgress = ({
  percentage,
}) => {
  const normalizedPercentage = Math.min(
    Math.max(Number(percentage) || 0, 0),
    100,
  );

  const progressColor =
    normalizedPercentage >= 75
      ? "bg-green-500"
      : normalizedPercentage >= 40
        ? "bg-blue-500"
        : "bg-red-500";

  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Overall Score
        </span>

        <span className="text-sm font-semibold text-gray-900">
          {normalizedPercentage.toFixed(2)}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={[
            "h-full rounded-full transition-all duration-500",
            progressColor,
          ].join(" ")}
          style={{
            width: `${normalizedPercentage}%`,
          }}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Statistics                                                        */
/* -------------------------------------------------------------------------- */

const QuestionStatistics = ({
  summary,
  showQuestionStats,
  showEvaluationStats,
}) => {
  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b bg-gray-50 px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Question Statistics
        </h3>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
        {showQuestionStats && (
          <>
            <StatisticItem
              label="Total"
              value={summary.totalQuestions}
            />

            <StatisticItem
              label="Attempted"
              value={summary.attemptedQuestions}
            />
          </>
        )}

        {showEvaluationStats && (
          <>
            <StatisticItem
              label="Evaluated"
              value={summary.evaluatedQuestions}
            />

            <StatisticItem
              label="Pending"
              value={summary.pendingQuestions}
              variant={
                summary.pendingQuestions > 0
                  ? "warning"
                  : "default"
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

const StatisticItem = ({
  label,
  value,
  variant = "default",
}) => {
  const valueClasses = {
    default: "text-gray-900",
    warning: "text-yellow-600",
    danger: "text-red-600",
    success: "text-green-600",
  };

  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-lg font-semibold",
          valueClasses[variant] ||
            valueClasses.default,
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Summary Calculation                                                        */
/* -------------------------------------------------------------------------- */

const buildScoreSummary = (
  result,
  resultDetails,
) => {
  const details = Array.isArray(resultDetails)
    ? resultDetails
    : [];

  /*
   * Prefer values already calculated/stored on
   * Result. Fall back to ResultDetail aggregation.
   */

  const detailMaximumMarks =
    details.length > 0
      ? details.reduce(
          (total, detail) =>
            total +
            Number(
              detail.maximumMarks || 0,
            ),
          0,
        )
      : null;

  const detailObtainedMarks =
    details.length > 0
      ? details.reduce(
          (total, detail) =>
            total +
            Number(
              detail.obtainedMarks || 0,
            ),
          0,
        )
      : null;

  const maximumMarks = getNumber(
    result?.maximumMarks ??
      result?.totalMaximumMarks ??
      result?.maxMarks ??
      detailMaximumMarks,
  );

  const obtainedMarks = getNumber(
    result?.obtainedMarks ??
      result?.totalObtainedMarks ??
      result?.marksObtained ??
      detailObtainedMarks,
  );

  const percentage = getNumber(
    result?.percentage ??
      calculatePercentage(
        obtainedMarks,
        maximumMarks,
      ),
  );

  const totalQuestions =
    result?.totalQuestions ??
    result?.questionCount ??
    result?.numberOfQuestions ??
    details.length;

  const attemptedQuestions =
    result?.attemptedQuestions ??
    result?.attemptedQuestionCount ??
    details.filter(
      (detail) =>
        detail.evaluationStatus !==
        "NOT_ATTEMPTED",
    ).length;

  const evaluatedQuestions =
    result?.evaluatedQuestions ??
    result?.evaluatedQuestionCount ??
    details.filter((detail) =>
      [
        "AUTO_EVALUATED",
        "EVALUATED",
      ].includes(
        detail.evaluationStatus,
      ),
    ).length;

  const pendingQuestions =
    result?.pendingQuestions ??
    result?.pendingQuestionCount ??
    details.filter((detail) =>
      [
        "PENDING",
        "REVIEW_REQUIRED",
      ].includes(
        detail.evaluationStatus,
      ),
    ).length;

  return {
    obtainedMarks,
    maximumMarks,
    percentage,
    totalQuestions:
      Number(totalQuestions) || 0,
    attemptedQuestions:
      Number(attemptedQuestions) || 0,
    evaluatedQuestions:
      Number(evaluatedQuestions) || 0,
    pendingQuestions:
      Number(pendingQuestions) || 0,
  };
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? null
    : number;
};

const calculatePercentage = (
  obtainedMarks,
  maximumMarks,
) => {
  if (
    obtainedMarks === null ||
    maximumMarks === null ||
    maximumMarks <= 0
  ) {
    return null;
  }

  return (
    (obtainedMarks / maximumMarks) *
    100
  );
};

const formatMarks = (marks) => {
  if (
    marks === null ||
    marks === undefined
  ) {
    return "—";
  }

  const number = Number(marks);

  if (Number.isNaN(number)) {
    return "—";
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);
};

const getPercentageVariant = (
  percentage,
) => {
  if (percentage === null) {
    return "default";
  }

  if (percentage >= 75) {
    return "success";
  }

  if (percentage >= 40) {
    return "primary";
  }

  return "danger";
};

const getPercentageDescription = (
  percentage,
) => {
  if (percentage === null) {
    return "Score unavailable";
  }

  if (percentage >= 75) {
    return "Excellent performance";
  }

  if (percentage >= 60) {
    return "Good performance";
  }

  if (percentage >= 40) {
    return "Satisfactory performance";
  }

  return "Needs improvement";
};

export default ResultScoreSummary;
