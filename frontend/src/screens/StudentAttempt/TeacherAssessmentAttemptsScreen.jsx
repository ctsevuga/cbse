
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Filter,
  History,
  Loader2,
  Pencil,
  RefreshCw,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import {
  useGetAssessmentAttemptsForTeacherQuery,
} from "../../slices/answerEvaluationApiSlice";

import {
  useGetMyAssessmentsQuery,
} from "../../slices/assessmentApiSlice";

const TeacherAssessmentAttemptsScreen = () => {
  const navigate = useNavigate();
  const [assessmentId, setAssessmentId] = useState("");

  // Load assessments assigned to the current teacher.
  const {
    data: assessmentsResponse,
    isLoading: assessmentsLoading,
    isError: assessmentsError,
    error: assessmentsErrorDetails,
    refetch: refetchAssessments,
  } = useGetMyAssessmentsQuery();

  const assessments = Array.isArray(assessmentsResponse)
    ? assessmentsResponse
    : Array.isArray(assessmentsResponse?.assessments)
      ? assessmentsResponse.assessments
      : Array.isArray(assessmentsResponse?.data?.assessments)
        ? assessmentsResponse.data.assessments
        : Array.isArray(assessmentsResponse?.data)
          ? assessmentsResponse.data
          : [];

  // Fetch attempts using only the selected assessment ID.
  const {
    data: attemptsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAssessmentAttemptsForTeacherQuery(
    assessmentId,
    { skip: !assessmentId }
  );

  const attempts = Array.isArray(attemptsResponse)
    ? attemptsResponse
    : Array.isArray(attemptsResponse?.attempts)
      ? attemptsResponse.attempts
      : Array.isArray(attemptsResponse?.data?.attempts)
        ? attemptsResponse.data.attempts
        : Array.isArray(attemptsResponse?.data)
          ? attemptsResponse.data
          : [];

  const selectedAssessment = assessments.find(
    (assessment) => assessment._id === assessmentId
  );

  const getStudentName = (student) => {
    if (!student) return "Unknown Student";

    if (typeof student === "string") {
      return "Unknown Student";
    }

    if (student.name?.trim()) {
      return student.name;
    }

    const fullName = [
      student.firstName,
      student.middleName,
      student.lastName,
    ]
      .filter((part) => typeof part === "string" && part.trim())
      .join(" ");

    return (
      fullName ||
      student.studentName ||
      student.user?.name ||
      "Unknown Student"
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

  const getStatusConfig = (status) => {
    const configs = {
      IN_PROGRESS: {
        label: "In Progress",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      },
      SUBMITTED: {
        label: "Submitted",
        className: "border-blue-200 bg-blue-50 text-blue-700",
      },
      EVALUATING: {
        label: "Evaluating",
        className: "border-purple-200 bg-purple-50 text-purple-700",
      },
      EVALUATED: {
        label: "Evaluated",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      },
    };

    return (
      configs[status] || {
        label: status || "Unknown",
        className: "border-gray-200 bg-gray-50 text-gray-600",
      }
    );
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeSpent = (seconds = 0) => {
    const totalSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    if (minutes === 0) return `${remainingSeconds}s`;

    return `${minutes}m ${remainingSeconds}s`;
  };

  // Only submissions awaiting evaluation are displayed.
  const evaluableAttempts = attempts.filter((attempt) =>
    ["SUBMITTED", "EVALUATING"].includes(attempt.status)
  );

  const handleEvaluate = (attempt) => {
    if (!attempt?._id) return;

    navigate(`/answer-evaluations/create/${attempt._id}`, {
      state: {
        attemptId: attempt._id,
        assessmentId,
        assessmentName: getAssessmentName(
          attempt.assessment || selectedAssessment
        ),
        studentName: getStudentName(attempt.student),
      },
    });
  };

  const handleRefresh = () => {
    if (assessmentId) {
      refetch();
    } else {
      refetchAssessments();
    }
  };

  const isRefreshing =
    assessmentsLoading || (Boolean(assessmentId) && isFetching);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
          {/* Title */}
          <div className="border-b border-white/10 px-5 py-7 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <History size={28} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    Student Answer Evaluation
                  </h1>
                  <p className="mt-1 text-sm text-white/70">
                    Select an assessment to review student submissions.
                  </p>
                </div>
              </div>

              {assessmentId && !isLoading && !isError && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-white">
                  <Users size={21} />
                  <div>
                    <p className="text-xs text-white/60">
                      Submissions Ready
                    </p>
                    <p className="text-xl font-bold">
                      {evaluableAttempts.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assessment selector */}
          <div className="border-b border-white/10 bg-white/5 px-5 py-5 sm:px-8">
            <label
              htmlFor="teacher-assessment"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"
            >
              <FileText size={17} />
              Select Assessment
            </label>

            <div className="relative">
              <select
                id="teacher-assessment"
                value={assessmentId}
                onChange={(event) => setAssessmentId(event.target.value)}
                disabled={assessmentsLoading || assessmentsError}
                className="h-12 w-full appearance-none rounded-xl border border-white/30 bg-white px-4 pr-11 text-sm font-medium text-gray-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:bg-gray-100"
              >
                <option value="">
                  {assessmentsLoading
                    ? "Loading your assessments..."
                    : assessmentsError
                      ? "Unable to load assessments"
                      : assessments.length === 0
                        ? "No assessments available"
                        : "Choose an assessment"}
                </option>

                {assessments.map((assessment) => (
                  <option
                    key={assessment._id}
                    value={assessment._id}
                  >
                    {getAssessmentName(assessment)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>

            {assessmentsError && (
              <div className="mt-3 text-sm text-white">
                {assessmentsErrorDetails?.data?.message ||
                  "Unable to load your assessments."}

                <button
                  type="button"
                  onClick={refetchAssessments}
                  className="ml-2 underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Submission list */}
          {!assessmentId ? (
            <div className="px-5 py-16 text-center sm:px-8">
              <Filter size={34} className="mx-auto text-white" />

              <h2 className="mt-5 text-xl font-bold text-white">
                Choose an Assessment
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm text-white/70">
                Select an assessment to view student submissions
                available for evaluation.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center gap-3 text-white">
              <Loader2 size={30} className="animate-spin" />
              Loading student submissions...
            </div>
          ) : isError ? (
            <div className="px-5 py-16 text-center text-white">
              <XCircle size={32} className="mx-auto" />

              <h2 className="mt-4 text-xl font-bold">
                Unable to Load Submissions
              </h2>

              <p className="mt-2 text-sm text-white/70">
                {error?.data?.message ||
                  error?.error ||
                  "Please try again."}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-xl bg-white px-5 py-2 text-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : evaluableAttempts.length === 0 ? (
            <div className="px-5 py-16 text-center text-white">
              <Users size={34} className="mx-auto" />

              <h2 className="mt-5 text-xl font-bold">
                No Submissions Ready for Evaluation
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm text-white/70">
                No submitted or currently evaluating attempts were
                found for this assessment.
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4 sm:p-6">
              {evaluableAttempts.map((attempt) => {
                const statusConfig = getStatusConfig(attempt.status);

                return (
                  <div
                    key={attempt._id}
                    className="rounded-2xl border border-white/20 bg-white p-4 shadow-lg sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* Student details */}
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                          <UserRound size={23} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words font-bold text-gray-800">
                            {getStudentName(attempt.student)}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {getAssessmentName(
                              attempt.assessment || selectedAssessment
                            )}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                            </span>

                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                              Attempt #{attempt.attemptNumber ?? "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Attempt statistics */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-indigo-50 p-3">
                          <p className="text-xs text-indigo-600">
                            Questions
                          </p>
                          <p className="mt-1 font-bold text-gray-800">
                            {attempt.attemptedQuestions ?? 0}/
                            {attempt.totalQuestions ?? 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-sky-50 p-3">
                          <p className="text-xs text-sky-600">
                            Time Spent
                          </p>
                          <p className="mt-1 font-bold text-gray-800">
                            {formatTimeSpent(attempt.timeSpent)}
                          </p>
                        </div>

                        <div className="col-span-2 rounded-xl bg-purple-50 p-3 sm:col-span-1">
                          <p className="text-xs text-purple-600">
                            Submitted
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {formatDateTime(attempt.submittedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Evaluate action */}
                      <button
                        type="button"
                        onClick={() => handleEvaluate(attempt)}
                        className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 text-sm font-semibold text-white shadow-md transition hover:from-emerald-600 hover:to-teal-700"
                      >
                        <Pencil size={16} />
                        {attempt.status === "EVALUATING"
                          ? "Continue Evaluation"
                          : "Evaluate"}
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

export default TeacherAssessmentAttemptsScreen;
