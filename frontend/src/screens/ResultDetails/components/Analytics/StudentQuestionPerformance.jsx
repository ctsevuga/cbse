import React, { useMemo } from "react";

const StudentQuestionPerformance = ({
  resultDetails = [],

  student,
  title = "Question Performance",

  loading = false,

  showQuestionNumber = true,
  showSubject = true,
  showChapter = true,
  showTopic = true,
  showQuestionType = true,
  showStatus = true,

  onQuestionClick,

  className = "",
}) => {
  const records = useMemo(() => {
    return Array.isArray(resultDetails)
      ? resultDetails
      : [];
  }, [resultDetails]);

  if (loading) {
    return (
      <PerformanceSkeleton
        title={title}
      />
    );
  }

  if (!records.length) {
    return (
      <EmptyPerformance
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
      {/* Header */}
      <PerformanceHeader
        title={title}
        student={student}
        records={records}
      />

      {/* Desktop Table */}
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

              {showSubject && (
                <th className={tableHeaderClass}>
                  Subject
                </th>
              )}

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

          <tbody className="divide-y divide-gray-100 bg-white">
            {records.map(
              (resultDetail, index) => (
                <StudentQuestionRow
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
                  showSubject={
                    showSubject
                  }
                  showChapter={
                    showChapter
                  }
                  showTopic={showTopic}
                  showQuestionType={
                    showQuestionType
                  }
                  showStatus={showStatus}
                  onClick={
                    onQuestionClick
                  }
                />
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y divide-gray-100 md:hidden">
        {records.map(
          (resultDetail, index) => (
            <StudentQuestionCard
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
              showSubject={
                showSubject
              }
              showChapter={
                showChapter
              }
              showTopic={showTopic}
              showQuestionType={
                showQuestionType
              }
              showStatus={showStatus}
              onClick={
                onQuestionClick
              }
            />
          ),
        )}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

const PerformanceHeader = ({
  title,
  student,
  records,
}) => {
  const statistics =
    calculateStatistics(records);

  return (
    <div className="border-b px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {title}
          </h2>

          {student && (
            <p className="mt-1 text-xs text-gray-500">
              {getPersonName(student)}
            </p>
          )}
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

const StudentQuestionRow = ({
  resultDetail,
  index,

  showQuestionNumber,
  showSubject,
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

      <td className="min-w-[260px] max-w-[360px] px-4 py-4">
        <QuestionCell
          resultDetail={
            resultDetail
          }
        />
      </td>

      {showSubject && (
        <td className={tableCellClass}>
          {getDisplayName(
            resultDetail?.subject,
          )}
        </td>
      )}

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

const StudentQuestionCard = ({
  resultDetail,
  index,

  showQuestionNumber,
  showSubject,
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
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
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

      <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3">
        {showSubject && (
          <ContextItem
            label="Subject"
            value={getDisplayName(
              resultDetail?.subject,
            )}
          />
        )}

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
/* Score Display                                                              */
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
          compact
            ? "text-sm"
            : "text-sm",
          "font-semibold",
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
/* Evaluation Status                                                          */
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
/* Context Item                                                               */
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
}) => {
  return (
    <section className="rounded-xl border bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <QuestionIcon />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-gray-800">
        {title}
      </h2>

      <p className="mt-1 text-xs text-gray-400">
        No question performance data is
        available.
      </p>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

const PerformanceSkeleton = ({
  title,
}) => {
  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>

        <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-200" />
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

      if (status === "PENDING") {
        stats.pending += 1;
      }

      if (status === "EVALUATED") {
        stats.evaluated += 1;
      }

      if (
        status === "AUTO_EVALUATED"
      ) {
        stats.evaluated += 1;
      }

      return stats;
    },
    {
      total: 0,
      pending: 0,
      evaluated: 0,
      maximumMarks: 0,
      obtainedMarks: 0,
    },
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

const getPersonName = (
  person,
) => {
  if (!person) {
    return "";
  }

  if (typeof person === "string") {
    return person;
  }

  return (
    person.name ||
    person.fullName ||
    [
      person.firstName,
      person.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    person.username ||
    person.email ||
    ""
  );
};

const getDisplayName = (
  value,
) => {
  if (!value) {
    return "—";
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
    "—"
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

const ChevronIcon = () => (
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
      d="m9 18 6-6-6-6"
    />
  </svg>
);

const tableHeaderClass =
  "whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400";

const tableCellClass =
  "whitespace-nowrap px-4 py-4 text-xs text-gray-600";

export default StudentQuestionPerformance;
