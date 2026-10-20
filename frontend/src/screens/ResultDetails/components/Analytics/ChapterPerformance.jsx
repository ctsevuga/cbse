import React, { useMemo } from "react";

const ChapterPerformance = ({
  resultDetails = [],

  subject,

  title = "Chapter Performance",

  loading = false,

  showSubject = false,
  showEvaluationStatus = true,
  showProgress = true,

  onChapterClick,

  className = "",
}) => {
  const records = useMemo(() => {
    const items = Array.isArray(resultDetails)
      ? resultDetails
      : [];

    if (!subject) {
      return items;
    }

    const subjectId = getId(subject);

    return items.filter(
      (item) =>
        getId(item?.subject) === subjectId,
    );
  }, [resultDetails, subject]);

  const chapters = useMemo(
    () => buildChapterPerformance(records),
    [records],
  );

  const overall = useMemo(
    () => calculateOverall(chapters),
    [chapters],
  );

  if (loading) {
    return (
      <ChapterPerformanceSkeleton
        title={title}
      />
    );
  }

  if (!chapters.length) {
    return (
      <EmptyChapterPerformance
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
      <ChapterPerformanceHeader
        title={title}
        overall={overall}
        subject={subject}
      />

      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={tableHeaderClass}>
                Chapter
              </th>

              {showSubject && (
                <th className={tableHeaderClass}>
                  Subject
                </th>
              )}

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
            {chapters.map((chapter) => (
              <ChapterPerformanceRow
                key={chapter.key}
                chapter={chapter}
                showSubject={showSubject}
                showEvaluationStatus={
                  showEvaluationStatus
                }
                showProgress={showProgress}
                onClick={onChapterClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-gray-100 md:hidden">
        {chapters.map((chapter) => (
          <ChapterPerformanceCard
            key={chapter.key}
            chapter={chapter}
            showSubject={showSubject}
            showEvaluationStatus={
              showEvaluationStatus
            }
            showProgress={showProgress}
            onClick={onChapterClick}
          />
        ))}
      </div>

      <ChapterPerformanceFooter
        overall={overall}
      />
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

const ChapterPerformanceHeader = ({
  title,
  overall,
  subject,
}) => {
  return (
    <div className="border-b px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
            Chapter Analysis
          </p>

          <h2 className="mt-1 text-base font-semibold text-gray-900">
            {title}
          </h2>

          {subject && (
            <p className="mt-1 text-xs text-gray-500">
              Subject:{" "}
              <span className="font-medium text-gray-700">
                {getDisplayName(subject)}
              </span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStatistic
            label="Chapters"
            value={overall.chapters}
          />

          <MiniStatistic
            label="Questions"
            value={overall.questions}
          />

          <MiniStatistic
            label="Average"
            value={`${overall.percentage.toFixed(
              1,
            )}%`}
            color={getPerformanceColor(
              overall.percentage,
            )}
          />

          <MiniStatistic
            label="Evaluated"
            value={`${overall.evaluated}/${overall.questions}`}
            color="green"
          />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Desktop Row                                                                */
/* -------------------------------------------------------------------------- */

const ChapterPerformanceRow = ({
  chapter,

  showSubject,
  showEvaluationStatus,
  showProgress,

  onClick,
}) => {
  const clickable =
    typeof onClick === "function";

  return (
    <tr
      onClick={
        clickable
          ? () =>
              onClick(
                chapter.chapter,
                chapter,
              )
          : undefined
      }
      className={[
        "transition",
        clickable
          ? "cursor-pointer hover:bg-gray-50"
          : "",
      ].join(" ")}
    >
      <td className="min-w-[220px] px-4 py-4">
        <ChapterCell
          chapter={chapter}
        />
      </td>

      {showSubject && (
        <td className={tableCellClass}>
          {chapter.subjectName || "—"}
        </td>
      )}

      <td className="whitespace-nowrap px-4 py-4 text-center">
        <span className="text-sm font-semibold text-gray-800">
          {chapter.questions}
        </span>
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-600">
        {formatMarks(
          chapter.maximumMarks,
        )}
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-center">
        <span
          className={[
            "text-sm font-semibold",
            getPerformanceColor(
              chapter.percentage,
            ),
          ].join(" ")}
        >
          {formatMarks(
            chapter.obtainedMarks,
          )}
        </span>
      </td>

      <td className="min-w-[200px] px-4 py-4">
        <PerformanceCell
          chapter={chapter}
          showProgress={showProgress}
        />
      </td>

      {showEvaluationStatus && (
        <td className="min-w-[220px] px-4 py-4">
          <EvaluationDistribution
            chapter={chapter}
          />
        </td>
      )}
    </tr>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile Card                                                                */
/* -------------------------------------------------------------------------- */

const ChapterPerformanceCard = ({
  chapter,

  showSubject,
  showEvaluationStatus,
  showProgress,

  onClick,
}) => {
  const clickable =
    typeof onClick === "function";

  return (
    <article
      onClick={
        clickable
          ? () =>
              onClick(
                chapter.chapter,
                chapter,
              )
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
        <ChapterCell
          chapter={chapter}
        />

        <div className="text-right">
          <p
            className={[
              "text-base font-semibold",
              getPerformanceColor(
                chapter.percentage,
              ),
            ].join(" ")}
          >
            {chapter.percentage.toFixed(1)}%
          </p>

          <p className="mt-0.5 text-[10px] text-gray-400">
            performance
          </p>
        </div>
      </div>

      {showSubject &&
        chapter.subjectName && (
          <p className="mt-2 text-xs text-gray-500">
            {chapter.subjectName}
          </p>
        )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MetricBox
          label="Questions"
          value={chapter.questions}
        />

        <MetricBox
          label="Maximum"
          value={formatMarks(
            chapter.maximumMarks,
          )}
        />

        <MetricBox
          label="Obtained"
          value={formatMarks(
            chapter.obtainedMarks,
          )}
        />
      </div>

      {showProgress && (
        <div className="mt-4">
          <PerformanceBar
            percentage={
              chapter.percentage
            }
          />
        </div>
      )}

      {showEvaluationStatus && (
        <div className="mt-4 border-t pt-3">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-wide text-gray-400">
            Evaluation Status
          </p>

          <EvaluationDistribution
            chapter={chapter}
          />
        </div>
      )}
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/* Chapter Cell                                                               */
/* -------------------------------------------------------------------------- */

const ChapterCell = ({
  chapter,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">
        {chapter.index + 1}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-800">
          {chapter.chapterName}
        </p>

        <p className="mt-0.5 text-[10px] text-gray-400">
          {chapter.questions}{" "}
          {chapter.questions === 1
            ? "question"
            : "questions"}
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Performance                                                                */
/* -------------------------------------------------------------------------- */

const PerformanceCell = ({
  chapter,
  showProgress,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span
          className={[
            "text-sm font-semibold",
            getPerformanceColor(
              chapter.percentage,
            ),
          ].join(" ")}
        >
          {chapter.percentage.toFixed(1)}%
        </span>

        <span className="text-[10px] text-gray-400">
          {formatMarks(
            chapter.obtainedMarks,
          )}
          /
          {formatMarks(
            chapter.maximumMarks,
          )}
        </span>
      </div>

      {showProgress && (
        <div className="mt-2">
          <PerformanceBar
            percentage={
              chapter.percentage
            }
          />
        </div>
      )}
    </div>
  );
};

const PerformanceBar = ({
  percentage,
}) => {
  const safePercentage = Math.max(
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
  chapter,
}) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {chapter.evaluated > 0 && (
        <StatusCount
          label="Evaluated"
          count={chapter.evaluated}
          color="green"
        />
      )}

      {chapter.autoEvaluated > 0 && (
        <StatusCount
          label="Auto"
          count={chapter.autoEvaluated}
          color="blue"
        />
      )}

      {chapter.pending > 0 && (
        <StatusCount
          label="Pending"
          count={chapter.pending}
          color="yellow"
        />
      )}

      {chapter.reviewRequired > 0 && (
        <StatusCount
          label="Review"
          count={
            chapter.reviewRequired
          }
          color="orange"
        />
      )}

      {chapter.notAttempted > 0 && (
        <StatusCount
          label="Not Attempted"
          count={chapter.notAttempted}
          color="gray"
        />
      )}

      {!chapter.evaluated &&
        !chapter.autoEvaluated &&
        !chapter.pending &&
        !chapter.reviewRequired &&
        !chapter.notAttempted && (
          <span className="text-xs text-gray-400">
            —
          </span>
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
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

const ChapterPerformanceFooter = ({
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
          label="Total Chapters"
          value={overall.chapters}
        />

        <FooterMetric
          label="Total Questions"
          value={overall.questions}
        />

        <FooterMetric
          label="Total Marks"
          value={`${formatMarks(
            overall.obtainedMarks,
          )}/${formatMarks(
            overall.maximumMarks,
          )}`}
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
/* Mini Statistic                                                             */
/* -------------------------------------------------------------------------- */

const MiniStatistic = ({
  label,
  value,
  color = "gray",
}) => {
  const colors = {
    gray: "text-gray-800",
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    orange: "text-orange-600",
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
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

const buildChapterPerformance = (
  resultDetails,
) => {
  const records = Array.isArray(
    resultDetails,
  )
    ? resultDetails
    : [];

  const grouped = new Map();

  records.forEach((detail) => {
    const chapterId =
      getId(detail?.chapter);

    /*
     * A chapter is normally present in ResultDetail,
     * but we keep an explicit fallback so malformed/
     * legacy records do not disappear silently.
     */
    const key =
      chapterId || "NO_CHAPTER";

    if (!grouped.has(key)) {
      grouped.set(
        key,
        createChapterGroup(detail),
      );
    }

    const group = grouped.get(key);

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
    .map((item, index) => ({
      ...item,

      index,

      percentage:
        item.maximumMarks > 0
          ? (item.obtainedMarks /
              item.maximumMarks) *
            100
          : 0,
    }))
    .sort((a, b) => {
      /*
       * Chapters with better performance appear
       * first. Change to chapterName sorting if
       * your UI needs curriculum order.
       */
      return (
        b.percentage - a.percentage
      );
    });
};

const createChapterGroup = (
  detail,
) => {
  const chapter =
    detail?.chapter;

  return {
    key:
      getId(chapter) ||
      "NO_CHAPTER",

    chapter:
      chapter || null,

    chapterName:
      getDisplayName(chapter) ||
      "Unassigned Chapter",

    subjectName:
      getDisplayName(
        detail?.subject,
      ),

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
  chapters,
) => {
  const result = chapters.reduce(
    (acc, chapter) => {
      acc.questions +=
        chapter.questions;

      acc.maximumMarks +=
        chapter.maximumMarks;

      acc.obtainedMarks +=
        chapter.obtainedMarks;

      acc.evaluated +=
        chapter.evaluated;

      acc.autoEvaluated +=
        chapter.autoEvaluated;

      acc.pending +=
        chapter.pending;

      acc.reviewRequired +=
        chapter.reviewRequired;

      acc.notAttempted +=
        chapter.notAttempted;

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

  result.chapters =
    chapters.length;

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

const ChapterPerformanceSkeleton = ({
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

const EmptyChapterPerformance = ({
  title,
}) => {
  return (
    <section className="rounded-xl border bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <ChapterIcon />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-gray-800">
        No chapter performance
      </h2>

      <p className="mt-1 text-xs text-gray-400">
        There are no chapter-level result
        details available for {title.toLowerCase()}.
      </p>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getId = (value) => {
  if (!value) {
    return null;
  }

  if (
    typeof value === "object" &&
    value._id
  ) {
    return String(value._id);
  }

  return String(value);
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
    value.chapterName ||
    value.subjectName ||
    value.label ||
    value.code ||
    ""
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
/* Icon                                                                       */
/* -------------------------------------------------------------------------- */

const ChapterIcon = () => (
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
      d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"
    />

    <path
      strokeLinecap="round"
      d="M8 20V7a3 3 0 0 1 3-3"
    />

    <path
      strokeLinecap="round"
      d="M11 9h5M11 13h5M11 17h3"
    />
  </svg>
);

const tableHeaderClass =
  "whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400";

const tableCellClass =
  "whitespace-nowrap px-4 py-4 text-xs text-gray-600";

export default ChapterPerformance;
