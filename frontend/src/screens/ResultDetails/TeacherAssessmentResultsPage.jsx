
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useGetMyAssessmentsQuery,
} from "../../slices/assessmentApiSlice";

import {
  useGetResultsByAssessmentQuery,
} from "../../slices/resultApiSlice";

import LoadingState from "./Common/LoadingState";
import EmptyState from "./Common/EmptyState";
import Pagination from "./Common/Pagination";

const TeacherAssessmentResultsPage = ({
  pageSize = 10,
  className = "",
}) => {
  const navigate = useNavigate();

  const [selectedAssessmentId, setSelectedAssessmentId] =
    useState("");

  const [page, setPage] = useState(1);

  // --------------------------------------------------
  // Fetch teacher's assessments
  // --------------------------------------------------

  const {
    data: assessmentResponse,
    isLoading: assessmentsLoading,
    isError: assessmentsError,
    error: assessmentError,
  } = useGetMyAssessmentsQuery();

  const assessments = useMemo(
    () => normalizeArray(assessmentResponse, [
      "assessments",
      "data",
      "items",
    ]),
    [assessmentResponse]
  );

  // --------------------------------------------------
  // Fetch results for selected assessment
  // --------------------------------------------------

  const {
    data: resultResponse,
    isLoading: resultsLoading,
    isFetching: resultsFetching,
    isError: resultsError,
    error: resultError,
    refetch,
  } = useGetResultsByAssessmentQuery(
    {
      assessmentId: selectedAssessmentId,
    },
    {
      skip: !selectedAssessmentId,
    }
  );

  const results = useMemo(
    () => normalizeArray(resultResponse, [
      "results",
      "data",
      "items",
    ]),
    [resultResponse]
  );

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalItems = results.length;

  const totalPages = Math.max(
    Math.ceil(totalItems / pageSize),
    1
  );

  const paginatedResults = useMemo(() => {
    const start = (page - 1) * pageSize;

    return results.slice(
      start,
      start + pageSize
    );
  }, [results, page, pageSize]);

  // --------------------------------------------------
  // Assessment selection
  // --------------------------------------------------

  const handleAssessmentChange = (event) => {
    setSelectedAssessmentId(event.target.value);
    setPage(1);
  };

  // --------------------------------------------------
  // View individual result
  // --------------------------------------------------

  const handleViewResult = (resultId) => {
    if (!resultId) return;

    navigate(
      `/result-details/result/${resultId}`
    );
  };

  // --------------------------------------------------
  // Loading assessments
  // --------------------------------------------------

  if (assessmentsLoading) {
    return (
      <PageShell className={className}>
        <LoadingState
          variant="page"
          message="Loading your assessments..."
          description="Please wait while your assessments are being loaded."
        />
      </PageShell>
    );
  }

  // --------------------------------------------------
  // Assessment loading error
  // --------------------------------------------------

  if (assessmentsError) {
    return (
      <PageShell className={className}>
        <EmptyState
          variant="card"
          title="Unable to load assessments"
          message={getErrorMessage(assessmentError)}
        />
      </PageShell>
    );
  }

  return (
    <PageShell className={className}>

      {/* Header */}

      <header>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Assessment Results
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Select an assessment to view the results
          of your students.
        </p>
      </header>

      {/* Assessment Dropdown */}

      <section className="rounded-xl border bg-white p-4 shadow-sm">

        <label
          htmlFor="assessment"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Select Assessment
        </label>

        <select
          id="assessment"
          value={selectedAssessmentId}
          onChange={handleAssessmentChange}
          className="w-full max-w-xl rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">
            -- Select Assessment --
          </option>

          {assessments.map((assessment) => {
            const id = getId(assessment);

            return (
              <option
                key={id}
                value={id}
              >
                {getAssessmentName(assessment)}
              </option>
            );
          })}
        </select>

        {assessments.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            No assessments are currently assigned to you.
          </p>
        )}

      </section>

      {/* Results */}

      {!selectedAssessmentId ? (
        <EmptyState
          variant="card"
          title="Select an assessment"
          message="Choose an assessment from the dropdown to view its student results."
        />
      ) : resultsLoading ? (
        <LoadingState
          variant="card"
          message="Loading assessment results..."
          description="Please wait while student results are being retrieved."
        />
      ) : resultsError ? (
        <EmptyState
          variant="card"
          title="Unable to load results"
          message={getErrorMessage(resultError)}
          actionLabel="Try Again"
          onAction={refetch}
        />
      ) : (
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">

          {/* Results Header */}

          <div className="flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Student Results
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {totalItems} result record(s) found
              </p>
            </div>

            {resultsFetching && (
              <LoadingState
                variant="inline"
                message="Refreshing..."
                size="sm"
              />
            )}

          </div>

          {results.length === 0 ? (
            <div className="p-6">
              <EmptyState
                variant="compact"
                title="No results found"
                message="No student results have been generated for this assessment."
                actionLabel="Refresh"
                onAction={refetch}
              />
            </div>
          ) : (
            <>
              <AssessmentResultTable
                results={paginatedResults}
                onView={handleViewResult}
              />

              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}

        </section>
      )}

    </PageShell>
  );
};

