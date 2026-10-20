import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  useGetResultDetailsQuery,
  useUpdateResultMutation,
  usePublishResultMutation,
  useWithdrawResultMutation,
  useDeleteResultMutation,
} from "../../slices/resultApiSlice";

import ResultStatusBadge from "./components/ResultStatusBadge";

const ResultDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetResultDetailsQuery(id);

  const [updateResult, { isLoading: isUpdating }] =
    useUpdateResultMutation();

  const [publishResult, { isLoading: isPublishing }] =
    usePublishResultMutation();

  const [withdrawResult, { isLoading: isWithdrawing }] =
    useWithdrawResultMutation();

  const [deleteResult, { isLoading: isDeleting }] =
    useDeleteResultMutation();

  const handleRecalculate = async () => {
    if (
      !window.confirm(
        "Recalculate this result using the latest evaluation data?",
      )
    ) {
      return;
    }

    try {
      await updateResult({
        resultId: id,
      }).unwrap();

      window.alert("Result recalculated successfully.");
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to recalculate result.",
      );
    }
  };

  const handlePublish = async () => {
    if (
      !window.confirm(
        "Are you sure you want to publish this result?",
      )
    ) {
      return;
    }

    try {
      await publishResult(id).unwrap();

      window.alert("Result published successfully.");
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to publish result.",
      );
    }
  };

  const handleWithdraw = async () => {
    if (
      !window.confirm(
        "Are you sure you want to withdraw this published result?",
      )
    ) {
      return;
    }

    try {
      await withdrawResult(id).unwrap();

      window.alert("Result withdrawn successfully.");
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to withdraw result.",
      );
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this result?",
      )
    ) {
      return;
    }

    try {
      await deleteResult(id).unwrap();

      navigate("/results");
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to delete result.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Loading result...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-800">
            Unable to load result
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
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-6">
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            Result not found.
          </p>

          <Link
            to="/results"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  const student = result.student;
  const assessment = result.assessment;
  const attempt = result.attempt;

  const studentName =
    student?.user?.name || "Unknown Student";

  const studentEmail = student?.user?.email;

  const assessmentTitle =
    assessment?.title || "Unknown Assessment";

  const subjectName =
    assessment?.subject?.name;

  const className =
    assessment?.class?.name;

  const sectionName =
    assessment?.section?.name;

  const attemptNumber =
    attempt?.attemptNumber;

  const canRecalculate =
    result.status !== "PUBLISHED" &&
    result.status !== "WITHDRAWN";

  const canPublish =
    result.status === "EVALUATED";

  const canWithdraw =
    result.status === "PUBLISHED";

  const canDelete =
    result.status !== "PUBLISHED" &&
    result.status !== "WITHDRAWN";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2">
              <Link
                to="/results"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                ← Back to Results
              </Link>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              Result Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View assessment result and result status.
            </p>
          </div>

          <ResultStatusBadge
            status={result.status}
          />
        </div>

        {/* Student + Assessment Summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Student Information */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              Student Information
            </h2>

            <div className="space-y-4">
              <InfoRow
                label="Name"
                value={studentName}
              />

              {studentEmail && (
                <InfoRow
                  label="Email"
                  value={studentEmail}
                />
              )}

              {student?.admissionNumber && (
                <InfoRow
                  label="Admission Number"
                  value={
                    student.admissionNumber
                  }
                />
              )}

              {className && (
                <InfoRow
                  label="Class"
                  value={className}
                />
              )}

              {sectionName && (
                <InfoRow
                  label="Section"
                  value={sectionName}
                />
              )}
            </div>
          </div>

          {/* Assessment Information */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              Assessment Information
            </h2>

            <div className="space-y-4">
              <InfoRow
                label="Assessment"
                value={assessmentTitle}
              />

              {subjectName && (
                <InfoRow
                  label="Subject"
                  value={subjectName}
                />
              )}

              {assessment?.assessmentType && (
                <InfoRow
                  label="Type"
                  value={
                    assessment.assessmentType
                  }
                />
              )}

              {assessment?.totalQuestions !==
                undefined && (
                <InfoRow
                  label="Questions"
                  value={
                    assessment.totalQuestions
                  }
                />
              )}

              {assessment?.totalMarks !==
                undefined && (
                <InfoRow
                  label="Assessment Total Marks"
                  value={assessment.totalMarks}
                />
              )}

              {attemptNumber !==
                undefined && (
                <InfoRow
                  label="Attempt"
                  value={`Attempt ${attemptNumber}`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Marks */}
        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            Result
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MarksCard
              label="Total Marks"
              value={result.totalMarks}
            />

            <MarksCard
              label="Obtained Marks"
              value={result.obtainedMarks}
            />

            <MarksCard
              label="Percentage"
              value={`${result.percentage}%`}
            />
          </div>
        </div>

        {/* Status / Publication Information */}
        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Result Status
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow
              label="Current Status"
              value={
                <ResultStatusBadge
                  status={result.status}
                />
              }
            />

            {result.publishedAt && (
              <InfoRow
                label="Published At"
                value={formatDate(
                  result.publishedAt,
                )}
              />
            )}

            {result.publishedBy && (
              <InfoRow
                label="Published By"
                value={
                  result.publishedBy.name ||
                  result.publishedBy.email ||
                  "-"
                }
              />
            )}

            {result.createdAt && (
              <InfoRow
                label="Created At"
                value={formatDate(
                  result.createdAt,
                )}
              />
            )}

            {result.updatedAt && (
              <InfoRow
                label="Last Updated"
                value={formatDate(
                  result.updatedAt,
                )}
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Actions
          </h2>

          <div className="flex flex-wrap gap-3">
            {/* Recalculate */}
            {canRecalculate && (
              <button
                type="button"
                onClick={handleRecalculate}
                disabled={isUpdating}
                className="rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating
                  ? "Recalculating..."
                  : "Recalculate Result"}
              </button>
            )}

            {/* Publish */}
            {canPublish && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPublishing
                  ? "Publishing..."
                  : "Publish Result"}
              </button>
            )}

            {/* Withdraw */}
            {canWithdraw && (
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isWithdrawing
                  ? "Withdrawing..."
                  : "Withdraw Result"}
              </button>
            )}

            {/* Delete */}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Result"}
              </button>
            )}
          </div>

          {/* Lifecycle information */}
          <div className="mt-5 rounded-md bg-gray-50 p-4">
            {result.status ===
              "PENDING_EVALUATION" && (
              <p className="text-sm text-yellow-700">
                This result is waiting for all required
                answers to be evaluated.
              </p>
            )}

            {result.status === "EVALUATED" && (
              <p className="text-sm text-blue-700">
                All required evaluations are complete.
                This result can be published by an
                authorized user.
              </p>
            )}

            {result.status === "PUBLISHED" && (
              <p className="text-sm text-green-700">
                This result has been published and is
                available to the student.
              </p>
            )}

            {result.status === "WITHDRAWN" && (
              <p className="text-sm text-red-700">
                This result has been withdrawn and is no
                longer available as a published result.
              </p>
            )}

            {result.status === "DRAFT" && (
              <p className="text-sm text-gray-600">
                This result is currently in draft state.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/*
==========================================================
Reusable local display components
==========================================================
*/

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-b-0">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>

      <div className="text-sm font-medium text-gray-900">
        {value || "-"}
      </div>
    </div>
  );
};

const MarksCard = ({ label, value }) => {
  return (
    <div className="rounded-lg bg-gray-50 p-5 text-center">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value ?? "-"}
      </p>
    </div>
  );
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString();
};

export default ResultDetailsPage;
