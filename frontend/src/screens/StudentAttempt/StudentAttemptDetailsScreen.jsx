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
  MessageSquare,
  ClipboardCheck,
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

  if (
    typeof question === "string" ||
    typeof question === "number"
  ) {
    return question;
  }

  if (typeof question !== "object") {
    return "Question";
  }

  const text =
    question.questionText ??
    question.text ??
    question.question;

  if (
    typeof text === "string" ||
    typeof text === "number"
  ) {
    return text;
  }

  // Handle unexpectedly nested question objects.
  if (text && typeof text === "object") {
    if (typeof text.questionText === "string") {
      return text.questionText;
    }

    if (typeof text.text === "string") {
      return text.text;
    }
  }

  return `Question ${question._id || ""}`;
};


  const getQuestionType = (question) => {
    if (!question || typeof question === "string") {
      return "";
    }

    return question.questionType || "";
  };


const getTeacherName = (teacher) => {
  if (!teacher) return "Teacher";

  if (typeof teacher === "string") {
    return teacher;
  }

  return (
    teacher.name ||
    teacher.user?.name ||
    teacher.firstName ||
    "Teacher"
  );
};

const getEvaluationStatusConfig = (status) => {
  const configs = {
    PENDING: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700",
    },
    EVALUATED: {
      label: "Evaluated",
      className: "bg-emerald-100 text-emerald-700",
    },
    REVIEW_REQUIRED: {
      label: "Review Required",
      className: "bg-orange-100 text-orange-700",
    },
    REVISED: {
      label: "Revised",
      className: "bg-blue-100 text-blue-700",
    },
    PUBLISHED: {
      label: "Published",
      className: "bg-purple-100 text-purple-700",
    },
  };

  return (
    configs[status] || {
      label: status || "Not Evaluated",
      className: "bg-gray-100 text-gray-600",
    }
  );
};

/*
 * Safely render answers stored as Mixed objects.
 * Supports strings, numbers, arrays and nested objects.
 */
const renderAnswerValue = (value, depth = 0) => {
  if (value === null || value === undefined || value === "") {
    return (
      <span className="text-sm italic text-gray-400">
        No answer provided
      </span>
    );
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return (
      <span className="whitespace-pre-wrap break-words text-sm text-gray-800">
        {String(value)}
      </span>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span className="text-sm text-gray-800">
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (depth >= 5) {
    return (
      <span className="text-xs text-gray-500">
        Structured answer
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span className="text-sm italic text-gray-400">
          Empty answer
        </span>
      );
    }

    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-lg bg-white p-2"
          >
            {renderAnswerValue(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).filter(
      ([key, item]) =>
        !["_id", "__v", "createdAt", "updatedAt"].includes(key) &&
        item !== null &&
        item !== undefined
    );

    if (entries.length === 0) {
      return (
        <span className="text-sm italic text-gray-400">
          No answer content
        </span>
      );
    }

    return (
      <div className="space-y-2">
        {entries.map(([key, item]) => (
          <div
            key={key}
            className="rounded-lg bg-white p-2"
          >
            <p className="mb-1 text-xs font-semibold capitalize text-gray-500">
              {key.replace(/([A-Z])/g, " $1")}
            </p>

            {renderAnswerValue(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  return null;
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

const evaluatedAnswers = Array.isArray(
  attempt?.evaluatedAnswers
)
  ? attempt.evaluatedAnswers
  : [];

const questionOrderMap = new Map(
  (attempt?.questionOrder || []).map((item, index) => {
    const question = item.question || item;

    return [
      getQuestionId(question).toString(),
      item.order || index + 1,
    ];
  })
);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-3 py-3 sm:px-4 sm:py-4">
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
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="border-b border-white/10 px-4 py-4 sm:px-5">
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-lg">
  <FileText size={23} />
</div>

                <div>
                  <p className="text-sm font-medium text-white/60">
                    Student Assessment Attempt
                  </p>

                  <h1 className="mt-0.5 text-xl font-bold text-white sm:text-2xl">
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

              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white">
  <Target size={19} />

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

          {/* COMPACT ATTEMPT SUMMARY - SINGLE ROW */}
<div className="grid grid-cols-2 gap-2 border-b border-white/10 bg-white/5 p-3 sm:grid-cols-4">

  {/* STUDENT */}
  <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white">
    <div className="shrink-0 rounded-lg bg-cyan-400/20 p-2 text-cyan-100">
      <UserRound size={18} />
    </div>

    <div className="min-w-0">
      <p className="text-[11px] text-white/60">Student</p>
      <p className="truncate text-sm font-bold">
        {getStudentName(attempt.student)}
      </p>
    </div>
  </div>

  {/* QUESTIONS */}
  <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white">
    <div className="shrink-0 rounded-lg bg-purple-400/20 p-2 text-purple-100">
      <FileText size={18} />
    </div>

    <div>
      <p className="text-[11px] text-white/60">Questions</p>
      <p className="text-sm font-bold">
        {attempt.attemptedQuestions || 0}/{attempt.totalQuestions || 0}
      </p>
    </div>
  </div>

  {/* MARKS */}
  <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white">
    <div className="shrink-0 rounded-lg bg-emerald-400/20 p-2 text-emerald-100">
      <Award size={18} />
    </div>

    <div>
      <p className="text-[11px] text-white/60">Marks</p>
      <p className="text-sm font-bold">
        {attempt.obtainedMarks || 0}/{attempt.totalMarks || 0}
      </p>
    </div>
  </div>

  {/* TIME SPENT */}
  <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white">
    <div className="shrink-0 rounded-lg bg-amber-400/20 p-2 text-amber-100">
      <Timer size={18} />
    </div>

    <div>
      <p className="text-[11px] text-white/60">Time Spent</p>
      <p className="text-sm font-bold">
        {formatTimeSpent(attempt.timeSpent)}
      </p>
    </div>
  </div>

</div>

          <div className="grid grid-cols-1 gap-4 p-3 sm:p-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <div className="rounded-xl border border-white/20 bg-white p-4 shadow-md">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CalendarDays size={17} />
                      <span className="text-sm">
                        Started At
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
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

              <div className="mt-4 rounded-xl border border-white/20 bg-white p-4 shadow-md">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800">
                    Question Order
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Questions stored in the exact order used for this
                    attempt
                  </p>
                </div>

                {attempt.questionOrder?.length ? (
                  <div className="space-y-2">
                    {attempt.questionOrder.map(
                      (item, index) => {
                        const question =
                          item.question;

                        return (
                          <div
                            key={`${getQuestionId(
                              question
                            )}-${item.order}-${index}`}
                            className="rounded-lg border border-gray-100 bg-gray-50 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-md">
                                {item.order || index + 1}
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

{/* =====================================================
    STUDENT ANSWERS & TEACHER EVALUATION
===================================================== */}

{attempt.status === "EVALUATED" && (
  <div className="mt-6 rounded-2xl border border-white/20 bg-white p-5 shadow-xl sm:p-6">

    {/* SECTION HEADER */}
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <div className="flex items-center gap-2">
          <ClipboardCheck
            size={23}
            className="text-emerald-600"
          />

          <h2 className="text-xl font-bold text-gray-800">
            Student Answers & Teacher Evaluation
          </h2>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Submitted answers, awarded marks and teacher feedback
        </p>
      </div>

      <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
        {evaluatedAnswers.length} Answers
      </span>

    </div>

    {/* NO ANSWERS */}
    {evaluatedAnswers.length === 0 ? (
      <div className="rounded-xl bg-gray-50 px-5 py-10 text-center">

        <FileText
          size={32}
          className="mx-auto text-gray-400"
        />

        <p className="mt-3 text-sm text-gray-500">
          No student answers were found for this attempt.
        </p>

      </div>
    ) : (

      <div className="space-y-4">

        {evaluatedAnswers.map((studentAnswer, index) => {

          const question = studentAnswer.question;

          const questionId = getQuestionId(question);

          const questionNumber =
            questionOrderMap.get(questionId.toString()) ||
            index + 1;

          const evaluation =
            studentAnswer.evaluation;

          const evaluationStatus =
            getEvaluationStatusConfig(
              evaluation?.evaluationStatus
            );

          return (
            <div
              key={studentAnswer._id}
              className="overflow-hidden rounded-xl border border-gray-200"
            >

              {/* QUESTION HEADER */}
              <div className="border-b border-gray-100 bg-indigo-50 px-4 py-3">

                <div className="flex flex-wrap items-center justify-between gap-2">

                  <div className="flex items-center gap-2">

                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                      {questionNumber}
                    </span>

                    <div>
                      <p className="text-xs font-semibold text-indigo-600">
                        Question {questionNumber}
                      </p>

                      <p className="text-xs text-gray-500">
                        {getQuestionType(question)}
                        {question?.marks !== undefined &&
                          ` • ${question.marks} marks`}
                      </p>
                    </div>

                  </div>

                  {evaluation && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${evaluationStatus.className}`}
                    >
                      {evaluationStatus.label}
                    </span>
                  )}

                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-gray-800">
                  {getQuestionText(question)}
                </p>

              </div>

              {/* STUDENT ANSWER */}
              <div className="space-y-4 p-4">

                <div>

                  <div className="mb-2 flex items-center gap-2">
                    <UserRound
                      size={16}
                      className="text-indigo-600"
                    />

                    <h3 className="text-sm font-bold text-gray-700">
                      Student Answer
                    </h3>

                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                      {studentAnswer.answerMode}
                    </span>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">

                    {studentAnswer.selectedOption && (
                      <div className="mb-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3">

                        <p className="mb-1 text-xs font-semibold text-indigo-600">
                          Selected Option
                        </p>

                        <p className="text-sm font-semibold text-indigo-800">
                          {studentAnswer.selectedOption}
                        </p>

                      </div>
                    )}

                    {studentAnswer.answer !== null &&
                    studentAnswer.answer !== undefined &&
                    studentAnswer.answer !== "" ? (
                      renderAnswerValue(studentAnswer.answer)
                    ) : !studentAnswer.selectedOption ? (
                      <p className="text-sm italic text-gray-400">
                        No answer provided.
                      </p>
                    ) : null}

                    {studentAnswer.attachments?.length > 0 && (
                      <div className="mt-3 border-t border-gray-200 pt-3">

                        <p className="mb-2 text-xs font-semibold text-gray-600">
                          Attachments ({studentAnswer.attachments.length})
                        </p>

                        <div className="space-y-1">

                          {studentAnswer.attachments.map(
                            (attachment, attachmentIndex) => (
                              <div
                                key={attachment._id || attachmentIndex}
                                className="flex items-center gap-2 text-xs text-gray-600"
                              >
                                <FileText size={13} />

                                {typeof attachment === "string"
                                  ? attachment
                                  : attachment.fileName ||
                                    attachment.originalName ||
                                    attachment.name ||
                                    `Attachment ${attachmentIndex + 1}`}
                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                  {studentAnswer.submittedAt && (
                    <p className="mt-2 text-right text-xs text-gray-400">
                      Submitted: {formatDateTime(studentAnswer.submittedAt)}
                    </p>
                  )}

                </div>

                {/* TEACHER EVALUATION */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">

                  <div className="mb-3 flex items-center gap-2">

                    <Award
                      size={18}
                      className="text-emerald-700"
                    />

                    <h3 className="text-sm font-bold text-emerald-800">
                      Teacher Evaluation
                    </h3>

                  </div>

                  {evaluation ? (
                    <>

                      {/* MARKS */}
                      <div className="grid grid-cols-2 gap-3">

                        <div className="rounded-lg bg-white p-3">

                          <p className="text-xs text-gray-500">
                            Marks Awarded
                          </p>

                          <p className="mt-1 text-xl font-bold text-emerald-700">
                            {evaluation.marksAwarded}
                          </p>

                        </div>

                        <div className="rounded-lg bg-white p-3">

                          <p className="text-xs text-gray-500">
                            Maximum Marks
                          </p>

                          <p className="mt-1 text-xl font-bold text-gray-800">
                            {evaluation.maximumMarks}
                          </p>

                        </div>

                      </div>

                      {/* FEEDBACK */}
                      <div className="mt-3 rounded-lg bg-white p-3">

                        <div className="mb-2 flex items-center gap-2">

                          <MessageSquare
                            size={15}
                            className="text-emerald-600"
                          />

                          <p className="text-xs font-bold text-gray-700">
                            Teacher Feedback
                          </p>

                        </div>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                          {evaluation.feedback?.trim() ||
                            "No feedback provided."}
                        </p>

                      </div>

                      {/* TEACHER INFORMATION */}
                      <div className="mt-3 flex flex-col gap-2 border-t border-emerald-100 pt-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-2 text-xs text-gray-600">

                          <UserRound
                            size={14}
                            className="text-emerald-600"
                          />

                          <span>
                            Evaluated by:{" "}
                            <strong>
                              {getTeacherName(evaluation.teacher)}
                            </strong>
                          </span>

                        </div>

                        {evaluation.evaluatedAt && (
                          <span className="text-xs text-gray-500">
                            {formatDateTime(evaluation.evaluatedAt)}
                          </span>
                        )}

                      </div>

                    </>
                  ) : (

                    <div className="rounded-lg bg-white p-4 text-center">

                      <p className="text-sm font-medium text-amber-700">
                        Evaluation details are not available for this answer.
                      </p>

                    </div>

                  )}

                </div>

              </div>

            </div>
          );
        })}

      </div>
    )}

  </div>
)}


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
