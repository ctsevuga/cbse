// ResultDetailEvaluation.jsx

import React, { useEffect, useMemo, useState } from "react";

const ResultDetailEvaluation = ({
  resultDetail,

  onSubmit,
  onCancel,
  onStatusChange,

  isSubmitting = false,

  readOnly = false,

  title = "Evaluate Question",
}) => {
  const [obtainedMarks, setObtainedMarks] =
    useState(
      resultDetail?.obtainedMarks ?? 0,
    );

  const [evaluationStatus, setEvaluationStatus] =
    useState(
      resultDetail?.evaluationStatus ||
        "PENDING",
    );

  const [feedback, setFeedback] =
    useState(
      resultDetail?.feedback ||
        "",
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    setObtainedMarks(
      resultDetail?.obtainedMarks ?? 0,
    );

    setEvaluationStatus(
      resultDetail?.evaluationStatus ||
        "PENDING",
    );

    setFeedback(
      resultDetail?.feedback || "",
    );

    setError("");
  }, [resultDetail]);

  const maximumMarks = Number(
    resultDetail?.maximumMarks || 0,
  );

  const percentage = useMemo(() => {
    if (maximumMarks <= 0) {
      return 0;
    }

    return (
      (Number(obtainedMarks || 0) /
        maximumMarks) *
      100
    );
  }, [
    obtainedMarks,
    maximumMarks,
  ]);

  const student =
    resultDetail?.result?.student ||
    resultDetail?.student;

  const question =
    resultDetail?.question;

  const subject =
    resultDetail?.subject;

  const chapter =
    resultDetail?.chapter;

  const topic =
    resultDetail?.topic;

  if (!resultDetail) {
    return (
      <EmptyEvaluation />
    );
  }

  const handleMarksChange = (
    event,
  ) => {
    const value = event.target.value;

    if (value === "") {
      setObtainedMarks("");
      setError("");
      return;
    }

    const numericValue =
      Number(value);

    if (Number.isNaN(numericValue)) {
      return;
    }

    setObtainedMarks(numericValue);

    if (
      numericValue < 0 ||
      numericValue > maximumMarks
    ) {
      setError(
        `Marks must be between 0 and ${maximumMarks}.`,
      );
    } else {
      setError("");
    }
  };

  const handleStatusChange = (
    event,
  ) => {
    const status =
      event.target.value;

    setEvaluationStatus(status);

    onStatusChange?.(
      resultDetail,
      status,
    );
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    const marks = Number(
      obtainedMarks,
    );

    if (
      Number.isNaN(marks) ||
      marks < 0
    ) {
      setError(
        "Please enter a valid mark.",
      );
      return;
    }

    if (marks > maximumMarks) {
      setError(
        `Obtained marks cannot exceed ${maximumMarks}.`,
      );
      return;
    }

    setError("");

    await onSubmit?.({
      resultDetail,
      obtainedMarks: marks,
      evaluationStatus,
      feedback,
    });
  };

  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <EvaluationHeader
        title={title}
        resultDetail={resultDetail}
        onCancel={onCancel}
      />

      <form onSubmit={handleSubmit}>
        {/* Student / Assessment Context */}
        <div className="border-b px-5 py-5">
          <EvaluationContext
            student={student}
            subject={subject}
            chapter={chapter}
            topic={topic}
            resultDetail={
              resultDetail
            }
          />
        </div>

        {/* Question */}
        <div className="border-b px-5 py-6">
          <SectionHeading>
            Question
          </SectionHeading>

          <QuestionContent
            question={question}
          />
        </div>

        {/* Answer */}
        <div className="border-b px-5 py-6">
          <SectionHeading>
            Student Answer
          </SectionHeading>

          <StudentAnswer
            resultDetail={
              resultDetail
            }
          />
        </div>

        {/* Evaluation */}
        <div className="px-5 py-6">
          <SectionHeading>
            Evaluation
          </SectionHeading>

          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            {/* Marks */}
            <MarksEvaluation
              obtainedMarks={
                obtainedMarks
              }
              maximumMarks={
                maximumMarks
              }
              percentage={
                percentage
              }
              onChange={
                handleMarksChange
              }
              disabled={readOnly}
              error={error}
            />

            {/* Status */}
            <StatusEvaluation
              status={
                evaluationStatus
              }
              onChange={
                handleStatusChange
              }
              disabled={readOnly}
            />
          </div>

          {/* Feedback */}
          <div className="mt-5">
            <label
              htmlFor="evaluation-feedback"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Feedback
              <span className="ml-1 font-normal text-gray-400">
                (optional)
              </span>
            </label>

            <textarea
              id="evaluation-feedback"
              value={feedback}
              onChange={(event) =>
                setFeedback(
                  event.target.value,
                )
              }
              disabled={readOnly}
              rows={4}
              placeholder="Add feedback for the student..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Footer */}
        {!readOnly && (
          <EvaluationFooter
            onCancel={onCancel}
            isSubmitting={
              isSubmitting
            }
            disabled={
              Boolean(error) ||
              obtainedMarks === ""
            }
          />
        )}
      </form>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

