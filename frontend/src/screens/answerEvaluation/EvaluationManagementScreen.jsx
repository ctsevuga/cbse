import { useNavigate } from "react-router-dom";
import { useGetAnswerEvaluationsQuery } from "../../slices/answerEvaluationApiSlice";

const EvaluationManagementScreen = () => {
  const navigate = useNavigate();

  const {
    data: evaluations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAnswerEvaluationsQuery();

  const getStudentName = (evaluation) => {
    return (
      evaluation?.student?.user?.name ||
      evaluation?.student?.name ||
      "Unknown Student"
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
      "Subject"
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

  const getStatusClass = (status) => {
    switch (status) {
      case "EVALUATED":
        return "bg-emerald-400/20 text-emerald-100 border-emerald-300/20";

      case "REVIEW_REQUIRED":
        return "bg-amber-400/20 text-amber-100 border-amber-300/20";

      case "REVISED":
        return "bg-cyan-400/20 text-cyan-100 border-cyan-300/20";

      case "PENDING":
      default:
        return "bg-white/10 text-white/70 border-white/20";
    }
  };

  const viewHandler = (evaluation) => {
    navigate(
      `/teacher/answer-evaluation/${evaluation._id}/view`,
      {
        state: {
          evaluation,
        },
      },
    );
  };

  const editHandler = (evaluation) => {
    navigate(
      `/teacher/answer-evaluation/${evaluation._id}/edit`,
      {
        state: {
          evaluation,
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-6 shadow-2xl backdrop-blur-xl sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Answer Evaluations
              </h1>

              <p className="mt-1 text-sm text-white/70 sm:text-base">
                View and manage evaluated student answers
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-center backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-100">
                Total Evaluations
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {isLoading ? "..." : evaluations.length}
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-12 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />

            <p className="mt-4 text-sm font-medium text-white/80">
              Loading evaluations...
            </p>
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-300/30 bg-red-500/20 px-6 py-8 text-center shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">
              Unable to load evaluations
            </h2>

            <p className="mt-2 text-sm text-white/70">
              {error?.data?.message ||
                error?.error ||
                "Something went wrong while loading evaluations."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl active:scale-[0.98]"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading &&
          !isError &&
          evaluations.length === 0 && (
            <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-14 text-center shadow-2xl backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl text-white">
                ✓
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                No Evaluations Found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/70">
                There are no answer evaluations available
                for your school.
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          evaluations.length > 0 && (
            <div className="grid gap-5">
              {evaluations.map((evaluation) => (
                <div
                  key={evaluation._id}
                  className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.14]"
                >
                  <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                              evaluation.evaluationStatus,
                            )}`}
                          >
                            {evaluation.evaluationStatus ||
                              "PENDING"}
                          </span>

                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                            {getSubjectName(evaluation)}
                          </span>
                        </div>

                        <h2 className="mt-3 text-lg font-bold text-white sm:text-xl">
                          {getAssessmentTitle(
                            evaluation,
                          )}
                        </h2>

                        <p className="mt-1 text-sm text-white/60">
                          {getStudentName(evaluation)}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center">
                        <p className="text-xs font-medium text-white/50">
                          Marks
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          {evaluation.marksAwarded}{" "}
                          <span className="text-sm font-medium text-white/50">
                            / {evaluation.maximumMarks}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-5 sm:px-6">
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                          Student
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {getStudentName(
                            evaluation,
                          )}
                        </p>

                        {evaluation.student
                          ?.admissionNumber && (
                          <p className="mt-1 text-xs text-white/50">
                            Admission No:{" "}
                            {
                              evaluation.student
                                .admissionNumber
                            }
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                          Evaluated By
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {evaluation.teacher
                            ?.user?.name ||
                            evaluation.teacher
                              ?.name ||
                            "Teacher"}
                        </p>

                        {evaluation.evaluatedAt && (
                          <p className="mt-1 text-xs text-white/50">
                            {new Date(
                              evaluation.evaluatedAt,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                          Evaluation
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {evaluation.marksAwarded} /{" "}
                          {evaluation.maximumMarks}
                        </p>

                        <p className="mt-1 text-xs text-white/50">
                          {evaluation.feedback
                            ? "Feedback provided"
                            : "No feedback"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                        Question
                      </p>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/90">
                        {getQuestionText(
                          evaluation,
                        )}
                      </p>
                    </div>

                    {evaluation.feedback && (
                      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                          Teacher Feedback
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">
                          {evaluation.feedback}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          viewHandler(evaluation)
                        }
                        className="w-full rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-white/20 active:scale-[0.98] sm:w-auto"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          editHandler(evaluation)
                        }
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl active:scale-[0.98] sm:w-auto"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default EvaluationManagementScreen;