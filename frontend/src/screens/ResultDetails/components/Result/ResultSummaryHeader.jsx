// ResultSummaryHeader.jsx

import React from "react";

const ResultSummaryHeader = ({
  result,
  title = "Result Details",
  subtitle,
}) => {
  if (!result) {
    return (
      <div className="rounded-lg border bg-white p-5">
        <h1 className="text-xl font-semibold text-gray-900">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  const student = result.student || result.user;
  const assessment =
    result.assessment ||
    result.assessmentId;

  const studentName = getStudentName(student);

  const assessmentName = getDisplayName(
    assessment,
  );

  const resultStatus =
    result.status ||
    result.resultStatus;

  const resultCode =
    result.resultNumber ||
    result.resultCode;

  const obtainedMarks =
    result.obtainedMarks ??
    result.totalObtainedMarks ??
    result.marksObtained;

  const maximumMarks =
    result.maximumMarks ??
    result.totalMaximumMarks ??
    result.maxMarks;

  const percentage =
    result.percentage ??
    calculatePercentage(
      obtainedMarks,
      maximumMarks,
    );

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      {/* Main Header */}
      <div className="border-b px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Student / Assessment */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <StudentAvatar
                student={student}
              />

              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-gray-900">
                  {studentName ||
                    "Student Result"}
                </h1>

                {student?.email && (
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {student.email}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Assessment
              </p>

              <p className="mt-1 text-sm font-medium text-gray-800">
                {assessmentName ||
                  "Assessment unavailable"}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-wrap items-center gap-2">
            {resultCode && (
              <span className="rounded-md border bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
                {resultCode}
              </span>
            )}

            {resultStatus && (
              <ResultStatusBadge
                status={resultStatus}
              />
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <ResultSummaryStats
        obtainedMarks={obtainedMarks}
        maximumMarks={maximumMarks}
        percentage={percentage}
        result={result}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Summary Statistics                                                         */
/* -------------------------------------------------------------------------- */

const ResultSummaryStats = ({
  obtainedMarks,
  maximumMarks,
  percentage,
  result,
}) => {
  const totalQuestions =
    result.totalQuestions ??
    result.questionCount ??
    result.numberOfQuestions;

  const evaluatedQuestions =
    result.evaluatedQuestions ??
    result.evaluatedQuestionCount;

  return (
    <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
      <SummaryItem
        label="Obtained Marks"
        value={
          obtainedMarks !== undefined &&
          obtainedMarks !== null
            ? formatMarks(obtainedMarks)
            : "—"
        }
      />

      <SummaryItem
        label="Maximum Marks"
        value={
          maximumMarks !== undefined &&
          maximumMarks !== null
            ? formatMarks(maximumMarks)
            : "—"
        }
      />

      <SummaryItem
        label="Percentage"
        value={
          percentage !== undefined &&
          percentage !== null
            ? `${Number(percentage).toFixed(2)}%`
            : "—"
        }
      />

      <SummaryItem
        label="Questions"
        value={
          totalQuestions !== undefined
            ? totalQuestions
            : evaluatedQuestions !== undefined
              ? evaluatedQuestions
              : "—"
        }
      />
    </div>
  );
};

const SummaryItem = ({
  label,
  value,
}) => {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Student Avatar                                                             */
/* -------------------------------------------------------------------------- */

const StudentAvatar = ({ student }) => {
  const name = getStudentName(student);

  const initials = getInitials(name);

  if (student?.avatar || student?.profileImage) {
    return (
      <img
        src={
          student.avatar ||
          student.profileImage
        }
        alt={name || "Student"}
        className="h-11 w-11 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
      {initials || "S"}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Result Status                                                              */
/* -------------------------------------------------------------------------- */

const ResultStatusBadge = ({
  status,
}) => {
  const normalizedStatus =
    String(status || "").toUpperCase();

  const styles = {
    PASS: {
      label: "Pass",
      className:
        "bg-green-50 text-green-700 ring-green-600/20",
    },

    PASSED: {
      label: "Passed",
      className:
        "bg-green-50 text-green-700 ring-green-600/20",
    },

    FAIL: {
      label: "Fail",
      className:
        "bg-red-50 text-red-700 ring-red-600/20",
    },

    FAILED: {
      label: "Failed",
      className:
        "bg-red-50 text-red-700 ring-red-600/20",
    },

    PENDING: {
      label: "Pending",
      className:
        "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    },

    COMPLETED: {
      label: "Completed",
      className:
        "bg-blue-50 text-blue-700 ring-blue-600/20",
    },

    DRAFT: {
      label: "Draft",
      className:
        "bg-gray-50 text-gray-700 ring-gray-600/20",
    },
  };

  const config =
    styles[normalizedStatus] || {
      label: formatEnumLabel(
        normalizedStatus,
      ),
      className:
        "bg-gray-50 text-gray-700 ring-gray-600/20",
    };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1.5",
        "text-xs font-medium ring-1 ring-inset",
        config.className,
      ].join(" ")}
    >
      {config.label || "Unknown"}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getStudentName = (student) => {
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
    value.label ||
    value.assessmentName ||
    value._id ||
    ""
  );
};

const getInitials = (name) => {
  if (!name) {
    return "";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`
    .toUpperCase();
};

const calculatePercentage = (
  obtainedMarks,
  maximumMarks,
) => {
  if (
    obtainedMarks === undefined ||
    obtainedMarks === null ||
    maximumMarks === undefined ||
    maximumMarks === null ||
    Number(maximumMarks) <= 0
  ) {
    return null;
  }

  return (
    (Number(obtainedMarks) /
      Number(maximumMarks)) *
    100
  );
};

const formatMarks = (marks) => {
  const number = Number(marks);

  if (Number.isNaN(number)) {
    return "—";
  }

  return Number.isInteger(number)
    ? number
    : number.toFixed(2);
};

const formatEnumLabel = (value) => {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
};

export default ResultSummaryHeader;
