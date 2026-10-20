// ResultDetailFilters.jsx

import React from "react";

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const EVALUATION_STATUSES = [
  "NOT_ATTEMPTED",
  "AUTO_EVALUATED",
  "PENDING",
  "EVALUATED",
  "REVIEW_REQUIRED",
];

const ResultDetailFilters = ({
  filters,

  // Filter options
  results = [],
  subjects = [],
  chapters = [],
  topics = [],

  // Callbacks
  onFilterChange,
  onReset,

  // Optional
  disabled = false,
}) => {
  const {
    result = "",
    subject = "",
    chapter = "",
    topic = "",
    questionType = "",
    evaluationStatus = "",
  } = filters || {};

  return (
    <div className="rounded-lg border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Filters
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Filter result details by result, subject,
            question type, and evaluation status.
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="text-sm font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      {/* Filters */}
      <div className="p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Result */}
          <FilterField label="Result">
            <select
              value={result}
              onChange={(event) =>
                onFilterChange(
                  "result",
                  event.target.value,
                )
              }
              disabled={disabled}
              className={inputClass()}
            >
              <option value="">
                All Results
              </option>

              {results.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {getResultLabel(item)}
                </option>
              ))}
            </select>
          </FilterField>

          {/* Subject */}
          <FilterField label="Subject">
            <select
              value={subject}
              onChange={(event) =>
                onFilterChange(
                  "subject",
                  event.target.value,
                )
              }
              disabled={disabled}
              className={inputClass()}
            >
              <option value="">
                All Subjects
              </option>

              {subjects.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {getDisplayName(item)}
                </option>
              ))}
            </select>
          </FilterField>

          {/* Chapter */}
          <FilterField label="Chapter">
            <select
              value={chapter}
              onChange={(event) =>
                onFilterChange(
                  "chapter",
                  event.target.value,
                )
              }
              disabled={disabled}
              className={inputClass()}
            >
              <option value="">
                All Chapters
              </option>

              {chapters.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {getDisplayName(item)}
                </option>
              ))}
            </select>
          </FilterField>

          {/* Topic */}
          <FilterField label="Topic">
            <select
              value={topic}
              onChange={(event) =>
                onFilterChange(
                  "topic",
                  event.target.value,
                )
              }
              disabled={disabled}
              className={inputClass()}
            >
              <option value="">
                All Topics
              </option>

              {topics.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {getDisplayName(item)}
                </option>
              ))}
            </select>
          </FilterField>

          {/* Question Type */}
          <FilterField label="Question Type">
            <select
              value={questionType}
              onChange={(event) =>
                onFilterChange(
                  "questionType",
                  event.target.value,
                )
              }
              disabled={disabled}
              className={inputClass()}
            >
              <option value="">
                All Types
              </option>

              {QUESTION_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {formatEnumLabel(type)}
                </option>
              ))}
            </select>
          </FilterField>

          {/* Evaluation Status */}
          <FilterField label="Evaluation Status">
            <select
              value={evaluationStatus}
              onChange={(event) =>
                onFilterChange(
                  "evaluationStatus",
                  event.target.value,
                )
              }
              disabled={disabled}
              className={inputClass()}
            >
              <option value="">
                All Statuses
              </option>

              {EVALUATION_STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {formatEnumLabel(status)}
                  </option>
                ),
              )}
            </select>
          </FilterField>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Filter Field                                                               */
/* -------------------------------------------------------------------------- */

const FilterField = ({
  label,
  children,
}) => {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </label>

      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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
    value.fullName ||
    value.label ||
    value._id ||
    ""
  );
};

const getResultLabel = (result) => {
  if (!result) {
    return "";
  }

  if (result.name) {
    return result.name;
  }

  if (result.student?.name) {
    return `${result.student.name} - ${getResultIdentifier(result)}`;
  }

  if (result.student?.fullName) {
    return `${result.student.fullName} - ${getResultIdentifier(result)}`;
  }

  return getResultIdentifier(result);
};

const getResultIdentifier = (result) => {
  return (
    result.resultNumber ||
    result.resultCode ||
    result._id ||
    ""
  );
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

const inputClass = () => {
  return [
    "w-full rounded-md border border-gray-300",
    "bg-white px-3 py-2 text-sm text-gray-900",
    "outline-none transition",
    "focus:border-blue-500",
    "focus:ring-2 focus:ring-blue-100",
    "disabled:cursor-not-allowed",
    "disabled:bg-gray-100",
    "disabled:text-gray-500",
  ].join(" ");
};

export default ResultDetailFilters;
