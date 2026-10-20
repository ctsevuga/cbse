import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MathText from '../../components/MathText';
import { toast } from "react-toastify";
import {
  useGetMyAnswerEvaluationsQuery,
} from "../../slices/answerEvaluationApiSlice";

const EvaluationHistoryScreen = () => {
  const navigate = useNavigate();

  const {
    data: evaluations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMyAnswerEvaluationsQuery();

  const sortedEvaluations = useMemo(() => {
    return [...evaluations].sort((a, b) => {
      const dateA = new Date(
        a.evaluatedAt || a.createdAt || 0,
      ).getTime();

      const dateB = new Date(
        b.evaluatedAt || b.createdAt || 0,
      ).getTime();

      return dateB - dateA;
    });
  }, [evaluations]);

  const handleView = (evaluation) => {
    navigate(
      `/teacher/answer-evaluation/${evaluation._id}/view`,
      {
        state: {
          evaluation,
        },
      },
    );
  };

  const handleEdit = (evaluation) => {
    navigate(
      `/teacher/answer-evaluation/${evaluation._id}/edit`,
      {
        state: {
          evaluation,
        },
      },
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "EVALUATED":
        return "bg-emerald-500/20 text-emerald-100 border-emerald-300/30";

      case "REVIEW_REQUIRED":
        return "bg-amber-500/20 text-amber-100 border-amber-300/30";

      case "REVISED":
        return "bg-blue-500/20 text-blue-100 border-blue-300/30";

      case "PENDING":
        return "bg-gray-500/20 text-gray-100 border-gray-300/30";

      default:
        return "bg-white/10 text-white/80 border-white/20";
    }
  };

  const getStudentName = (evaluation) => {
    return (
      evaluation?.student?.user?.name ||
      evaluation?.student?.name ||
      "Student"
    );
  };

  const getAssessmentTitle = (evaluation) => {
    return (
      evaluation?.studentAnswer?.attempt?.assessment?.title ||
      evaluation?.studentAnswer?.assessment?.title ||
      "Assessment"
    );
  };

  const getSubjectName = (evaluation) => {
    return (
      evaluation?.studentAnswer?.attempt?.assessment?.subject?.name ||
      evaluation?.studentAnswer?.assessment?.subject?.name ||
      "-"
    );
  };

  const getQuestionText = (evaluation) => {
    return (
      evaluation?.studentAnswer?.assessmentQuestion?.question
        ?.questionText ||
      evaluation?.studentAnswer?.question?.questionText ||
      "Question"
    );
  };

  const getMaximumMarks = (evaluation) => {
    return evaluation?.maximumMarks ?? 0;
  };

  const getMarksAwarded = (evaluation) => {
    return evaluation?.marksAwarded ?? 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
          <div className="animate-pulse text-white text-lg font-semibold">
            Loading evaluation history...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const message =
      error?.data?.message ||
      error?.error ||
      "Unable to load evaluation history";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white">
            Unable to Load Evaluations
          </h2>

          <p className="mt-3 text-white/70">
            {message}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!sortedEvaluations.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                My Evaluation History
              </h1>

              <p className="mt-2 text-white/70">
                Evaluations completed by you will appear here.
              </p>
            </div>

            <div className="mt-10 py-12 text-center bg-white/5 rounded-xl border border-white/10">
              <div className="text-5xl mb-4">
                📝
              </div>

              <h2 className="text-xl font-semibold text-white">
                No Evaluations Found
              </h2>

              <p className="mt-2 text-white/60">
                You have not evaluated any student answers yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-5 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                My Evaluation History
              </h1>

              <p className="mt-1 text-white/70">
                Review and manage evaluations completed by you.
              </p>
            </div>

            <div className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 border border-white/20">
              <span className="text-sm text-white/60">
                Total Evaluations
              </span>

              <div className="text-xl font-bold text-white">
                {sortedEvaluations.length}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {sortedEvaluations.map((evaluation) => {
              const studentName =
                getStudentName(evaluation);

              const assessmentTitle =
                getAssessmentTitle(evaluation);

              const subjectName =
                getSubjectName(evaluation);

              const questionText =
                getQuestionText(evaluation);

              const maximumMarks =
                getMaximumMarks(evaluation);

              const marksAwarded =
                getMarksAwarded(evaluation);

              return (
                <div
                  key={evaluation._id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-100 border border-cyan-300/30">
                          {subjectName}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(
                            evaluation.evaluationStatus,
                          )}`}
                        >
                          {evaluation.evaluationStatus ||
                            "UNKNOWN"}
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-bold text-white">
                        {assessmentTitle}
                      </h2>

                      <div className="mt-2 text-white/80">
                        Student:{" "}
                        <span className="font-semibold text-white">
                          {studentName}
                        </span>
                      </div>

                      <div className="mt-4 p-4 rounded-xl bg-black/10 border border-white/10">
                        <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold mb-2">
                          Question
                        </p>

                        <p className="text-sm sm:text-base text-white/90 line-clamp-3">
                          <MathText text={questionText} />
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                          <p className="text-xs text-white/50">
                            Maximum Marks
                          </p>

                          <p className="mt-1 text-lg font-bold text-white">
                            {maximumMarks}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                          <p className="text-xs text-white/50">
                            Marks Awarded
                          </p>

                          <p className="mt-1 text-lg font-bold text-emerald-300">
                            {marksAwarded}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 border border-white/10 p-3 col-span-2 sm:col-span-2">
                          <p className="text-xs text-white/50">
                            Evaluated On
                          </p>

                          <p className="mt-1 text-sm font-semibold text-white">
                            {formatDate(
                              evaluation.evaluatedAt ||
                                evaluation.createdAt,
                            )}
                          </p>
                        </div>
                      </div>

                      {evaluation.feedback && (
                        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold mb-2">
                            Feedback
                          </p>

                          <p className="text-sm text-white/80">
                            {evaluation.feedback}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-32">
                      <button
                        type="button"
                        onClick={() =>
                          handleView(evaluation)
                        }
                        className="flex-1 h-11 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(evaluation)
                        }
                        className="flex-1 h-11 px-5 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationHistoryScreen;