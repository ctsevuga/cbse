import React from "react";

const EVALUATION_STATUSES = [
  {
    value: "PENDING",
    label: "Pending",
    description:
      "The question still needs evaluation.",
    color:
      "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  {
    value: "EVALUATED",
    label: "Evaluated",
    description:
      "The question has been evaluated.",
    color:
      "bg-green-50 text-green-700 border-green-200",
  },
  {
    value: "REVIEW_REQUIRED",
    label: "Review Required",
    description:
      "The evaluation requires another review.",
    color:
      "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    value: "AUTO_EVALUATED",
    label: "Auto Evaluated",
    description:
      "The question was evaluated automatically.",
    color:
      "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "NOT_ATTEMPTED",
    label: "Not Attempted",
    description:
      "The student did not attempt the question.",
    color:
      "bg-gray-50 text-gray-600 border-gray-200",
  },
];

const EvaluationStatusControl = ({
  value = "PENDING",
  onChange,

  disabled = false,
  readOnly = false,

  mode = "select",
  label = "Evaluation Status",
  description,

  showDescription = true,
  showStatusBadge = false,

  className = "",
}) => {
  const selectedStatus =
    getStatusConfig(value);

  const isDisabled =
    disabled || readOnly;

  const handleChange = (event) => {
    const nextStatus =
      event.target.value;

    onChange?.(nextStatus);
  };

  return (
    <div
      className={[
        "w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Label */}
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="evaluation-status-control"
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        {showStatusBadge && (
          <StatusBadge
            status={value}
          />
        )}
      </div>

      {/* Select */}
      {mode === "select" && (
        <select
          id="evaluation-status-control"
          value={value}
          onChange={handleChange}
          disabled={isDisabled}
          className={[
            "mt-2 w-full rounded-lg border",
            "bg-white px-3 py-2.5",
            "text-sm text-gray-800",
            "outline-none transition",
            "focus:border-blue-500",
            "focus:ring-2 focus:ring-blue-100",
            "disabled:cursor-not-allowed",
            "disabled:bg-gray-50",
            "disabled:text-gray-500",
          ].join(" ")}
        >
          {EVALUATION_STATUSES.map(
            (status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ),
          )}
        </select>
      )}

      {/* Button Group */}
      {mode === "buttons" && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {EVALUATION_STATUSES.map(
            (status) => {
              const isSelected =
                status.value === value;

              return (
                <button
                  key={status.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() =>
                    onChange?.(
                      status.value,
                    )
                  }
                  className={[
                    "rounded-lg border px-3 py-2.5",
                    "text-left transition",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-60",
                    isSelected
                      ? status.color
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <StatusDot
                      status={
                        status.value
                      }
                      selected={
                        isSelected
                      }
                    />

                    <span className="text-sm font-medium">
                      {status.label}
                    </span>

                    {isSelected && (
                      <CheckIcon />
                    )}
                  </div>

                  {showDescription && (
                    <p className="mt-1 pl-5 text-xs opacity-70">
                      {
                        status.description
                      }
                    </p>
                  )}
                </button>
              );
            },
          )}
        </div>
      )}

      {/* Selected Status Description */}
      {showDescription &&
        mode === "select" &&
        selectedStatus && (
          <p className="mt-2 text-xs text-gray-400">
            {description ||
              selectedStatus.description}
          </p>
        )}

      {/* Read-only status */}
      {readOnly && (
        <div className="mt-2">
          <StatusBadge
            status={value}
          />
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

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
        "whitespace-nowrap rounded-full",
        "border px-2.5 py-1",
        "text-xs font-medium",
        config.color,
      ].join(" ")}
    >
      <StatusDot
        status={status}
      />

      {config.label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Status Dot                                                                 */
/* -------------------------------------------------------------------------- */

const StatusDot = ({
  status,
  selected = false,
}) => {
  const colors = {
    PENDING:
      "bg-yellow-500",
    EVALUATED:
      "bg-green-500",
    REVIEW_REQUIRED:
      "bg-orange-500",
    AUTO_EVALUATED:
      "bg-blue-500",
    NOT_ATTEMPTED:
      "bg-gray-400",
  };

  return (
    <span
      className={[
        "h-2 w-2 shrink-0 rounded-full",
        colors[status] ||
          "bg-gray-400",
        selected
          ? "ring-2 ring-white"
          : "",
      ].join(" ")}
      aria-hidden="true"
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Check Icon                                                                 */
/* -------------------------------------------------------------------------- */

const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="ml-auto h-4 w-4"
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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getStatusConfig = (
  status,
) => {
  return EVALUATION_STATUSES.find(
    (item) =>
      item.value === status,
  );
};

export {
  EVALUATION_STATUSES,
};

export default EvaluationStatusControl;