const EvaluationHeader = ({
  title,
  resultDetail,
  onCancel,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b bg-gray-50 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20h9"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4Z"
            />
          </svg>
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-gray-900">
            {title}
          </h1>

          <p className="mt-0.5 text-xs text-gray-500">
            {formatEnumLabel(
              resultDetail.questionType,
            )}
            {" · "}
            {formatMarks(
              resultDetail.maximumMarks,
            )}{" "}
            marks
          </p>
        </div>
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
          aria-label="Close evaluation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6l12 12M18 6 6 18"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Evaluation Context                                                         */
/* -------------------------------------------------------------------------- */

const EvaluationContext = ({
  student,
  subject,
  chapter,
  topic,
  resultDetail,
}) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ContextItem
        label="Student"
        value={getStudentName(student)}
      />

      <ContextItem
        label="Subject"
        value={getDisplayName(subject)}
      />

      <ContextItem
        label="Chapter"
        value={getDisplayName(chapter)}
      />

      <ContextItem
        label="Topic"
        value={getDisplayName(topic)}
      />

      <ContextItem
        label="Question Type"
        value={formatEnumLabel(
          resultDetail.questionType,
        )}
      />

      <ContextItem
        label="Maximum Marks"
        value={`${formatMarks(
          resultDetail.maximumMarks,
        )} marks`}
      />

      <ContextItem
        label="Current Marks"
        value={`${formatMarks(
          resultDetail.obtainedMarks,
        )} marks`}
      />

      <ContextItem
        label="Status"
        value={formatEnumLabel(
          resultDetail.evaluationStatus,
        )}
      />
    </div>
  );
};

const ContextItem = ({
  label,
  value,
}) => {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Content                                                           */
/* -------------------------------------------------------------------------- */

const QuestionContent = ({
  question,
}) => {
  const questionText =
    getQuestionText(question);

  return (
    <div className="mt-4 rounded-lg border bg-gray-50 p-4 sm:p-5">
      <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
        {questionText}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Student Answer                                                             */
/* -------------------------------------------------------------------------- */

const StudentAnswer = ({
  resultDetail,
}) => {
  /*
   * The ResultDetail model supplied does not contain
   * an answer/response field. Therefore we intentionally
   * read common populated/nested answer locations
   * without assuming a new schema field.
   */
  const answer =
    resultDetail?.answer ??
    resultDetail?.studentAnswer ??
    resultDetail?.response ??
    resultDetail?.result?.answer ??
    resultDetail?.result?.studentAnswer ??
    null;

  if (!answer) {
    return (
      <div className="mt-4 rounded-lg border border-dashed bg-gray-50 px-4 py-6 text-center">
        <p className="text-sm text-gray-500">
          Student answer is not available in
          this ResultDetail record.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border bg-gray-50 p-4 sm:p-5">
      <AnswerContent
        answer={answer}
      />
    </div>
  );
};

const AnswerContent = ({
  answer,
}) => {
  if (
    typeof answer === "string" ||
    typeof answer === "number"
  ) {
    return (
      <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
        {String(answer)}
      </p>
    );
  }

  if (Array.isArray(answer)) {
    return (
      <ul className="space-y-2">
        {answer.map(
          (item, index) => (
            <li
              key={index}
              className="rounded-md bg-white px-3 py-2 text-sm text-gray-800"
            >
              {renderValue(item)}
            </li>
          ),
        )}
      </ul>
    );
  }

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-gray-800">
      {JSON.stringify(
        answer,
        null,
        2,
      )}
    </pre>
  );
};

/* -------------------------------------------------------------------------- */
/* Marks Evaluation                                                           */
/* -------------------------------------------------------------------------- */

const MarksEvaluation = ({
  obtainedMarks,
  maximumMarks,
  percentage,
  onChange,
  disabled,
  error,
}) => {
  return (
    <div className="rounded-lg border p-4">
      <label
        htmlFor="obtained-marks"
        className="block text-sm font-medium text-gray-700"
      >
        Obtained Marks
      </label>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative w-36">
          <input
            id="obtained-marks"
            type="number"
            min="0"
            max={maximumMarks}
            step="0.01"
            value={obtainedMarks}
            onChange={onChange}
            disabled={disabled}
            className={[
              "w-full rounded-lg border px-3 py-2.5 pr-14",
              "text-lg font-semibold text-gray-900",
              "outline-none transition",
              error
                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
              "disabled:cursor-not-allowed disabled:bg-gray-50",
            ].join(" ")}
          />

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            /{" "}
            {formatMarks(
              maximumMarks,
            )}
          </span>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Percentage
          </p>

          <p
            className={[
              "mt-0.5 text-lg font-semibold",
              percentage >= 75
                ? "text-green-600"
                : percentage >= 40
                  ? "text-blue-600"
                  : "text-red-600",
            ].join(" ")}
          >
            {percentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Enter a value from 0 to{" "}
        {formatMarks(maximumMarks)}.
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Status Evaluation                                                           */
/* -------------------------------------------------------------------------- */

const StatusEvaluation = ({
  status,
  onChange,
  disabled,
}) => {
  return (
    <div className="rounded-lg border p-4">
      <label
        htmlFor="evaluation-status"
        className="block text-sm font-medium text-gray-700"
      >
        Evaluation Status
      </label>

      <select
        id="evaluation-status"
        value={status}
        onChange={onChange}
        disabled={disabled}
        className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        <option value="PENDING">
          Pending
        </option>

        <option value="EVALUATED">
          Evaluated
        </option>

        <option value="REVIEW_REQUIRED">
          Review Required
        </option>

        <option value="AUTO_EVALUATED">
          Auto Evaluated
        </option>

        <option value="NOT_ATTEMPTED">
          Not Attempted
        </option>
      </select>

      <p className="mt-3 text-xs text-gray-400">
        Select the current evaluation state for
        this question.
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

const EvaluationFooter = ({
  onCancel,
  isSubmitting,
  disabled,
}) => {
  return (
    <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      )}

      <button
        type="submit"
        disabled={
          disabled || isSubmitting
        }
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && (
          <Spinner />
        )}

        {isSubmitting
          ? "Saving..."
          : "Save Evaluation"}
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Section Heading                                                            */
/* -------------------------------------------------------------------------- */

const SectionHeading = ({
  children,
}) => {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
      {children}
    </h2>
  );
};

/* -------------------------------------------------------------------------- */
/* Spinner                                                                    */
/* -------------------------------------------------------------------------- */

const Spinner = () => {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden="true"
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyEvaluation = () => {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-white">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          ?
        </div>

        <p className="text-sm font-medium text-gray-700">
          Result detail not found.
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Select a valid result detail to
          evaluate.
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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
    value.chapterName ||
    value.topicName ||
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

const renderValue = (value) => {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return JSON.stringify(value);
};

export default ResultDetailEvaluation;
