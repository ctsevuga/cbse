import React, { useEffect, useMemo, useState } from "react";

const EvaluationPanel = ({
  maximumMarks = 0,
  initialObtainedMarks = 0,
  initialStatus = "PENDING",
  initialFeedback = "",

  onSubmit,
  onCancel,

  isSubmitting = false,
  readOnly = false,

  submitLabel = "Save Evaluation",
  title = "Evaluation",
}) => {
  const [obtainedMarks, setObtainedMarks] =
    useState(initialObtainedMarks ?? 0);

  const [evaluationStatus, setEvaluationStatus] =
    useState(initialStatus || "PENDING");

  const [feedback, setFeedback] =
    useState(initialFeedback || "");

  const [error, setError] = useState("");

  const maxMarks = Number(maximumMarks) || 0;

  useEffect(() => {
    setObtainedMarks(initialObtainedMarks ?? 0);
    setEvaluationStatus(
      initialStatus || "PENDING",
    );
    setFeedback(initialFeedback || "");
    setError("");
  }, [
    initialObtainedMarks,
    initialStatus,
    initialFeedback,
  ]);

  const percentage = useMemo(() => {
    const marks = Number(obtainedMarks);

    if (
      maxMarks <= 0 ||
      Number.isNaN(marks)
    ) {
      return 0;
    }

    return (marks / maxMarks) * 100;
  }, [obtainedMarks, maxMarks]);

  const validate = () => {
    const marks = Number(obtainedMarks);

    if (
      obtainedMarks === "" ||
      Number.isNaN(marks)
    ) {
      return "Please enter obtained marks.";
    }

    if (marks < 0) {
      return "Obtained marks cannot be negative.";
    }

    if (marks > maxMarks) {
      return `Obtained marks cannot exceed ${maxMarks}.`;
    }

    if (!evaluationStatus) {
      return "Please select an evaluation status.";
    }

    return "";
  };

  const handleMarksChange = (event) => {
    const value = event.target.value;

    setObtainedMarks(value);

    if (value === "") {
      setError("");
      return;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      setError("Please enter a valid mark.");
      return;
    }

    if (numericValue < 0) {
      setError(
        "Obtained marks cannot be negative.",
      );
      return;
    }

    if (numericValue > maxMarks) {
      setError(
        `Obtained marks cannot exceed ${maxMarks}.`,
      );
      return;
    }

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    await onSubmit?.({
      obtainedMarks: Number(obtainedMarks),
      evaluationStatus,
      feedback: feedback.trim(),
    });
  };

  const handleStatusChange = (event) => {
    setEvaluationStatus(event.target.value);
  };

  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b bg-gray-50 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-gray-500">
          Assign marks and record the evaluation
          status for this question.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5 p-5">
          {/* Marks */}
          <MarksField
            value={obtainedMarks}
            maximumMarks={maxMarks}
            percentage={percentage}
            onChange={handleMarksChange}
            disabled={readOnly || isSubmitting}
            error={error}
          />

          {/* Status */}
          <StatusField
            value={evaluationStatus}
            onChange={handleStatusChange}
            disabled={readOnly || isSubmitting}
          />

          {/* Feedback */}
          <FeedbackField
            value={feedback}
            onChange={(event) =>
              setFeedback(event.target.value)
            }
            disabled={readOnly || isSubmitting}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="border-t bg-red-50 px-5 py-3">
            <p className="text-xs font-medium text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Footer */}
        {!readOnly && (
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
                isSubmitting ||
                Boolean(error) ||
                obtainedMarks === ""
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Spinner />}

              {isSubmitting
                ? "Saving..."
                : submitLabel}
            </button>
          </div>
        )}
      </form>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Marks Field                                                                */
/* -------------------------------------------------------------------------- */

const MarksField = ({
  value,
  maximumMarks,
  percentage,
  onChange,
  disabled,
  error,
}) => {
  return (
    <div>
      <label
        htmlFor="evaluation-obtained-marks"
        className="block text-sm font-medium text-gray-700"
      >
        Obtained Marks
      </label>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <div className="relative w-40">
          <input
            id="evaluation-obtained-marks"
            type="number"
            min="0"
            max={maximumMarks}
            step="0.01"
            value={value}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={[
              "w-full rounded-lg border px-3 py-2.5 pr-16",
              "text-lg font-semibold text-gray-900",
              "outline-none transition",
              error
                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
              "disabled:cursor-not-allowed disabled:bg-gray-50",
            ].join(" ")}
          />

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            / {formatMarks(maximumMarks)}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Score
          </p>

          <p
            className={[
              "mt-0.5 text-lg font-semibold",
              getPercentageColor(percentage),
            ].join(" ")}
          >
            {percentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {!error && (
        <p className="mt-2 text-xs text-gray-400">
          Maximum allowed:{" "}
          {formatMarks(maximumMarks)} marks.
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Status Field                                                               */
/* -------------------------------------------------------------------------- */

const StatusField = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <div>
      <label
        htmlFor="evaluation-status"
        className="block text-sm font-medium text-gray-700"
      >
        Evaluation Status
      </label>

      <select
        id="evaluation-status"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
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
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Feedback Field                                                             */
/* -------------------------------------------------------------------------- */

const FeedbackField = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <div>
      <label
        htmlFor="evaluation-feedback"
        className="block text-sm font-medium text-gray-700"
      >
        Feedback
        <span className="ml-1 font-normal text-gray-400">
          (optional)
        </span>
      </label>

      <textarea
        id="evaluation-feedback"
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={4}
        maxLength={2000}
        placeholder="Add feedback for the student..."
        className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
      />

      <div className="mt-1 flex justify-end">
        <span className="text-[11px] text-gray-400">
          {value.length}/2000
        </span>
      </div>
    </div>
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
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatMarks = (marks) => {
  const number = Number(marks);

  if (Number.isNaN(number)) {
    return "0";
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);
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

export default EvaluationPanel;
