import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAnswerEvaluationDetailsQuery,
  useUpdateAnswerEvaluationStatusMutation,
} from "../../slices/answerEvaluationApiSlice";

const AnswerEvaluationViewScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: evaluation,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAnswerEvaluationDetailsQuery(id);

  const [
    updateAnswerEvaluationStatus,
    { isLoading: isUpdatingStatus },
  ] = useUpdateAnswerEvaluationStatusMutation();

  const [status, setStatus] = useState("");

  const currentStatus =
    status ||
    evaluation?.evaluationStatus ||
    "PENDING";

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

  const getStatusClasses = (value) => {
    switch (value) {
      case "EVALUATED":
        return "bg-emerald-500/20 text-emerald-100 border-emerald-300/30";

      case "REVIEW_REQUIRED":
        return "bg-amber-500/20 text-amber-100 border-amber-300/30";

      case "REVISED":
        return "bg-blue-500/20 text-blue-100 border-blue-300/30";

      case "PENDING":
        return "bg-gray-500/20 text-gray-100 border-gray-300/30";

      default:
        return "bg-white/10 text-white border-white/20";
    }
  };

  const updateStatusHandler = async () => {
    if (!evaluation?._id) {
      toast.error("Evaluation not found");
      return;
    }

    if (!status) {
      toast.info("Please select a status");
      return;
    }

    if (status === evaluation.evaluationStatus) {
      toast.info("The evaluation already has this status");
      return;
    }

    try {
      await updateAnswerEvaluationStatus({
        id: evaluation._id,
        evaluationStatus: status,
      }).unwrap();

      toast.success(
        "Evaluation status updated successfully",
      );

      setStatus("");

      refetch();
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to update evaluation status";

      toast.error(message);
    }
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
      "Answer evaluation not found";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white">
            Unable to Load Evaluation
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

  const maximumMarks =
    evaluation.maximumMarks ?? 0;

  const marksAwarded =
    evaluation.marksAwarded ?? 0;

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
                View the evaluated student answer and update its status.
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

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50">
                Maximum Marks
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {maximumMarks}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50">
                Marks Awarded
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-300">
                {marksAwarded}
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

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50">
                Created On
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {formatDate(
                  evaluation.createdAt,
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

          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white">
              Update Evaluation Status
            </h2>

            <p className="mt-1 text-sm text-white/60">
              Change the current status of this evaluation.
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-indigo-100 mb-2">
                Evaluation Status
              </label>

              <select
                value={currentStatus}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
              >
                <option value="PENDING">
                  Pending
                </option>

                <option value="EVALUATED">
                  Evaluated
                </option>

                <option value="REVIEW_REQUIRED">
                  Review Required
                </option>

                <option value="REVISED">
                  Revised
                </option>
              </select>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={updateStatusHandler}
                disabled={
                  isUpdatingStatus ||
                  currentStatus ===
                    evaluation.evaluationStatus
                }
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUpdatingStatus
                  ? "Updating Status..."
                  : "Update Status"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerEvaluationViewScreen;