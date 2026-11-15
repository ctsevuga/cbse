
import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  useGetResultByAssessmentAndStudentQuery,
} from "../../slices/resultApiSlice";

import ResultSummary from "./components/ResultSummary";
import ResultMarks from "./components/ResultMarks";
import ResultStatusBadge from "./components/ResultStatusBadge";

const StudentAssessmentResultPage = () => {
  const { assessmentId, studentId } = useParams();

  const {
    data: results = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetResultByAssessmentAndStudentQuery({
    assessmentId,
    studentId,
  });

  const result = results?.[0];

  const isPublished = result?.status === "PUBLISHED";
  const isWithdrawn = result?.status === "WITHDRAWN";

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading assessment result..." />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <ErrorState
          error={error}
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  if (!result) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Result Not Found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            No result exists for this student and assessment.
          </p>

          <Link
            to={`/students/${studentId}/results`}
            className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Student Results
          </Link>
        </div>
      </PageContainer>
    );
  }

  const assessment = result.assessment;
  const student = result.student;
  const attempt = result.attempt;

  const ViewResultButton = ({ position = "top" }) => {
    if (!isPublished || !result?._id) {
      return null;
    }

    return (
      <Link
        to={`/result-details/result/${result._id}`}
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 ${
          position === "bottom" ? "w-full sm:w-auto" : ""
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

        View Result
      </Link>
    );
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0 flex-1">
            <Link
              to={`/students/${studentId}/results`}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              ← Back to Student Results
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                Assessment Result
              </h1>

              <ResultStatusBadge status={result.status} />
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

          {/* Top View Result Button */}
          <div className="shrink-0">
            <ViewResultButton position="top" />
          </div>

        </div>
      </div>

      {isWithdrawn && (
        <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
          <p className="text-xs font-medium text-orange-800">
            This result has been withdrawn and is no longer published.
          </p>
        </div>
      )}

      {/* Result Summary and Marks */}
      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">

        <div className="min-w-0 rounded-xl">
          <ResultSummary result={result} />
        </div>

        <div className="min-w-0 rounded-xl">
          <ResultMarks
            totalMarks={result.totalMarks}
            obtainedMarks={result.obtainedMarks}
            percentage={result.percentage}
          />
        </div>

      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">

        {/* Assessment Information */}
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

        {/* Student Information */}
        {student && (
          <InfoCard title="Student Information">

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

        {/* Attempt Information */}
        {attempt && (
          <InfoCard title="Attempt Information">

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
              label="Questions"
              value={attempt.totalQuestions ?? "-"}
            />

            <InfoItem
              label="Attempted Questions"
              value={attempt.attemptedQuestions ?? "-"}
            />

          </InfoCard>
        )}

        {/* Result Information */}
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

      {/* Published Result Information */}
      {isPublished && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <p className="text-xs font-medium text-green-800">
            This result has been published and is available to the student.
          </p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-3 sm:flex-row sm:items-center sm:justify-between">

        <Link
          to={`/students/${studentId}/results`}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back to Student Results
        </Link>

        <ViewResultButton position="bottom" />

      </div>

    </PageContainer>
  );
};

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

const PageContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
};

const LoadingState = ({ message }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
      <p className="text-sm text-gray-500">
        {message}
      </p>
    </div>
  );
};

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">

      <h2 className="text-sm font-semibold text-red-800">
        Unable to load result
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

export default StudentAssessmentResultPage;
