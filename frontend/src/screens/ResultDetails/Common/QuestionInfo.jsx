import React from "react";
import QuestionTypeBadge from "./QuestionTypeBadge";

const QuestionInfo = ({
  question,
  assessmentQuestion,

  questionNumber,
  title,
  text,
  questionText,
  questionType,

  size = "md",
  variant = "default",

  showNumber = true,
  showType = true,
  showMarks = false,
  maximumMarks,

  truncate = false,
  maxLines = 2,

  clickable = false,
  onClick,

  className = "",
}) => {
  const questionData = normalizeQuestion({
    question,
    assessmentQuestion,
    questionNumber,
    title,
    text,
    questionText,
    questionType,
    maximumMarks,
  });

  const displayText =
    questionData.text ||
    questionData.title ||
    "Question";

  if (variant === "compact") {
    return (
      <CompactQuestionInfo
        question={questionData}
        displayText={displayText}
        size={size}
        showNumber={showNumber}
        showType={showType}
        clickable={clickable}
        onClick={onClick}
        className={className}
      />
    );
  }

  if (variant === "card") {
    return (
      <QuestionInfoCard
        question={questionData}
        displayText={displayText}
        size={size}
        showNumber={showNumber}
        showType={showType}
        showMarks={showMarks}
        clickable={clickable}
        onClick={onClick}
        className={className}
      />
    );
  }

  return (
    <DefaultQuestionInfo
      question={questionData}
      displayText={displayText}
      size={size}
      showNumber={showNumber}
      showType={showType}
      showMarks={showMarks}
      truncate={truncate}
      maxLines={maxLines}
      clickable={clickable}
      onClick={onClick}
      className={className}
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Default                                                                    */
/* -------------------------------------------------------------------------- */

const DefaultQuestionInfo = ({
  question,
  displayText,
  size,
  showNumber,
  showType,
  showMarks,
  truncate,
  maxLines,
  clickable,
  onClick,
  className,
}) => {
  return (
    <div
      className={[
        "min-w-0",
        clickable
          ? "cursor-pointer"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={
        clickable
          ? onClick
          : undefined
      }
      role={
        clickable
          ? "button"
          : undefined
      }
    >
      <div className="flex min-w-0 items-start gap-2">
        {showNumber &&
          question.questionNumber != null && (
            <QuestionNumber
              number={question.questionNumber}
              size={size}
            />
          )}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p
              className={[
                "min-w-0 font-medium text-gray-800",
                sizeClasses[size].text,
                truncate
                  ? `line-clamp-${Math.min(
                      Math.max(maxLines, 1),
                      6,
                    )}`
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              title={
                truncate
                  ? displayText
                  : undefined
              }
            >
              {displayText}
            </p>

            {showType &&
              question.questionType && (
                <QuestionTypeBadge
                  questionType={
                    question.questionType
                  }
                  size="sm"
                  variant="compact"
                />
              )}
          </div>

          {showMarks &&
            question.maximumMarks != null && (
              <p
                className={[
                  "mt-1 text-gray-400",
                  sizeClasses[size].secondary,
                ].join(" ")}
              >
                {question.maximumMarks}{" "}
                {question.maximumMarks === 1
                  ? "mark"
                  : "marks"}
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Compact                                                                    */
/* -------------------------------------------------------------------------- */

const CompactQuestionInfo = ({
  question,
  displayText,
  size,
  showNumber,
  showType,
  clickable,
  onClick,
  className,
}) => {
  return (
    <div
      className={[
        "inline-flex min-w-0 items-center gap-2",
        clickable
          ? "cursor-pointer"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={
        clickable
          ? onClick
          : undefined
      }
      role={
        clickable
          ? "button"
          : undefined
      }
    >
      {showNumber &&
        question.questionNumber != null && (
          <span
            className={[
              "shrink-0 font-semibold text-gray-500",
              sizeClasses[size].number,
            ].join(" ")}
          >
            Q{question.questionNumber}
          </span>
        )}

      <span
        className={[
          "min-w-0 truncate font-medium text-gray-700",
          sizeClasses[size].text,
        ].join(" ")}
        title={displayText}
      >
        {displayText}
      </span>

      {showType &&
        question.questionType && (
          <QuestionTypeBadge
            questionType={
              question.questionType
            }
            size="sm"
            variant="compact"
            short
          />
        )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

const QuestionInfoCard = ({
  question,
  displayText,
  size,
  showNumber,
  showType,
  showMarks,
  clickable,
  onClick,
  className,
}) => {
  return (
    <div
      className={[
        "rounded-xl border bg-white p-4 shadow-sm",
        clickable
          ? "cursor-pointer transition hover:border-blue-200 hover:shadow"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={
        clickable
          ? onClick
          : undefined
      }
      role={
        clickable
          ? "button"
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        {showNumber &&
          question.questionNumber != null && (
            <QuestionNumber
              number={question.questionNumber}
              size={
                size === "sm"
                  ? "md"
                  : size
              }
            />
          )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {showType &&
              question.questionType && (
                <QuestionTypeBadge
                  questionType={
                    question.questionType
                  }
                  size="sm"
                  variant="compact"
                />
              )}

            {showMarks &&
              question.maximumMarks != null && (
                <span
                  className={[
                    "text-gray-400",
                    sizeClasses[size].secondary,
                  ].join(" ")}
                >
                  {question.maximumMarks}{" "}
                  {question.maximumMarks === 1
                    ? "mark"
                    : "marks"}
                </span>
              )}
          </div>

          <p
            className={[
              "mt-2 text-gray-800",
              sizeClasses[size].text,
            ].join(" ")}
          >
            {displayText}
          </p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Question Number                                                            */
/* -------------------------------------------------------------------------- */

const QuestionNumber = ({
  number,
  size = "md",
}) => {
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center rounded-md",
        "bg-gray-100 font-semibold text-gray-600",
        questionNumberSizes[size],
      ].join(" ")}
    >
      Q{number}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Normalization                                                              */
/* -------------------------------------------------------------------------- */

const normalizeQuestion = ({
  question,
  assessmentQuestion,
  questionNumber,
  title,
  text,
  questionText,
  questionType,
  maximumMarks,
}) => {
  const source =
    question &&
    typeof question === "object"
      ? question
      : {};

  const assessment =
    assessmentQuestion &&
    typeof assessmentQuestion ===
      "object"
      ? assessmentQuestion
      : {};

  return {
    id:
      source._id ||
      source.id ||
      assessment._id ||
      assessment.id ||
      (typeof question === "string"
        ? question
        : null),

    assessmentQuestionId:
      assessment._id ||
      assessment.id ||
      (typeof assessmentQuestion ===
      "string"
        ? assessmentQuestion
        : null),

    questionNumber:
      questionNumber ??
      assessment.questionNumber ??
      assessment.order ??
      assessment.sequence ??
      source.questionNumber ??
      source.number,

    title:
      title ||
      source.title ||
      source.questionTitle ||
      assessment.title,

    text:
      text ||
      questionText ||
      source.text ||
      source.questionText ||
      source.content ||
      source.statement ||
      assessment.text ||
      assessment.questionText,

    questionType:
      questionType ||
      assessment.questionType ||
      source.questionType ||
      source.type,

    maximumMarks:
      maximumMarks ??
      assessment.maximumMarks ??
      assessment.marks ??
      source.maximumMarks ??
      source.marks,
  };
};

/* -------------------------------------------------------------------------- */
/* Sizes                                                                      */
/* -------------------------------------------------------------------------- */

const sizeClasses = {
  sm: {
    text: "text-xs",
    number: "text-[9px]",
    secondary: "text-[9px]",
  },

  md: {
    text: "text-sm",
    number: "text-[10px]",
    secondary: "text-[10px]",
  },

  lg: {
    text: "text-base",
    number: "text-xs",
    secondary: "text-xs",
  },
};

const questionNumberSizes = {
  sm: "h-6 min-w-6 px-1 text-[9px]",
  md: "h-7 min-w-7 px-1.5 text-[10px]",
  lg: "h-8 min-w-8 px-2 text-xs",
};

export default QuestionInfo;
