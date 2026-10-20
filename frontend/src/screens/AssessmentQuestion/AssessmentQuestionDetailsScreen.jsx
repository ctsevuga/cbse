import { useNavigate, useParams } from "react-router-dom";
import { useGetAssessmentQuestionDetailsQuery } from "../../slices/assessmentQuestionApiSlice";

const AssessmentQuestionDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: assessmentQuestion,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAssessmentQuestionDetailsQuery(id);

  const getName = (value, fallback = "Not assigned") => {
    if (!value) {
      return fallback;
    }

    if (typeof value === "string") {
      return value;
    }

    return (
      value.name ||
      value.title ||
      value.code ||
      value.text ||
      fallback
    );
  };

  const assessmentName = getName(
    assessmentQuestion?.assessment,
    "Assessment",
  );

  const sectionName = getName(
    assessmentQuestion?.section,
    "Section",
  );

  const questionName = getName(
    assessmentQuestion?.question,
    "Question",
  );

  const questionGroupName = getName(
    assessmentQuestion?.questionGroup,
    "No question group",
  );

  const choiceGroupName = getName(
    assessmentQuestion?.choiceGroup,
    "No choice group",
  );

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />

          <h2 className="text-xl font-bold text-white">
            Loading Question
          </h2>

          <p className="mt-2 text-sm text-white/70">
            Please wait while the assessment question details
            are being loaded.
          </p>
        </div>
      </div>
    );
  }

  if (isError || !assessmentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-3xl text-red-200">
            !
          </div>

          <h2 className="text-2xl font-bold text-white">
            Question Not Found
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/70">
            {error?.data?.message ||
              error?.error ||
              "The assessment question could not be found or you do not have permission to view it."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => refetch()}
              className="flex-1 rounded-xl bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/assessment-questions")
              }
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-700 px-5 py-3 font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-600"
            >
              Back to Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() =>
                    navigate("/assessment-questions")
                  }
                  className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-100 transition hover:text-white"
                >
                  <span className="text-lg">←</span>
                  Back to Assessment Questions
                </button>

                <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-100">
                  Question Details
                </div>

                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Assessment Question
                </h1>

                <p className="mt-1 text-sm text-white/70 sm:text-base">
                  View the complete assignment and marking
                  details for this assessment question.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/assessment-questions/${id}/edit`,
                  )
                }
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 px-6 font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl active:scale-[0.98]"
              >
                Edit Question
              </button>
            </div>
          </div>

          <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
                  Order
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {assessmentQuestion.order}
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Question position
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                  Marks
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {assessmentQuestion.marks}
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Positive marks
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-200">
                  Negative Marks
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {assessmentQuestion.negativeMarks || 0}
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Deduction for incorrect answer
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">
                  Assignment Information
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Assessment and section associated with this
                  question.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    Assessment
                  </p>

                  <p className="mt-2 text-base font-semibold text-white">
                    {assessmentName}
                  </p>

                  {assessmentQuestion.assessment?.code && (
                    <p className="mt-1 text-xs text-white/50">
                      Code:{" "}
                      {assessmentQuestion.assessment.code}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    Section
                  </p>

                  <p className="mt-2 text-base font-semibold text-white">
                    {sectionName}
                  </p>

                  {assessmentQuestion.section?.code && (
                    <p className="mt-1 text-xs text-white/50">
                      Code:{" "}
                      {assessmentQuestion.section.code}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">
                  Question
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  The question assigned to this assessment.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-300/10 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/20 text-lg font-bold text-cyan-100">
                    {assessmentQuestion.order}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold leading-7 text-white">
                      {questionName}
                    </p>

                    {assessmentQuestion.question?.code && (
                      <p className="mt-2 text-xs text-white/50">
                        Question Code:{" "}
                        {assessmentQuestion.question.code}
                      </p>
                    )}

                    {assessmentQuestion.question?.type && (
                      <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                        {assessmentQuestion.question.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">
                  Grouping
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Question and choice group associations.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-purple-300/10 bg-purple-400/10 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-400/20 text-purple-100">
                    #
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-200">
                    Question Group
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {questionGroupName}
                  </p>

                  {assessmentQuestion.questionGroup?.code && (
                    <p className="mt-1 text-xs text-white/50">
                      Code:{" "}
                      {
                        assessmentQuestion.questionGroup
                          .code
                      }
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-cyan-300/10 bg-cyan-400/10 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-100">
                    ↔
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
                    Choice Group
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {choiceGroupName}
                  </p>

                  {assessmentQuestion.choiceGroup
                    ?.code && (
                    <p className="mt-1 text-xs text-white/50">
                      Code:{" "}
                      {
                        assessmentQuestion.choiceGroup
                          .code
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">
                  Marking Details
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Marks configured for this assessment question.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Marks
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-300">
                    {assessmentQuestion.marks}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Negative Marks
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-300">
                    {assessmentQuestion.negativeMarks ||
                      0}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Order
                  </p>

                  <p className="mt-2 text-2xl font-bold text-cyan-300">
                    {assessmentQuestion.order}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">
                  Record Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    Created
                  </p>

                  <p className="mt-2 text-sm text-white/80">
                    {formatDate(
                      assessmentQuestion.createdAt,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    Last Updated
                  </p>

                  <p className="mt-2 text-sm text-white/80">
                    {formatDate(
                      assessmentQuestion.updatedAt,
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate("/assessment-questions")
                }
                className="h-12 rounded-xl border border-white/20 bg-white/10 px-6 font-semibold text-white transition hover:bg-white/20"
              >
                Back to Questions
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/assessment-questions/${id}/edit`,
                  )
                }
                className="h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 px-7 font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl active:scale-[0.98]"
              >
                Edit Question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuestionDetailsScreen;
