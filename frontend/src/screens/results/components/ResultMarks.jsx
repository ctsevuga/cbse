import React from "react";

const ResultMarks = ({
  totalMarks = 0,
  obtainedMarks = 0,
  percentage = 0,
  className = "",
}) => {
  const safeTotalMarks = Number(totalMarks) || 0;
  const safeObtainedMarks = Number(obtainedMarks) || 0;
  const safePercentage = Math.min(
    Math.max(Number(percentage) || 0, 0),
    100,
  );

  return (
    <div
      className={`rounded-lg border bg-white p-6 shadow-sm ${className}`}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Marks
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Marks obtained in this assessment
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Obtained Marks */}
        <MarksCard
          label="Obtained Marks"
          value={safeObtainedMarks}
          suffix={`/ ${safeTotalMarks}`}
          valueClassName="text-blue-600"
        />

        {/* Total Marks */}
        <MarksCard
          label="Total Marks"
          value={safeTotalMarks}
          valueClassName="text-gray-900"
        />

        {/* Percentage */}
        <MarksCard
          label="Percentage"
          value={safePercentage}
          suffix="%"
          valueClassName="text-green-600"
        />
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Performance
          </span>

          <span className="text-sm font-semibold text-gray-900">
            {safePercentage}%
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${safePercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const MarksCard = ({
  label,
  value,
  suffix,
  valueClassName = "text-gray-900",
}) => {
  return (
    <div className="rounded-lg bg-gray-50 p-5">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span
          className={`text-2xl font-bold ${valueClassName}`}
        >
          {value}
        </span>

        {suffix && (
          <span className="text-sm font-medium text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResultMarks;
