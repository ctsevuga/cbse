import React from "react";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Hash,
  Loader2,
  Target,
  Timer,
  UserRound,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetStudentAttemptDetailsQuery,
  useUpdateStudentAttemptStatusMutation,
} from "../../slices/studentAttemptApiSlice";

const StudentAttemptDetailsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: attempt,
    isLoading,
    error,
    refetch,
  } = useGetStudentAttemptDetailsQuery(id, {
    skip: !id,
  });

  const [
    updateStudentAttemptStatus,
    { isLoading: isUpdatingStatus },
  ] = useUpdateStudentAttemptStatusMutation();

  const getStudentName = (student) => {
    if (!student) return "Student";

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

    return (
      assessment.title ||
      assessment.name ||
      assessment.assessmentName ||
      "Assessment"
    );
  };

  const getSubjectName = (assessment) => {
    if (!assessment) return "";

    return (
      assessment.subject?.name ||
      assessment.subject?.title ||
      ""
    );
  };

  const getStatusConfig = (status) => {
    const configs = {
      IN_PROGRESS: {
        label: "In Progress",
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
      },
      SUBMITTED: {
        label: "Submitted",
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
        icon: CheckCircle2,
      },
      EVALUATING: {
        label: "Evaluating",
        className:
          "border-purple-200 bg-purple-50 text-purple-700",
        icon: Loader2,
      },
      EVALUATED: {
        label: "Evaluated",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: Award,
      },
      ABANDONED: {
        label: "Abandoned",
        className:
          "border-gray-200 bg-gray-50 text-gray-600",
        icon: XCircle,
      },
      EXPIRED: {
        label: "Expired",
        className:
          "border-red-200 bg-red-50 text-red-700",
        icon: XCircle,
      },
    };

    return (
      configs[status] || {
        label: status || "Unknown",
        className:
          "border-gray-200 bg-gray-50 text-gray-600",
        icon: FileText,
      }
    );
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
    const remainingMinutes = minutes % 60;

    if (hours && remainingMinutes) {
      return `${hours}h ${remainingMinutes}m`;
    }

    if (hours) return `${hours}h`;

    return `${remainingMinutes}m`;
  };

  const formatTimeSpent = (seconds) => {
    if (!seconds) return "0m";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(
      (seconds % 3600) / 60
    );
    const remainingSeconds = seconds % 60;

    if (hours && minutes) {
      return `${hours}h ${minutes}m`;
    }

    if (hours) {
      return `${hours}h`;
    }

    if (minutes && remainingSeconds) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    if (minutes) {
      return `${minutes}m`;
    }

    return `${remainingSeconds}s`;
  };

  const getPercentage = () => {
    if (
      !attempt?.totalMarks ||
      attempt.obtainedMarks === undefined ||
      attempt.obtainedMarks === null
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (attempt.obtainedMarks /
          attempt.totalMarks) *
          100
      )
    );
  };

  const getQuestionId = (question) => {
    if (!question) return "-";

    if (typeof question === "string") {
      return question;
    }

    return question._id || "-";
  };

  const getQuestionText = (question) => {
    if (!question) return "Question";

    if (typeof question === "string") {
      return question;
    }

    return (
      question.questionText ||
      question.text ||
      question.question ||
      `Question ${question._id || ""}`
    );
  };

  const getQuestionType = (question) => {
    if (!question || typeof question === "string") {
      return "";
    }

    return question.questionType || "";
  };

  const handleStatusUpdate = async (status) => {
    if (!attempt?._id || isUpdatingStatus) {
      return;
    }

    try {
      await updateStudentAttemptStatus({
        id: attempt._id,
        status,
      }).unwrap();

      await refetch();
    } catch {
      return;
    }
  };

  const statusConfig = getStatusConfig(
    attempt?.status
  );

  const StatusIcon = statusConfig.icon;

  const percentage = getPercentage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-white">
            <Loader2
              size={42}
              className="animate-spin"
            />

            <p className="text-sm text-white/75">
              Loading attempt details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="rounded-3xl border border-white/20 bg-white/10 px-5 py-20 text-center shadow-2xl backdrop-blur-xl sm:px-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-red-100">
              <XCircle size={38} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-white">
              Unable to Load Attempt
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/65">
              {error?.data?.message ||
                "The requested student attempt could not be found."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          <div
            className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${statusConfig.className}`}
          >
            <StatusIcon
              size={17}
              className={
                attempt.status === "EVALUATING"
                  ? "animate-spin"
                  : ""
              }
            />

            {statusConfig.label}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-7 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg">
                  <FileText size={30} />
                </div>

                <div>
                  <p className="text-sm font-medium text-white/60">
                    Student Assessment Attempt
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    {getAssessmentName(
                      attempt.assessment
                    )}
                  </h1>

                  {getSubjectName(
                    attempt.assessment
                  ) && (
                    <p className="mt-1 text-sm text-white/70">
                      {getSubjectName(
                        attempt.assessment
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white">
                <Target size={23} />

                <div>
                  <p className="text-xs text-white/60">
                    Attempt Number
                  </p>

                  <p className="text-xl font-bold">
                    #{attempt.attemptNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 border-b border-white/10 bg-white/5 p-5 sm:p-8 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-400/20 p-3 text-cyan-100">
                  <UserRound size={22} />
                </div>

                <div>
                  <p className="text-xs text-white/55">
                    Student
                  </p>

                  <p className="mt-1 font-bold">
                    {getStudentName(
                      attempt.student
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-400/20 p-3 text-purple-100">
                  <FileText size={22} />
                </div>

                <div>
                  <p className="text-xs text-white/55">
                    Questions
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {attempt.attemptedQuestions || 0}/
                    {attempt.totalQuestions || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-400/20 p-3 text-emerald-100">
                  <Award size={22} />
                </div>

                <div>
                  <p className="text-xs text-white/55">
                    Marks
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {attempt.obtainedMarks || 0}/
                    {attempt.totalMarks || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-400/20 p-3 text-amber-100">
                  <Timer size={22} />
                </div>

                <div>
                  <p className="text-xs text-white/55">
                    Time Spent
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {formatTimeSpent(
                      attempt.timeSpent
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 sm:p-8 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <div className="rounded-2xl border border-white/20 bg-white p-5 shadow-xl sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Attempt Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Detailed timing and assessment information
                    </p>
                  </div>

                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <CalendarDays size={23} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CalendarDays size={17} />
                      <span className="text-sm">
                        Started At
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-800">
                      {formatDateTime(
                        attempt.startedAt
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock3 size={17} />
                      <span className="text-sm">
                        Last Activity
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-800">
                      {formatDateTime(
                        attempt.lastActivityAt
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CheckCircle2 size={17} />
                      <span className="text-sm">
                        Submitted At
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-800">
                      {formatDateTime(
                        attempt.submittedAt
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Timer size={17} />
                      <span className="text-sm">
                        Allowed Duration
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-800">
                      {formatDuration(
                        attempt.durationMinutes
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock3 size={17} />
                      <span className="text-sm">
                        Time Spent
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-800">
                      {formatTimeSpent(
                        attempt.timeSpent
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Hash size={17} />
                      <span className="text-sm">
                        Attempt ID
                      </span>
                    </div>

                    <p className="mt-2 break-all font-mono text-xs font-semibold text-gray-800">
                      {attempt._id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/20 bg-white p-5 shadow-xl sm:p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Question Order
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Questions stored in the exact order used for this
                    attempt
                  </p>
                </div>

                {attempt.questionOrder?.length ? (
                  <div className="space-y-3">
                    {attempt.questionOrder.map(
                      (item, index) => {
                        const question =
                          item.question;

                        return (
                          <div
                            key={`${getQuestionId(
                              question
                            )}-${item.order}-${index}`}
                            className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-md">
                                {item.order}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-800">
                                  {getQuestionText(
                                    question
                                  )}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  {getQuestionType(
                                    question
                                  ) && (
                                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                      {getQuestionType(
                                        question
                                      )}
                                    </span>
                                  )}

                                  <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    {item.optionOrder
                                      ?.length || 0}{" "}
                                    options
                                  </span>

                                  <span className="font-mono text-[11px] text-gray-400">
                                    {getQuestionId(
                                      question
                                    )}
                                  </span>
                                </div>
                              </div>

                              {item.optionOrder?.length >
                                0 && (
                                <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                    Option Order
                                  </p>

                                  <p className="mt-1 font-mono text-xs text-gray-600">
                                    {item.optionOrder
                                      .map(
                                        (option) =>
                                          typeof option ===
                                          "string"
                                            ? option.slice(
                                                -6
                                              )
                                            : option?._id?.slice(
                                                -6
                                              )
                                      )
                                      .join(" → ")}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-50 px-5 py-10 text-center text-sm text-gray-500">
                    No question order information is available.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/20 bg-white p-6 shadow-xl">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                    <Award size={36} />
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-gray-800">
                    Result
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Current attempt performance
                  </p>

                  <div className="mt-6">
                    <p className="text-5xl font-black text-indigo-600">
                      {percentage}%
                    </p>

                    <p className="mt-2 text-sm font-medium text-gray-500">
                      {attempt.obtainedMarks || 0} out of{" "}
                      {attempt.totalMarks || 0} marks
                    </p>
                  </div>

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white p-6 shadow-xl">
                <h2 className="text-lg font-bold text-gray-800">
                  Attempt Summary
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-3">
                    <span className="text-sm text-gray-600">
                      Total Questions
                    </span>

                    <span className="font-bold text-indigo-700">
                      {attempt.totalQuestions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3">
                    <span className="text-sm text-gray-600">
                      Attempted
                    </span>

                    <span className="font-bold text-purple-700">
                      {attempt.attemptedQuestions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                    <span className="text-sm text-gray-600">
                      Total Marks
                    </span>

                    <span className="font-bold text-emerald-700">
                      {attempt.totalMarks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-sky-50 p-3">
                    <span className="text-sm text-gray-600">
                      Obtained Marks
                    </span>

                    <span className="font-bold text-sky-700">
                      {attempt.obtainedMarks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3">
                    <span className="text-sm text-gray-600">
                      Duration
                    </span>

                    <span className="font-bold text-amber-700">
                      {formatDuration(
                        attempt.durationMinutes
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white p-6 shadow-xl">
                <h2 className="text-lg font-bold text-gray-800">
                  Status
                </h2>

                <div
                  className={`mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-4 text-sm font-bold ${statusConfig.className}`}
                >
                  <StatusIcon
                    size={19}
                    className={
                      attempt.status ===
                      "EVALUATING"
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {statusConfig.label}
                </div>

                <div className="mt-5 space-y-3">
                  {attempt.status === "IN_PROGRESS" && (
                    <>
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() =>
                          handleStatusUpdate(
                            "SUBMITTED"
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdatingStatus ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2 size={18} />
                        )}
                        Submit Attempt
                      </button>

                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() =>
                          handleStatusUpdate(
                            "ABANDONED"
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdatingStatus ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle size={18} />
                        )}
                        Abandon Attempt
                      </button>
                    </>
                  )}

                  {attempt.status === "SUBMITTED" && (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() =>
                        handleStatusUpdate(
                          "EVALUATING"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingStatus ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Loader2 size={18} />
                      )}
                      Start Evaluation
                    </button>
                  )}

                  {attempt.status === "EVALUATING" && (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() =>
                        handleStatusUpdate(
                          "EVALUATED"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingStatus ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Award size={18} />
                      )}
                      Mark as Evaluated
                    </button>
                  )}

                  {attempt.status === "EXPIRED" && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                      <p className="text-sm font-semibold text-red-800">
                        This attempt has expired.
                      </p>
                    </div>
                  )}

                  {attempt.status === "ABANDONED" && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                      <p className="text-sm font-semibold text-gray-700">
                        This attempt has been abandoned.
                      </p>
                    </div>
                  )}

                  {attempt.status === "EVALUATED" && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                      <p className="text-sm font-semibold text-emerald-800">
                        Evaluation is complete.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/5 px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/student-attempts/${attempt._id}/edit`
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
              >
                Edit Attempt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttemptDetailsScreen;
