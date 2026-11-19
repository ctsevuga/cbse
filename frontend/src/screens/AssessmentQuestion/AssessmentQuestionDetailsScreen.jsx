import { useNavigate, useParams } from "react-router-dom";
import { useGetAssessmentQuestionDetailsQuery } from "../../slices/assessmentQuestionApiSlice";
import TeacherQuestionPreview from "../../components/questions/TeacherQuestionPreview";

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

    return value.name || value.title || value.code || value.text || fallback;
  };

  const assessmentName = getName(assessmentQuestion?.assessment, "Assessment");

  const sectionName = getName(assessmentQuestion?.section, "Section");

  const questionName = getName(assessmentQuestion?.question, "Question");

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

          <h2 className="text-xl font-bold text-white">Loading Question</h2>

          <p className="mt-2 text-sm text-white/70">
            Please wait while the assessment question details are being loaded.
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

          <h2 className="text-2xl font-bold text-white">Question Not Found</h2>

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
              onClick={() => navigate("/assessment-questions")}
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
  <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-2 py-3 sm:px-4">
    <div className="mx-auto w-full max-w-7xl">
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl">

        {/* Compact Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate("/assessment-questions")}
              className="mb-1 text-xs font-medium text-indigo-100 hover:text-white"
            >
              ← Back to Assessment Questions
            </button>

            <h1 className="text-lg font-bold text-white sm:text-xl">
              Assessment Question Details
            </h1>

            <p className="text-xs text-white/60">
              Question #{assessmentQuestion.order} · {assessmentName}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/assessment-questions/${id}/edit`)}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
          >
            Edit Question
          </button>
        </div>

        <div className="space-y-3 p-3">

          {/* Summary Horizontal Bar */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:grid-cols-4">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
                Order
              </p>
              <p className="text-lg font-bold text-white">
                {assessmentQuestion.order}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                Marks
              </p>
              <p className="text-lg font-bold text-white">
                {assessmentQuestion.marks}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-200">
                Negative Marks
              </p>
              <p className="text-lg font-bold text-white">
                {assessmentQuestion.negativeMarks || 0}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-200">
                Question Type
              </p>
              <p className="text-sm font-semibold text-white">
                {assessmentQuestion.question?.questionType || "—"}
              </p>
            </div>
          </div>

          {/* Assessment Information - Horizontal */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <h2 className="mb-2 text-sm font-bold text-white">
              Assessment Information
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <div className="min-w-0">
                <p className="text-[10px] uppercase text-white/50">
                  Assessment
                </p>
                <p className="truncate text-sm font-semibold text-white">
                  {assessmentName}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase text-white/50">
                  Section
                </p>
                <p className="truncate text-sm font-semibold text-white">
                  {sectionName}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase text-white/50">
                  Question Group
                </p>
                <p className="truncate text-sm font-semibold text-white">
                  {questionGroupName}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase text-white/50">
                  Choice Group
                </p>
                <p className="truncate text-sm font-semibold text-white">
                  {choiceGroupName}
                </p>
              </div>
            </div>
          </div>

          {/* Question Preview */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white">
                Question Preview
              </h2>

              <div className="flex flex-wrap gap-1">
                <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold text-cyan-200">
                  {assessmentQuestion.question?.questionType}
                </span>

                <span className="rounded-full bg-purple-400/10 px-2 py-1 text-[10px] font-semibold text-purple-200">
                  {assessmentQuestion.question?.answerEditorConfiguration?.answerMode || "Unknown Editor"}
                </span>
              </div>
            </div>

            {assessmentQuestion.question ? (
              <div className="rounded-lg bg-white p-3 sm:p-4">
                <TeacherQuestionPreview
                  question={assessmentQuestion.question}
                />
              </div>
            ) : (
              <p className="text-sm text-red-200">
                Question information is not available.
              </p>
            )}

            {/* Correct Answer */}
            {assessmentQuestion.question?.questionType === "MCQ" && (
              <div className="mt-2 rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2">
                <span className="text-xs font-semibold text-emerald-200">
                  Correct Answer:{" "}
                </span>

                <span className="text-sm font-medium text-white">
                  {typeof assessmentQuestion.question.correctAnswer === "string"
                    ? assessmentQuestion.question.correctAnswer
                    : JSON.stringify(
                        assessmentQuestion.question.correctAnswer
                      )}
                </span>
              </div>
            )}
          </div>

          {/* Configuration and Marking - Horizontal */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

            {/* Editor Configuration */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <h2 className="mb-2 text-sm font-bold text-white">
                Editor Configuration
              </h2>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-white/50">Configuration</p>
                  <p className="text-sm font-medium text-white">
                    {assessmentQuestion.question?.answerEditorConfiguration?.name || "Not configured"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-white/50">Configuration Code</p>
                  <p className="text-sm font-medium text-white">
                    {assessmentQuestion.question?.answerEditorConfiguration?.code || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Marking and Record Details */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <h2 className="mb-2 text-sm font-bold text-white">
                Marking & Record Details
              </h2>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-white/50">Positive Marks</p>
                  <p className="text-sm font-semibold text-emerald-300">
                    {assessmentQuestion.marks}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-white/50">Negative Marks</p>
                  <p className="text-sm font-semibold text-red-300">
                    {assessmentQuestion.negativeMarks || 0}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-white/50">Created</p>
                  <p className="text-xs text-white/80">
                    {formatDate(assessmentQuestion.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-white/50">Last Updated</p>
                  <p className="text-xs text-white/80">
                    {formatDate(assessmentQuestion.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => navigate("/assessment-questions")}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
            >
              Back
            </button>

            <button
              type="button"
              onClick={() => navigate(`/assessment-questions/${id}/edit`)}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-700 px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
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
