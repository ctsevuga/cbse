// EvaluationQueueTable.jsx

import React from "react";

import ResultDetailActions from "./../../ResultDetail/ResultDetailActions";

const EvaluationQueueTable = ({
  resultDetails = [],

  onView,
  onEvaluate,
  onEdit,
  onDelete,

  emptyMessage = "No evaluations are currently pending.",

  showStudent = true,
  showSubject = true,
  showQuestionType = true,
  showMarks = true,
  showStatus = true,
  showActions = true,
}) => {
  if (!Array.isArray(resultDetails)) {
    return (
      <EmptyState message={emptyMessage} />
    );
  }

  if (resultDetails.length === 0) {
    return (
      <EmptyState message={emptyMessage} />
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[900px] w-full divide-y divide-gray-200">
        <TableHeader
          showStudent={showStudent}
          showSubject={showSubject}
          showQuestionType={
            showQuestionType
          }
          showMarks={showMarks}
          showStatus={showStatus}
          showActions={showActions}
        />

        <tbody className="divide-y divide-gray-100 bg-white">
          {resultDetails.map(
            (resultDetail) => (
              <EvaluationQueueTableRow
                key={resultDetail._id}
                resultDetail={resultDetail}
                onView={onView}
                onEvaluate={onEvaluate}
                onEdit={onEdit}
                onDelete={onDelete}
                showStudent={showStudent}
                showSubject={showSubject}
                showQuestionType={
                  showQuestionType
                }
                showMarks={showMarks}
                showStatus={showStatus}
                showActions={showActions}
              />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Table Header                                                               */
/* -------------------------------------------------------------------------- */

const TableHeader = ({
  showStudent,
  showSubject,
  showQuestionType,
  showMarks,
  showStatus,
  showActions,
}) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th
          scope="col"
          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Question
        </th>

        {showStudent && (
          <th
            scope="col"
            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Student
          </th>
        )}

        {showSubject && (
          <th
            scope="col"
            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Subject
          </th>
        )}

        {showQuestionType && (
          <th
            scope="col"
            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Type
          </th>
        )}

        {showMarks && (
          <th
            scope="col"
            className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Marks
          </th>
        )}

        {showStatus && (
          <th
            scope="col"
            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Status
          </th>
        )}

        {showActions && (
          <th
            scope="col"
            className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Actions
          </th>
        )}
      </tr>
    </thead>
  );
};

/* -------------------------------------------------------------------------- */
/* Table Row                                                                  */
/* -------------------------------------------------------------------------- */

const EvaluationQueueTableRow = ({
  resultDetail,

  onView,
  onEvaluate,
  onEdit,
  onDelete,

  showStudent,
  showSubject,
  showQuestionType,
  showMarks,
  showStatus,
  showActions,
}) => {
  const student =
    resultDetail?.result?.student ||
    resultDetail?.student;

  const subject =
    resultDetail?.subject;

  const question =
    resultDetail?.question;

  return (
    <tr className="transition-colors hover:bg-gray-50">
      {/* Question */}
      <td className="max-w-[360px] px-5 py-4">
        <QuestionCell
          question={question}
        />
      </td>

      {/* Student */}
      {showStudent && (
        <td className="px-4 py-4">
          <StudentCell
            student={student}
          />
        </td>
      )}

      {/* Subject */}
      {showSubject && (
        <td className="px-4 py-4">
          <SubjectCell
            subject={subject}
          />
        </td>
      )}

      {/* Question Type */}
      {showQuestionType && (
        <td className="px-4 py-4">
          <QuestionTypeBadge
            type={
              resultDetail.questionType
            }
          />
        </td>
      )}

      {/* Marks */}
      {showMarks && (
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
      )}

      {/* Evaluation Status */}
      {showStatus && (
        <td className="px-4 py-4">
          <EvaluationStatusBadge
            status={
              resultDetail.evaluationStatus
            }
          />
        </td>
      )}

      {/* Actions */}
      {showActions && (
        <td className="px-5 py-4 text-right">
          <ResultDetailActions
            resultDetail={
              resultDetail
            }
            onView={onView}
            onEvaluate={onEvaluate}
            onEdit={onEdit}
            onDelete={onDelete}
            canEvaluate={isEvaluatable(
              resultDetail,
            )}
          />
        </td>
      )}
    </tr>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Cell                                                              */
/* -------------------------------------------------------------------------- */

const QuestionCell = ({
  question,
}) => {
  const questionText =
    getQuestionText(question);

  return (
    <div className="min-w-0">
      <p
        className="line-clamp-2 text-sm font-medium leading-5 text-gray-900"
        title={questionText}
      >
        {questionText}
      </p>

      {question?._id && (
        <p className="mt-1 text-[11px] text-gray-400">
          Question ID:{" "}
          {String(question._id).slice(
            -8,
          )}
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Student Cell                                                               */
/* -------------------------------------------------------------------------- */

const StudentCell = ({
  student,
}) => {
  const name =
    getStudentName(student);

  if (!name) {
    return (
      <span className="text-sm text-gray-400">
        —
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
        {getInitials(name)}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-800">
          {name}
        </p>

        {student?.email && (
          <p className="max-w-[160px] truncate text-xs text-gray-400">
            {student.email}
          </p>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Subject Cell                                                               */
/* -------------------------------------------------------------------------- */

const SubjectCell = ({
  subject,
}) => {
  const name =
    getDisplayName(subject);

  if (!name) {
    return (
      <span className="text-sm text-gray-400">
        —
      </span>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-700">
        {name}
      </p>

      {subject?.code && (
        <p className="mt-0.5 text-xs text-gray-400">
          {subject.code}
        </p>
      )}
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
    <div className="whitespace-nowrap">
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
    <span className="inline-flex whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
      {formatEnumLabel(type) ||
        "Unknown"}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Evaluation Status Badge                                                    */
/* -------------------------------------------------------------------------- */

const EvaluationStatusBadge = ({
  status,
}) => {
  const statusConfig = {
    PENDING: {
      label: "Pending",
      className:
        "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    },

    REVIEW_REQUIRED: {
      label: "Review Required",
      className:
        "bg-orange-50 text-orange-700 ring-orange-600/20",
    },

    AUTO_EVALUATED: {
      label: "Auto Evaluated",
      className:
        "bg-blue-50 text-blue-700 ring-blue-600/20",
    },

    EVALUATED: {
      label: "Evaluated",
      className:
        "bg-green-50 text-green-700 ring-green-600/20",
    },

    NOT_ATTEMPTED: {
      label: "Not Attempted",
      className:
        "bg-gray-100 text-gray-600 ring-gray-500/20",
    },
  };

  const config =
    statusConfig[status] || {
      label:
        formatEnumLabel(status) ||
        "Unknown",
      className:
        "bg-gray-100 text-gray-600 ring-gray-500/20",
    };

  return (
    <span
      className={[
        "inline-flex whitespace-nowrap rounded-full",
        "px-2.5 py-1 text-xs font-medium",
        "ring-1 ring-inset",
        config.className,
      ].join(" ")}
    >
      {config.label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyState = ({
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
        No questions currently require your
        attention.
      </p>
    </div>
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
    value.subjectName ||
    value.label ||
    value.code ||
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

export default EvaluationQueueTable;
