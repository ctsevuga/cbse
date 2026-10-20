// SubjectPerformanceSummary.jsx

import React, { useMemo } from "react";

const SubjectPerformanceSummary = ({
  subjects = [],
  resultDetails = [],

  // Optional: if the backend already provides
  // subject-level summaries, they can be passed here.
  subjectSummaries = [],

  onSubjectClick,

  showQuestions = true,
  showEvaluation = true,
}) => {
  const summaries = useMemo(() => {
    if (
      Array.isArray(subjectSummaries) &&
      subjectSummaries.length > 0
    ) {
      return subjectSummaries.map(
        normalizeSubjectSummary,
      );
    }

    return buildSubjectSummaries(
      subjects,
      resultDetails,
    );
  }, [
    subjects,
    resultDetails,
    subjectSummaries,
  ]);

  if (summaries.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-white">
      {/* Header */}
      <div className="border-b bg-gray-50 px-5 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Subject Performance
            </h2>

            <p className="text-xs text-gray-500">
              Compare performance across subjects.
            </p>
          </div>

          <span className="text-xs font-medium text-gray-500">
            {summaries.length}{" "}
            {summaries.length === 1
              ? "subject"
              : "subjects"}
          </span>
        </div>
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Subject
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Score
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Percentage
              </th>

              {showQuestions && (
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  Questions
                </th>
              )}

              {showEvaluation && (
                <th
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  Evaluation
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {summaries.map((summary) => (
              <SubjectPerformanceRow
                key={summary.subjectId}
                summary={summary}
                showQuestions={showQuestions}
                showEvaluation={showEvaluation}
                onClick={onSubjectClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-gray-100 md:hidden">
        {summaries.map((summary) => (
          <SubjectPerformanceCard
            key={summary.subjectId}
            summary={summary}
            showQuestions={showQuestions}
            showEvaluation={showEvaluation}
            onClick={onSubjectClick}
          />
        ))}
      </div>

      {/* Overall comparison */}
      <SubjectPerformanceFooter
        summaries={summaries}
      />
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Desktop Row                                                                */
/* -------------------------------------------------------------------------- */

const SubjectPerformanceRow = ({
  summary,
  showQuestions,
  showEvaluation,
  onClick,
}) => {
  const clickable =
    typeof onClick === "function";

  const handleClick = () => {
    onClick?.(summary.subject, summary);
  };

  return (
    <tr
      onClick={
        clickable ? handleClick : undefined
      }
      className={
        clickable
          ? "cursor-pointer transition-colors hover:bg-gray-50"
          : undefined
      }
    >
      {/* Subject */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <SubjectAvatar
            name={summary.subjectName}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {summary.subjectName}
            </p>

            {summary.subjectCode && (
              <p className="mt-0.5 text-xs text-gray-400">
                {summary.subjectCode}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Score */}
      <td className="px-4 py-4 text-right">
        <span className="text-sm font-semibold text-gray-900">
          {formatMarks(
            summary.obtainedMarks,
          )}
        </span>

        <span className="text-xs text-gray-400">
          {" "}
          / {formatMarks(
            summary.maximumMarks,
          )}
        </span>
      </td>

      {/* Percentage */}
      <td className="px-4 py-4 text-right">
        <PercentageDisplay
          percentage={summary.percentage}
        />
      </td>

      {/* Questions */}
      {showQuestions && (
        <td className="px-4 py-4 text-right">
          <p className="text-sm font-medium text-gray-800">
            {summary.attemptedQuestions}
            <span className="font-normal text-gray-400">
              {" "}
              / {summary.totalQuestions}
            </span>
          </p>

          <p className="mt-0.5 text-xs text-gray-400">
            attempted
          </p>
        </td>
      )}

      {/* Evaluation */}
      {showEvaluation && (
        <td className="px-5 py-4">
          <EvaluationProgress
            evaluated={
              summary.evaluatedQuestions
            }
            total={
              summary.totalQuestions
            }
            pending={
              summary.pendingQuestions
            }
          />
        </td>
      )}
    </tr>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile Card                                                                */
/* -------------------------------------------------------------------------- */

const SubjectPerformanceCard = ({
  summary,
  showQuestions,
  showEvaluation,
  onClick,
}) => {
  const clickable =
    typeof onClick === "function";

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() =>
        onClick?.(summary.subject, summary)
      }
      className={[
        "block w-full p-4 text-left",
        clickable
          ? "transition-colors hover:bg-gray-50"
          : "cursor-default",
      ].join(" ")}
    >
      {/* Subject */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <SubjectAvatar
            name={summary.subjectName}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {summary.subjectName}
            </p>

            {summary.subjectCode && (
              <p className="mt-0.5 text-xs text-gray-400">
                {summary.subjectCode}
              </p>
            )}
          </div>
        </div>

        <PercentageDisplay
          percentage={summary.percentage}
        />
      </div>

      {/* Score */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Score
          </p>

          <p className="mt-1 text-base font-semibold text-gray-900">
            {formatMarks(
              summary.obtainedMarks,
            )}
            <span className="text-sm font-normal text-gray-400">
              {" "}
              / {formatMarks(
                summary.maximumMarks,
              )}
            </span>
          </p>
        </div>

        {showQuestions && (
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Questions
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {summary.attemptedQuestions}
              <span className="text-gray-400">
                {" "}
                / {summary.totalQuestions}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Evaluation */}
      {showEvaluation && (
        <div className="mt-4">
          <EvaluationProgress
            evaluated={
              summary.evaluatedQuestions
            }
            total={
              summary.totalQuestions
            }
            pending={
              summary.pendingQuestions
            }
          />
        </div>
      )}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* Percentage                                                                 */
/* -------------------------------------------------------------------------- */

const PercentageDisplay = ({
  percentage,
}) => {
  const color =
    percentage === null
      ? "text-gray-400"
      : percentage >= 75
        ? "text-green-600"
        : percentage >= 40
          ? "text-blue-600"
          : "text-red-600";

  return (
    <span
      className={`text-sm font-semibold ${color}`}
    >
      {percentage !== null
        ? `${percentage.toFixed(2)}%`
        : "—"}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Evaluation Progress                                                        */
/* -------------------------------------------------------------------------- */

const EvaluationProgress = ({
  evaluated,
  total,
  pending,
}) => {
  const percentage =
    total > 0
      ? (evaluated / total) * 100
      : 0;

  return (
    <div className="min-w-[150px]">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">
          {evaluated}/{total} evaluated
        </span>

        {pending > 0 && (
          <span className="text-xs font-medium text-yellow-600">
            {pending} pending
          </span>
        )}
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={[
            "h-full rounded-full transition-all",
            pending > 0
              ? "bg-yellow-500"
              : "bg-green-500",
          ].join(" ")}
          style={{
            width: `${Math.min(
              Math.max(percentage, 0),
              100,
            )}%`,
          }}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

const SubjectPerformanceFooter = ({
  summaries,
}) => {
  const overall = calculateOverall(
    summaries,
  );

  if (summaries.length <= 1) {
    return null;
  }

  return (
    <div className="border-t bg-gray-50 px-5 py-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FooterMetric
          label="Subjects"
          value={summaries.length}
        />

        <FooterMetric
          label="Overall Score"
          value={`${formatMarks(
            overall.obtainedMarks,
          )} / ${formatMarks(
            overall.maximumMarks,
          )}`}
        />

        <FooterMetric
          label="Average"
          value={
            overall.percentage !== null
              ? `${overall.percentage.toFixed(
                  2,
                )}%`
              : "—"
          }
        />

        <FooterMetric
          label="Evaluation"
          value={`${overall.evaluatedQuestions}/${overall.totalQuestions}`}
        />
      </div>
    </div>
  );
};

const FooterMetric = ({
  label,
  value,
}) => {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Subject Avatar                                                             */
/* -------------------------------------------------------------------------- */

const SubjectAvatar = ({
  name,
}) => {
  const initials = getInitials(name);

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-semibold text-blue-700">
      {initials || "S"}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Build Subject Summaries                                                    */
/* -------------------------------------------------------------------------- */

const buildSubjectSummaries = (
  subjects,
  resultDetails,
) => {
  const details = Array.isArray(
    resultDetails,
  )
    ? resultDetails
    : [];

  const subjectMap = new Map();

  /*
   * Start with supplied subjects so that a subject
   * with zero details can still be displayed.
   */
  if (Array.isArray(subjects)) {
    subjects.forEach((subject) => {
      const subjectId =
        getEntityId(subject);

      if (!subjectId) {
        return;
      }

      subjectMap.set(
        String(subjectId),
        createEmptySummary(subject),
      );
    });
  }

  /*
   * Add / aggregate ResultDetail records.
   */
  details.forEach((detail) => {
    const subject =
      detail?.subject;

    const subjectId =
      getEntityId(subject);

    if (!subjectId) {
      return;
    }

    const key = String(subjectId);

    if (!subjectMap.has(key)) {
      subjectMap.set(
        key,
        createEmptySummary(subject),
      );
    }

    const summary =
      subjectMap.get(key);

    summary.totalQuestions += 1;

    summary.maximumMarks += Number(
      detail.maximumMarks || 0,
    );

    summary.obtainedMarks += Number(
      detail.obtainedMarks || 0,
    );

    if (
      detail.evaluationStatus !==
      "NOT_ATTEMPTED"
    ) {
      summary.attemptedQuestions += 1;
    }

    if (
      [
        "AUTO_EVALUATED",
        "EVALUATED",
      ].includes(
        detail.evaluationStatus,
      )
    ) {
      summary.evaluatedQuestions += 1;
    }

    if (
      [
        "PENDING",
        "REVIEW_REQUIRED",
      ].includes(
        detail.evaluationStatus,
      )
    ) {
      summary.pendingQuestions += 1;
    }
  });

  return Array.from(
    subjectMap.values(),
  ).map((summary) => ({
    ...summary,
    percentage:
      summary.maximumMarks > 0
        ? (summary.obtainedMarks /
            summary.maximumMarks) *
          100
        : null,
  }));
};

/* -------------------------------------------------------------------------- */
/* Empty Summary                                                              */
/* -------------------------------------------------------------------------- */

const createEmptySummary = (
  subject,
) => {
  return {
    subject:
      typeof subject === "object"
        ? subject
        : null,

    subjectId:
      getEntityId(subject),

    subjectName:
      getSubjectName(subject),

    subjectCode:
      typeof subject === "object"
        ? subject.code ||
          subject.subjectCode ||
          ""
        : "",

    totalQuestions: 0,
    attemptedQuestions: 0,
    evaluatedQuestions: 0,
    pendingQuestions: 0,

    maximumMarks: 0,
    obtainedMarks: 0,
    percentage: null,
  };
};

/* -------------------------------------------------------------------------- */
/* Normalize Backend Summary                                                  */
/* -------------------------------------------------------------------------- */

const normalizeSubjectSummary = (
  summary,
) => {
  const maximumMarks = Number(
    summary.maximumMarks ??
      summary.totalMaximumMarks ??
      summary.maxMarks ??
      0,
  );

  const obtainedMarks = Number(
    summary.obtainedMarks ??
      summary.totalObtainedMarks ??
      summary.marksObtained ??
      0,
  );

  const percentage =
    summary.percentage !== undefined &&
    summary.percentage !== null
      ? Number(summary.percentage)
      : maximumMarks > 0
        ? (obtainedMarks /
            maximumMarks) *
          100
        : null;

  return {
    ...summary,

    subjectId:
      summary.subjectId ||
      getEntityId(summary.subject),

    subjectName:
      summary.subjectName ||
      getSubjectName(summary.subject),

    subjectCode:
      summary.subjectCode || "",

    totalQuestions:
      Number(
        summary.totalQuestions ||
          0,
      ),

    attemptedQuestions:
      Number(
        summary.attemptedQuestions ||
          0,
      ),

    evaluatedQuestions:
      Number(
        summary.evaluatedQuestions ||
          0,
      ),

    pendingQuestions:
      Number(
        summary.pendingQuestions ||
          0,
      ),

    maximumMarks,
    obtainedMarks,
    percentage,
  };
};

/* -------------------------------------------------------------------------- */
/* Overall Calculation                                                        */
/* -------------------------------------------------------------------------- */

const calculateOverall = (
  summaries,
) => {
  const maximumMarks =
    summaries.reduce(
      (total, summary) =>
        total +
        Number(
          summary.maximumMarks || 0,
        ),
      0,
    );

  const obtainedMarks =
    summaries.reduce(
      (total, summary) =>
        total +
        Number(
          summary.obtainedMarks || 0,
        ),
      0,
    );

  const totalQuestions =
    summaries.reduce(
      (total, summary) =>
        total +
        Number(
          summary.totalQuestions || 0,
        ),
      0,
    );

  const evaluatedQuestions =
    summaries.reduce(
      (total, summary) =>
        total +
        Number(
          summary.evaluatedQuestions ||
            0,
        ),
      0,
    );

  return {
    maximumMarks,
    obtainedMarks,
    totalQuestions,
    evaluatedQuestions,
    percentage:
      maximumMarks > 0
        ? (obtainedMarks /
            maximumMarks) *
          100
        : null,
  };
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getEntityId = (value) => {
  if (!value) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return value;
  }

  return (
    value._id ||
    value.id ||
    null
  );
};

const getSubjectName = (
  subject,
) => {
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

export default SubjectPerformanceSummary;
