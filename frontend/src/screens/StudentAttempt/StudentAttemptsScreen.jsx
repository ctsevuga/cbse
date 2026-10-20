
import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Filter,
  History,
  Loader2,
  RefreshCw,
  Target,
  Timer,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetMyStudentAttemptsQuery } from "../../slices/studentAttemptApiSlice";

const StudentAttemptsScreen = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [assessmentId, setAssessmentId] = useState("");

  const {
    data: attempts = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMyStudentAttemptsQuery(
    {
      ...(assessmentId ? { assessmentId } : {}),
      ...(status ? { status } : {}),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const assessmentOptions = useMemo(() => {
    const map = new Map();

    attempts.forEach((attempt) => {
      const assessment = attempt.assessment;

      if (assessment?._id) {
        map.set(assessment._id, assessment);
      }
    });

    return Array.from(map.values());
  }, [attempts]);

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0 min";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    }

    if (hours > 0) {
      return `${hours}h`;
    }

    return `${mins}m`;
  };

  const getStatusConfig = (value) => {
    const configs = {
      IN_PROGRESS: {
        label: "In Progress",
        className: "bg-amber-100 text-amber-700 border-amber-200",
        icon: Clock3,
      },
      SUBMITTED: {
        label: "Submitted",
        className: "bg-blue-100 text-blue-700 border-blue-200",
        icon: CheckCircle2,
      },
      EVALUATING: {
        label: "Evaluating",
        className: "bg-purple-100 text-purple-700 border-purple-200",
        icon: Loader2,
      },
      EVALUATED: {
        label: "Evaluated",
        className: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: Award,
      },
      ABANDONED: {
        label: "Abandoned",
        className: "bg-gray-100 text-gray-600 border-gray-200",
        icon: XCircle,
      },
      EXPIRED: {
        label: "Expired",
        className: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      },
    };

    return (
      configs[value] || {
        label: value || "Unknown",
        className: "bg-gray-100 text-gray-600 border-gray-200",
        icon: FileText,
      }
    );
  };

  const getAssessmentName = (assessment) => {
    if (!assessment) return "Assessment";

    return (
      assessment.title ||
      assessment.name ||
      assessment.assessmentName ||
      "Assessment"
    );
  };

  const getPercentage = (attempt) => {
    if (!attempt.totalMarks || attempt.obtainedMarks === undefined) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (attempt.obtainedMarks / attempt.totalMarks) * 100
      )
    );
  };

  const handleViewAttempt = (attempt) => {
    navigate(`/student/attempts/${attempt._id}`);
  };

  const clearFilters = () => {
    setStatus("");
    setAssessmentId("");
  };

  const hasFilters = Boolean(status || assessmentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-7 shadow-2xl backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white shadow-lg">
                  <History size={25} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    My Attempts
                  </h1>
                  <p className="mt-1 text-sm text-white/70">
                    View your assessment attempts and results
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white backdrop-blur-md">
              <div className="flex items-center gap-3">
                <BarChart3 size={20} />
                <div>
                  <p className="text-xs text-white/60">
                    Total Attempts
                  </p>
                  <p className="text-xl font-bold">
                    {attempts.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-white">
              <Filter size={18} />
              <h2 className="font-semibold">Filter Attempts</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-indigo-100">
                  Assessment
                </label>

                <select
                  value={assessmentId}
                  onChange={(e) =>
                    setAssessmentId(e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-white/30 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">All Assessments</option>

                  {assessmentOptions.map((assessment) => (
                    <option
                      key={assessment._id}
                      value={assessment._id}
                    >
                      {getAssessmentName(assessment)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-indigo-100">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/30 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">All Statuses</option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="EVALUATING">Evaluating</option>
                  <option value="EVALUATED">Evaluated</option>
                  <option value="ABANDONED">Abandoned</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  className="h-11 w-full rounded-xl border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/15 bg-white/5">
              <div className="flex flex-col items-center gap-3 text-white">
                <Loader2 size={34} className="animate-spin" />
                <p className="text-sm text-white/80">
                  Loading your attempts...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200/30 bg-red-500/10 p-8 text-center backdrop-blur-md">
              <XCircle
                size={42}
                className="mx-auto mb-3 text-red-200"
              />
              <h3 className="text-lg font-semibold text-white">
                Unable to load attempts
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Something went wrong while loading your assessment
                history.
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                Try Again
              </button>
            </div>
          ) : attempts.length === 0 ? (
            <div className="rounded-2xl border border-white/15 bg-white/5 px-6 py-14 text-center backdrop-blur-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                <FileText size={30} />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-white">
                No Attempts Found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/65">
                {hasFilters
                  ? "No attempts match the selected filters. Try changing the filters to see more results."
                  : "You have not completed any assessment attempts yet."}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {attempts.map((attempt) => {
                const statusConfig = getStatusConfig(
                  attempt.status
                );
                const StatusIcon = statusConfig.icon;
                const percentage = getPercentage(attempt);

                return (
                  <div
                    key={attempt._id}
                    className="group overflow-hidden rounded-2xl border border-white/20 bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-indigo-600">
                            <FileText size={15} />
                            Assessment
                          </div>

                          <h3 className="truncate text-lg font-bold text-gray-800 sm:text-xl">
                            {getAssessmentName(
                              attempt.assessment
                            )}
                          </h3>
                        </div>

                        <div
                          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusConfig.className}`}
                        >
                          <StatusIcon
                            size={14}
                            className={
                              attempt.status === "EVALUATING"
                                ? "animate-spin"
                                : ""
                            }
                          />
                          {statusConfig.label}
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl bg-indigo-50 p-3">
                          <div className="mb-1 flex items-center gap-1.5 text-indigo-500">
                            <Target size={15} />
                            <span className="text-xs font-medium">
                              Attempt
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-800">
                            #{attempt.attemptNumber}
                          </p>
                        </div>

                        <div className="rounded-xl bg-purple-50 p-3">
                          <div className="mb-1 flex items-center gap-1.5 text-purple-500">
                            <FileText size={15} />
                            <span className="text-xs font-medium">
                              Questions
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-800">
                            {attempt.attemptedQuestions || 0}/
                            {attempt.totalQuestions || 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-emerald-50 p-3">
                          <div className="mb-1 flex items-center gap-1.5 text-emerald-500">
                            <Award size={15} />
                            <span className="text-xs font-medium">
                              Marks
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-800">
                            {attempt.obtainedMarks || 0}/
                            {attempt.totalMarks || 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-sky-50 p-3">
                          <div className="mb-1 flex items-center gap-1.5 text-sky-500">
                            <Timer size={15} />
                            <span className="text-xs font-medium">
                              Duration
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-800">
                            {formatDuration(
                              attempt.durationMinutes
                            )}
                          </p>
                        </div>
                      </div>

                      {attempt.status === "EVALUATED" && (
                        <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-emerald-700">
                              Score
                            </span>
                            <span className="text-lg font-bold text-emerald-700">
                              {percentage}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <CalendarDays size={16} />
                            Started
                          </div>
                          <span className="text-right font-medium text-gray-700">
                            {formatDateTime(
                              attempt.startedAt
                            )}
                          </span>
                        </div>

                        {attempt.submittedAt && (
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                              <CheckCircle2 size={16} />
                              Submitted
                            </div>
                            <span className="text-right font-medium text-gray-700">
                              {formatDateTime(
                                attempt.submittedAt
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock3 size={16} />
                            Time Spent
                          </div>
                          <span className="font-medium text-gray-700">
                            {Math.floor(
                              (attempt.timeSpent || 0) / 60
                            )}
                            m{" "}
                            {(attempt.timeSpent || 0) % 60}s
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <History size={16} />
                            Attempt Date
                          </div>
                          <span className="font-medium text-gray-700">
                            {formatDate(attempt.createdAt)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleViewAttempt(attempt)
                        }
                        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 text-sm font-semibold text-white shadow-md transition duration-300 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-500"
                      >
                        <Eye size={17} />
                        View Attempt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttemptsScreen;
