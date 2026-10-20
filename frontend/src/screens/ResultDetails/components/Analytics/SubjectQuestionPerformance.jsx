import React, { useMemo } from "react";


const tableHeaderClass =
  "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500";

const tableCellClass =
  "whitespace-nowrap px-4 py-4 text-sm text-gray-600";
  
const SubjectQuestionPerformance = ({
  resultDetails = [],
  subject,

  title = "Subject Question Performance",

  loading = false,

  showQuestionNumber = true,
  showChapter = true,
  showTopic = true,
  showQuestionType = true,
  showStatus = true,

  onQuestionClick,

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

  const statistics = useMemo(
    () => calculateStatistics(records),
    [records],
  );

  const subjectName =
    getDisplayName(subject) ||
    getDisplayName(records[0]?.subject) ||
    "Subject";

  if (loading) {
    return (
      <SubjectQuestionPerformanceSkeleton
        title={title}
      />
    );
  }

  if (!records.length) {
    return (
      <EmptyPerformance
        title={title}
        subjectName={subjectName}
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
      <PerformanceHeader
        title={title}
        subjectName={subjectName}
        statistics={statistics}
      />

      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showQuestionNumber && (
                <th className={tableHeaderClass}>
                  #
                </th>
              )}

              <th className={tableHeaderClass}>
                Question
              </th>

              {showChapter && (
                <th className={tableHeaderClass}>
                  Chapter
                </th>
              )}

              {showTopic && (
                <th className={tableHeaderClass}>
                  Topic
                </th>
              )}

              {showQuestionType && (
                <th className={tableHeaderClass}>
                  Type
                </th>
              )}

              <th
                className={`${tableHeaderClass} text-center`}
              >
                Score
              </th>

              {showStatus && (
                <th
                  className={`${tableHeaderClass} text-center`}
                >
                  Status
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {records.map(
              (resultDetail, index) => (
                <SubjectQuestionRow
                  key={
                    resultDetail?._id ||
                    resultDetail?.id ||
                    index
                  }
                  resultDetail={
                    resultDetail
                  }
                  index={index}
                  showQuestionNumber={
                    showQuestionNumber
                  }
                  showChapter={
                    showChapter
                  }
                  showTopic={showTopic}
                  showQuestionType={
                    showQuestionType
                  }
                  showStatus={
                    showStatus
                  }
                  onClick={
                    onQuestionClick
                  }
                />
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-gray-100 md:hidden">
        {records.map(
          (resultDetail, index) => (
            <SubjectQuestionCard
              key={
                resultDetail?._id ||
                resultDetail?.id ||
                index
              }
              resultDetail={
                resultDetail
              }
              index={index}
              showQuestionNumber={
                showQuestionNumber
              }
              showChapter={
                showChapter
              }
              showTopic={showTopic}
              showQuestionType={
                showQuestionType
              }
              showStatus={
                showStatus
              }
              onClick={
                onQuestionClick
              }
            />
          ),
        )}
      </div>

      <PerformanceFooter
        statistics={statistics}
      />
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

const PerformanceHeader = ({
  title,
  subjectName,
  statistics,
}) => {
  return (
    <div className="border-b px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
            Subject
          </p>

          <h2 className="mt-0.5 truncate text-base font-semibold text-gray-900">
            {subjectName}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {title}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStatistic
            label="Questions"
            value={statistics.total}
          />

          <MiniStatistic
            label="Evaluated"
            value={
              statistics.evaluated
            }
            color="green"
          />

          <MiniStatistic
            label="Pending"
            value={statistics.pending}
            color="yellow"
          />

          <MiniStatistic
            label="Score"
            value={`${formatMarks(
              statistics.obtainedMarks,
            )}/${formatMarks(
              statistics.maximumMarks,
            )}`}
            color="blue"
          />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Desktop Row                                                                */
/* -------------------------------------------------------------------------- */

const SubjectQuestionRow = ({
  resultDetail,
  index,

  showQuestionNumber,
  showChapter,
  showTopic,
  showQuestionType,
  showStatus,

  onClick,
}) => {
  const maximumMarks =
    Number(
      resultDetail?.maximumMarks,
    ) || 0;

  const obtainedMarks =
    Number(
      resultDetail?.obtainedMarks,
    ) || 0;

  const percentage =
    calculatePercentage(
      obtainedMarks,
      maximumMarks,
    );

  const clickable =
    typeof onClick === "function";

  return (
    <tr
      onClick={
        clickable
          ? () => onClick(resultDetail)
          : undefined
      }
      className={[
        "transition",
        clickable
          ? "cursor-pointer hover:bg-gray-50"
          : "",
      ].join(" ")}
    >
      {showQuestionNumber && (
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-500">
          {index + 1}
        </td>
      )}

      <td className="min-w-[280px] max-w-[400px] px-4 py-4">
        <QuestionCell
          resultDetail={
            resultDetail
          }
        />
      </td>

      {showChapter && (
        <td className={tableCellClass}>
          {getDisplayName(
            resultDetail?.chapter,
          )}
        </td>
      )}

      {showTopic && (
        <td className={tableCellClass}>
          {getDisplayName(
            resultDetail?.topic,
          )}
        </td>
      )}

      {showQuestionType && (
        <td className={tableCellClass}>
          <QuestionTypeBadge
            type={
              resultDetail?.questionType
            }
          />
        </td>
      )}

      <td className="whitespace-nowrap px-4 py-4 text-center">
        <ScoreDisplay
          obtainedMarks={
            obtainedMarks
          }
          maximumMarks={
            maximumMarks
          }
          percentage={
            percentage
          }
        />
      </td>

      {showStatus && (
        <td className="whitespace-nowrap px-4 py-4 text-center">
          <EvaluationStatusBadge
            status={
              resultDetail?.evaluationStatus
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

const SubjectQuestionCard = ({
  resultDetail,
  index,

  showQuestionNumber,
  showChapter,
  showTopic,
  showQuestionType,
  showStatus,

  onClick,
}) => {
  const maximumMarks =
    Number(
      resultDetail?.maximumMarks,
    ) || 0;

  const obtainedMarks =
    Number(
      resultDetail?.obtainedMarks,
    ) || 0;

  const percentage =
    calculatePercentage(
      obtainedMarks,
      maximumMarks,
    );

  const clickable =
    typeof onClick === "function";

  return (
    <article
      onClick={
        clickable
          ? () => onClick(resultDetail)
          : undefined
      }
      className={[
        "p-4",
        clickable
          ? "cursor-pointer active:bg-gray-50"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {showQuestionNumber && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
            {index + 1}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <QuestionCell
            resultDetail={
              resultDetail
            }
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {showQuestionType && (
              <QuestionTypeBadge
                type={
                  resultDetail?.questionType
                }
              />
            )}

            {showStatus && (
              <EvaluationStatusBadge
                status={
                  resultDetail?.evaluationStatus
                }
              />
            )}
          </div>
        </div>

        <ScoreDisplay
          obtainedMarks={
            obtainedMarks
          }
          maximumMarks={
            maximumMarks
          }
          percentage={percentage}
          compact
        />
      </div>

      {(showChapter || showTopic) && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3">
          {showChapter && (
            <ContextItem
              label="Chapter"
              value={getDisplayName(
                resultDetail?.chapter,
              )}
            />
          )}

          {showTopic && (
            <ContextItem
              label="Topic"
              value={getDisplayName(
                resultDetail?.topic,
              )}
            />
          )}
        </div>
      )}
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Cell                                                              */
/* -------------------------------------------------------------------------- */

const QuestionCell = ({
  resultDetail,
}) => {
  const question =
    resultDetail?.question;

  return (
    <div>
      <p className="line-clamp-2 text-sm font-medium leading-5 text-gray-800">
        {getQuestionText(question)}
      </p>

      {resultDetail?.assessmentQuestion && (
        <p className="mt-1 text-[10px] text-gray-400">
          Assessment Question:{" "}
          {getShortId(
            resultDetail.assessmentQuestion,
          )}
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Score                                                                      */
/* -------------------------------------------------------------------------- */

const ScoreDisplay = ({
  obtainedMarks,
  maximumMarks,
  percentage,
  compact = false,
}) => {
  return (
    <div
      className={
        compact ? "text-right" : ""
      }
    >
      <p
        className={[
          "text-sm font-semibold",
          getScoreColor(
            percentage,
          ),
        ].join(" ")}
      >
        {formatMarks(
          obtainedMarks,
        )}
        <span className="font-normal text-gray-400">
          {" "}
          /{" "}
          {formatMarks(
            maximumMarks,
          )}
        </span>
      </p>

      <p className="mt-0.5 text-[10px] text-gray-400">
        {percentage.toFixed(1)}%
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

const EvaluationStatusBadge = ({
  status,
}) => {
  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.PENDING;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full border px-2.5 py-1",
        "text-[10px] font-medium",
        config.className,
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          config.dotClassName,
        ].join(" ")}
      />

      {config.label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Type                                                              */
/* -------------------------------------------------------------------------- */

const QuestionTypeBadge = ({
  type,
}) => {
  return (
    <span className="inline-flex rounded-full bg-purple-50 px-2 py-1 text-[10px] font-medium text-purple-700">
      {formatEnumLabel(type)}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

const PerformanceFooter = ({
  statistics,
}) => {
  const percentage =
    calculatePercentage(
      statistics.obtainedMarks,
      statistics.maximumMarks,
    );

  const completion =
    statistics.total > 0
      ? ((statistics.evaluated +
          statistics.autoEvaluated) /
          statistics.total) *
        100
      : 0;

  return (
    <div className="border-t bg-gray-50 px-5 py-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <FooterMetric
          label="Maximum Marks"
          value={`${formatMarks(
            statistics.maximumMarks,
          )}`}
        />

        <FooterMetric
          label="Obtained Marks"
          value={`${formatMarks(
            statistics.obtainedMarks,
          )}`}
          color={getScoreColor(
            percentage,
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
    yellow: "text-yellow-600",
    blue: "text-blue-600",
  };

  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p
        className={[
          "mt-0.5 text-sm font-semibold",
          colors[color],
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Context                                                                     */
/* -------------------------------------------------------------------------- */

const ContextItem = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-medium text-gray-700">
        {value || "—"}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyPerformance = ({
  title,
  subjectName,
}) => {
  return (
    <section className="rounded-xl border bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <QuestionIcon />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-gray-800">
        No question performance
      </h2>

      <p className="mt-1 text-xs text-gray-400">
        No question-level performance is
        available for {subjectName}.
      </p>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

const SubjectQuestionPerformanceSkeleton = ({
  title,
}) => {
  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>

        <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="space-y-3 p-4">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-lg border p-4"
          >
            <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />

            <div className="flex-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />

              <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-gray-200" />
            </div>

            <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

const calculateStatistics = (
  records,
) => {
  return records.reduce(
    (stats, item) => {
      const status =
        item?.evaluationStatus;

      stats.total += 1;

      stats.maximumMarks +=
        Number(
          item?.maximumMarks,
        ) || 0;

      stats.obtainedMarks +=
        Number(
          item?.obtainedMarks,
        ) || 0;

      switch (status) {
        case "PENDING":
          stats.pending += 1;
          break;

        case "EVALUATED":
          stats.evaluated += 1;
          break;

        case "AUTO_EVALUATED":
          stats.autoEvaluated += 1;
          break;

        case "REVIEW_REQUIRED":
          stats.reviewRequired += 1;
          break;

        case "NOT_ATTEMPTED":
          stats.notAttempted += 1;
          break;

        default:
          break;
      }

      return stats;
    },
    {
      total: 0,
      pending: 0,
      evaluated: 0,
      autoEvaluated: 0,
      reviewRequired: 0,
      notAttempted: 0,
      maximumMarks: 0,
      obtainedMarks: 0,
    },
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
    value.fullName ||
    value.subjectName ||
    value.chapterName ||
    value.topicName ||
    value.label ||
    value.code ||
    ""
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

const getShortId = (
  value,
) => {
  if (!value) {
    return "";
  }

  if (
    typeof value === "object" &&
    value._id
  ) {
    value = value._id;
  }

  return String(value).slice(-8);
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

const getScoreColor = (
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
    return "Unknown";
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

/* -------------------------------------------------------------------------- */
/* Status Configuration                                                       */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700",
    dotClassName:
      "bg-yellow-500",
  },

  EVALUATED: {
    label: "Evaluated",
    className:
      "border-green-200 bg-green-50 text-green-700",
    dotClassName:
      "bg-green-500",
  },

  REVIEW_REQUIRED: {
    label: "Review Required",
    className:
      "border-orange-200 bg-orange-50 text-orange-700",
    dotClassName:
      "bg-orange-500",
  },

  AUTO_EVALUATED: {
    label: "Auto Evaluated",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    dotClassName:
      "bg-blue-500",
  },

  NOT_ATTEMPTED: {
    label: "Not Attempted",
    className:
      "border-gray-200 bg-gray-50 text-gray-600",
    dotClassName:
      "bg-gray-400",
  },
};

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

const QuestionIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <rect
      x="4"
      y="3"
      width="16"
      height="18"
      rx="2"
    />

    <path
      strokeLinecap="round"
      d="M8 8h8M8 12h5M8 16h4"
    />
  </svg>
);

export default SubjectQuestionPerformance;
