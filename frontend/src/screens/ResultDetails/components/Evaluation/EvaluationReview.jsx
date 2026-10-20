import React from "react";

const EvaluationReview = ({
  resultDetail,

  obtainedMarks,
  evaluationStatus,
  feedback = "",

  currentObtainedMarks,
  currentEvaluationStatus,

  evaluator,

  onEdit,
  onConfirm,

  isSubmitting = false,

  showQuestion = true,
  showStudent = true,
  showSubject = true,
  showFeedback = true,
  showEvaluator = true,
}) => {
  if (!resultDetail) {
    return <EmptyReview />;
  }

  const maximumMarks =
    Number(resultDetail.maximumMarks) || 0;

  const marks =
    obtainedMarks === ""
      ? 0
      : Number(obtainedMarks) || 0;

  const percentage =
    maximumMarks > 0
      ? (marks / maximumMarks) * 100
      : 0;

  const student =
    resultDetail?.result?.student ||
    resultDetail?.student;

  const subject =
    resultDetail?.subject;

  const question =
    resultDetail?.question;

  const hasMarksChanged =
    currentObtainedMarks !== undefined &&
    Number(currentObtainedMarks) !== marks;

  const hasStatusChanged =
    currentEvaluationStatus !== undefined &&
    currentEvaluationStatus !==
      evaluationStatus;

  const hasChanges =
    hasMarksChanged ||
    hasStatusChanged ||
    Boolean(feedback);

  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <ReviewHeader
        evaluationStatus={
          evaluationStatus
        }
        hasChanges={hasChanges}
      />

      <div className="space-y-6 p-5">
        {/* Question */}
        {showQuestion && (
          <ReviewQuestion
            question={question}
            questionType={
              resultDetail.questionType
            }
          />
        )}

        {/* Student / Subject */}
        {(showStudent || showSubject) && (
          <ReviewContext
            student={student}
            subject={subject}
            resultDetail={
              resultDetail
            }
            showStudent={
              showStudent
            }
            showSubject={
              showSubject
            }
          />
        )}

        {/* Score */}
        <ReviewScore
          obtainedMarks={marks}
          maximumMarks={maximumMarks}
          percentage={percentage}
          hasChanged={
            hasMarksChanged
          }
        />

        {/* Status */}
        <ReviewStatus
          currentStatus={
            currentEvaluationStatus
          }
          newStatus={
            evaluationStatus
          }
          hasChanged={
            hasStatusChanged
          }
        />

        {/* Feedback */}
        {showFeedback &&
          feedback.trim() && (
            <ReviewFeedback
              feedback={feedback}
            />
          )}

        {/* Evaluator */}
        {showEvaluator &&
          evaluator && (
            <ReviewEvaluator
              evaluator={evaluator}
            />
          )}

        {/* Changes */}
        {hasChanges && (
          <ChangesSummary
            hasMarksChanged={
              hasMarksChanged
            }
            hasStatusChanged={
              hasStatusChanged
            }
            hasFeedback={
              Boolean(
                feedback.trim(),
              )
            }
          />
        )}
      </div>

      {/* Actions */}
      <ReviewActions
        onEdit={onEdit}
        onConfirm={onConfirm}
        isSubmitting={
          isSubmitting
        }
      />
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

const ReviewHeader = ({
  evaluationStatus,
  hasChanges,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b bg-gray-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
          <CheckIcon />
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Review Evaluation
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Review the evaluation before saving.
          </p>
        </div>
      </div>

      <StatusBadge
        status={evaluationStatus}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Question                                                                   */
/* -------------------------------------------------------------------------- */

const ReviewQuestion = ({
  question,
  questionType,
}) => {
  return (
    <div>
      <ReviewSectionTitle>
        Question
      </ReviewSectionTitle>

      <div className="mt-3 rounded-lg border bg-gray-50 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {formatEnumLabel(
              questionType,
            )}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
          {getQuestionText(question)}
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

const ReviewContext = ({
  student,
  subject,
  resultDetail,
  showStudent,
  showSubject,
}) => {
  return (
    <div>
      <ReviewSectionTitle>
        Assessment Context
      </ReviewSectionTitle>

      <div className="mt-3 grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        {showStudent && (
          <ContextItem
            label="Student"
            value={getStudentName(student)}
          />
        )}

        {showSubject && (
          <ContextItem
            label="Subject"
            value={getDisplayName(subject)}
          />
        )}

        <ContextItem
          label="Maximum Marks"
          value={`${formatMarks(
            resultDetail.maximumMarks,
          )} marks`}
        />

        <ContextItem
          label="Assessment Question"
          value={
            resultDetail.assessmentQuestion
              ? getShortId(
                  resultDetail.assessmentQuestion,
                )
              : "—"
          }
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Score                                                                      */
/* -------------------------------------------------------------------------- */

const ReviewScore = ({
  obtainedMarks,
  maximumMarks,
  percentage,
  hasChanged,
}) => {
  return (
    <div>
      <ReviewSectionTitle>
        Score
      </ReviewSectionTitle>

      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <ScoreCard
          label="Obtained Marks"
          value={`${formatMarks(
            obtainedMarks,
          )} / ${formatMarks(
            maximumMarks,
          )}`}
          changed={hasChanged}
        />

        <ScoreCard
          label="Percentage"
          value={`${percentage.toFixed(
            2,
          )}%`}
          color={getPercentageColor(
            percentage,
          )}
        />

        <ScoreCard
          label="Maximum Marks"
          value={formatMarks(
            maximumMarks,
          )}
        />
      </div>
    </div>
  );
};

const ScoreCard = ({
  label,
  value,
  changed = false,
  color = "text-gray-900",
}) => {
  return (
    <div
      className={[
        "rounded-lg border p-4",
        changed
          ? "border-blue-200 bg-blue-50"
          : "bg-white",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>

        {changed && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
            Changed
          </span>
        )}
      </div>

      <p
        className={[
          "mt-2 text-xl font-semibold",
          color,
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

const ReviewStatus = ({
  currentStatus,
  newStatus,
  hasChanged,
}) => {
  return (
    <div>
      <ReviewSectionTitle>
        Evaluation Status
      </ReviewSectionTitle>

      <div className="mt-3 rounded-lg border p-4">
        {hasChanged &&
        currentStatus ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Current
              </p>

              <StatusBadge
                status={currentStatus}
              />
            </div>

            <ArrowIcon />

            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                New
              </p>

              <StatusBadge
                status={newStatus}
              />
            </div>
          </div>
        ) : (
          <StatusBadge
            status={newStatus}
          />
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Feedback                                                                   */
/* -------------------------------------------------------------------------- */

const ReviewFeedback = ({
  feedback,
}) => {
  return (
    <div>
      <ReviewSectionTitle>
        Feedback
      </ReviewSectionTitle>

      <div className="mt-3 rounded-lg border bg-gray-50 p-4">
        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {feedback}
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Evaluator                                                                  */
/* -------------------------------------------------------------------------- */

const ReviewEvaluator = ({
  evaluator,
}) => {
  const name =
    getStudentName(evaluator);

  return (
    <div>
      <ReviewSectionTitle>
        Evaluator
      </ReviewSectionTitle>

      <div className="mt-3 flex items-center gap-3 rounded-lg border p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
          {getInitials(name)}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800">
            {name || "Current evaluator"}
          </p>

          {evaluator?.email && (
            <p className="mt-0.5 truncate text-xs text-gray-400">
              {evaluator.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Changes Summary                                                            */
/* -------------------------------------------------------------------------- */

const ChangesSummary = ({
  hasMarksChanged,
  hasStatusChanged,
  hasFeedback,
}) => {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex gap-3">
        <InfoIcon />

        <div>
          <p className="text-sm font-medium text-blue-900">
            Changes to save
          </p>

          <ul className="mt-2 space-y-1 text-xs text-blue-700">
            {hasMarksChanged && (
              <li>
                • Obtained marks will be
                updated.
              </li>
            )}

            {hasStatusChanged && (
              <li>
                • Evaluation status will be
                updated.
              </li>
            )}

            {hasFeedback && (
              <li>
                • Evaluation feedback will be
                saved.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

const ReviewActions = ({
  onEdit,
  onConfirm,
  isSubmitting,
}) => {
  return (
    <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Edit Evaluation
        </button>
      )}

      {onConfirm && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <Spinner />
          )}

          {isSubmitting
            ? "Saving..."
            : "Confirm & Save"}
        </button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Reusable UI                                                                */
/* -------------------------------------------------------------------------- */

const ReviewSectionTitle = ({
  children,
}) => {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </h3>
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

      <p className="mt-1 text-sm font-medium text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
};

const StatusBadge = ({
  status,
}) => {
  const config =
    getStatusConfig(status);

  if (!config) {
    return (
      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
        Unknown
      </span>
    );
  }

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "whitespace-nowrap rounded-full border",
        "px-2.5 py-1 text-xs font-medium",
        config.className,
      ].join(" ")}
    >
      <span
        className={[
          "h-2 w-2 rounded-full",
          config.dotClassName,
        ].join(" ")}
      />

      {config.label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 4 4L19 6"
      />
    </svg>
  );
};

const ArrowIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5 rotate-90 text-gray-300 sm:rotate-0"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  );
};

const InfoIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path
        strokeLinecap="round"
        d="M12 11v5"
      />

      <path
        strokeLinecap="round"
        d="M12 8h.01"
      />
    </svg>
  );
};

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

const EmptyReview = () => {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-xl border bg-white">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          ?
        </div>

        <p className="text-sm font-medium text-gray-700">
          Evaluation data is unavailable.
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Select a valid result detail before
          reviewing.
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
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

const getStatusConfig = (
  status,
) => {
  return (
    STATUS_CONFIG[status] || null
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
    return "?";
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

const getShortId = (value) => {
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

const getPercentageColor = (
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

export default EvaluationReview;
