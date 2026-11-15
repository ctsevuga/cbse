
import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  useGetChildResultByAssessmentQuery,
} from "../../slices/resultApiSlice";

import ResultSummary from "../results/components/ResultSummary";
import ResultMarks from "../results/components/ResultMarks";
import ResultStatusBadge from "../results/components/ResultStatusBadge";

// ==========================================================
// PARENT ASSESSMENT RESULT PAGE
//
// Parent can view published assessment results
// of their linked children.
//
// Route parameters:
// assessmentId
// studentId
// ==========================================================

const ParentAssessmentResultPage = () => {
  const { assessmentId, studentId } = useParams();

  // --------------------------------------------------------
  // API
  // --------------------------------------------------------

  const {
    data: results = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetChildResultByAssessmentQuery(
    {
      assessmentId,
      studentId,
    },
    {
      skip: !assessmentId || !studentId,
    }
  );

  // --------------------------------------------------------
  // Result
  // --------------------------------------------------------

  const result = Array.isArray(results)
    ? results[0]
    : results?.results?.[0] || results;

  const isPublished =
    result?.status === "PUBLISHED";

  // --------------------------------------------------------
  // Navigation
  // --------------------------------------------------------

  const backUrl =
    `/parent/children/${studentId}/results`;

  // --------------------------------------------------------
  // Loading
  // --------------------------------------------------------

  if (isLoading || isFetching) {
    return (
      <PageContainer>
        <LoadingState
          message="Loading assessment result..."
        />
      </PageContainer>
    );
  }

  // --------------------------------------------------------
  // Error
  // --------------------------------------------------------

  if (isError) {
    return (
      <PageContainer>
        <ErrorState
          error={error}
          onRetry={refetch}
        />

        <BackButton to={backUrl} />
      </PageContainer>
    );
  }

  // --------------------------------------------------------
  // No published result
  // --------------------------------------------------------

  if (!result || !isPublished) {
    return (
      <PageContainer>

        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">

          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Result Not Available
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            The assessment result has not been published
            yet, or no result is available for this assessment.
          </p>

          <BackButton to={backUrl} />

        </div>

      </PageContainer>
    );
  }

  // --------------------------------------------------------
  // Result information
  // --------------------------------------------------------

  const assessment = result.assessment;
  const student = result.student;
  const attempt = result.attempt;

  // --------------------------------------------------------
  // View Result Button
  // --------------------------------------------------------

  const ViewResultButton = ({
    position = "top",
  }) => {

    return (
      <Link
        to={`/result-details/result/${result._id}`}
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 ${
          position === "bottom"
            ? "w-full sm:w-auto"
            : ""
        }`}
      >

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"
          />
        </svg>

        View Detailed Result

      </Link>
    );
  };

  // ========================================================
  // MAIN RENDER
  // ========================================================

  return (
    <PageContainer>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-4">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0 flex-1">

            <BackLink to={backUrl}>
              ← Back to Child's Results
            </BackLink>

            <div className="mt-2 flex flex-wrap items-center gap-2">

              <h1 className="text-xl font-bold text-gray-900">
                Assessment Result
              </h1>

              <ResultStatusBadge
                status={result.status}
              />

            </div>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              {assessment?.title || "Assessment"}
            </p>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">

              <span>
                Subject: {assessment?.subject?.name || "-"}
              </span>

              <span>
                Student: {student?.user?.name || "Student"}
              </span>

            </div>

          </div>

          {/* Top action */}

          <div className="shrink-0">
            <ViewResultButton position="top" />
          </div>

        </div>

      </div>


      {/* ==================================================
          RESULT SUMMARY AND MARKS
      ================================================== */}

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">

        <div className="min-w-0">
          <ResultSummary result={result} />
        </div>

        <div className="min-w-0">
          <ResultMarks
            totalMarks={result.totalMarks}
            obtainedMarks={result.obtainedMarks}
            percentage={result.percentage}
          />
        </div>

      </div>


      {/* ==================================================
          INFORMATION CARDS
      ================================================== */}

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">

        {/* ----------------------------------------------
            ASSESSMENT INFORMATION
        ---------------------------------------------- */}

        <InfoCard title="Assessment Information">

          <InfoItem
            label="Assessment"
            value={assessment?.title || "-"}
          />

          <InfoItem
            label="Subject"
            value={assessment?.subject?.name || "-"}
          />

          <InfoItem
            label="Assessment Type"
            value={assessment?.assessmentType || "-"}
          />

          <InfoItem
            label="Total Questions"
            value={
              assessment?.totalQuestions ??
              attempt?.totalQuestions ??
              "-"
            }
          />

          <InfoItem
            label="Duration"
            value={
              assessment?.durationMinutes
                ? `${assessment.durationMinutes} minutes`
                : "-"
            }
          />

          <InfoItem
            label="Assessment Status"
            value={assessment?.status || "-"}
          />

        </InfoCard>


        {/* ----------------------------------------------
            STUDENT INFORMATION
        ---------------------------------------------- */}

        {student && (
          <InfoCard title="Child Information">

            <InfoItem
              label="Name"
              value={student.user?.name || "-"}
            />

            <InfoItem
              label="Admission Number"
              value={student.admissionNumber || "-"}
            />

            <InfoItem
              label="Class"
              value={student.class?.name || "-"}
            />

            <InfoItem
              label="Section"
              value={student.section?.name || "-"}
            />

            <InfoItem
              label="Academic Year"
              value={student.academicYear?.name || "-"}
            />

            <InfoItem
              label="Stream"
              value={student.stream?.name || "-"}
            />

          </InfoCard>
        )}


        {/* ----------------------------------------------
            ATTEMPT INFORMATION
        ---------------------------------------------- */}

        {attempt && (
          <InfoCard title="Assessment Attempt">

            <InfoItem
              label="Attempt Number"
              value={attempt.attemptNumber ?? "-"}
            />

            <InfoItem
              label="Attempt Status"
              value={attempt.status || "-"}
            />

            <InfoItem
              label="Started At"
              value={formatDate(attempt.startedAt)}
            />

            <InfoItem
              label="Submitted At"
              value={formatDate(attempt.submittedAt)}
            />

            <InfoItem
              label="Total Questions"
              value={attempt.totalQuestions ?? "-"}
            />

            <InfoItem
              label="Attempted Questions"
              value={attempt.attemptedQuestions ?? "-"}
            />

          </InfoCard>
        )}


        {/* ----------------------------------------------
            RESULT INFORMATION
        ---------------------------------------------- */}

        <InfoCard title="Result Information">

          <InfoItem
            label="Result Status"
            value={result.status || "-"}
          />

          <InfoItem
            label="Published At"
            value={formatDate(result.publishedAt)}
          />

          <InfoItem
            label="Published By"
            value={result.publishedBy?.name || "-"}
          />

          <InfoItem
            label="Created At"
            value={formatDate(result.createdAt)}
          />

          <InfoItem
            label="Last Updated"
            value={formatDate(result.updatedAt)}
          />

        </InfoCard>

      </div>


      {/* ==================================================
          PUBLISHED MESSAGE
      ================================================== */}

      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-3">

        <div className="flex items-start gap-2">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mt-0.5 h-4 w-4 shrink-0 text-green-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>

          <p className="text-xs font-medium text-green-800">
            This assessment result has been officially
            published by the school and is available
            for viewing.
          </p>

        </div>

      </div>


      {/* ==================================================
          BOTTOM ACTIONS
      ================================================== */}

      <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-3 sm:flex-row sm:items-center sm:justify-between">

        <BackButton to={backUrl} />

        <ViewResultButton position="bottom" />

      </div>

    </PageContainer>
  );
};


// ==========================================================
// REUSABLE COMPONENTS
// ==========================================================

const InfoCard = ({ title, children }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">

        <h2 className="text-sm font-semibold text-gray-800">
          {title}
        </h2>

      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-3 sm:grid-cols-3">
        {children}
      </div>

    </div>
  );
};


// ==========================================================
// INFORMATION ITEM
// ==========================================================

const InfoItem = ({ label, value }) => {
  return (
    <div className="min-w-0">

      <p className="text-[11px] font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-0.5 break-words text-xs font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
};


// ==========================================================
// PAGE CONTAINER
// ==========================================================

const PageContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 px-3 py-3 sm:px-4 sm:py-4">

      <div className="mx-auto max-w-7xl">
        {children}
      </div>

    </div>
  );
};


// ==========================================================
// LOADING STATE
// ==========================================================

const LoadingState = ({ message }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">

      <div className="mb-2 flex justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>

      <p className="text-sm text-gray-500">
        {message}
      </p>

    </div>
  );
};


// ==========================================================
// ERROR STATE
// ==========================================================

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">

      <h2 className="text-sm font-semibold text-red-800">
        Unable to load assessment result
      </h2>

      <p className="mt-1 text-xs text-red-700">
        {error?.data?.message ||
          error?.error ||
          "An error occurred while loading the result."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
      >
        Retry
      </button>

    </div>
  );
};


// ==========================================================
// BACK LINK
// ==========================================================

const BackLink = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="text-xs font-medium text-blue-600 hover:text-blue-800"
    >
      {children}
    </Link>
  );
};


// ==========================================================
// BACK BUTTON
// ==========================================================

const BackButton = ({ to }) => {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      ← Back to Child's Results
    </Link>
  );
};


// ==========================================================
// DATE FORMATTER
// ==========================================================

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


export default ParentAssessmentResultPage;
