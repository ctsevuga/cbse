import React from "react";

import ResultStatusBadge from "./ResultStatusBadge";
import ResultSummary from "./ResultSummary";
import ResultMarks from "./ResultMarks";

const ResultDetails = ({
  result,
  showStudent = true,
  showAssessment = true,
  showAttempt = true,
  showPublication = true,
  className = "",
}) => {
  if (!result) {
    return (
      <div
        className={`rounded-lg border bg-white p-6 shadow-sm ${className}`}
      >
        <p className="text-sm text-gray-500">
          Result details are not available.
        </p>
      </div>
    );
  }

  const {
    assessment,
    student,
    attempt,
    totalMarks,
    obtainedMarks,
    percentage,
    status,
    publishedAt,
    publishedBy,
    createdAt,
    updatedAt,
  } = result;

  return (
    <div
      className={`space-y-6 ${className}`}
    >
      {/* Result Header */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Result Details
            </h2>

            {assessment?.title && (
              <p className="mt-1 text-sm text-gray-500">
                {assessment.title}
              </p>
            )}
          </div>

          <ResultStatusBadge
            status={status}
          />
        </div>
      </div>

      {/* Result Summary */}
      <ResultSummary result={result} />

      {/* Marks */}
      <ResultMarks
        totalMarks={totalMarks}
        obtainedMarks={obtainedMarks}
        percentage={percentage}
      />

      {/* Assessment */}
      {showAssessment && (
        <DetailsSection title="Assessment Information">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        </DetailsSection>
      )}

      {/* Student */}
      {showStudent && (
        <DetailsSection title="Student Information">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Name"
              value={
                student?.user?.name ||
                "-"
              }
            />

            <InfoItem
              label="Admission Number"
              value={
                student?.admissionNumber ||
                "-"
              }
            />

            <InfoItem
              label="Class"
              value={
                student?.class?.name || "-"
              }
            />

            <InfoItem
              label="Section"
              value={
                student?.section?.name ||
                "-"
              }
            />

            <InfoItem
              label="Academic Year"
              value={
                student?.academicYear?.name ||
                "-"
              }
            />

            <InfoItem
              label="Stream"
              value={
                student?.stream?.name || "-"
              }
            />
          </div>
        </DetailsSection>
      )}

      {/* Attempt */}
      {showAttempt && (
        <DetailsSection title="Attempt Information">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              label="Total Questions"
              value={
                attempt?.totalQuestions ??
                "-"
              }
            />

            <InfoItem
              label="Attempted Questions"
              value={
                attempt?.attemptedQuestions ??
                "-"
              }
            />

            <InfoItem
              label="Started At"
              value={formatDate(
                attempt?.startedAt,
              )}
            />

            <InfoItem
              label="Submitted At"
              value={formatDate(
                attempt?.submittedAt,
              )}
            />

            <InfoItem
              label="Time Spent"
              value={formatTimeSpent(
                attempt?.timeSpent,
              )}
            />
          </div>
        </DetailsSection>
      )}

      {/* Publication */}
      {showPublication && (
        <DetailsSection title="Result Information">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Status"
              value={status || "-"}
            />

            <InfoItem
              label="Published At"
              value={formatDate(
                publishedAt,
              )}
            />

            <InfoItem
              label="Published By"
              value={
                publishedBy?.name || "-"
              }
            />

            <InfoItem
              label="Created At"
              value={formatDate(
                createdAt,
              )}
            />

            <InfoItem
              label="Last Updated"
              value={formatDate(
                updatedAt,
              )}
            />
          </div>
        </DetailsSection>
      )}
    </div>
  );
};

const DetailsSection = ({
  title,
  children,
}) => {
  return (
    <section className="rounded-lg border bg-white shadow-sm">
      <div className="border-b px-6 py-5">
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      <div className="p-6">
        {children}
      </div>
    </section>
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

const formatTimeSpent = (seconds) => {
  if (
    seconds === null ||
    seconds === undefined ||
    seconds === ""
  ) {
    return "-";
  }

  const totalSeconds = Number(seconds);

  if (!Number.isFinite(totalSeconds)) {
    return "-";
  }

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const remainingSeconds =
    Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
};

export default ResultDetails;
