import { useNavigate } from "react-router-dom";
import { useGetPendingAnswerEvaluationsQuery } from "../../slices/answerEvaluationApiSlice";
import MathText from '../../components/MathText';
const AnswerEvaluationPendingScreen = () => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPendingAnswerEvaluationsQuery();

  const answers = data?.answers || [];

  const getStudentName = (student) => {
    return student?.user?.name || "Unknown Student";
  };

  const getAssessmentTitle = (assessment) => {
    return assessment?.title || "Assessment";
  };

  const getSubjectName = (assessment) => {
    return assessment?.subject?.name || "Subject";
  };

  const getQuestionText = (answer) => {
    return (
      answer?.assessmentQuestion?.question?.questionText ||
      answer?.question?.questionText ||
      "Question"
    );
  };

  const getMaximumMarks = (answer) => {
    return (
      answer?.assessmentQuestion?.question?.marks ||
      answer?.question?.marks ||
      answer?.assessmentQuestion?.section?.marksPerQuestion ||
      0
    );
  };

  const getAssessment = (answer) => {
    return answer?.attempt?.assessment;
  };

  const getAttemptNumber = (answer) => {
    return answer?.attempt?.attemptNumber || "-";
  };

  const evaluateAnswerHandler = (answer) => {
    navigate(
      `/teacher/answer-evaluation/${answer._id}`,
      {
        state: {
          studentAnswer: answer,
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
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Teacher Dashboard
              </h1>

              <p className="mt-1 text-sm text-white/70 sm:text-base">
                Review and evaluate student answers
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-center backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-100">
                Pending Evaluations
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {isLoading ? "..." : answers.length}
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-12 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />

            <p className="mt-4 text-sm font-medium text-white/80">
              Loading pending evaluations...
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
                "Something went wrong while loading pending evaluations."}
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

        {!isLoading && !isError && answers.length === 0 && (
          <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-14 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
              ✓
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              All Caught Up
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/70">
              There are no student answers waiting for your evaluation.
            </p>
          </div>
        )}

        {!isLoading && !isError && answers.length > 0 && (
          <div className="grid gap-5">
            {answers.map((answer) => {
              const assessment = getAssessment(answer);
              const maximumMarks = getMaximumMarks(answer);

              return (
                <div
                  key={answer._id}
                  className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.14] hover:shadow-2xl"
                >
                  <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100">
                            Pending Evaluation
                          </span>

                          {assessment?.assessmentType && (
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                              {assessment.assessmentType}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 truncate text-lg font-bold text-white sm:text-xl">
                          {getAssessmentTitle(assessment)}
                        </h2>

                        <p className="mt-1 text-sm text-white/60">
                          Attempt {getAttemptNumber(answer)}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                        <p className="text-xs font-medium text-white/50">
                          Maximum Marks
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          {maximumMarks}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                        Student
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-white">
                        {getStudentName(answer.student)}
                      </p>

                      {answer.student?.admissionNumber && (
                        <p className="mt-1 text-xs text-white/50">
                          Admission No:{" "}
                          {answer.student.admissionNumber}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                        Subject
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {getSubjectName(assessment)}
                      </p>

                      {assessment?.class?.name && (
                        <p className="mt-1 text-xs text-white/50">
                          Class: {assessment.class.name}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                        Submitted
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {answer.createdAt
                          ? new Date(
                              answer.createdAt,
                            ).toLocaleDateString()
                          : "-"}
                      </p>

                      <p className="mt-1 text-xs text-white/50">
                        {answer.createdAt
                          ? new Date(
                              answer.createdAt,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 px-5 py-5 sm:px-6">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                        Question
                      </p>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/90">
                        <MathText text={getQuestionText(answer)}></MathText>
                      </p>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          evaluateAnswerHandler(answer)
                        }
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl active:scale-[0.98] sm:w-auto"
                      >
                        Evaluate Answer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerEvaluationPendingScreen;