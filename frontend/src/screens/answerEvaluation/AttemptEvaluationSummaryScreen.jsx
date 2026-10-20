
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetEvaluationsByAttemptQuery,
} from "../../slices/answerEvaluationApiSlice";

const AttemptEvaluationSummaryScreen = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetEvaluationsByAttemptQuery(attemptId, {
    skip: !attemptId,
  });

  const student = data?.student;
  const attempt = data?.attempt;
  const evaluations = data?.evaluations || [];

  const getStudentName = () => {
    return (
      student?.user?.name ||
      student?.name ||
      student?.user?.fullName ||
      "Student"
    );
  };

  const getQuestionText = (evaluation) => {
    return (
      evaluation?.studentAnswer?.assessmentQuestion?.question?.questionText ||
      evaluation?.studentAnswer?.question?.questionText ||
      evaluation?.studentAnswer?.assessmentQuestion?.question?.text ||
      "Question"
    );
  };

  const getAssessmentTitle = (evaluation) => {
    return (
      evaluation?.studentAnswer?.attempt?.assessment?.title ||
      attempt?.assessment?.title ||
      "Assessment"
    );
  };

  const getSubjectName = (evaluation) => {
    return (
      evaluation?.studentAnswer?.attempt?.assessment?.subject?.name ||
      attempt?.assessment?.subject?.name ||
      evaluation?.studentAnswer?.assessmentQuestion?.question?.subject?.name ||
      "Subject"
    );
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "EVALUATED":
        return "bg-emerald-400/20 text-emerald-200 border-emerald-300/30";
      case "REVISED":
        return "bg-blue-400/20 text-blue-200 border-blue-300/30";
      case "REVIEW_REQUIRED":
        return "bg-amber-400/20 text-amber-200 border-amber-300/30";
      case "PENDING":
        return "bg-white/10 text-white/70 border-white/20";
      default:
        return "bg-white/10 text-white/70 border-white/20";
    }
  };

  const handleView = (evaluation) => {
    navigate(
      `/teacher/answer-evaluation/${evaluation._id}/view`,
      {
        state: { evaluation },
      },
    );
  };

  const handleEdit = (evaluation) => {
    navigate(
      `/teacher/answer-evaluation/${evaluation._id}/edit`,
      {
        state: { evaluation },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-8 py-10 text-center">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold">
            Loading evaluation summary...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-400/20 border border-red-300/30 flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl text-red-200">!</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Unable to Load Evaluations
          </h2>

          <p className="text-white/70 mb-6">
            {error?.data?.message ||
              error?.error ||
              "Unable to retrieve the evaluation summary."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const evaluatedCount = evaluations.filter(
    (item) =>
      item.evaluationStatus === "EVALUATED" ||
      item.evaluationStatus === "REVISED",
  ).length;

  const reviewRequiredCount = evaluations.filter(
    (item) => item.evaluationStatus === "REVIEW_REQUIRED",
  ).length;

  const totalMarks = evaluations.reduce(
    (total, item) =>
      total + Number(item?.maximumMarks || 0),
    0,
  );

  const marksAwarded = evaluations.reduce(
    (total, item) =>
      total + Number(item?.marksAwarded || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:py-10">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          <div className="px-5 sm:px-8 py-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-cyan-200 text-sm font-semibold uppercase tracking-wider mb-1">
                  Evaluation Summary
                </p>

                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {getAssessmentTitle(
                    evaluations[0],
                  )}
                </h1>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-white/70">
                  <span>
                    Student:{" "}
                    <span className="text-white font-semibold">
                      {getStudentName()}
                    </span>
                  </span>

                  <span>
                    Subject:{" "}
                    <span className="text-white font-semibold">
                      {getSubjectName(
                        evaluations[0],
                      )}
                    </span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="self-start lg:self-center px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition"
              >
                Back
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-5 sm:p-8">
            <div className="bg-white/10 border border-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">
                Total Answers
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {evaluations.length}
              </p>
            </div>

            <div className="bg-emerald-400/10 border border-emerald-300/20 rounded-xl p-4">
              <p className="text-emerald-100/70 text-sm">
                Evaluated
              </p>
              <p className="text-2xl font-bold text-emerald-100 mt-1">
                {evaluatedCount}
              </p>
            </div>

            <div className="bg-amber-400/10 border border-amber-300/20 rounded-xl p-4">
              <p className="text-amber-100/70 text-sm">
                Review Required
              </p>
              <p className="text-2xl font-bold text-amber-100 mt-1">
                {reviewRequiredCount}
              </p>
            </div>

            <div className="bg-cyan-400/10 border border-cyan-300/20 rounded-xl p-4">
              <p className="text-cyan-100/70 text-sm">
                Marks
              </p>
              <p className="text-2xl font-bold text-cyan-100 mt-1">
                {marksAwarded}
                <span className="text-base text-white/50">
                  {" "}
                  / {totalMarks}
                </span>
              </p>
            </div>
          </div>

          <div className="px-5 sm:px-8 pb-8">
            {evaluations.length === 0 ? (
              <div className="bg-white/10 border border-white/10 rounded-xl p-10 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Evaluations Found
                </h3>

                <p className="text-white/60">
                  No answer evaluations are available for this
                  student attempt.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluations.map(
                  (evaluation, index) => (
                    <div
                      key={evaluation._id}
                      className="bg-white/10 hover:bg-white/[0.13] border border-white/10 rounded-2xl p-5 transition"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg bg-cyan-400/20 border border-cyan-300/20 text-cyan-100 text-sm font-bold">
                              Q{index + 1}
                            </span>

                            <span
                              className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusClasses(
                                evaluation.evaluationStatus,
                              )}`}
                            >
                              {evaluation.evaluationStatus?.replace(
                                /_/g,
                                " ",
                              )}
                            </span>
                          </div>

                          <h3 className="text-white font-semibold text-base sm:text-lg leading-relaxed">
                            {getQuestionText(
                              evaluation,
                            )}
                          </h3>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                            <div className="bg-black/10 rounded-xl px-4 py-3">
                              <p className="text-white/50 text-xs">
                                Maximum Marks
                              </p>
                              <p className="text-white font-bold mt-1">
                                {
                                  evaluation.maximumMarks
                                }
                              </p>
                            </div>

                            <div className="bg-black/10 rounded-xl px-4 py-3">
                              <p className="text-white/50 text-xs">
                                Marks Awarded
                              </p>
                              <p className="text-cyan-200 font-bold mt-1">
                                {
                                  evaluation.marksAwarded
                                }
                              </p>
                            </div>

                            <div className="bg-black/10 rounded-xl px-4 py-3 col-span-2 sm:col-span-1">
                              <p className="text-white/50 text-xs">
                                Feedback
                              </p>
                              <p className="text-white font-medium mt-1 truncate">
                                {evaluation.feedback ||
                                  "No feedback"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row xl:flex-col gap-2 xl:min-w-[110px]">
                          <button
                            type="button"
                            onClick={() =>
                              handleView(
                                evaluation,
                              )
                            }
                            className="flex-1 xl:w-full px-4 py-2.5 rounded-xl bg-sky-500/80 hover:bg-sky-500 text-white font-semibold transition shadow-lg"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                evaluation,
                              )
                            }
                            className="flex-1 xl:w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptEvaluationSummaryScreen;
