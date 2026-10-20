import React, { useMemo } from "react";

const QuestionPerformance = ({
  resultDetails = [],
  question,

  title = "Question Performance",

  loading = false,

  showStudent = true,
  showSubject = true,
  showChapter = true,
  showTopic = true,
  showQuestionType = true,
  showStatus = true,

  onResultDetailClick,

  className = "",
}) => {
  const records = useMemo(() => {
    const items = Array.isArray(resultDetails)
      ? resultDetails
      : [];

    if (!question) {
      return items;
    }

    const questionId = getId(question);

    return items.filter(
      (item) =>
        getId(item?.question) === questionId,
    );
  }, [resultDetails, question]);

  const statistics = useMemo(
    () => calculateStatistics(records),
    [records],
  );

  const questionName =
    getQuestionText(question) ||
    getQuestionText(records[0]?.question);

  if (loading) {
    return (
      <QuestionPerformanceSkeleton
        title={title}
      />
    );
  }

  if (!records.length) {
    return (
      <EmptyQuestionPerformance
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
      <QuestionPerformanceHeader
        title={title}
        question={question}
        questionName={questionName}
        statistics={statistics}
      />

      <QuestionPerformanceSummary
        statistics={statistics}
      />

      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showStudent && (
                <th className={tableHeaderClass}>
                  Student / Result
                </th>
              )}

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

          <tbody className="divide-y divide-gray-100">
            {records.map(
              (resultDetail, index) => (
                <QuestionPerformanceRow
                  key={
                    resultDetail?._id ||
                    resultDetail?.id ||
                    index
                  }
                  resultDetail={
                    resultDetail
                  }
                  showStudent={showStudent}
                  showSubject={showSubject}
                  showChapter={showChapter}
                  showTopic={showTopic}
                  showQuestionType={
                    showQuestionType
                  }
                  showStatus={showStatus}
                  onClick={
                    onResultDetailClick
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
            <QuestionPerformanceCard
              key={
                resultDetail?._id ||
                resultDetail?.id ||
                index
              }
              resultDetail={
                resultDetail
              }
              showStudent={showStudent}
              showSubject={showSubject}
              showChapter={showChapter}
              showTopic={showTopic}
              showQuestionType={
                showQuestionType
              }
              showStatus={showStatus}
              onClick={
                onResultDetailClick
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

const QuestionPerformanceHeader = ({
  title,
  question,
  questionName,
  statistics,
}) => {
  return (
    <div className="border-b px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-600">
            Question
          </p>

          <h2 className="mt-1 max-w-3xl text-base font-semibold leading-6 text-gray-900">
            {questionName}
          </h2>

          {question?._id && (
            <p className="mt-1 text-[10px] text-gray-400">
              Question ID:{" "}
              {getShortId(question)}
            </p>
          )}

          <p className="mt-2 text-xs text-gray-500">
            {title}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStatistic
            label="Attempts"
            value={statistics.attempts}
          />

          <MiniStatistic
            label="Average"
            value={`${statistics.averagePercentage.toFixed(
              1,
            )}%`}
            color="blue"
          />

          <MiniStatistic
            label="Highest"
            value={`${formatMarks(
              statistics.highestMarks,
            )}/${formatMarks(
              statistics.maximumMarks,
            )}`}
            color="green"
          />

          <MiniStatistic
            label="Evaluated"
            value={`${statistics.evaluated}/${statistics.attempts}`}
            color="green"
          />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const QuestionPerformanceSummary = ({
  statistics,
}) => {
  return (
    <div className="border-b bg-gray-50 px-5 py-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryItem
          label="Maximum Marks"
          value={formatMarks(
            statistics.maximumMarks,
          )}
        />

        <SummaryItem
          label="Total Obtained"
          value={formatMarks(
            statistics.obtainedMarks,
          )}
        />

        <SummaryItem
          label="Average Marks"
          value={formatMarks(
            statistics.averageMarks,
          )}
        />

        <SummaryItem
          label="Average %"
          value={`${statistics.averagePercentage.toFixed(
            1,
          )}%`}
        />

        <SummaryItem
          label="Pending"
          value={statistics.pending}
          color="text-yellow-600"
        />

        <SummaryItem
          label="Review Required"
          value={
            statistics.reviewRequired
          }
          color="text-orange-600"
        />
      </div>
    </div>
  );
};

const SummaryItem = ({
  label,
  value,
  color = "text-gray-800",
}) => {
  return (
    <div className="rounded-lg border bg-white px-3 py-2">
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
/* Desktop Row                                                                */
/* -------------------------------------------------------------------------- */

const QuestionPerformanceRow = ({
  resultDetail,

  showStudent,
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
      {showStudent && (
        <td className="min-w-[180px] px-4 py-4">
          <StudentCell
            resultDetail={
              resultDetail
            }
          />
        </td>
      )}

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

const QuestionPerformanceCard = ({
  resultDetail,

  showStudent,
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
      <div className="flex items-start justify-between gap-4">
        {showStudent ? (
          <StudentCell
            resultDetail={
              resultDetail
            }
          />
        ) : (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-700">
              Result
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              {getShortId(
                resultDetail?.result,
              )}
            </p>
          </div>
        )}

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
/* Student Cell                                                               */
/* -------------------------------------------------------------------------- */

const StudentCell = ({
  resultDetail,
}) => {
  const student =
    resultDetail?.result?.student ||
    resultDetail?.student;

  const studentName =
    getPersonName(student);

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-gray-800">
        {studentName || "Student"}
      </p>

      <p className="mt-1 text-[10px] text-gray-400">
        Result:{" "}
        {getShortId(
          resultDetail?.result,
        )}
      </p>
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

const EmptyQuestionPerformance = ({
  title,
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
        No result details are available for
        this question.
      </p>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

const QuestionPerformanceSkeleton = ({
  title,
}) => {
  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>

        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3 border-b bg-gray-50 p-4 sm:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-lg bg-white"
          />
        ))}
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
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

const calculateStatistics = (
  records,
) => {
  if (!records.length) {
    return {
      attempts: 0,
      maximumMarks: 0,
      obtainedMarks: 0,
      averageMarks: 0,
      averagePercentage: 0,
      highestMarks: 0,
      lowestMarks: 0,
      evaluated: 0,
      pending: 0,
      reviewRequired: 0,
      autoEvaluated: 0,
      notAttempted: 0,
    };
  }

  let maximumMarks = 0;
  let obtainedMarks = 0;
  let highestMarks = 0;
  let lowestMarks = Infinity;

  let evaluated = 0;
  let pending = 0;
  let reviewRequired = 0;
  let autoEvaluated = 0;
  let notAttempted = 0;

  records.forEach((item) => {
    const maximum =
      Number(
        item?.maximumMarks,
      ) || 0;

    const obtained =
      Number(
        item?.obtainedMarks,
      ) || 0;

    maximumMarks += maximum;
    obtainedMarks += obtained;

    highestMarks = Math.max(
      highestMarks,
      obtained,
    );

    lowestMarks = Math.min(
      lowestMarks,
      obtained,
    );

    switch (
      item?.evaluationStatus
    ) {
      case "EVALUATED":
        evaluated += 1;
        break;

      case "AUTO_EVALUATED":
        autoEvaluated += 1;
        break;

      case "PENDING":
        pending += 1;
        break;

      case "REVIEW_REQUIRED":
        reviewRequired += 1;
        break;

      case "NOT_ATTEMPTED":
        notAttempted += 1;
        break;

      default:
        break;
    }
  });

  const attempts = records.length;

  const averageMarks =
    attempts > 0
      ? obtainedMarks / attempts
      : 0;

  const averagePercentage =
    attempts > 0
      ? records.reduce(
          (sum, item) =>
            sum +
            calculatePercentage(
              Number(
                item?.obtainedMarks,
              ) || 0,
              Number(
                item?.maximumMarks,
              ) || 0,
            ),
          0,
        ) / attempts
      : 0;

  return {
    attempts,
    maximumMarks:
      attempts > 0
        ? maximumMarks / attempts
        : 0,
    obtainedMarks,
    averageMarks,
    averagePercentage,
    highestMarks,
    lowestMarks:
      lowestMarks === Infinity
        ? 0
        : lowestMarks,
    evaluated,
    pending,
    reviewRequired,
    autoEvaluated,
    notAttempted,
  };
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

const getQuestionText = (
  question,
) => {
  if (!question) {
    return "";
  }

  if (typeof question === "string") {
    return question;
  }

  return (
    question.questionText ||
    question.text ||
    question.title ||
    question.name ||
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
    value.subjectName ||
    value.chapterName ||
    value.topicName ||
    value.label ||
    value.code ||
    ""
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
/* Icon                                                                       */
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

const tableHeaderClass =
  "whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400";

const tableCellClass =
  "whitespace-nowrap px-4 py-4 text-xs text-gray-600";

export default QuestionPerformance;
