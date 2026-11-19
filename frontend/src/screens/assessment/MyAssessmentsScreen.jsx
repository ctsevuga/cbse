
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Pencil,
  ClipboardList,
  CalendarDays,
  Clock3,
  FileQuestion,
  Award,
  AlertCircle,
  Filter,
  RotateCcw,
} from "lucide-react";

import { useGetMyAssessmentsQuery } from "../../slices/assessmentApiSlice";
import {
  usePublishAssessmentResultsMutation,
} from "../../slices/resultApiSlice";

const ASSESSMENT_TYPES = [
  { value: "CHAPTER_TEST", label: "Chapter Test" },
  { value: "UNIT_TEST", label: "Unit Test" },
  { value: "MONTHLY_TEST", label: "Monthly Test" },
  { value: "REVISION_TEST", label: "Revision Test" },
  { value: "MOCK_EXAM", label: "Mock Exam" },
  { value: "PRE_BOARD", label: "Pre Board" },
  { value: "BOARD_PRACTICE", label: "Board Practice" },
];

const ASSESSMENT_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const getStatusStyles = (status) => {
  const styles = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    COMPLETED: "bg-purple-50 text-purple-700 border-purple-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    styles[status] ||
    "bg-slate-100 text-slate-700 border-slate-200"
  );
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAssessmentType = (type) => {
  if (!type) return "-";

  return type
    .split("_")
    .map(
      (word) =>
        word.charAt(0) + word.slice(1).toLowerCase()
    )
    .join(" ");
};

