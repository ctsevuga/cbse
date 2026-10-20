import React from "react";

const EVALUATION_STATUS_CONFIG = {
  NOT_ATTEMPTED: {
    label: "Not Attempted",
    shortLabel: "Not Attempted",
    description:
      "The student did not attempt this question.",
    color:
      "text-gray-600 bg-gray-50 border-gray-200",
    dot: "bg-gray-400",
    icon: "○",
  },

  AUTO_EVALUATED: {
    label: "Auto Evaluated",
    shortLabel: "Auto",
    description:
      "The question was evaluated automatically.",
    color:
      "text-blue-700 bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
    icon: "✓",
  },

  PENDING: {
    label: "Pending",
    shortLabel: "Pending",
    description:
      "The question is waiting for evaluation.",
    color:
      "text-yellow-700 bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-500",
    icon: "!",
  },

  EVALUATED: {
    label: "Evaluated",
    shortLabel: "Evaluated",
    description:
      "The question has been evaluated by a teacher.",
    color:
      "text-green-700 bg-green-50 border-green-200",
    dot: "bg-green-500",
    icon: "✓",
  },

  REVIEW_REQUIRED: {
    label: "Review Required",
    shortLabel: "Review",
    description:
      "The evaluation requires additional review.",
    color:
      "text-orange-700 bg-orange-50 border-orange-200",
    dot: "bg-orange-500",
    icon: "!",
  },
};

const DEFAULT_STATUS = {
  label: "Unknown",
  shortLabel: "Unknown",
  description:
    "The evaluation status is unavailable.",
  color:
    "text-gray-600 bg-gray-50 border-gray-200",
  dot: "bg-gray-400",
  icon: "?",
};

const EvaluationStatusBadge = ({
  status,

  size = "md",

  variant = "badge",

  showIcon = false,
  showDot = true,
  showDescription = false,

  label,

  className = "",

  onClick,
}) => {
  const normalizedStatus =
    normalizeStatus(status);

  const config =
    EVALUATION_STATUS_CONFIG[
      normalizedStatus
    ] || DEFAULT_STATUS;

  const displayLabel =
    label ||
    config.label;

  const clickable =
    typeof onClick === "function";

  if (variant === "dot") {
    return (
      <span
        title={config.label}
        className={[
          "inline-flex items-center",
          sizeClasses[size].dotWrapper,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={[
            "rounded-full",
            config.dot,
            sizeClasses[size].dot,
          ].join(" ")}
        />
      </span>
    );
  }

  if (variant === "text") {
    return (
      <span
        className={[
          "inline-flex items-center gap-1",
          "font-medium",
          configTextColor(normalizedStatus),
          sizeClasses[size].text,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {showDot && (
          <span
            className={[
              "rounded-full",
              config.dot,
              sizeClasses[size].dot,
            ].join(" ")}
          />
        )}

        {showIcon && (
          <span
            className={[
              "font-bold leading-none",
              sizeClasses[size].icon,
            ].join(" ")}
          >
            {config.icon}
          </span>
        )}

        {displayLabel}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span
        title={
          showDescription
            ? config.description
            : undefined
        }
        className={[
          "inline-flex items-center gap-1.5",
          "font-medium",
          config.color,
          "border rounded-full",
          sizeClasses[size].compact,
          clickable
            ? "cursor-pointer hover:opacity-80"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={onClick}
        role={
          clickable
            ? "button"
            : undefined
        }
      >
        {showDot && (
          <span
            className={[
              "rounded-full",
              config.dot,
              sizeClasses[size].dot,
            ].join(" ")}
          />
        )}

        {displayLabel}
      </span>
    );
  }

  return (
    <span
      title={
        showDescription
          ? config.description
          : undefined
      }
      className={[
        "inline-flex items-center gap-1.5",
        "border rounded-md font-medium",
        config.color,
        sizeClasses[size].badge,
        clickable
          ? "cursor-pointer hover:opacity-80"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      role={
        clickable
          ? "button"
          : undefined
      }
    >
      {showDot && (
        <span
          className={[
            "rounded-full",
            config.dot,
            sizeClasses[size].dot,
          ].join(" ")}
        />
      )}

      {showIcon && (
        <span
          className={[
            "font-bold leading-none",
            sizeClasses[size].icon,
          ].join(" ")}
        >
          {config.icon}
        </span>
      )}

      <span>{displayLabel}</span>
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Size                                                                       */
/* -------------------------------------------------------------------------- */

const sizeClasses = {
  sm: {
    badge:
      "px-2 py-0.5 text-[9px]",
    compact:
      "px-2 py-0.5 text-[9px]",
    text: "text-[10px]",
    dotWrapper: "p-0.5",
    dot: "h-1.5 w-1.5",
    icon: "text-[9px]",
  },

  md: {
    badge:
      "px-2.5 py-1 text-[10px]",
    compact:
      "px-2.5 py-1 text-[10px]",
    text: "text-xs",
    dotWrapper: "p-0.5",
    dot: "h-2 w-2",
    icon: "text-[10px]",
  },

  lg: {
    badge:
      "px-3 py-1.5 text-xs",
    compact:
      "px-3 py-1.5 text-xs",
    text: "text-sm",
    dotWrapper: "p-0.5",
    dot: "h-2.5 w-2.5",
    icon: "text-xs",
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const normalizeStatus = (status) => {
  if (!status) {
    return "";
  }

  return String(status)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};

const configTextColor = (status) => {
  switch (status) {
    case "EVALUATED":
      return "text-green-700";

    case "AUTO_EVALUATED":
      return "text-blue-700";

    case "PENDING":
      return "text-yellow-700";

    case "REVIEW_REQUIRED":
      return "text-orange-700";

    case "NOT_ATTEMPTED":
      return "text-gray-600";

    default:
      return "text-gray-600";
  }
};

/* -------------------------------------------------------------------------- */
/* Static helpers                                                             */
/* -------------------------------------------------------------------------- */

export const getEvaluationStatusConfig = (
  status,
) => {
  const normalizedStatus =
    normalizeStatus(status);

  return (
    EVALUATION_STATUS_CONFIG[
      normalizedStatus
    ] || DEFAULT_STATUS
  );
};

export const getEvaluationStatusLabel = (
  status,
) => {
  return getEvaluationStatusConfig(status)
    .label;
};

export const isEvaluationComplete = (
  status,
) => {
  const normalizedStatus =
    normalizeStatus(status);

  return [
    "EVALUATED",
    "AUTO_EVALUATED",
  ].includes(normalizedStatus);
};

export const requiresEvaluation = (
  status,
) => {
  const normalizedStatus =
    normalizeStatus(status);

  return [
    "PENDING",
    "REVIEW_REQUIRED",
  ].includes(normalizedStatus);
};

export default EvaluationStatusBadge;
