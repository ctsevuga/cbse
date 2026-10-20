import React from "react";

const QUESTION_TYPE_CONFIG = {
  MCQ: {
    label: "MCQ",
    shortLabel: "MCQ",
    description: "Multiple Choice Question",
    color:
      "text-purple-700 bg-purple-50 border-purple-200",
    dot: "bg-purple-500",
    icon: "A",
  },

  DESCRIPTIVE: {
    label: "Descriptive",
    shortLabel: "Desc.",
    description: "Descriptive / written answer",
    color:
      "text-blue-700 bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
    icon: "D",
  },

  ASSERTION_REASON: {
    label: "Assertion & Reason",
    shortLabel: "A&R",
    description: "Assertion and Reason question",
    color:
      "text-indigo-700 bg-indigo-50 border-indigo-200",
    dot: "bg-indigo-500",
    icon: "A",
  },

  CASE_STUDY: {
    label: "Case Study",
    shortLabel: "Case",
    description: "Case study based question",
    color:
      "text-orange-700 bg-orange-50 border-orange-200",
    dot: "bg-orange-500",
    icon: "C",
  },

  FILL_BLANK: {
    label: "Fill in the Blank",
    shortLabel: "Fill Blank",
    description: "Fill in the blank question",
    color:
      "text-teal-700 bg-teal-50 border-teal-200",
    dot: "bg-teal-500",
    icon: "F",
  },

  MATCHING: {
    label: "Matching",
    shortLabel: "Match",
    description: "Matching question",
    color:
      "text-pink-700 bg-pink-50 border-pink-200",
    dot: "bg-pink-500",
    icon: "M",
  },

  TRUE_FALSE: {
    label: "True / False",
    shortLabel: "T/F",
    description: "True or False question",
    color:
      "text-green-700 bg-green-50 border-green-200",
    dot: "bg-green-500",
    icon: "T",
  },
};

const DEFAULT_CONFIG = {
  label: "Unknown",
  shortLabel: "Unknown",
  description: "Unknown question type",
  color:
    "text-gray-600 bg-gray-50 border-gray-200",
  dot: "bg-gray-400",
  icon: "?",
};

const QuestionTypeBadge = ({
  questionType,

  size = "md",

  variant = "badge",

  showIcon = false,
  showDot = true,

  label,

  short = false,

  showDescription = false,

  className = "",

  onClick,
}) => {
  const normalizedType =
    normalizeQuestionType(questionType);

  const config =
    QUESTION_TYPE_CONFIG[
      normalizedType
    ] || DEFAULT_CONFIG;

  const displayLabel =
    label ||
    (short
      ? config.shortLabel
      : config.label);

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
        title={
          showDescription
            ? config.description
            : undefined
        }
        className={[
          "inline-flex items-center gap-1",
          "font-medium",
          getTextColor(normalizedType),
          sizeClasses[size].text,
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
          "rounded-full border font-medium",
          config.color,
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

  return (
    <span
      title={
        showDescription
          ? config.description
          : undefined
      }
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-md border font-medium",
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
    badge: "px-2 py-0.5 text-[9px]",
    compact: "px-2 py-0.5 text-[9px]",
    text: "text-[10px]",
    dotWrapper: "p-0.5",
    dot: "h-1.5 w-1.5",
    icon: "text-[9px]",
  },

  md: {
    badge: "px-2.5 py-1 text-[10px]",
    compact: "px-2.5 py-1 text-[10px]",
    text: "text-xs",
    dotWrapper: "p-0.5",
    dot: "h-2 w-2",
    icon: "text-[10px]",
  },

  lg: {
    badge: "px-3 py-1.5 text-xs",
    compact: "px-3 py-1.5 text-xs",
    text: "text-sm",
    dotWrapper: "p-0.5",
    dot: "h-2.5 w-2.5",
    icon: "text-xs",
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const normalizeQuestionType = (
  questionType,
) => {
  if (!questionType) {
    return "";
  }

  return String(questionType)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};

const getTextColor = (questionType) => {
  switch (questionType) {
    case "MCQ":
      return "text-purple-700";

    case "DESCRIPTIVE":
      return "text-blue-700";

    case "ASSERTION_REASON":
      return "text-indigo-700";

    case "CASE_STUDY":
      return "text-orange-700";

    case "FILL_BLANK":
      return "text-teal-700";

    case "MATCHING":
      return "text-pink-700";

    case "TRUE_FALSE":
      return "text-green-700";

    default:
      return "text-gray-600";
  }
};

/* -------------------------------------------------------------------------- */
/* Static helpers                                                             */
/* -------------------------------------------------------------------------- */

export const getQuestionTypeConfig = (
  questionType,
) => {
  const normalizedType =
    normalizeQuestionType(questionType);

  return (
    QUESTION_TYPE_CONFIG[
      normalizedType
    ] || DEFAULT_CONFIG
  );
};

export const getQuestionTypeLabel = (
  questionType,
) => {
  return getQuestionTypeConfig(questionType)
    .label;
};

export const getQuestionTypeShortLabel = (
  questionType,
) => {
  return getQuestionTypeConfig(questionType)
    .shortLabel;
};

export const isObjectiveQuestionType = (
  questionType,
) => {
  const normalizedType =
    normalizeQuestionType(questionType);

  return [
    "MCQ",
    "FILL_BLANK",
    "MATCHING",
    "TRUE_FALSE",
  ].includes(normalizedType);
};

export const isSubjectiveQuestionType = (
  questionType,
) => {
  const normalizedType =
    normalizeQuestionType(questionType);

  return [
    "DESCRIPTIVE",
    "ASSERTION_REASON",
    "CASE_STUDY",
  ].includes(normalizedType);
};

export default QuestionTypeBadge;
