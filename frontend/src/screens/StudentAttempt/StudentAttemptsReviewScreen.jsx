
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
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetAttemptsForReviewQuery } from "../../slices/answerEvaluationApiSlice";
import { useGetStudentsQuery } from "../../slices/studentApiSlice";
import { useGetAssessmentsQuery } from "../../slices/assessmentApiSlice";

const StudentAttemptsReviewScreen = () => {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState("");
  const [assessmentId, setAssessmentId] = useState("");

  const {
    data: studentsResponse,
    isLoading: studentsLoading,
  } = useGetStudentsQuery();

  const {
    data: assessmentsResponse,
    isLoading: assessmentsLoading,
  } = useGetAssessmentsQuery();

  const students = Array.isArray(studentsResponse)
    ? studentsResponse
    : studentsResponse?.students || studentsResponse?.data || [];

  const assessments = Array.isArray(assessmentsResponse)
    ? assessmentsResponse
    : assessmentsResponse?.assessments || assessmentsResponse?.data || [];

  const {
    data: attemptsResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAttemptsForReviewQuery(
    {
      student: studentId,
      assessment: assessmentId,
    },
    {
      skip: !studentId || !assessmentId,
    }
  );

  const attempts = Array.isArray(attemptsResponse)
    ? attemptsResponse
    : attemptsResponse?.attempts ||
      attemptsResponse?.data ||
      [];
      
  const getStudentName = (student) => {
    if (!student) return "Student";
    if (typeof student === "string") return "Student";
    if (student.name) return student.name;

    const fullName = [
      student.firstName,
      student.middleName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      fullName ||
      student.studentName ||
      student.user?.name ||
      "Student"
    );
  };

  const getAssessmentName = (assessment) => {
    if (!assessment) return "Assessment";
    if (typeof assessment === "string") return "Assessment";

    return (
      assessment.title ||
      assessment.name ||
      assessment.assessmentName ||
      "Assessment"
    );
  };

  const getStatusConfig = (status) => {
    const configs = {
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

    return (
      configs[status] || {
        label: status || "Ready for Review",
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

  const formatTimeSpent = (seconds) => {
    if (!seconds) return "0m";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (!minutes) return `${remainingSeconds}s`;

    return `${minutes}m ${remainingSeconds}s`;
  };

  const getAttemptId = (attempt) => {
    return attempt._id || attempt.id;
  };

  const getAttemptMarks = (attempt) => {
    const value =
      attempt.totalAwardedMarks ??
      attempt.awardedMarks ??
      attempt.obtainedMarks ??
      attempt.score;

    return value === undefined || value === null ? null : value;
  };

  const getMaximumMarks = (attempt) => {
    const value =
      attempt.totalMarks ??
      attempt.maxMarks ??
      attempt.maximumMarks ??
      attempt.assessment?.totalMarks;

    return value === undefined || value === null ? null : value;
  };

  const getEvaluatedQuestionCount = (attempt) => {
  return (
    attempt.evaluatedQuestions ??
    attempt.evaluatedAnswers ??
    attempt.evaluatedCount ??
    attempt.evaluatedQuestionCount ??
    attempt.totalQuestions ??
    0
  );
};

  const handleReviewAttempt = (attempt) => {
    const attemptId = getAttemptId(attempt);
    
    if (!attemptId) return;

    navigate(`/student-answers-reviews/${attemptId}`);
  };

  const hasFilters = Boolean(studentId && assessmentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
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
            disabled={!hasFilters || isFetching}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-7 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg">
                  <History size={28} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    Review Evaluated Attempts
                  </h1>

                  <p className="mt-1 text-sm text-white/70">
                    Correct marks and feedback before publishing results
                  </p>
                </div>
              </div>

              {hasFilters && (
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <UserRound size={17} />
                  Student
                </label>

                <select
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  disabled={studentsLoading}
                  className="h-12 w-full rounded-xl border border-white/30 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {studentsLoading
                      ? "Loading students..."
                      : "Select Student"}
                  </option>

                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {getStudentName(student)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText size={17} />
                  Assessment
                </label>

                <select
                  value={assessmentId}
                  onChange={(event) =>
                    setAssessmentId(event.target.value)
                  }
                  disabled={assessmentsLoading}
                  className="h-12 w-full rounded-xl border border-white/30 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {assessmentsLoading
                      ? "Loading assessments..."
                      : "Select Assessment"}
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
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setStudentId("");
                  setAssessmentId("");
                }}
                disabled={!studentId && !assessmentId}
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Filter size={16} />
                Clear Selection
              </button>
            </div>
          </div>

          {!hasFilters ? (
            <div className="px-5 py-20 text-center sm:px-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-white">
                <Filter size={34} />
              </div>

              <h2 className="mt-6 text-xl font-bold text-white">
                Select Student and Assessment
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/65">
                Choose a student and assessment to view evaluated attempts
                awaiting review and publication.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-white">
                <Loader2 size={38} className="animate-spin" />
                <p className="text-sm text-white/70">
                  Loading attempts for review...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="px-5 py-20 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-100">
                <XCircle size={32} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                Unable to Load Attempts
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
                {error?.data?.message ||
                  error?.error ||
                  "An error occurred while loading attempts for review."}
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
            <div className="px-5 py-20 text-center sm:px-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-white">
                <CheckCircle2 size={34} />
              </div>

              <h2 className="mt-6 text-xl font-bold text-white">
                No Attempts Awaiting Review
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/65">
                No evaluated attempts awaiting review were returned for
                this student and assessment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 p-5 sm:p-8 xl:grid-cols-2">
              {attempts.map((attempt) => {

                const statusConfig = getStatusConfig(
                  attempt.reviewStatus ||
                    attempt.evaluationStatus ||
                    attempt.status
                );

                const awardedMarks = getAttemptMarks(attempt);
                const maximumMarks = getMaximumMarks(attempt);

                const student =
                  attempt.student ||
                  attempt.studentAttempt?.student;

                const assessment =
                  attempt.assessment ||
                  attempt.studentAttempt?.assessment;

                return (
                  <div
                    key={getAttemptId(attempt)}
                    className="overflow-hidden rounded-2xl border border-white/20 bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                            <FileText size={15} />
                            Evaluated Attempt
                          </div>

                          <h2 className="text-lg font-bold text-gray-800">
                            {getAssessmentName(assessment)}
                          </h2>

                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <UserRound size={15} />
                            {getStudentName(student)}
                          </div>
                        </div>

                        <span
                          className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${statusConfig.className}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-indigo-50 p-3">
                          <div className="mb-1 flex items-center gap-1.5 text-indigo-500">
                            <Target size={15} />
                            <span className="text-xs font-medium">
                              Attempt
                            </span>
                          </div>

                          <p className="text-lg font-bold text-gray-800">
                            #{attempt.attemptNumber ?? "-"}
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
                            {attempt.attemptedQuestions ??
                              attempt.totalAttemptedQuestions ??
                              0}
                            /
                            {attempt.totalQuestions ??
                              attempt.questionCount ??
                              0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-sky-50 p-3">
                          <div className="mb-1 flex items-center gap-1.5 text-sky-500">
                            <Timer size={15} />
                            <span className="text-xs font-medium">
                              Time Spent
                            </span>
                          </div>

                          <p className="text-lg font-bold text-gray-800">
                            {formatTimeSpent(attempt.timeSpent)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                          <p className="text-xs font-medium text-emerald-700">
                            Marks Awarded
                          </p>

                          <p className="mt-1 text-xl font-bold text-emerald-800">
                            {awardedMarks === null
                              ? "-"
                              : awardedMarks}
                          </p>
                        </div>

                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                          <p className="text-xs font-medium text-blue-700">
                            Maximum Marks
                          </p>

                          <p className="mt-1 text-xl font-bold text-blue-800">
                            {maximumMarks === null
                              ? "-"
                              : maximumMarks}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <CalendarDays size={16} />
                            Started
                          </div>

                          <span className="text-right font-medium text-gray-700">
                            {formatDateTime(attempt.startedAt)}
                          </span>
                        </div>

                        {attempt.submittedAt && (
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                              <CheckCircle2 size={16} />
                              Submitted
                            </div>

                            <span className="text-right font-medium text-gray-700">
                              {formatDateTime(attempt.submittedAt)}
                            </span>
                          </div>
                        )}

                        {(attempt.evaluatedAt ||
                          attempt.completedAt) && (
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                              <CheckCircle2 size={16} />
                              Evaluated
                            </div>

                            <span className="text-right font-medium text-gray-700">
                              {formatDateTime(
                                attempt.evaluatedAt ||
                                  attempt.completedAt
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-4 text-sm">
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
                        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700"
                      >
                        <Pencil size={16} />
                        Review and Correct Marks
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

export default StudentAttemptsReviewScreen;
