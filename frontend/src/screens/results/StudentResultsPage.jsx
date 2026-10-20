import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  useGetResultsByStudentQuery,
} from "../../slices/resultApiSlice";

import ResultTable from "./components/ResultTable";

const StudentResultsPage = () => {
  const { studentId } = useParams();

  const {
    data: results = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetResultsByStudentQuery({
    studentId,
  });

  const student =
    results?.[0]?.student;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading student results...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800">
              Unable to load student results
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error?.data?.message ||
                error?.error ||
                "An error occurred while loading the results."}
            </p>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={refetch}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Retry
              </button>

              <Link
                to="/results"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Results
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalResults = results.length;

  const publishedResults = results.filter(
    (result) =>
      result.status === "PUBLISHED",
  );

  const evaluatedResults = results.filter(
    (result) =>
      result.status === "EVALUATED",
  );

  const pendingResults = results.filter(
    (result) =>
      result.status ===
      "PENDING_EVALUATION",
  );

  const withdrawnResults = results.filter(
    (result) =>
      result.status === "WITHDRAWN",
  );

  const averagePercentage =
    totalResults > 0
      ? (
          results.reduce(
            (sum, result) =>
              sum +
              (Number(result.percentage) || 0),
            0,
          ) / totalResults
        ).toFixed(2)
      : "0.00";

  const bestPercentage =
    totalResults > 0
      ? Math.max(
          ...results.map(
            (result) =>
              Number(result.percentage) || 0,
          ),
        ).toFixed(2)
      : "0.00";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2">
            <Link
              to="/results"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              ← Back to Results
            </Link>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Student Results
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Complete assessment result history
              </p>

              {student && (
                <div className="mt-3">
                  <p className="text-base font-medium text-gray-900">
                    {student.user?.name ||
                      "Student"}
                  </p>

                  {student.admissionNumber && (
                    <p className="mt-1 text-sm text-gray-500">
                      Admission No:{" "}
                      {student.admissionNumber}
                    </p>
                  )}

                  {student.class?.name && (
                    <p className="mt-1 text-sm text-gray-500">
                      Class:{" "}
                      {student.class.name}
                      {student.section?.name
                        ? ` - ${student.section.name}`
                        : ""}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            label="Total Results"
            value={totalResults}
            color="gray"
          />

          <SummaryCard
            label="Average"
            value={`${averagePercentage}%`}
            color="blue"
          />

          <SummaryCard
            label="Best Score"
            value={`${bestPercentage}%`}
            color="green"
          />

          <SummaryCard
            label="Published"
            value={publishedResults.length}
            color="indigo"
          />

          <SummaryCard
            label="Pending"
            value={pendingResults.length}
            color="yellow"
          />
        </div>

        {/* Status Information */}
        {(evaluatedResults.length > 0 ||
          withdrawnResults.length > 0) && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {evaluatedResults.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  {evaluatedResults.length} result
                  {evaluatedResults.length !== 1
                    ? "s are"
                    : " is"}{" "}
                  evaluated and ready for
                  publishing.
                </p>
              </div>
            )}

            {withdrawnResults.length > 0 && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm text-orange-800">
                  {withdrawnResults.length} result
                  {withdrawnResults.length !== 1
                    ? "s have"
                    : " has"}{" "}
                  been withdrawn.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Assessment Results
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Results are listed from newest to
              oldest.
            </p>
          </div>

          <div className="p-4">
            {results.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-gray-700">
                  No results found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  This student does not have any
                  results yet.
                </p>
              </div>
            ) : (
              <ResultTable
                results={results}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  color = "gray",
}) => {
  const colorClasses = {
    gray: "text-gray-900",
    blue: "text-blue-600",
    green: "text-green-600",
    indigo: "text-indigo-600",
    yellow: "text-yellow-600",
  };

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          colorClasses[color] ||
          colorClasses.gray
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default StudentResultsPage;
