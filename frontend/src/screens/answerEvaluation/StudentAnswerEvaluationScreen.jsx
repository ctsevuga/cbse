import { useNavigate, useParams } from "react-router-dom";
import {
  useGetEvaluationByStudentAnswerQuery,
} from "../../slices/answerEvaluationApiSlice";

const StudentAnswerEvaluationScreen = () => {
  const { studentAnswerId } = useParams();
  const navigate = useNavigate();

  const {
    data: evaluation,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetEvaluationByStudentAnswerQuery(
    studentAnswerId,
  );

  const getStudentName = () => {
    return (
      evaluation?.student?.user?.name ||
      evaluation?.student?.name ||
      "Student"
    );
  };

  const getAssessmentTitle = () => {
    return (
      evaluation?.studentAnswer?.attempt?.assessment
        ?.title ||
      evaluation?.studentAnswer?.assessment?.title ||
      "Assessment"
    );
  };

  const getSubjectName = () => {
    return (
      evaluation?.studentAnswer?.attempt?.assessment
        ?.subject?.name ||
      evaluation?.studentAnswer?.assessment?.subject
        ?.name ||
      "-"
    );
  };

  const getQuestionText = () => {
    return (
      evaluation?.studentAnswer?.assessmentQuestion
        ?.question?.questionText ||
      evaluation?.studentAnswer?.question?.questionText ||
      "Question not available"
    );
  };

  const getStudentAnswer = () => {
    const studentAnswer =
      evaluation?.studentAnswer;

    return (
      studentAnswer?.answerText ||
      studentAnswer?.answer ||
      studentAnswer?.textAnswer ||
      studentAnswer?.response ||
      "No answer provided"
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

  const handleView = () => {
    if (!evaluation?._id) {
      return;
    }

    navigate(
      `/teacher/answer-evaluation/${evaluation._id}/view`,
      {
        state: {
          evaluation,
        },
      },
    );
  };

  const handleEdit = () => {
    if (!evaluation?._id) {
      return;
    }

    navigate(
      `/teacher/answer-evaluation/${evaluation._id}/edit`,
      {
        state: {
          evaluation,
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
          <div className="animate-pulse text-white text-lg font-semibold">
            Loading evaluation...
          </div>
        </div>
      </div>
    );
  }

  if (isError || !evaluation) {
    const message =
      error?.data?.message ||
      error?.error ||
      "Evaluation not found for this answer";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-2xl">
              !
            </span>
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Evaluation Not Found
          </h2>

          <p className="mt-3 text-white/70">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={() => refetch()}
              className="flex-1 h-11 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg transition-all duration-200"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 h-11 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Answer Evaluation
              </h1>

              <p className="mt-1 text-white/70">
                Review the evaluation for this student answer.
              </p>
            </div>

            <span
              className={`self-start px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusClasses(
                evaluation.evaluationStatus,
              )}`}
            >
              {evaluation.evaluationStatus}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold">
                Student
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {getStudentName()}
              </p>

              {evaluation?.student?.admissionNumber && (
                <p className="mt-1 text-sm text-white/60">
                  Admission No:{" "}
                  {evaluation.student.admissionNumber}
                </p>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold">
                Assessment
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {getAssessmentTitle()}
              </p>

              <p className="mt-1 text-sm text-white/60">
                Subject: {getSubjectName()}
              </p>
            </div>
          </div>

          <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold mb-3">
              Question
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-white">
              {getQuestionText()}
            </p>
          </div>

          <div className="mt-5 bg-black/10 border border-white/10 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold mb-3">
              Student Answer
            </p>

            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <p className="text-base leading-relaxed text-white/90 whitespace-pre-wrap">
                {getStudentAnswer()}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50">
                Maximum Marks
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {evaluation.maximumMarks ?? 0}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50">
                Marks Awarded
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-300">
                {evaluation.marksAwarded ?? 0}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50">
                Evaluated On
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {formatDate(
                  evaluation.evaluatedAt,
                )}
              </p>
            </div>
          </div>

          {evaluation.feedback && (
            <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold mb-3">
                Teacher Feedback
              </p>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed whitespace-pre-wrap">
                {evaluation.feedback}
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleView}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
              >
                View Evaluation
              </button>

              <button
                type="button"
                onClick={handleEdit}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
              >
                Edit Evaluation
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-200 active:scale-[0.98]"
              >
                Back
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-white/50 text-xs">
            Evaluation created:{" "}
            {formatDate(evaluation.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnswerEvaluationScreen;