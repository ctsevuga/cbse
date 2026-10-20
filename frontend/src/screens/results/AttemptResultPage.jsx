import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  useGetResultByAttemptQuery,
} from "../../slices/resultApiSlice";

import ResultDetails from "./components/ResultDetails";

const AttemptResultPage = () => {
  const { attemptId } = useParams();

  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetResultByAttemptQuery(attemptId);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            Loading attempt result...
          </p>
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800">
            Unable to load attempt result
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error?.data?.message ||
              error?.error ||
              "An error occurred while loading the result."}
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
      </PageContainer>
    );
  }

  if (!result) {
    return (
      <PageContainer>
        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Result Not Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            No result exists for this attempt.
          </p>

          <Link
            to="/results"
            className="mt-5 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Results
          </Link>
        </div>
      </PageContainer>
    );
  }

  const assessment =
    result.assessment;

  const student =
    result.student;

  const attempt =
    result.attempt;

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/results"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Results
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Attempt Result
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Result generated from this student
            attempt
          </p>
        </div>
      </div>

      {/* Attempt Header */}
      <div className="mb-6 rounded-lg border bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
          <InfoItem
            label="Assessment"
            value={
              assessment?.title || "-"
            }
          />

          <InfoItem
            label="Student"
            value={
              student?.user?.name ||
              "-"
            }
          />

          <InfoItem
            label="Attempt Number"
            value={
              attempt?.attemptNumber ?? "-"
            }
          />

          <InfoItem
            label="Attempt Status"
            value={
              attempt?.status || "-"
            }
          />

          <InfoItem
            label="Submitted At"
            value={formatDate(
              attempt?.submittedAt,
            )}
          />

          <InfoItem
            label="Result Status"
            value={
              result.status || "-"
            }
          />
        </div>
      </div>

      {/* Result Details */}
      <ResultDetails
        result={result}
        showStudent={true}
        showAssessment={true}
        showAttempt={true}
        showPublication={true}
      />
    </PageContainer>
  );
};

const PageContainer = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
};

const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
};

export default AttemptResultPage;
