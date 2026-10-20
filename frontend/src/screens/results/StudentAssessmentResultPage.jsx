import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  useGetResultByAssessmentAndStudentQuery,
} from "../../slices/resultApiSlice";

import ResultSummary from "./components/ResultSummary";
import ResultMarks from "./components/ResultMarks";
import ResultStatusBadge from "./components/ResultStatusBadge";

const StudentAssessmentResultPage = () => {
  const {
    assessmentId,
    studentId,
  } = useParams();

  const {
    data: results = [],
    isLoading,
    isError,
    error,
    refetch,
  } =
    useGetResultByAssessmentAndStudentQuery({
      assessmentId,
      studentId,
    });

  const result = results?.[0];

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
        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Result Not Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            No result exists for this student and
            assessment.
          </p>

          <Link
            to={`/students/${studentId}/results`}
            className="mt-5 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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

  const isPublished =
    result.status === "PUBLISHED";

  const isWithdrawn =
    result.status === "WITHDRAWN";

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/students/${studentId}/results`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Student Results
        </Link>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Assessment Result
            </h1>

            <p className="mt-1 text-lg font-medium text-gray-800">
              {assessment?.title ||
                "Assessment"}
            </p>

            {assessment?.subject?.name && (
              <p className="mt-1 text-sm text-gray-500">
                Subject:{" "}
                {assessment.subject.name}
              </p>
            )}

            {student && (
              <p className="mt-1 text-sm text-gray-500">
                Student:{" "}
                {student.user?.name ||
                  "Student"}
              </p>
            )}
          </div>

          <ResultStatusBadge
            status={result.status}
          />
        </div>
      </div>

      {/* Withdrawn Notice */}
      {isWithdrawn && (
        <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-medium text-orange-800">
            This result has been withdrawn and is
            no longer published.
          </p>
        </div>
      )}

      {/* Result Summary */}
      <div className="mb-6">
        <ResultSummary result={result} />
      </div>

      {/* Marks */}
      <div className="mb-6">
        <ResultMarks
          totalMarks={result.totalMarks}
          obtainedMarks={result.obtainedMarks}
          percentage={result.percentage}
        />
      </div>

      {/* Assessment Information */}
      <div className="mb-6 rounded-lg border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Assessment Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Assessment"
            value={
              assessment?.title || "-"
            }
          />

          <InfoItem
            label="Subject"
            value={
              assessment?.subject?.name ||
              "-"
            }
          />

          <InfoItem
            label="Assessment Type"
            value={
              assessment?.assessmentType ||
              "-"
            }
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
            value={
              assessment?.status || "-"
            }
          />
        </div>
      </div>

      {/* Student Information */}
      {student && (
        <div className="mb-6 rounded-lg border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Student Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Name"
              value={
                student.user?.name ||
                "-"
              }
            />

            <InfoItem
              label="Admission Number"
              value={
                student.admissionNumber ||
                "-"
              }
            />

            <InfoItem
              label="Class"
              value={
                student.class?.name || "-"
              }
            />

            <InfoItem
              label="Section"
              value={
                student.section?.name ||
                "-"
              }
            />

            <InfoItem
              label="Academic Year"
              value={
                student.academicYear?.name ||
                "-"
              }
            />

            <InfoItem
              label="Stream"
              value={
                student.stream?.name || "-"
              }
            />
          </div>
        </div>
      )}

      {/* Attempt Information */}
      {attempt && (
        <div className="mb-6 rounded-lg border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Attempt Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Attempt Number"
              value={
                attempt.attemptNumber ?? "-"
              }
            />

            <InfoItem
              label="Attempt Status"
              value={
                attempt.status || "-"
              }
            />

            <InfoItem
              label="Started At"
              value={formatDate(
                attempt.startedAt,
              )}
            />

            <InfoItem
              label="Submitted At"
              value={formatDate(
                attempt.submittedAt,
              )}
            />

            <InfoItem
              label="Questions"
              value={
                attempt.totalQuestions ?? "-"
              }
            />

            <InfoItem
              label="Attempted Questions"
              value={
                attempt.attemptedQuestions ??
                "-"
              }
            />
          </div>
        </div>
      )}

      {/* Publication Information */}
      <div className="mb-6 rounded-lg border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Result Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Result Status"
            value={
              result.status || "-"
            }
          />

          <InfoItem
            label="Published At"
            value={formatDate(
              result.publishedAt,
            )}
          />

          <InfoItem
            label="Published By"
            value={
              result.publishedBy?.name ||
              "-"
            }
          />

          <InfoItem
            label="Created At"
            value={formatDate(
              result.createdAt,
            )}
          />

          <InfoItem
            label="Last Updated"
            value={formatDate(
              result.updatedAt,
            )}
          />
        </div>
      </div>

      {/* Student-facing note */}
      {isPublished && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            This result has been published and is
            available to the student.
          </p>
        </div>
      )}
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

const LoadingState = ({
  message,
}) => {
  return (
    <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
      <p className="text-sm text-gray-500">
        {message}
      </p>
    </div>
  );
};

const ErrorState = ({
  error,
  onRetry,
}) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-800">
        Unable to load result
      </h2>

      <p className="mt-2 text-sm text-red-700">
        {error?.data?.message ||
          error?.error ||
          "An error occurred while loading the result."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