const MyAssessmentsScreen = () => {
  const {
    data: assessments = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMyAssessmentsQuery();

  const [
  publishAssessmentResults,
  { isLoading: isPublishing },
] = usePublishAssessmentResultsMutation();

const [publishingAssessmentId, setPublishingAssessmentId] =
  useState(null);

const [publishFeedback, setPublishFeedback] = useState({});

  // Filter states
  const [assessmentType, setAssessmentType] = useState("");
  const [status, setStatus] = useState("");

  // Apply filters
  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesType =
        !assessmentType ||
        assessment.assessmentType === assessmentType;

      const matchesStatus =
        !status || assessment.status === status;

      return matchesType && matchesStatus;
    });
  }, [assessments, assessmentType, status]);

  // Reset filters
  const resetFilters = () => {
    setAssessmentType("");
    setStatus("");
  };

  const hasActiveFilters = assessmentType || status;

  const handlePublishResults = async (assessmentId) => {
  try {
    setPublishingAssessmentId(assessmentId);

    setPublishFeedback((prev) => ({
      ...prev,
      [assessmentId]: null,
    }));

    const response = await publishAssessmentResults(
      assessmentId
    ).unwrap();

    setPublishFeedback((prev) => ({
      ...prev,
      [assessmentId]: {
        success: true,
        message: response.message,
        totalAttempts: response.totalAttempts,
        publishedAttempts: response.publishedAttempts,
      },
    }));

  } catch (error) {
    setPublishFeedback((prev) => ({
      ...prev,
      [assessmentId]: {
        success: false,
        message:
          error?.data?.message ||
          "Unable to publish assessment results.",
        totalAttempts: error?.data?.totalAttempts,
        notEvaluatedAttempts:
          error?.data?.notEvaluatedAttempts,
        evaluatedAttempts:
          error?.data?.evaluatedAttempts,
      },
    }));

  } finally {
    setPublishingAssessmentId(null);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow-lg">
          <div className="px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-xl bg-white/15 p-2.5 text-white backdrop-blur-sm">
                    <ClipboardList className="h-6 w-6" />
                  </div>

                  <span className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                    Assessment Management
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  My Assessments
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
                  View and manage assessments created by you
                  for your school.
                </p>
              </div>

              <div className="flex h-16 min-w-28 items-center justify-center rounded-2xl bg-white/15 px-5 text-white backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {assessments.length}
                  </p>
                  <p className="text-xs text-blue-100">
                    Total Assessments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">
                Unable to load assessments
              </p>

              <p className="mt-1 text-sm">
                {error?.data?.message ||
                  "Something went wrong while loading your assessments."}
              </p>

              <button
                type="button"
                onClick={refetch}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {!isLoading && !isError && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />

              <h2 className="font-semibold text-slate-800">
                Filter Assessments
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {/* Assessment Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Assessment Type
                </label>

                <select
                  value={assessmentType}
                  onChange={(e) =>
                    setAssessmentType(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All Assessment Types</option>

                  {ASSESSMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Assessment Status
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All Statuses</option>

                  {ASSESSMENT_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-indigo-600">
                  {filteredAssessments.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {assessments.length}
                </span>{" "}
                assessments
              </p>

              {hasActiveFilters && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Filters applied
                </span>
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 h-6 w-3/4 rounded bg-slate-200" />
                <div className="mb-6 h-4 w-1/2 rounded bg-slate-200" />

                <div className="space-y-3">
                  <div className="h-4 rounded bg-slate-200" />
                  <div className="h-4 rounded bg-slate-200" />
                  <div className="h-4 rounded bg-slate-200" />
                </div>

                <div className="mt-6 h-10 rounded bg-slate-200" />
              </div>
            ))}
          </div>

        ) : !isError && filteredAssessments.length === 0 ? (

          /* Empty State */
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <ClipboardList className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              {assessments.length === 0
                ? "No assessments found"
                : "No matching assessments"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {assessments.length === 0
                ? "You haven't created any assessments yet. Assessments created by your account will appear here."
                : "No assessments match the selected filters. Try changing the assessment type or status."}
            </p>

            {assessments.length > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            )}
          </div>

        ) : !isError && (

          /* Assessment Cards */
          <div className="relative">
            {isFetching && (
              <div className="absolute right-0 top-0 z-10 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                Refreshing...
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredAssessments.map((assessment) => (
                <div
                  key={assessment._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                >
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-slate-800">
                          {assessment.title}
                        </h2>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {assessment.subject?.name ||
                            "Subject not available"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
                          assessment.status
                        )}`}
                      >
                        {assessment.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {formatAssessmentType(assessment.assessmentType)}
                      </span>

                      {assessment.stream?.name && (
                        <span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                          {assessment.stream.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-5">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          Academic Year
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                        {assessment.academicYear?.name || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <ClipboardList className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          Class
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                        {assessment.class?.name || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <FileQuestion className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          Questions
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {assessment.totalQuestions}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Award className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          Marks
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {assessment.totalMarks}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 px-5 py-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4" />
                        <span>
                          {assessment.durationMinutes} min
                        </span>
                      </div>

                      <span>
                        {formatDate(assessment.startDate)}
                      </span>
                    </div>

                    
<div className="mt-4 grid grid-cols-2 gap-2">

  {/* View */}
  <Link
    to={`/assessments/${assessment._id}`}
    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
  >
    <Eye className="h-4 w-4" />
    View
  </Link>

  {/* Edit */}
  <Link
    to={`/assessments/${assessment._id}/edit`}
    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
  >
    <Pencil className="h-4 w-4" />
    Edit
  </Link>

  {/* Publish All Results - ACTIVE assessments only */}
  {assessment.status === "ACTIVE" && (
    <button
      type="button"
      onClick={() =>
        handlePublishResults(assessment._id)
      }
      disabled={isPublishing}
      className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {publishingAssessmentId === assessment._id
        ? "PUBLISHING..."
        : "PUBLISH"}
    </button>
  )}

</div>

{/* Publication Feedback */}
{publishFeedback[assessment._id] && (
  <div
    className={`mt-3 rounded-xl border p-3 text-sm ${
      publishFeedback[assessment._id].success
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-red-200 bg-red-50 text-red-700"
    }`}
  >
    <p className="font-semibold">
      {publishFeedback[assessment._id].success
        ? "Publication Successful"
        : "Publication Failed"}
    </p>

    <p className="mt-1">
      {publishFeedback[assessment._id].message}
    </p>

    {publishFeedback[assessment._id].success && (
      <p className="mt-1 font-medium">
        Published Attempts:{" "}
        {publishFeedback[assessment._id].publishedAttempts}
      </p>
    )}

    {!publishFeedback[assessment._id].success &&
      publishFeedback[assessment._id].totalAttempts !== undefined && (
        <div className="mt-2 space-y-1">
          <p>
            Total Attempts:{" "}
            {publishFeedback[assessment._id].totalAttempts}
          </p>

          <p>
            Evaluated:{" "}
            {publishFeedback[assessment._id].evaluatedAttempts}
          </p>

          <p className="font-semibold">
            Not Evaluated:{" "}
            {publishFeedback[assessment._id].notEvaluatedAttempts}
          </p>
        </div>
      )}
  </div>
)}

                  </div>

                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Created {formatDateTime(assessment.createdAt)}
                      </span>

                      <span className="text-xs font-medium text-slate-400">
                        {assessment.section?.name || ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAssessmentsScreen;
