
import React from "react";

import ResultStatusBadge from "./ResultStatusBadge";

const ResultSummary = ({
  result,
  className = "",
}) => {
  if (!result) {
    return (
      <div
        className={`rounded-lg border bg-white p-6 shadow-sm ${className}`}
      >
        <p className="text-sm text-gray-500">
          Result information is not available.
        </p>
      </div>
    );
  }

  const {
    totalMarks = 0,
    obtainedMarks = 0,
    percentage = 0,
    status,
  } = result;

  return (
    <div
      className={`rounded-lg border bg-white shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Result Summary
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Overall performance for this assessment
          </p>
        </div>

        {status && (
          <ResultStatusBadge status={status} />
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {/* Total Marks */}
        <SummaryItem
          label="Total Marks"
          value={totalMarks}
          valueClassName="text-gray-900"
        />

        {/* Obtained Marks */}
        <SummaryItem
          label="Obtained Marks"
          value={obtainedMarks}
          valueClassName="text-blue-600"
        />

        {/* Percentage */}
        <SummaryItem
          label="Percentage"
          value={`${percentage}%`}
          valueClassName="text-green-600"
        />
      </div>

      {/* Progress */}
      <div className="border-t px-6 py-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Performance
          </span>

          <span className="text-sm font-semibold text-gray-900">
            {percentage}%
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${Math.min(
                Math.max(Number(percentage) || 0, 0),
                100,
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({
  label,
  value,
  valueClassName = "text-gray-900",
}) => {
  return (
    <div className="px-6 py-5">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
};

export default ResultSummary;
