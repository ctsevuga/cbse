import React from "react";
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
} from "lucide-react";

import { useGetMyAssessmentsQuery } from "../../slices/assessmentApiSlice";

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
        word.charAt(0) + word.slice(1).toLowerCase(),
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
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
                    Assessments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
        ) : assessments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <ClipboardList className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No assessments found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't created any assessments yet.
              Assessments created by your account will appear
              here.
            </p>
          </div>
        ) : (
          <div className="relative">
            {isFetching && (
              <div className="absolute right-0 top-0 z-10 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                Refreshing...
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {assessments.map((assessment) => (
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
                          assessment.status,
                        )}`}
                      >
                        {assessment.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {formatAssessmentType(
                          assessment.assessmentType,
                        )}
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
                        {assessment.academicYear?.name ||
                          "-"}
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
                      <Link
                        to={`/assessments/${assessment._id}`}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>

                      <Link
                        to={`/assessments/${assessment._id}/edit`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Created{" "}
                        {formatDateTime(
                          assessment.createdAt,
                        )}
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