// ==================================================
// Page Shell
// ==================================================

const PageShell = ({
  children,
  className = "",
}) => (
  <main
    className={[
      "min-h-screen bg-gray-50",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  </main>
);

// ==================================================
// Results Table
// ==================================================

const AssessmentResultTable = ({
  results,
  onView,
}) => (
  <div className="overflow-x-auto">

    <table className="min-w-full divide-y divide-gray-200">

      <thead className="bg-gray-50">
        <tr>
          <TableHeader>Student</TableHeader>
          <TableHeader>Obtained Marks</TableHeader>
          <TableHeader>Percentage</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Published Date</TableHeader>
          <TableHeader align="right">Action</TableHeader>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-100 bg-white">

        {results.map((result, index) => {
          const studentUser =
  result.student?.user || result.user;

          const resultId = getId(result);

          return (
            <tr
              key={resultId || index}
              className="transition hover:bg-gray-50"
            >

              {/* Student */}

              <td className="whitespace-nowrap px-4 py-3">
  <div className="text-sm font-medium text-gray-800">
    {getDisplayName(studentUser)}
  </div>

  {result.student?.admissionNumber && (
    <div className="mt-0.5 text-xs text-gray-400">
      Admission No: {result.student.admissionNumber}
    </div>
  )}
</td>

              {/* Obtained Marks */}

              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                <span className="font-semibold">
                  {formatNumber(result.obtainedMarks)}
                </span>

                <span className="text-gray-400">
                  {" / "}
                  {formatNumber(result.totalMarks)}
                </span>
              </td>

              {/* Percentage */}

              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-700">
                {formatNumber(result.percentage)}%
              </td>

              {/* Status */}

              <td className="whitespace-nowrap px-4 py-3">
                <ResultStatusBadge status={result.status} />
              </td>

              {/* Published Date */}

              <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                {formatDate(result.publishedAt)}
              </td>

              {/* View Action */}

              <td className="whitespace-nowrap px-4 py-3 text-right">

                <button
                  type="button"
                  disabled={!resultId}
                  onClick={() => onView(resultId)}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  View
                </button>

              </td>

            </tr>
          );
        })}

      </tbody>

    </table>

  </div>
);

// ==================================================
// Table Header
// ==================================================

const TableHeader = ({
  children,
  align = "left",
}) => (
  <th
    className={`whitespace-nowrap px-4 py-3 text-${align} text-xs font-semibold uppercase tracking-wide text-gray-500`}
  >
    {children}
  </th>
);

// ==================================================
// Result Status Badge
// ==================================================

const ResultStatusBadge = ({
  status,
}) => {
  const normalizedStatus = status || "UNKNOWN";

  const styles = {
    PUBLISHED: "bg-green-100 text-green-700",
    EVALUATED: "bg-blue-100 text-blue-700",
    DRAFT: "bg-gray-100 text-gray-600",
    PENDING: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[normalizedStatus] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {normalizedStatus.replace(/_/g, " ")}
    </span>
  );
};

// ==================================================
// Helpers
// ==================================================

const normalizeArray = (response, keys = []) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  for (const key of keys) {
    if (Array.isArray(response[key])) {
      return response[key];
    }
  }

  return [];
};

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || null;
};

const getDisplayName = (value) => {
  if (!value) return "—";

  if (typeof value === "string") {
    return value;
  }

  return (
    value.name ||
    value.studentName ||
    value.fullName ||
    value.title ||
    value.email ||
    getId(value) ||
    "—"
  );
};

const getAssessmentName = (assessment) => {
  return (
    assessment.title ||
    assessment.name ||
    assessment.assessmentName ||
    getId(assessment)
  );
};

const formatNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number.toFixed(2)
    : "0.00";
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getErrorMessage = (error) => {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    "An unexpected error occurred."
  );
};

export default TeacherAssessmentResultsPage;
