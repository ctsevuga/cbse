
import React, { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Filter,
  History,
  Loader2,
  Pencil,
  RefreshCw,
  Target,
  Timer,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  
  useGetMyAssessmentsQuery,
} from "../../slices/assessmentApiSlice";

import {
  useGetAttemptsForReviewByAssessmentQuery,
  
} from "../../slices/answerEvaluationApiSlice";

const TeacherAssessmentAttemptsReviewScreen = () => {
  const navigate = useNavigate();
  const [assessmentId, setAssessmentId] = useState("");

  const {
    data: assessmentsResponse,
    isLoading: assessmentsLoading,
    isError: assessmentsError,
    error: assessmentsErrorDetails,
    refetch: refetchAssessments,
  } = useGetMyAssessmentsQuery();

  const assessments = Array.isArray(assessmentsResponse)
    ? assessmentsResponse
    : assessmentsResponse?.assessments ||
      assessmentsResponse?.data?.assessments ||
      assessmentsResponse?.data ||
      [];

  const {
  data: attemptsResponse,
  isLoading,
  isFetching,
  error,
  refetch,
} = useGetAttemptsForReviewByAssessmentQuery(
  { assessmentId },
  {
    skip: !assessmentId,
  }
);

  const attempts = Array.isArray(attemptsResponse)
    ? attemptsResponse
    : attemptsResponse?.data?.attempts ||
      attemptsResponse?.attempts ||
      attemptsResponse?.data ||
      [];

  const selectedAssessment = assessments.find(
    (assessment) =>
      String(assessment._id || assessment.id) === String(assessmentId)
  );

  const getStudentName = (student) => {
  if (!student || typeof student === "string") {
    return "Unknown Student";
  }

  const user =
    student.user && typeof student.user === "object"
      ? student.user
      : {};

  const fullName = [
    user.firstName ?? student.firstName,
    user.middleName ?? student.middleName,
    user.lastName ?? student.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    user.name ||
    user.fullName ||
    fullName ||
    student.name ||
    student.studentName ||
    student.fullName ||
    "Unknown Student"
  );
};

  const getAssessmentName = (assessment) => {
    if (!assessment || typeof assessment === "string") {
      return "Assessment";
    }

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
        label: "Evaluation In Progress",
        className: "border-purple-200 bg-purple-50 text-purple-700",
      },
      EVALUATED: {
        label: "Evaluated",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      },
      COMPLETED: {
        label: "Completed",
        className: "border-blue-200 bg-blue-50 text-blue-700",
      },
      REVIEW_REQUIRED: {
        label: "Review Required",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      },
      PENDING: {
        label: "Pending Review",
        className: "border-purple-200 bg-purple-50 text-purple-700",
      },
    };

    return configs[status] || {
      label: status || "Ready for Review",
      className: "border-gray-200 bg-gray-50 text-gray-600",
    };
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
    const remainingSeconds = Math.floor(totalSeconds % 60);

    return minutes === 0
      ? `${remainingSeconds}s`
      : `${minutes}m ${remainingSeconds}s`;
  };

  const getAttemptId = (attempt) => attempt?._id || attempt?.id;

  const getAttemptMarks = (attempt) =>
    attempt.totalAwardedMarks ??
    attempt.awardedMarks ??
    attempt.obtainedMarks ??
    attempt.score ??
    null;

  const getMaximumMarks = (attempt) =>
    attempt.totalMarks ??
    attempt.maxMarks ??
    attempt.maximumMarks ??
    attempt.assessment?.totalMarks ??
    selectedAssessment?.totalMarks ??
    null;

  const getEvaluatedQuestionCount = (attempt) =>
    attempt.evaluatedQuestions ??
    attempt.evaluatedAnswers ??
    attempt.evaluatedCount ??
    attempt.evaluatedQuestionCount ??
    0;

  const getQuestionCount = (attempt) => {
    const attempted =
      attempt.attemptedQuestions ??
      attempt.totalAttemptedQuestions ??
      0;

    const total =
      attempt.totalQuestions ??
      attempt.questionCount ??
      selectedAssessment?.totalQuestions ??
      0;

    return `${attempted}/${total}`;
  };

  const handleReviewAttempt = (attempt) => {
    const attemptId = getAttemptId(attempt);
    if (!attemptId) return;

    navigate(`/student-answers-reviews/${attemptId}`);
  };

  const handleRefresh = () => {
    if (assessmentId) {
      refetch();
    } else {
      refetchAssessments();
    }
  };

  const handleClearSelection = () => setAssessmentId("");

  const refreshing = assessmentId
    ? isFetching
    : assessmentsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-7 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <History size={28} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    Teacher Assessment Review
                  </h1>
                  <p className="mt-1 text-sm text-white/70">
                    Select an assessment to review student attempts.
                  </p>
                </div>
              </div>

              {assessmentId && !isLoading && !error && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-white">
                  <Users size={21} />
                  <div>
                    <p className="text-xs text-white/60">
                      Attempts Available
                    </p>
                    <p className="text-xl font-bold">
                      {attempts.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-b border-white/10 bg-white/5 px-5 py-5 sm:px-8">
            <label
              htmlFor="teacher-review-assessment"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"
            >
              <FileText size={17} />
              Select Your Assessment
            </label>

            <select
              id="teacher-review-assessment"
              value={assessmentId}
              onChange={(event) => setAssessmentId(event.target.value)}
              disabled={assessmentsLoading || assessmentsError}
              className="h-12 w-full rounded-xl border border-white/30 bg-white px-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-cyan-200"
            >
              <option value="">
                {assessmentsLoading
                  ? "Loading assessments..."
                  : assessmentsError
                    ? "Unable to load assessments"
                    : assessments.length === 0
                      ? "No assessments available"
                      : "Choose an assessment"}
              </option>

              {assessments.map((assessment) => {
                const id = assessment._id || assessment.id;

                return (
                  <option key={id} value={id}>
                    {getAssessmentName(assessment)}
                  </option>
                );
              })}
            </select>

            {selectedAssessment && (
              <p className="mt-2 text-sm text-white/75">
                Selected: {getAssessmentName(selectedAssessment)}
              </p>
            )}

            {assessmentsError && (
              <p className="mt-3 text-sm text-white">
                {assessmentsErrorDetails?.data?.message ||
                  "Unable to load assessments."}
                <button
                  type="button"
                  onClick={refetchAssessments}
                  className="ml-2 underline"
                >
                  Try again
                </button>
              </p>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={!assessmentId}
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Filter size={16} />
                Clear Selection
              </button>
            </div>
          </div>

          {!assessmentId ? (
            <div className="px-5 py-20 text-center text-white">
              <Filter size={34} className="mx-auto" />
              <h2 className="mt-6 text-xl font-bold">
                Select an Assessment
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Choose one of your assessments to view student attempts.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center gap-3 text-white">
              <Loader2 size={32} className="animate-spin" />
              Loading student attempts...
            </div>
          ) : error ? (
            <div className="px-5 py-20 text-center text-white">
              <XCircle size={34} className="mx-auto" />
              <h2 className="mt-5 text-xl font-bold">
                Unable to Load Attempts
              </h2>
              <p className="mt-2 text-sm text-white/70">
                {error?.data?.message ||
                  error?.error ||
                  "Please try again."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-5 rounded-xl bg-white px-5 py-2.5 font-semibold text-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : attempts.length === 0 ? (
            <div className="px-5 py-20 text-center text-white">
              <CheckCircle2 size={34} className="mx-auto" />
              <h2 className="mt-6 text-xl font-bold">
                No Attempts Found
              </h2>
              <p className="mt-2 text-sm text-white/70">
                No student attempts were returned for this assessment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 p-5 sm:p-8 xl:grid-cols-2">
              {attempts.map((attempt) => {
                const attemptId = getAttemptId(attempt);
                const student =
                  attempt.student || attempt.studentAttempt?.student;
                const assessment =
                  attempt.assessment ||
                  attempt.studentAttempt?.assessment ||
                  selectedAssessment;

                const statusConfig = getStatusConfig(
                  attempt.reviewStatus ||
                    attempt.evaluationStatus ||
                    attempt.status
                );

                const awardedMarks = getAttemptMarks(attempt);
                const maximumMarks = getMaximumMarks(attempt);

                return (
                  <div
                    key={attemptId}
                    className="overflow-hidden rounded-2xl border border-white/20 bg-white shadow-xl"
                  >
                    <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-indigo-600">
                            <FileText size={15} />
                            Student Attempt
                          </p>
                          <h2 className="break-words text-lg font-bold text-gray-800">
                            {getStudentName(student)}
                          </h2>
                          <p className="mt-2 text-sm text-gray-500">
                            {getAssessmentName(assessment)}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${statusConfig.className}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-indigo-50 p-3">
                          <Target size={16} className="text-indigo-500" />
                          <p className="mt-1 text-xs text-indigo-600">
                            Attempt
                          </p>
                          <p className="font-bold text-gray-800">
                            #{attempt.attemptNumber ?? "-"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-purple-50 p-3">
                          <FileText size={16} className="text-purple-500" />
                          <p className="mt-1 text-xs text-purple-600">
                            Questions
                          </p>
                          <p className="font-bold text-gray-800">
                            {getQuestionCount(attempt)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-sky-50 p-3">
                          <Timer size={16} className="text-sky-500" />
                          <p className="mt-1 text-xs text-sky-600">
                            Time Spent
                          </p>
                          <p className="font-bold text-gray-800">
                            {formatTimeSpent(attempt.timeSpent)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                          <p className="text-xs text-emerald-700">
                            Marks Awarded
                          </p>
                          <p className="mt-1 text-xl font-bold text-emerald-800">
                            {awardedMarks ?? "-"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                          <p className="text-xs text-blue-700">
                            Maximum Marks
                          </p>
                          <p className="mt-1 text-xl font-bold text-blue-800">
                            {maximumMarks ?? "-"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="flex items-center gap-2 text-gray-500">
                            <CalendarDays size={16} />
                            Started
                          </span>
                          <span className="text-right text-gray-700">
                            {formatDateTime(attempt.startedAt)}
                          </span>
                        </div>

                        {attempt.submittedAt && (
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="flex items-center gap-2 text-gray-500">
                              <CheckCircle2 size={16} />
                              Submitted
                            </span>
                            <span className="text-right text-gray-700">
                              {formatDateTime(attempt.submittedAt)}
                            </span>
                          </div>
                        )}

                        {(attempt.evaluatedAt || attempt.completedAt) && (
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-gray-500">
                              Evaluated
                            </span>
                            <span className="text-right text-gray-700">
                              {formatDateTime(
                                attempt.evaluatedAt || attempt.completedAt
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Evaluated Questions
                          </span>
                          <span className="font-semibold text-gray-700">
                            {getEvaluatedQuestionCount(attempt)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReviewAttempt(attempt)}
                        disabled={!attemptId}
                        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 text-sm font-semibold text-white shadow-md hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                      >
                        <Pencil size={16} />
                        Review
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

export default TeacherAssessmentAttemptsReviewScreen;
