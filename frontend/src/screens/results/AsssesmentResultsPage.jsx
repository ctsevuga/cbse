import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  useGetResultsByAssessmentQuery,
} from "../../slices/resultApiSlice";

import ResultTable from "./components/ResultTable";
import PublishResultAction from "./actions/PublishResultAction";
import WithdrawResultAction from "./actions/WithdrawResultAction";

const AssessmentResultsPage = () => {
  const { assessmentId } = useParams();

  const {
    data: results = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetResultsByAssessmentQuery({
    assessmentId,
  });

  const assessment =
    results?.[0]?.assessment;

  const handlePublish = (resultId) => {
    // ResultTable provides the action button.
    // Publishing is handled by the action component
    // or can be connected here when using custom actions.
    console.log("Publish result:", resultId);
  };

  const handleWithdraw = (resultId) => {
    console.log("Withdraw result:", resultId);
  };

  const handleDelete = (resultId) => {
    console.log("Delete result:", resultId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading assessment results...
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
              Unable to load assessment results
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

  const totalStudents = results.length;

  const publishedCount = results.filter(
    (result) =>
      result.status === "PUBLISHED",
  ).length;

  const evaluatedCount = results.filter(
    (result) =>
      result.status === "EVALUATED",
  ).length;

  const pendingCount = results.filter(
    (result) =>
      result.status ===
      "PENDING_EVALUATION",
  ).length;

  const withdrawnCount = results.filter(
    (result) =>
      result.status === "WITHDRAWN",
  ).length;

  const averagePercentage =
    totalStudents > 0
      ? (
          results.reduce(
            (sum, result) =>
              sum +
              (Number(result.percentage) || 0),
            0,
          ) / totalStudents
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
                Assessment Results
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {assessment?.title ||
                  "Assessment"}
              </p>

              {assessment?.subject?.name && (
                <p className="mt-1 text-sm text-gray-500">
                  Subject:{" "}
                  {assessment.subject.name}
                </p>
              )}
            </div>

            {assessment && (
              <div className="rounded-lg border bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total Marks
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {assessment.totalMarks ??
                    "-"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            label="Students"
            value={totalStudents}
            color="gray"
          />

          <SummaryCard
            label="Average"
            value={`${averagePercentage}%`}
            color="blue"
          />

          <SummaryCard
            label="Evaluated"
            value={evaluatedCount}
            color="indigo"
          />

          <SummaryCard
            label="Published"
            value={publishedCount}
            color="green"
          />

          <SummaryCard
            label="Pending"
            value={pendingCount}
            color="yellow"
          />
        </div>

        {/* Withdrawn information */}
        {withdrawnCount > 0 && (
          <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm text-orange-800">
              {withdrawnCount} result
              {withdrawnCount !== 1
                ? "s have"
                : " has"}{" "}
              been withdrawn.
            </p>
          </div>
        )}

        {/* Results Table */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Student Results
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Results are sorted by percentage and
              obtained marks.
            </p>
          </div>

          <div className="p-4">
            <ResultTable
              results={results}
              onPublish={handlePublish}
              onWithdraw={handleWithdraw}
              onDelete={handleDelete}
            />
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
    indigo: "text-indigo-600",
    green: "text-green-600",
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

export default AssessmentResultsPage;
